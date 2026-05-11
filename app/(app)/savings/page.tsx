import { getCurrentTrader } from "@/lib/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/format";
import type { Savings } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const trader = await getCurrentTrader();
  if (!trader) redirect("/onboard");

  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("savings")
    .select("*")
    .eq("trader_id", trader.id)
    .maybeSingle();

  const savings = data as Savings | null;
  const balance = savings ? Number(savings.balance) : 0;
  const rulePct = savings ? Math.round(Number(savings.rule_percentage) * 100) : 5;
  const ruleThreshold = savings ? Number(savings.rule_threshold) : 5000;
  const goalAmount = savings?.goal_amount ? Number(savings.goal_amount) : null;
  const goalLabel = savings?.goal_label ?? "My savings";
  const goalPct = goalAmount ? Math.min(Math.round((balance / goalAmount) * 100), 100) : null;

  return (
    <div style={{ paddingTop: "16px" }}>
      {/* Balance hero */}
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
          Total saved
        </p>
        <p
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "56px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "8px",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {formatNaira(balance)}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: "18px" }}>
          Swept automatically from your daily payments — no action needed
        </p>
      </div>

      {/* Active savings rule */}
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
            marginBottom: "14px",
          }}
        >
          Active savings rule
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#fef1eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "18px",
                fontWeight: 800,
                color: "#f25c19",
              }}
            >
              {rulePct}%
            </span>
          </div>
          <div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1a1815",
                marginBottom: "2px",
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
              }}
            >
              {rulePct}% of payments above {formatNaira(ruleThreshold)}
            </p>
            <p style={{ fontSize: "13px", color: "#5c5852", lineHeight: "18px" }}>
              Each time a customer pays you more than {formatNaira(ruleThreshold)}, we
              set aside {rulePct}% before it reaches your account.
            </p>
          </div>
        </div>
      </div>

      {/* Goal progress */}
      {goalAmount && goalPct !== null ? (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "0 0 0 1px rgba(26,24,21,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#8b867e",
                  marginBottom: "4px",
                }}
              >
                Saving for
              </p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1a1815",
                  fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                }}
              >
                {goalLabel}
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "20px",
                fontWeight: 800,
                color: "#f25c19",
              }}
            >
              {goalPct}%
            </span>
          </div>

          <div
            style={{
              height: "6px",
              backgroundColor: "#f4f3ee",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${goalPct}%`,
                backgroundColor: "#f25c19",
                borderRadius: "3px",
                transition: "width 0.5s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#5c5852" }}>{formatNaira(balance)} saved</span>
            <span style={{ fontSize: "12px", color: "#8b867e" }}>{formatNaira(goalAmount)} goal</span>
          </div>
        </div>
      ) : (
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
              marginBottom: "10px",
            }}
          >
            Savings goal
          </p>
          <p style={{ fontSize: "14px", color: "#5c5852", lineHeight: "20px", marginBottom: "14px" }}>
            Set a goal — a second stall, new stock, school fees — and we will track your progress as payments come in.
          </p>
          <button
            disabled
            style={{
              width: "100%",
              padding: "14px 20px",
              backgroundColor: "#f4f3ee",
              color: "#8b867e",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
              border: "none",
              cursor: "not-allowed",
              textAlign: "center",
            }}
          >
            Set a savings goal (coming soon)
          </button>
        </div>
      )}

      {/* How it works */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
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
            How it works
          </h2>
        </div>

        {[
          {
            step: "1",
            title: "Customer pays you",
            body: `A customer sends money to your payment number (${trader.virtual_account_number ?? "your NUBAN"}).`,
          },
          {
            step: "2",
            title: `${rulePct}% is swept to savings`,
            body: `If the payment is above ${formatNaira(ruleThreshold)}, we move ${rulePct}% to your savings wallet automatically.`,
          },
          {
            step: "3",
            title: "Rest goes to your account",
            body: "The remaining balance is yours immediately. No manual transfers needed.",
          },
        ].map((item, i, arr) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              gap: "14px",
              padding: "16px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(26,24,21,0.06)" : "none",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#fef1eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "12px",
                fontWeight: 800,
                color: "#f25c19",
              }}
            >
              {item.step}
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1a1815",
                  marginBottom: "2px",
                  fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                }}
              >
                {item.title}
              </p>
              <p style={{ fontSize: "13px", color: "#5c5852", lineHeight: "18px" }}>
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
