"use client";

import { formatNaira, formatRelativeDate } from "@/lib/format";
import type { Transaction } from "@/lib/supabase/types";

interface TransactionFeedProps {
  transactions: Transaction[];
}

export default function TransactionFeed({ transactions }: TransactionFeedProps) {
  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface-raised, #fff)",
        border: "1px solid var(--border-subtle, rgba(26,24,21,0.08))",
        boxShadow: "var(--shadow-card, 0 1px 3px rgba(26,24,21,0.04))",
      }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle, rgba(26,24,21,0.08))" }}>
        <h2
          className="text-[15px] font-medium"
          style={{ color: "var(--color-text-primary, #1a1815)" }}
        >
          Recent payments
        </h2>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p style={{ color: "var(--color-text-tertiary, #8b867e)", fontSize: "14px" }}>
            No payments yet. Share your payment number to get started.
          </p>
        </div>
      ) : (
        <ul>
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
      className="flex items-center gap-3 px-6 h-14 transition-colors"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle, rgba(26,24,21,0.08))",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor =
          "var(--color-surface-sunken, #f4f3ee)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLLIElement).style.backgroundColor = "";
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
        style={{
          backgroundColor: "var(--color-squad-orange-50, #fef1eb)",
          color: "var(--color-squad-orange-700, #a93808)",
        }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ color: "var(--color-text-primary, #1a1815)" }}
        >
          {toTitleCase(transaction.sender_name)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className="text-sm font-medium tnum"
          style={{
            color: "var(--color-success, #0f7a4d)",
            fontFeatureSettings: '"tnum"',
          }}
        >
          +{formatNaira(transaction.settled_amount)}
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-text-tertiary, #8b867e)" }}
        >
          {formatRelativeDate(transaction.transaction_date)}
        </p>
      </div>
    </li>
  );
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
