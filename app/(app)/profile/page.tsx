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
    {
      label: "Member since",
      value: new Date(trader.created_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <div style={{ paddingTop: "16px", paddingBottom: "24px" }}>

      {/* Avatar + name */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            backgroundColor: "#fff4ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
            fontSize: "22px",
            fontWeight: 700,
            color: "#f25c19",
            letterSpacing: "-0.02em",
          }}
        >
          {trader.first_name[0]}{trader.last_name[0]}
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.03em",
            marginBottom: "4px",
          }}
        >
          {trader.first_name} {trader.last_name}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>
            Score {trader.trust_score}
          </span>
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#d1d5db", display: "inline-block" }} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#f25c19",
              backgroundColor: "#fff4ef",
              padding: "2px 10px",
              borderRadius: "99px",
              letterSpacing: "0.02em",
            }}
          >
            {tierLabel(trader.trust_score)}
          </span>
        </div>
      </div>

      {/* Detail rows */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          marginBottom: "14px",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "15px 20px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              gap: "16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: 500, flexShrink: 0 }}>
              {row.label}
            </span>
            <span
              style={{
                fontFamily: row.mono
                  ? "var(--font-mono, 'JetBrains Mono', monospace)"
                  : "inherit",
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
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

      <LogoutButton />
    </div>
  );
}
