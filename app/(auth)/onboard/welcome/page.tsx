import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader } from "@/lib/supabase/types";
import Link from "next/link";

export default async function WelcomePage() {
  const session = await getSession();
  if (!session.traderId) redirect("/onboard");

  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("traders")
    .select("first_name, virtual_account_number")
    .eq("id", session.traderId)
    .single();

  const trader = data as Pick<Trader, "first_name" | "virtual_account_number"> | null;
  const firstName = trader?.first_name ?? session.firstName ?? "there";

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "24px" }}>
        You&apos;re all set
      </p>

      <h1
        style={{
          fontFamily: "var(--font-display, 'Instrument Serif', serif)",
          fontSize: "40px",
          lineHeight: "44px",
          letterSpacing: "-0.015em",
          color: "#1a1815",
          marginBottom: "16px",
        }}
      >
        Welcome, {firstName}.
      </h1>

      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "32px" }}>
        Your Squad account is ready. Every payment you receive builds your credit score and unlocks working capital.
      </p>

      {trader?.virtual_account_number && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 0 0 1px rgba(26,24,21,0.08)",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#8b867e", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
            Your payment number
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: "22px",
              letterSpacing: "0.05em",
              color: "#1a1815",
              marginBottom: "4px",
            }}
          >
            {trader.virtual_account_number}
          </p>
          <p style={{ fontSize: "13px", color: "#8b867e" }}>
            GTBank · Share this number to receive payments
          </p>
        </div>
      )}

      <Link
        href="/dashboard"
        style={{
          display: "block",
          width: "100%",
          padding: "16px 24px",
          backgroundColor: "#f25c19",
          color: "#fff",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: 500,
          textAlign: "center",
          textDecoration: "none",
          transition: "background-color 0.15s ease",
        }}
      >
        Go to my account
      </Link>
    </div>
  );
}
