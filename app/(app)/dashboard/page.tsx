import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader, Transaction, Loan, Savings } from "@/lib/supabase/types";
import ScoreCard from "@/components/score-card";
import TransactionFeed from "@/components/transaction-feed";
import LoanBanner from "@/components/loan-banner";
import Link from "next/link";
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

  return (
    <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <RealtimeRefresher traderId={trader.id} />
      {!isVerified && (
        <Link
          href="/verify"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderRadius: "16px",
            padding: "14px 16px",
            backgroundColor: "#fff4ef",
            border: "1.5px solid #f25c19",
            textDecoration: "none",
          }}
        >
          <ShieldAlert size={22} color="#f25c19" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#c44112", letterSpacing: "-0.01em" }}>
              Complete your verification
            </p>
            <p style={{ fontSize: "12px", color: "#d96830", marginTop: "2px" }}>
              Verify your identity to unlock borrowing and savings
            </p>
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: "12px",
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: "99px",
              backgroundColor: "#f25c19",
              color: "#fff",
              fontFamily: "inherit",
            }}
          >
            Start
          </span>
        </Link>
      )}
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
