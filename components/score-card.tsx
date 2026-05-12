"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatNaira } from "@/lib/format";

interface ScoreCardProps {
  trustScore: number;
  savingsBalance: number;
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

export default function ScoreCard({ trustScore, savingsBalance }: ScoreCardProps) {
  const pct = Math.min((trustScore / 1000) * 100, 100);

  return (
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
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "8px" }}>
          Trust score
        </p>

        <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "12px" }}>
          <AnimatedScore score={trustScore} />
          <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>/1000</span>
        </div>

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
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "8px" }}>
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
      onUpdate: (v) => { el.textContent = Math.round(v).toString(); },
      onComplete: () => setDisplayed(score),
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <span
      ref={spanRef}
      style={{ fontSize: "30px", fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}
    >
      {score}
    </span>
  );
}
