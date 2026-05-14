"use server";

import { getSession, getCurrentTrader } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { disburseLoan } from "@/lib/squad";
import { tierForScore, computeLoanCost } from "@/lib/loan-tiers";
import { formatNaira } from "@/lib/format";
import type { Loan } from "@/lib/supabase/types";

type RequestLoanResult =
  | { success: true; loan: Loan }
  | { error: string };

export async function requestLoan(data: {
  amount: number;
  tenorDays: number;
}): Promise<RequestLoanResult> {
  const session = await getSession();
  if (!session.traderId) return { error: "Session expired. Please sign in again." };

  const trader = await getCurrentTrader();
  if (!trader) return { error: "Account not found." };

  if (!trader.disbursement_account_number) return { error: "NEED_BANK_DETAILS" };

  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Guard: no active or pending loan
  const { data: existingLoan } = await db
    .from("loans")
    .select("id")
    .eq("trader_id", trader.id)
    .in("status", ["active", "pending"])
    .maybeSingle();
  if (existingLoan) return { error: "You already have an active loan." };

  // Validate amount against tier and credit limit
  const tier = tierForScore(trader.trust_score);
  if (data.amount <= 0) return { error: "Enter a valid amount." };
  if (data.amount > Number(trader.credit_limit)) {
    return { error: "Amount exceeds your credit limit." };
  }
  if (data.amount > tier.maxAmount) {
    return { error: `Maximum for your tier is ${formatNaira(tier.maxAmount)}.` };
  }

  const { fee, totalDue } = computeLoanCost(data.amount, tier);
  const loanId = crypto.randomUUID();
  const now = Date.now();
  const disbursedAt = new Date(now).toISOString();
  const dueAt = new Date(now + data.tenorDays * 86_400_000).toISOString();

  // Insert pending loan row first
  const { error: insertErr } = await db.from("loans").insert({
    id: loanId,
    trader_id: trader.id,
    principal: data.amount,
    fee,
    total_due: totalDue,
    holdback_percentage: tier.holdback,
    tier: tier.tier,
    status: "pending",
    disbursed_at: disbursedAt,
    due_at: dueAt,
    squad_payout_reference: "",
  });

  if (insertErr) {
    console.error("[requestLoan] loan insert failed:", insertErr);
    return { error: "Could not create loan record. Try again." };
  }

  // Attempt Squad payout
  const amountKobo = String(Math.round(data.amount * 100));
  try {
    const payout = await disburseLoan({
      loanId,
      amount: amountKobo,
      bankCode: trader.disbursement_bank_code!,
      accountNumber: trader.disbursement_account_number!,
      accountName: trader.disbursement_account_name!,
    });

    const actualNow = Date.now();
    const actualDisbursedAt = new Date(actualNow).toISOString();
    const actualDueAt = new Date(actualNow + data.tenorDays * 86_400_000).toISOString();

    await db.from("loans").update({
      status: "active",
      squad_payout_reference: payout.nip_transaction_reference ?? payout.transaction_reference,
      disbursed_at: actualDisbursedAt,
      due_at: actualDueAt,
    }).eq("id", loanId);

    await db.from("traders").update({
      active_loan_balance: Number(trader.active_loan_balance ?? 0) + totalDue,
    }).eq("id", trader.id);

    const { data: loan } = await db.from("loans").select("*").eq("id", loanId).single();
    return { success: true, loan: loan as Loan };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    const msg = err instanceof Error ? err.message : String(err);

    if (
      code === "WALLET_PENDING" ||
      msg.toLowerCase().includes("insufficient") ||
      msg.toLowerCase().includes("wallet") ||
      msg.includes("WALLET_PENDING")
    ) {
      return { error: "WALLET_PENDING" };
    }

    // Mark loan as failed
    await db.from("loans").update({ status: "failed" }).eq("id", loanId);
    console.error("[requestLoan] disbursement failed:", err);
    return { error: msg || "Disbursement failed. Contact support." };
  }
}
