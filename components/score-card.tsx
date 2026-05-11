"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatNaira } from "@/lib/format";

interface ScoreCardProps {
  firstName: string;
  trustScore: number;
  creditLimit: number;
  savingsBalance: number;
  virtualAccountNumber: string;
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

export default function ScoreCard({
  firstName,
  trustScore,
  creditLimit,
  savingsBalance,
  virtualAccountNumber,
}: ScoreCardProps) {
  const pct = Math.min((trustScore / 1000) * 100, 100);

  return (
    <div
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(26,24,21,0.14), 0 2px 4px rgba(26,24,21,0.04)",
      }}
    >
      {/* Dark hero */}
      <div style={{ backgroundColor: "#1c1917", padding: "24px 24px 20px" }}>
        <p
          style={{
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "8px",
          }}
        >
          {firstName}&apos;s trust score
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          <AnimatedScore score={trustScore} />
          <div style={{ paddingBottom: "10px" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.04em",
                marginBottom: "3px",
              }}
            >
              out of 1000
            </p>
            <span
              style={{
                display: "inline-block",
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#f25c19",
                backgroundColor: "rgba(242,92,25,0.15)",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {tierLabel(trustScore)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              backgroundColor: "#f25c19",
              borderRadius: "2px",
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ backgroundColor: "#f25c19", padding: "18px 20px" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              marginBottom: "5px",
            }}
          >
            You can borrow
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {formatNaira(creditLimit)}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "18px 20px",
            borderLeft: "1px solid rgba(26,24,21,0.06)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#8b867e",
              marginBottom: "5px",
            }}
          >
            Saved
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 800,
              color: "#1a1815",
              letterSpacing: "-0.03em",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {formatNaira(savingsBalance)}
          </p>
        </div>
      </div>

      {/* Payment number footer */}
      {virtualAccountNumber && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "14px 20px",
            borderTop: "1px solid rgba(26,24,21,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#8b867e",
                marginBottom: "2px",
                letterSpacing: "0.02em",
              }}
            >
              Payment number
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: "15px",
                letterSpacing: "0.04em",
                color: "#1a1815",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {virtualAccountNumber}
            </p>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#5c5852",
              backgroundColor: "#f4f3ee",
              borderRadius: "6px",
              padding: "4px 10px",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            GTBank
          </span>
        </div>
      )}
    </div>
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
        fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
        fontSize: "72px",
        fontWeight: 800,
        lineHeight: 1,
        color: "#fff",
        letterSpacing: "-0.04em",
      }}
    >
      {score}
    </span>
  );
}
