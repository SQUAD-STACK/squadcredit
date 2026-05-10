"use client";

import { formatNaira, formatRelativeDate } from "@/lib/format";
import type { Loan } from "@/lib/supabase/types";

interface LoanBannerProps {
  loan: Loan;
}

export default function LoanBanner({ loan }: LoanBannerProps) {
  const remaining = loan.total_due - loan.amount_repaid;
  const progress = Math.min((loan.amount_repaid / loan.total_due) * 100, 100);
  const isOverdue = new Date(loan.due_at) < new Date();

  return (
    <div
      className="rounded-[16px] p-6"
      style={{
        backgroundColor: isOverdue
          ? "var(--color-danger-bg, #fae8e6)"
          : "var(--color-warning-bg, #fbf1dc)",
        border: `1px solid ${isOverdue ? "var(--color-danger, #a8211a)" : "var(--color-warning, #b8730a)"}22`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p
            className="text-xs font-medium mb-0.5"
            style={{
              color: isOverdue
                ? "var(--color-danger, #a8211a)"
                : "var(--color-warning, #b8730a)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              fontSize: "11px",
            }}
          >
            {isOverdue ? "Overdue" : "Active loan"}
          </p>
          <p
            className="text-lg font-medium tnum"
            style={{
              color: "var(--color-text-primary, #1a1815)",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {formatNaira(remaining)} left
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xs"
            style={{ color: "var(--color-text-secondary, #5c5852)" }}
          >
            Due {formatRelativeDate(loan.due_at)}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-tertiary, #8b867e)" }}
          >
            {loan.holdback_percentage * 100}% auto-repaid from payments
          </p>
        </div>
      </div>

      <div
        className="w-full h-1.5 rounded-full"
        style={{ backgroundColor: "rgba(26,24,21,0.08)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: isOverdue
              ? "var(--color-danger, #a8211a)"
              : "var(--color-warning, #b8730a)",
          }}
        />
      </div>

      <p
        className="text-xs mt-2"
        style={{ color: "var(--color-text-tertiary, #8b867e)" }}
      >
        {formatNaira(loan.amount_repaid)} of {formatNaira(loan.total_due)} repaid
      </p>
    </div>
  );
}
