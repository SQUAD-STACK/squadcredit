import { getCurrentTrader } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

const TIERS = [
  { id: 0, label: "Trial", minScore: 0, days: 7, feePct: 5, holdback: null },
  { id: 1, label: "Starter", minScore: 300, days: 14, feePct: 6, holdback: 15 },
  { id: 2, label: "Builder", minScore: 400, days: 21, feePct: 7, holdback: 15 },
  { id: 3, label: "Established", minScore: 500, days: 30, feePct: 7.5, holdback: 12 },
  { id: 4, label: "Growth", minScore: 600, days: 45, feePct: 9, holdback: 10 },
];

function getTier(score: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i].minScore) return TIERS[i];
  }
  return TIERS[0];
}

export default async function BorrowPage() {
  const trader = await getCurrentTrader();
  if (!trader) redirect("/onboard");

  const creditLimit = Number(trader.credit_limit);
  const tier = getTier(trader.trust_score);
  const fee = Math.round(creditLimit * (tier.feePct / 100));
  const totalDue = creditLimit + fee;
  const hasLimit = creditLimit > 0;

  const breakdownRows = hasLimit
    ? [
        { label: "Loan amount", value: formatNaira(creditLimit) },
        { label: `Flat fee (${tier.feePct}%)`, value: formatNaira(fee) },
        { label: "Total to repay", value: formatNaira(totalDue), highlight: true },
        {
          label: "Repayment",
          value: tier.holdback ? `${tier.holdback}% of each payment` : "Bullet at end of term",
        },
        { label: "Term", value: `${tier.days} days` },
      ]
    : [];

  return (
    <div style={{ paddingTop: "16px" }}>

      {/* Hero card */}
      <div
        style={{
          background: "linear-gradient(140deg, #FF7B4B 0%, #F25C19 50%, #E04B0D 100%)",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none" }} />

        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
          Your loan limit
        </p>
        <p style={{ fontSize: "48px", fontWeight: 700, color: hasLimit ? "#fff" : "rgba(255,255,255,0.3)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px", fontFeatureSettings: '"tnum"' }}>
          {hasLimit ? formatNaira(creditLimit) : "—"}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "18px" }}>
          {hasLimit ? "Repaid automatically from your daily sales" : "Receive your first payment to unlock borrowing"}
        </p>

        {hasLimit ? (
          <div style={{ display: "inline-flex", marginTop: "16px", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: "99px", padding: "5px 14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff" }}>
              {tier.label} tier
            </span>
          </div>
        ) : null}
      </div>

      {/* Tier ladder */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "16px" }}>
          Tier progress
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          {TIERS.slice(0, 4).map((t) => {
            const unlocked = trader.trust_score >= t.minScore;
            const current = tier.id === t.id;
            return (
              <div key={t.id} style={{ flex: 1 }}>
                <div style={{ height: "4px", borderRadius: "99px", marginBottom: "8px", backgroundColor: current ? "#f25c19" : unlocked ? "#059669" : "#f3f4f6" }} />
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: current ? "#f25c19" : unlocked ? "#059669" : "#9ca3af", marginBottom: "2px" }}>
                  {t.label}
                </p>
                <p style={{ fontSize: "10px", color: current ? "#f25c19" : unlocked ? "#6b7280" : "#9ca3af" }}>
                  {current ? "Current" : unlocked ? "Done" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan breakdown */}
      {hasLimit ? (
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
              Loan breakdown
            </h2>
          </div>

          {breakdownRows.map((row, i) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < breakdownRows.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 400 }}>{row.label}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: row.highlight ? "#f25c19" : "#111827", fontFeatureSettings: '"tnum"', letterSpacing: "-0.01em" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginBottom: "16px", lineHeight: "18px" }}>
        No hidden fees. All fees shown are the total cost.
      </p>

      <button
        disabled
        style={{ width: "100%", padding: "18px 24px", backgroundColor: hasLimit ? "#f25c19" : "#f3f4f6", color: hasLimit ? "#fff" : "#9ca3af", borderRadius: "14px", fontSize: "16px", fontWeight: 700, fontFamily: "inherit", letterSpacing: "-0.02em", border: "none", cursor: "not-allowed", textAlign: "center", opacity: hasLimit ? 0.9 : 1 }}
      >
        {hasLimit ? `Get ${formatNaira(creditLimit)} now` : "Build your score to borrow"}
      </button>

      {hasLimit ? (
        <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "10px" }}>
          Disbursement going live soon.
        </p>
      ) : null}
    </div>
  );
}
