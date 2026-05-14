import { getCurrentTrader } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { tierForScore } from "@/lib/loan-tiers";
import type { Loan } from "@/lib/supabase/types";
import BorrowClient from "./_components/borrow-client";

export const dynamic = "force-dynamic";

export default async function BorrowPage() {
  const trader = await getCurrentTrader();
  if (!trader) redirect("/onboard");

  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loanData } = await (supabase as any)
    .from("loans")
    .select("*")
    .eq("trader_id", trader.id)
    .in("status", ["active", "pending"])
    .maybeSingle();

  const activeLoan = (loanData ?? null) as Loan | null;
  const tier = tierForScore(trader.trust_score);

  return (
    <BorrowClient
      creditLimit={Number(trader.credit_limit)}
      trustScore={trader.trust_score}
      tier={tier}
      hasDisbursementAccount={!!trader.disbursement_account_number}
      disbursementBankCode={trader.disbursement_bank_code ?? ""}
      disbursementAccountNumber={trader.disbursement_account_number ?? ""}
      disbursementAccountName={trader.disbursement_account_name ?? ""}
      activeLoan={activeLoan}
    />
  );
}
