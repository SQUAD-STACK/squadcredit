"use client";

import { formatNaira } from "@/lib/format";
import { Lock } from "lucide-react";

interface ScoreCardProps {
  firstName: string;
  trustScore: number;
  creditLimit: number;
  savingsBalance: number;
  virtualAccountNumber: string;
  verified?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 800) return "var(--color-squad-red, #9a1f2a)";
  if (score >= 650) return "var(--color-success, #0f7a4d)";
  if (score >= 500) return "var(--color-squad-orange, #f25c19)";
  return "var(--color-text-secondary, #5c5852)";
}

function scoreTierLabel(score: number): string {
  if (score >= 800) return "Anchor";
  if (score >= 700) return "Scale";
  if (score >= 650) return "Growth";
  if (score >= 580) return "Established";
  if (score >= 500) return "Builder";
  if (score >= 400) return "Starter";
  return "Trial";
}

export default function ScoreCard({
  firstName,
  trustScore,
  creditLimit,
  savingsBalance,
  virtualAccountNumber,
  verified = true,
}: ScoreCardProps) {
  return (
    <div
      className="rounded-xl p-8"
      style={{
        background: "linear-gradient(135deg, var(--color-squad-orange-50, #fef1eb) 0%, var(--color-surface-raised, #fff) 100%)",
        boxShadow: "var(--shadow-elevated, 0 4px 12px rgba(26,24,21,0.08))",
      }}
    >
      <p
        className="text-sm font-medium mb-1"
        style={{ color: "var(--color-text-secondary, #5c5852)" }}
      >
        {firstName}&apos;s trust score
      </p>

      <div className="flex items-end gap-3 mb-1">
        <span
          className="text-[56px] leading-none"
          style={{
            fontFamily: "var(--font-display, 'Instrument Serif', serif)",
            color: scoreColor(trustScore),
          }}
        >
          {trustScore}
        </span>
        <span
          className="text-sm font-medium pb-2"
          style={{
            color: "var(--color-text-tertiary, #8b867e)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            fontSize: "12px",
          }}
        >
          {scoreTierLabel(trustScore)}
        </span>
      </div>

      <div
        className="w-full h-1.5 rounded-full mb-6"
        style={{ backgroundColor: "var(--color-surface-muted, #edebe3)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((trustScore / 1000) * 100, 100)}%`,
            backgroundColor: scoreColor(trustScore),
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {verified ? (
          <StatTile label="You can borrow" value={formatNaira(creditLimit)} accent />
        ) : (
          <div
            className="rounded-md p-4 flex flex-col items-center justify-center gap-1"
            style={{
              backgroundColor: "var(--color-surface-muted, #edebe3)",
              opacity: 0.7,
            }}
          >
            <Lock size={16} style={{ color: "var(--color-text-tertiary)" }} />
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              Verify to borrow
            </p>
          </div>
        )}
        <StatTile label="Saved" value={formatNaira(savingsBalance)} />
      </div>

      {virtualAccountNumber && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid var(--border-subtle, rgba(26,24,21,0.08))" }}
        >
          <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary, #8b867e)" }}>
            Your payment number
          </p>
          <p
            className="text-sm tracking-wide tnum"
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "var(--color-text-primary, #1a1815)",
            }}
          >
            {virtualAccountNumber}
            <span className="ml-2 text-xs" style={{ color: "var(--color-text-tertiary, #8b867e)" }}>
              GTBank
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-md p-4"
      style={{
        backgroundColor: accent
          ? "var(--color-squad-orange, #f25c19)"
          : "var(--color-surface-raised, #fff)",
      }}
    >
      <p
        className="text-xs mb-1"
        style={{
          color: accent ? "rgba(255,255,255,0.75)" : "var(--color-text-tertiary, #8b867e)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          fontSize: "11px",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        className="text-lg font-medium tnum"
        style={{
          color: accent ? "#fff" : "var(--color-text-primary, #1a1815)",
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </p>
    </div>
  );
}
