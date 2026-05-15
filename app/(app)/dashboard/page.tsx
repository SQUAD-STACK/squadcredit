import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader, Transaction, Loan, Savings } from "@/lib/supabase/types";
import ScoreCard from "@/components/score-card";
import DashboardCarousel from "@/components/dashboard-carousel";
import TransactionFeed from "@/components/transaction-feed";
import LoanBanner from "@/components/loan-banner";
import { ShieldAlert } from "lucide-react";
import RealtimeRefresher from "@/components/realtime-refresher";
import KycLauncher from "@/components/kyc/kyc-launcher";
import DashboardAccountMenu from "@/components/dashboard-account-menu";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const traderId = session.traderId;

  if (!traderId) {
    return (
      <div style={{ paddingTop: "64px", textAlign: "center", color: "#6b7280" }}>
        <p>Start onboarding to access your dashboard.</p>
      </div>
    );
  }

  const supabase = await createServiceClient();

  const [traderRes, txRes, loanRes, savingsRes] = await Promise.all([
    supabase.from("traders").select("*").eq("id", traderId).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("trader_id", traderId)
      .order("transaction_date", { ascending: false })
      .limit(5),
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
  const resolvedParams = searchParams ? await searchParams : {};
  const showKycParam = resolvedParams?.showKyc;
  const wantKyc =
    showKycParam === "1" ||
    showKycParam === "true" ||
    (Array.isArray(showKycParam) && (showKycParam.includes("1") || showKycParam.includes("true")));

  // Auto-open KYC modal for any unverified user regardless of query param
  const openKyc = !isVerified && (wantKyc || true);

  return (
    <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <RealtimeRefresher traderId={trader.id} />

      {!isVerified ? (
        <div
          style={{
            borderRadius: "18px",
            padding: "14px 16px",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.18)",
            color: "#7c2d12",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <ShieldAlert size={18} />
          <div style={{ fontSize: "14px", lineHeight: "20px" }}>
            Your account is active, but verification is not finished yet. Complete KYC to unlock the full dashboard.
          </div>
        </div>
      ) : null}

      {!isVerified ? (
        <KycLauncher
          traderId={trader.id}
          initialStep={1}
          initialOpen={openKyc}
          traderData={{
            firstName: trader.first_name,
            lastName: trader.last_name,
            phone: trader.phone,
            email: trader.email ?? "",
            market: trader.market ?? "",
            businessType: trader.business_type ?? "",
          }}
        />
      ) : null}

      <DashboardCarousel
        firstName={trader.first_name}
        walletBalance={Number(trader.wallet_balance ?? 0)}
        totalInflows={Number(trader.total_inflows ?? 0)}
        creditLimit={Number(trader.credit_limit)}
        virtualAccountNumber={trader.virtual_account_number ?? ""}
        disbursementAccountNumber={trader.disbursement_account_number ?? ""}
        disbursementBankCode={trader.disbursement_bank_code ?? ""}
      />

      <ScoreCard
        trustScore={trader.trust_score}
        savingsBalance={savings ? Number(savings.balance) : 0}
      />

      <DashboardAccountMenu />

      {activeLoan && isVerified ? <LoanBanner loan={activeLoan} /> : null}

      <TransactionFeed transactions={transactions} />
    </div>
  );
}
