import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/format";
import { getBank } from "@/lib/banks";
import type { Loan } from "@/lib/supabase/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

export default async function BorrowSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}) {
  const session = await getSession();
  if (!session.traderId) redirect("/");

  const params = searchParams ? await searchParams : {};
  const loanId = params?.ref;
  if (!loanId) redirect("/borrow");

  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loanData } = await (supabase as any)
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single();

  const loan = loanData as Loan | null;
  if (!loan) redirect("/borrow");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: traderData } = await (supabase as any)
    .from("traders")
    .select("disbursement_bank_code, disbursement_account_number, first_name")
    .eq("id", session.traderId)
    .single();

  const bankCode: string = traderData?.disbursement_bank_code ?? "";
  const accountNumber: string = traderData?.disbursement_account_number ?? "";
  const bankName = getBank(bankCode)?.name ?? "your bank";
  const last4 = accountNumber.slice(-4);
  const holdbackPct = Math.round(Number(loan.holdback_percentage) * 100);

  const timelineNodes = [
    { label: "Request received", sub: "Verified by SquadCredit" },
    { label: "Approved", sub: `${formatNaira(Number(loan.principal))} at ${(Number(loan.fee) / Number(loan.principal) * 100).toFixed(0)}% flat fee` },
    { label: `Sent to your ${bankName} account`, sub: `Ending in ···${last4}` },
  ];

  return (
    <div style={{ paddingTop: "40px" }}>

      {/* Hero text */}
      <div style={{ marginBottom: "8px" }}>
        <p
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            fontFeatureSettings: '"tnum"',
          }}
        >
          {formatNaira(Number(loan.principal))} sent
        </p>
      </div>

      {/* "Money sent" pill */}
      <div style={{ marginBottom: "36px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#ecfdf5",
            color: "#059669",
            fontSize: "13px",
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: "99px",
            letterSpacing: "-0.01em",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Money sent
        </span>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: "28px" }}>
        {timelineNodes.map((node, i) => (
          <div key={node.label} style={{ display: "flex", gap: "16px" }}>
            {/* Left column: circle + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#ecfdf5",
                  border: "1.5px solid #059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {i < timelineNodes.length - 1 && (
                <div
                  style={{
                    width: "1.5px",
                    flex: 1,
                    minHeight: "28px",
                    backgroundColor: "rgba(26,24,21,0.08)",
                    margin: "4px 0",
                  }}
                />
              )}
            </div>

            {/* Right column: text */}
            <div style={{ paddingBottom: i < timelineNodes.length - 1 ? "20px" : "0" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", letterSpacing: "-0.01em", marginBottom: "2px" }}>
                {node.label}
              </p>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                {node.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Repayment details card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total to repay", value: formatNaira(Number(loan.total_due)) },
          {
            label: "Repayment",
            value: holdbackPct > 0 ? `${holdbackPct}% of every payment` : "Bullet at end of term",
          },
          { label: "Due by", value: formatDueDate(loan.due_at) },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(26,24,21,0.05)" : "none",
            }}
          >
            <span style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "0.02em", textTransform: "uppercase" }}>{row.label}</span>
            <span
              style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: "14px",
                fontWeight: 500,
                color: "#111827",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "56px",
          backgroundColor: "#f25c19",
          color: "#fff",
          borderRadius: "16px",
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "inherit",
          letterSpacing: "-0.02em",
          textDecoration: "none",
        }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
