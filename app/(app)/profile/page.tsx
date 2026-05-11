import { getCurrentTrader } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatNaira } from "@/lib/format";
import LogoutButton from "./_logout-button";

export const dynamic = "force-dynamic";

function tierLabel(score: number) {
  if (score >= 800) return "Anchor";
  if (score >= 700) return "Scale";
  if (score >= 600) return "Growth";
  if (score >= 500) return "Established";
  if (score >= 400) return "Builder";
  if (score >= 300) return "Starter";
  return "Trial";
}

export default async function ProfilePage() {
  const trader = await getCurrentTrader();
  if (!trader) redirect("/onboard");

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Phone", value: trader.phone },
    { label: "Market", value: trader.market },
    { label: "Business", value: trader.business_type },
    { label: "Payment number", value: trader.virtual_account_number ?? "—", mono: true },
    { label: "Bank", value: "GTBank" },
    { label: "Credit limit", value: formatNaira(Number(trader.credit_limit)) },
    { label: "Tier", value: tierLabel(trader.trust_score) },
    { label: "Member since", value: new Date(trader.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <div style={{ paddingTop: "16px", paddingBottom: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "#fef1eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "20px",
            fontWeight: 800,
            color: "#a93808",
            letterSpacing: "-0.02em",
          }}
        >
          {trader.first_name[0]}{trader.last_name[0]}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "24px",
            fontWeight: 800,
            color: "#1a1815",
            letterSpacing: "-0.03em",
            marginBottom: "4px",
          }}
        >
          {trader.first_name} {trader.last_name}
        </h1>
        <p style={{ fontSize: "13px", color: "#8b867e" }}>
          Score {trader.trust_score} · {tierLabel(trader.trust_score)}
        </p>
      </div>

      {/* Detail rows */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(26,24,21,0.08)",
          marginBottom: "16px",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(26,24,21,0.06)" : "none",
              gap: "16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#5c5852", flexShrink: 0 }}>
              {row.label}
            </span>
            <span
              style={{
                fontFamily: row.mono
                  ? "var(--font-mono, 'JetBrains Mono', monospace)"
                  : "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1a1815",
                textAlign: "right",
                letterSpacing: row.mono ? "0.04em" : "-0.01em",
                wordBreak: "break-all",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <LogoutButton />
    </div>
  );
}
