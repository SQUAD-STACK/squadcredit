"use server";

import { getCurrentTrader } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPayout, getLedgerBalance } from "@/lib/squad";
import { formatNaira } from "@/lib/format";

const MERCHANT_ID = "SB8644AAYV";

export async function withdrawBalance(amount: number): Promise<
  { success: true; amount: number; accountName: string } | { error: string } | { error: "NEED_BANK_DETAILS" }
> {
  const trader = await getCurrentTrader();
  if (!trader) return { error: "Session expired." };

  const balance = Number(trader.wallet_balance ?? 0);
  if (balance < 100) return { error: "Nothing to withdraw yet." };
  if (amount < 100) return { error: "Minimum withdrawal is ₦100." };
  if (amount > balance) return { error: "Amount exceeds your available balance." };

  if (
    !trader.disbursement_account_number ||
    !trader.disbursement_bank_code ||
    !trader.disbursement_account_name
  ) {
    return { error: "NEED_BANK_DETAILS" };
  }

  // Validate against the real Squad merchant wallet before attempting the transfer.
  // DB wallet_balance can exceed Squad's actual balance if loan disbursements have
  // drawn from the same merchant wallet independently.
  try {
    const squadBalance = await getLedgerBalance();
    // Squad returns balance in naira (same unit as our amount)
    if (amount > squadBalance) {
      return {
        error: `Payout wallet balance is ${formatNaira(squadBalance)} right now. Try a smaller amount.`,
      };
    }
  } catch {
    // If balance check fails, let the transfer attempt proceed — Squad will reject if insufficient
  }

  const reference = `${MERCHANT_ID}_w${crypto.randomUUID().replace(/-/g, "")}`;
  const amountKobo = String(Math.round(amount * 100));

  try {
    await sendPayout({
      reference,
      amountKobo,
      bankCode: trader.disbursement_bank_code,
      accountNumber: trader.disbursement_account_number,
      accountName: trader.disbursement_account_name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg || "Transfer failed. Try again." };
  }

  const supabase = await createServiceClient();
  const newBalance = balance - amount;

  const { error: balanceErr } = await (supabase.from("traders") as ReturnType<typeof supabase.from>)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ wallet_balance: newBalance } as any)
    .eq("id", trader.id);

  if (balanceErr) console.error("[withdraw] balance update failed:", balanceErr);

  // Record the outgoing transfer so it appears in the transaction feed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("transactions") as any).insert({
    trader_id: trader.id,
    transaction_reference: reference,
    sender_name: "Withdrawal",
    sender_account: trader.disbursement_account_number,
    amount: -amount,
    settled_amount: -amount,
    transaction_date: new Date().toISOString(),
    raw_payload: { type: "withdrawal", destination: trader.disbursement_account_number },
  });

  return { success: true, amount, accountName: trader.disbursement_account_name };
}
