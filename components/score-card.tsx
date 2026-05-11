"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
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

function tierLabel(score: number): string {
  if (score >= 800) return "Anchor";
  if (score >= 700) return "Scale";
  if (score >= 650) return "Growth";
  if (score >= 580) return "Established";
  if (score >= 500) return "Builder";
  if (score >= 400) return "Starter";
  return "Trial";
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ScoreCard({
  firstName,
  trustScore,
  creditLimit,
  savingsBalance,
  virtualAccountNumber,
  verified = true,
}: ScoreCardProps) {
  const pct = Math.min((trustScore / 1000) * 100, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Hero gradient card ── */}
      <div
        style={{
          background: "linear-gradient(140deg, #FF7B4B 0%, #F25C19 50%, #E04B0D 100%)",
          borderRadius: "24px",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative ring */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "2px",
              }}
            >
              {greeting()}
            </p>
            <p
              style={{
                color: "#fff",
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {firstName}
            </p>
          </div>

          {/* Avatar */}
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {firstName[0]?.toUpperCase() ?? "?"}
          </div>
        </div>

        {/* Credit limit — hero number */}
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          Available to borrow
        </p>
        <AnimatedAmount value={creditLimit} />

        {/* NUBAN row */}
        {virtualAccountNumber && (
          <div
            style={{
              marginTop: "28px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                color: "rgba(255,255,255,0.75)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {virtualAccountNumber}
            </p>
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "99px",
                letterSpacing: "0.03em",
              }}
            >
              GTBank
            </span>
          </div>
        )}
      </div>

      {/* ── Two floating stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

        {/* Trust score */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#9ca3af",
              marginBottom: "8px",
            }}
          >
            Trust score
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "3px",
              marginBottom: "12px",
            }}
          >
            <AnimatedScore score={trustScore} />
            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>
              /1000
            </span>
          </div>

          {/* Progress */}
          <div
            style={{
              height: "4px",
              backgroundColor: "#f3f4f6",
              borderRadius: "99px",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                backgroundColor: "#f25c19",
                borderRadius: "99px",
                transition: "width 0.6s ease",
              }}
            />
          </div>

          <span
            style={{
              display: "inline-block",
              backgroundColor: "#fff4ef",
              color: "#f25c19",
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "99px",
              letterSpacing: "0.02em",
            }}
          >
            {tierLabel(trustScore)}
          </span>
        </div>

        {/* Savings */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#9ca3af",
              marginBottom: "8px",
            }}
          >
            Saved so far
          </p>
          <p
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.025em",
              fontFeatureSettings: '"tnum"',
              marginBottom: "6px",
            }}
          >
            {formatNaira(savingsBalance)}
          </p>
          <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 400 }}>
            auto-swept from sales
          </p>
        </div>
      </div>
    </div>
  );
}

function AnimatedAmount({ value }: { value: number }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const controls = animate(displayed, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = formatNaira(Math.round(v));
      },
      onComplete: () => setDisplayed(value),
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      ref={spanRef}
      style={{
        fontSize: "44px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.04em",
        lineHeight: 1,
        fontFeatureSettings: '"tnum"',
      }}
    >
      {formatNaira(value)}
    </span>
  );
}

function AnimatedScore({ score }: { score: number }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(score);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const controls = animate(displayed, score, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = Math.round(v).toString();
      },
      onComplete: () => setDisplayed(score),
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <span
      ref={spanRef}
      style={{
        fontSize: "30px",
        fontWeight: 700,
        color: "#111827",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      {score}
    </span>
  );
}
