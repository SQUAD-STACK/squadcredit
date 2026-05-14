import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { formatNaira, formatRelativeDate } from "@/lib/format";
import type { Transaction } from "@/lib/supabase/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const avatarColors = [
  { bg: "#fff4ef", text: "#c44112" },
  { bg: "#f0fdf4", text: "#16a34a" },
  { bg: "#eff6ff", text: "#2563eb" },
  { bg: "#fdf4ff", text: "#9333ea" },
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session.traderId) redirect("/");

  const params = searchParams ? await searchParams : {};
  const query = params?.q?.trim() ?? "";

  const supabase = await createServiceClient();
  let req = supabase
    .from("transactions")
    .select("*")
    .eq("trader_id", session.traderId)
    .order("transaction_date", { ascending: false })
    .limit(200);

  if (query) {
    req = req.ilike("sender_name", `%${query}%`);
  }

  const { data } = await req;
  const transactions = (data ?? []) as Transaction[];

  return (
    <div style={{ paddingTop: "8px" }}>

      {/* Back button + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#f3f4f6",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>
          All payments
        </h1>
      </div>

      {/* Search filter */}
      <form method="GET" action="/transactions" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1.5px solid #f3f4f6",
            padding: "0 14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            gap: "10px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search by sender name"
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: "14px",
              fontFamily: "inherit",
              color: "#111827",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
            }}
          />
          {query && (
            <Link
              href="/transactions"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#9ca3af",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Count */}
      {transactions.length > 0 && (
        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px", fontWeight: 500 }}>
          {query ? `${transactions.length} result${transactions.length !== 1 ? "s" : ""} for "${query}"` : `${transactions.length} payment${transactions.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* List */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {transactions.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              {query ? "No payments found" : "No payments yet"}
            </p>
            <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "18px" }}>
              {query ? "Try a different name." : "Share your payment number to start receiving money."}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none" }}>
            {transactions.map((tx, i) => {
              const initials = tx.sender_name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];
              const isLast = i === transactions.length - 1;

              return (
                <li
                  key={tx.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 20px",
                    borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: color.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: color.text,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.01em",
                        marginBottom: "2px",
                      }}
                    >
                      {toTitleCase(tx.sender_name)}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {formatRelativeDate(tx.transaction_date)}
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#059669",
                      letterSpacing: "-0.02em",
                      fontFeatureSettings: '"tnum"',
                      flexShrink: 0,
                    }}
                  >
                    +{formatNaira(tx.settled_amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
