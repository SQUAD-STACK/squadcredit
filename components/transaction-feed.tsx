"use client";

import { formatNaira, formatRelativeDate } from "@/lib/format";
import type { Transaction } from "@/lib/supabase/types";

interface TransactionFeedProps {
  transactions: Transaction[];
}

export default function TransactionFeed({ transactions }: TransactionFeedProps) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(26,24,21,0.07), 0 1px 3px rgba(26,24,21,0.04)",
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
          Recent payments
        </h2>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "#8b867e", fontSize: "14px", lineHeight: "20px" }}>
            No payments yet. Share your payment number to get started.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
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

function TransactionRow({
  transaction,
  isLast,
}: {
  transaction: Transaction;
  isLast: boolean;
}) {
  const initials = transaction.sender_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(26,24,21,0.06)",
        transition: "background-color 0.1s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor = "#f4f3ee";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor = "";
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          backgroundColor: "#fef1eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
          fontSize: "11px",
          fontWeight: 700,
          color: "#a93808",
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#1a1815",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "1px",
          }}
        >
          {toTitleCase(transaction.sender_name)}
        </p>
        <p style={{ fontSize: "12px", color: "#8b867e" }}>
          {formatRelativeDate(transaction.transaction_date)}
        </p>
      </div>

      <p
        style={{
          fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
          fontSize: "15px",
          fontWeight: 700,
          color: "#0f7a4d",
          letterSpacing: "-0.01em",
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
