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

function ringColor(score: number): string {
  if (score >= 675) return "#059669";
  if (score >= 575) return "#f25c19";
  if (score >= 400) return "#E91E63";
  return "#d1d5db";
}

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function ScoreCard({ trustScore, savingsBalance }: ScoreCardProps) {
  const pct = Math.min((trustScore / 1000) * 100, 100);
  const color = ringColor(trustScore);
  const dashOffset = RING_CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

      {/* Trust score ring */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "18px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", marginBottom: "12px", letterSpacing: "0.04em", textTransform: "uppercase", alignSelf: "flex-start" }}>
          Trust score
        </p>

        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(26,24,21,0.06)"
              strokeWidth="8"
            />
            {/* Fill */}
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
            />
          </svg>

          {/* Centered text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatedScore score={trustScore} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#9ca3af",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginTop: "1px",
              }}
            >
              {tierLabel(trustScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Savings */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "18px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", marginBottom: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Saved so far
        </p>
        <p
          style={{
    
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.01em",
            fontFeatureSettings: '"tnum"',
            marginBottom: "6px",
            lineHeight: 1.1,
          }}
        >
          {formatNaira(savingsBalance)}
        </p>
        <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 400 }}>
          Auto-swept from sales
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
      duration: 0.6,
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
      style={{

        fontSize: "36px",
        fontWeight: 700,
        color: "#111827",
        lineHeight: 1,
      }}
    >
      {score}
    </span>
  );
}
