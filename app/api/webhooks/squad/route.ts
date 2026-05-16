import { NextRequest, NextResponse } from "next/server";
import { verifySquadSignature, type SquadWebhookPayload } from "@/lib/squad";
import { createServiceClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/scoring";
import type { Trader, Transaction, Loan, Savings } from "@/lib/supabase/types";

function ok(reference: string) {
  return NextResponse.json({
    response_code: 200,
    transaction_reference: reference,
    response_description: "Success",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-squad-signature") ?? "";

  let payload: SquadWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Signature verification ──
  const skipSig = process.env.SKIP_WEBHOOK_SIG === "true";
  const keyConfigured = !!process.env.SQUAD_SECRET_KEY;

  if (!skipSig && keyConfigured) {
    if (!verifySquadSignature(payload, signature)) {
      console.error(
        "[webhook] signature mismatch — check SQUAD_SECRET_KEY matches Squad's signing key",
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (!skipSig && !keyConfigured) {
    console.warn(
      "[webhook] SQUAD_SECRET_KEY not set — skipping signature verification",
    );
  }

  // Only process inbound credit transactions
  if (payload.transaction_indicator !== "C") {
    return ok(payload.transaction_reference);
  }

  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // ── Look up trader by customer_identifier ──
  const traderId = payload.customer_identifier.replace(/^trader_/, "");
  const { data: traderData } = await db
    .from("traders")
    .select("*")
    .eq("id", traderId)
    .maybeSingle();

  const trader = traderData as Trader | null;

  if (!trader) {
    console.warn(
      "[webhook] no trader for customer_identifier:",
      payload.customer_identifier,
    );
    return ok(payload.transaction_reference);
  }

  const settledAmount = parseFloat(payload.settled_amount);
  const principalAmount = parseFloat(payload.principal_amount);

  // ── Write the transaction first (idempotent on reference) ──
  const { error: txError, count: txCount } = await db.from("transactions").upsert(
    {
      trader_id: trader.id,
      transaction_reference: payload.transaction_reference,
      sender_name: payload.sender_name,
      sender_account: payload.masked_sender_account_number ?? null,
      amount: principalAmount,
      settled_amount: settledAmount,
      transaction_date: payload.transaction_date,
      raw_payload: payload,
    },
    { onConflict: "transaction_reference", ignoreDuplicates: true, count: "exact" },
  );

  if (txError) {
    console.error("[webhook] transaction upsert failed:", txError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Duplicate webhook — Squad retries for 48 h. Skip all balance mutations.
  if (txCount === 0) {
    console.log(`[webhook] duplicate ${payload.transaction_reference} — skipping`);
    return ok(payload.transaction_reference);
  }

  // ── Fetch related rows in parallel ──
  const [loanRes, savingsRes, allTxRes] = await Promise.all([
    db
      .from("loans")
      .select("*")
      .eq("trader_id", trader.id)
      .eq("status", "active")
      .maybeSingle(),
    db.from("savings").select("*").eq("trader_id", trader.id).maybeSingle(),
    db
      .from("transactions")
      .select("*")
      .eq("trader_id", trader.id)
      .order("transaction_date", { ascending: false }),
  ]);

  const activeLoan = loanRes.data as Loan | null;
  const savings = savingsRes.data as Savings | null;
  const allTx = (allTxRes.data ?? []) as Transaction[];

  // ── Compute splits: how this payment is divided ──
  let loanHoldback = 0;
  if (activeLoan && activeLoan.tier >= 2) {
    loanHoldback = settledAmount * Number(activeLoan.holdback_percentage);
  }

  let savingsSweep = 0;
  if (savings && settledAmount >= Number(savings.rule_threshold)) {
    savingsSweep = settledAmount * Number(savings.rule_percentage);
  }

  const toWallet = settledAmount - loanHoldback - savingsSweep;

  // ── Update loan if there's an active holdback ──
  if (activeLoan && loanHoldback > 0) {
    const newRepaid = Number(activeLoan.amount_repaid) + loanHoldback;
    const isFullyRepaid = newRepaid >= Number(activeLoan.total_due);

    await db
      .from("loans")
      .update({
        amount_repaid: newRepaid,
        status: isFullyRepaid ? "repaid" : "active",
        ...(isFullyRepaid ? { repaid_at: new Date().toISOString() } : {}),
      })
      .eq("id", activeLoan.id);
  }

  // ── Update savings balance if there's a sweep ──
  if (savings && savingsSweep > 0) {
    await db
      .from("savings")
      .update({ balance: Number(savings.balance) + savingsSweep })
      .eq("id", savings.id);
  }

  // ── Recompute trust score and credit limit ──
  const { trustScore, creditLimit } = computeScore(allTx, trader.created_at);

  // ── Compute updated active loan balance ──
  const newActiveLoanBalance = activeLoan
    ? Math.max(
        0,
        Number(activeLoan.total_due) -
          (Number(activeLoan.amount_repaid) + loanHoldback),
      )
    : 0;

  // ── Single atomic trader update — touches Realtime once ──
  const { error: traderUpdateError } = await db
    .from("traders")
    .update({
      trust_score: trustScore,
      credit_limit: creditLimit,
      wallet_balance: Number(trader.wallet_balance ?? 0) + toWallet,
      total_inflows: Number(trader.total_inflows ?? 0) + settledAmount,
      lifetime_saved: Number(trader.lifetime_saved ?? 0) + savingsSweep,
      active_loan_balance: newActiveLoanBalance,
    })
    .eq("id", trader.id);

  if (traderUpdateError) {
    console.error("[webhook] trader update failed:", traderUpdateError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  console.log(
    `[webhook] processed ${payload.transaction_reference}: +₦${settledAmount} (wallet: +${toWallet}, savings: +${savingsSweep}, loan: -${loanHoldback}) → score ${trustScore}`,
  );

  return ok(payload.transaction_reference);
}
