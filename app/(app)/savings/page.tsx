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
      <div style={{ background: "linear-gradient(140deg, #FF7B4B 0%, #F25C19 50%, #E04B0D 100%)", borderRadius: "24px", padding: "24px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none" }} />
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
          Total saved
        </p>
        <p style={{ fontSize: "48px", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px", fontFeatureSettings: '"tnum"' }}>
          {formatNaira(balance)}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "18px" }}>
          Swept automatically from your daily payments
        </p>
      </div>

      {/* Savings rule */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "14px" }}>
          Active rule
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#fff4ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#f25c19" }}>{rulePct}%</span>
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "3px", letterSpacing: "-0.02em" }}>
              {rulePct}% of payments above {formatNaira(ruleThreshold)}
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "18px" }}>
              Auto-swept before it reaches your account
            </p>
          </div>
        </div>
      </div>

      {/* Goal */}
      {goalAmount && goalPct !== null ? (
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "4px" }}>Saving for</p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{goalLabel}</p>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#f25c19", letterSpacing: "-0.03em" }}>{goalPct}%</span>
          </div>
          <div style={{ height: "6px", backgroundColor: "#f3f4f6", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
            <div style={{ height: "100%", width: `${goalPct}%`, backgroundColor: "#f25c19", borderRadius: "99px", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>{formatNaira(balance)} saved</span>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>{formatNaira(goalAmount)} goal</span>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "6px", letterSpacing: "-0.02em" }}>Set a savings goal</p>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "19px", marginBottom: "16px" }}>
            A second stall, new stock, school fees — set a target and track your progress as payments come in.
          </p>
          <button disabled style={{ width: "100%", padding: "14px 20px", backgroundColor: "#f3f4f6", color: "#9ca3af", borderRadius: "12px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", border: "none", cursor: "not-allowed", textAlign: "center" }}>
            Set a goal (coming soon)
          </button>
        </div>
      )}

      {/* How it works */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>How it works</h2>
        </div>

        {[
          { step: "1", title: "Customer pays you", body: `A customer sends to your payment number (${trader.virtual_account_number ?? "your NUBAN"}).` },
          { step: "2", title: `${rulePct}% goes to savings`, body: `If the payment is above ${formatNaira(ruleThreshold)}, we move ${rulePct}% to your savings wallet before you see the rest.` },
          { step: "3", title: "Rest lands in your account", body: "The remaining balance is yours immediately — no manual transfers." },
        ].map((item, i, arr) => (
          <div key={item.step} style={{ display: "flex", gap: "14px", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff4ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#f25c19" }}>
              {item.step}
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "3px", letterSpacing: "-0.01em" }}>{item.title}</p>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "18px" }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
