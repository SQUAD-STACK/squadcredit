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
          backgroundColor: "#1c1917",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "8px",
          }}
        >
          Your loan limit
        </p>
        <p
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "56px",
            fontWeight: 800,
            color: hasLimit ? "#fff" : "rgba(255,255,255,0.25)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "8px",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {hasLimit ? formatNaira(creditLimit) : "—"}
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            lineHeight: "18px",
          }}
        >
          {hasLimit
            ? "Repaid automatically from your daily sales — no stress"
            : "Receive your first payment to unlock your credit limit"}
        </p>

        {hasLimit && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "14px",
              backgroundColor: "rgba(242,92,25,0.18)",
              borderRadius: "6px",
              padding: "6px 12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#f25c19",
              }}
            >
              {tier.label} tier unlocked
            </span>
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 0 0 1px rgba(26,24,21,0.07)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#8b867e",
            marginBottom: "16px",
          }}
        >
          Your tier progress
        </p>

        <div style={{ display: "flex", gap: "6px" }}>
          {TIERS.slice(0, 4).map((t) => {
            const unlocked = trader.trust_score >= t.minScore;
            const current = tier.id === t.id;
            return (
              <div key={t.id} style={{ flex: 1 }}>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor: current
                      ? "#f25c19"
                      : unlocked
                      ? "#0f7a4d"
                      : "rgba(26,24,21,0.08)",
                    marginBottom: "8px",
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: current ? "#f25c19" : unlocked ? "#0f7a4d" : "#8b867e",
                    marginBottom: "2px",
                  }}
                >
                  {t.label}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: current ? "#f25c19" : unlocked ? "#5c5852" : "#8b867e",
                  }}
                >
                  {current ? "Current" : unlocked ? "Done" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan breakdown */}
      {hasLimit && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "16px",
            boxShadow: "0 0 0 1px rgba(26,24,21,0.07)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(26,24,21,0.07)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1a1815",
                letterSpacing: "-0.01em",
              }}
            >
              Loan breakdown
            </h2>
          </div>

          {breakdownRows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom:
                  i < breakdownRows.length - 1 ? "1px solid rgba(26,24,21,0.06)" : "none",
              }}
            >
              <span style={{ fontSize: "14px", color: "#5c5852" }}>{row.label}</span>
              <span
                style={{
                  fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                  fontSize: "14px",
                  fontWeight: row.highlight ? 800 : 600,
                  color: row.highlight ? "#f25c19" : "#1a1815",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trust note */}
      <p
        style={{
          fontSize: "12px",
          color: "#8b867e",
          textAlign: "center",
          marginBottom: "16px",
          lineHeight: "18px",
        }}
      >
        No hidden fees. No harassment. All fees shown are the total cost — no compounding interest.
      </p>

      {/* CTA */}
      <button
        disabled
        style={{
          width: "100%",
          padding: "18px 24px",
          backgroundColor: hasLimit ? "#f25c19" : "#edebe3",
          color: hasLimit ? "#fff" : "#8b867e",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
          letterSpacing: "-0.01em",
          border: "none",
          cursor: "not-allowed",
          textAlign: "center",
          opacity: hasLimit ? 0.85 : 1,
        }}
      >
        {hasLimit ? `Get ${formatNaira(creditLimit)} now` : "Build your score to borrow"}
      </button>

      {hasLimit && (
        <p
          style={{
            fontSize: "12px",
            color: "#8b867e",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          Disbursement going live soon — your score already qualifies you.
        </p>
      )}
    </div>
  );
}
