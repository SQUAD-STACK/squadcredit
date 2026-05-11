"use client";

import { formatNaira, formatRelativeDate } from "@/lib/format";
import type { Transaction } from "@/lib/supabase/types";

export default function TransactionFeed({ transactions }: { transactions: Transaction[] }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          Recent payments
        </h2>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "22px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
              <path d="M12 8V12"/>
              <path d="M12 16H12.01"/>
            </svg>
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "4px",
            }}
          >
            No payments yet
          </p>
          <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "18px" }}>
            Share your payment number to start receiving money.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none" }}>
          {transactions.map((tx, i) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              isLast={i === transactions.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TransactionRow({ transaction, isLast }: { transaction: Transaction; isLast: boolean }) {
  const initials = transaction.sender_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const colors = [
    { bg: "#fff4ef", text: "#c44112" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf4ff", text: "#9333ea" },
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
        transition: "background-color 0.1s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor = "";
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
          {toTitleCase(transaction.sender_name)}
        </p>
        <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 400 }}>
          {formatRelativeDate(transaction.transaction_date)}
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
        +{formatNaira(transaction.settled_amount)}
      </p>
    </li>
  );
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
