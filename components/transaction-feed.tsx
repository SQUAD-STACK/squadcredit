"use client";

import Link from "next/link";
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
          padding: "16px 20px",
          borderBottom: "1px solid rgba(26,24,21,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Recent payments
        </h2>
        <Link
          href="/transactions"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#9ca3af",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            transition: "color 0.15s ease",
          }}
        >
          See all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.3,
            }}
          >
            No payments yet. Share your payment number to start building your score.
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

function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function TransactionRow({ transaction, isLast }: { transaction: Transaction; isLast: boolean }) {
  const parts = transaction.sender_name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const monogramColor =
    (initials.charCodeAt(0) || 0) % 2 === 0 ? "#F25C19" : "#E91E63";

  const displayName = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "0 20px",
        height: "64px",
        borderBottom: isLast ? "none" : "1px solid rgba(26,24,21,0.05)",
      }}
    >
      {/* Monogram */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: monogramColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "10px",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>

      {/* Name + time */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "2px",
          }}
        >
          {displayName}
        </p>
        <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 400 }}>
          {formatRelativeDate(transaction.transaction_date)}
        </p>
      </div>

      {/* Amount */}
      <p
        style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: "15px",
          fontWeight: 500,
          color: "#059669",
          letterSpacing: "-0.02em",
          fontFeatureSettings: '"tnum"',
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        +{formatNaira(transaction.settled_amount)}
      </p>
    </li>
  );
}
