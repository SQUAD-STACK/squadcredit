import { createServiceClient } from "@/lib/supabase/server";
import type { Trader, Transaction, Loan, Savings } from "@/lib/supabase/types";
import ScoreCard from "@/components/score-card";
import TransactionFeed from "@/components/transaction-feed";
import LoanBanner from "@/components/loan-banner";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

const DEMO_TRADER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServiceClient();

  const [traderRes, txRes, loanRes, savingsRes] = await Promise.all([
    supabase.from("traders").select("*").eq("id", DEMO_TRADER_ID).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("trader_id", DEMO_TRADER_ID)
      .order("transaction_date", { ascending: false })
      .limit(20),
    supabase
      .from("loans")
      .select("*")
      .eq("trader_id", DEMO_TRADER_ID)
      .eq("status", "active")
      .maybeSingle(),
    supabase.from("savings").select("*").eq("trader_id", DEMO_TRADER_ID).maybeSingle(),
  ]);

  const trader = traderRes.data as Trader | null;
  const transactions = (txRes.data ?? []) as Transaction[];
  const activeLoan = (loanRes.data ?? null) as Loan | null;
  const savings = (savingsRes.data ?? null) as Savings | null;

  if (!trader) {
    return (
      <div className="pt-16 text-center" style={{ color: "var(--color-text-secondary, #5c5852)" }}>
        <p>Supabase isn&apos;t connected yet.</p>
        <p className="text-sm mt-1">Add your keys to .env.local to continue.</p>
      </div>
    );
  }

  const isVerified = trader.kyc_status === "verified";

  return (
    <div className="pt-6 space-y-4">
      {/* Verification banner for unverified traders */}
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
