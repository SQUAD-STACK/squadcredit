import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader, Transaction, Loan, Savings } from "@/lib/supabase/types";
import ScoreCard from "@/components/score-card";
import TransactionFeed from "@/components/transaction-feed";
import LoanBanner from "@/components/loan-banner";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import RealtimeRefresher from "@/components/realtime-refresher";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const traderId = session.traderId!;

  const supabase = await createServiceClient();

  const [traderRes, txRes, loanRes, savingsRes] = await Promise.all([
    supabase.from("traders").select("*").eq("id", traderId).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("trader_id", traderId)
      .order("transaction_date", { ascending: false })
      .limit(20),
    supabase
      .from("loans")
      .select("*")
      .eq("trader_id", traderId)
      .eq("status", "active")
      .maybeSingle(),
    supabase.from("savings").select("*").eq("trader_id", traderId).maybeSingle(),
  ]);

  const trader = traderRes.data as Trader | null;
  const transactions = (txRes.data ?? []) as Transaction[];
  const activeLoan = (loanRes.data ?? null) as Loan | null;
  const savings = (savingsRes.data ?? null) as Savings | null;

  if (!trader) {
    return (
      <div style={{ paddingTop: "64px", textAlign: "center", color: "#6b7280" }}>
        <p>Something went wrong loading your account.</p>
      </div>
    );
  }

  const isVerified = trader.kyc_status === "verified";

  if (!isVerified) {
    redirect("/verify");
  }

  return (
    <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <RealtimeRefresher traderId={trader.id} />
      <ScoreCard
        firstName={trader.first_name}
        trustScore={trader.trust_score}
        creditLimit={Number(trader.credit_limit)}
        savingsBalance={savings ? Number(savings.balance) : 0}
        virtualAccountNumber={trader.virtual_account_number ?? ""}
        verified={isVerified}
      />

      {activeLoan && isVerified && <LoanBanner loan={activeLoan} />}

      <TransactionFeed transactions={transactions} />
    </div>
  );
}
