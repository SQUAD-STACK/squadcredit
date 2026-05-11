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
      <div className="pt-16 text-center" style={{ color: "var(--color-text-secondary, #5c5852)" }}>
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
          className="mx-4 flex items-center gap-3 rounded-xl p-4 transition-all"
          style={{
            backgroundColor: "var(--color-squad-orange-50, #fef1eb)",
            border: "1px solid var(--color-squad-orange, #f25c19)",
          }}
        >
          <ShieldAlert
            size={24}
            style={{ color: "var(--color-squad-orange, #f25c19)", flexShrink: 0 }}
          />
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--color-squad-orange-700, #a93808)" }}
            >
              Complete your verification
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-squad-orange-600, #d44a0f)" }}
            >
              Verify your identity to unlock borrowing and savings
            </p>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "var(--color-squad-orange, #f25c19)",
              color: "#fff",
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
