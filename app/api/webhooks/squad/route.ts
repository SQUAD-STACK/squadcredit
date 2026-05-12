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

  const skipSig = process.env.SKIP_WEBHOOK_SIG === "true";
  const keyConfigured = !!process.env.SQUAD_SECRET_KEY;

  if (!skipSig && keyConfigured) {
    if (!verifySquadSignature(payload, signature)) {
      console.error("[webhook] signature mismatch — check SQUAD_SECRET_KEY matches Squad's signing key");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (!skipSig && !keyConfigured) {
    console.warn("[webhook] SQUAD_SECRET_KEY not set — skipping signature verification");
  }

  // Only process inbound credit transactions
  if (payload.transaction_indicator !== "C") {
    return ok(payload.transaction_reference);
  }

  const supabase = await createServiceClient();

  // customer_identifier is "trader_<uuid>" — extract the uuid
  const traderId = payload.customer_identifier.replace(/^trader_/, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: _traderRes } = await (supabase as any)
    .from("traders")
    .select("*")
    .eq("id", traderId)
    .maybeSingle();

  const trader = _traderRes as Trader | null;

  if (!trader) {
    console.warn("[webhook] no trader found for customer_identifier:", payload.customer_identifier);
    return ok(payload.transaction_reference);
  }

  const settledAmount = parseFloat(payload.settled_amount);
  const principalAmount = parseFloat(payload.principal_amount);

  // ── Loan repayment holdback (T2+ only; T0/T1 use bullet repayment) ──
  const { data: _loanRes } = await supabase
    .from("loans")
    .select("*")
    .eq("trader_id", trader.id)
    .eq("status", "active")
    .maybeSingle();

  const activeLoan = _loanRes as Loan | null;

  // Use an untyped alias for mutations — our DB type is missing Supabase's
  // internal Relationships field, which collapses mutation argument types to never.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  if (activeLoan && activeLoan.tier >= 2) {
    const holdback = settledAmount * Number(activeLoan.holdback_percentage);
    const newRepaid = Number(activeLoan.amount_repaid) + holdback;
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

  // ── Write transaction — upsert is idempotent on transaction_reference ──
  const { error: txError } = await db.from("transactions").upsert(
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
    { onConflict: "transaction_reference", ignoreDuplicates: true }
  );

  if (txError) {
    console.error("[webhook] transaction upsert failed:", txError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // ── Fetch full transaction history and recompute score ──
  const { data: allTxRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("trader_id", trader.id)
    .order("transaction_date", { ascending: false });

  const { trustScore, creditLimit } = computeScore(
    (allTxRaw ?? []) as Transaction[],
    trader.created_at
  );

  // ── Savings auto-sweep ──
  const { data: _savingsRes } = await supabase
    .from("savings")
    .select("*")
    .eq("trader_id", trader.id)
    .maybeSingle();

  const savings = _savingsRes as Savings | null;

  if (savings && settledAmount >= Number(savings.rule_threshold)) {
    const sweep = settledAmount * Number(savings.rule_percentage);
    await db
      .from("savings")
      .update({ balance: Number(savings.balance) + sweep })
      .eq("id", savings.id);
  }

  // ── Update trader record — triggers Realtime broadcast ──
  await db
    .from("traders")
    .update({ trust_score: trustScore, credit_limit: creditLimit })
    .eq("id", trader.id);

  return ok(payload.transaction_reference);
}
