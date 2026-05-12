"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { animate } from "framer-motion";
import { formatNaira } from "@/lib/format";

interface DashboardCarouselProps {
  firstName: string;
  walletBalance: number;
  totalInflows: number;
  creditLimit: number;
  virtualAccountNumber: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Shared ATM card chrome ── */

function AtmCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "linear-gradient(140deg, #FF7B4B 0%, #F25C19 50%, #E04B0D 100%)",
        borderRadius: "24px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
      {children}
    </div>
  );
}

function CardTopRow({ firstName }: { firstName: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px",
      }}
    >
      <div>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>
          {greeting()}
        </p>
        <p style={{ color: "#fff", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {firstName}
        </p>
      </div>
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
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </p>
  );
}

/* ── Card 1: Wallet ── */

function WalletCard({
  firstName,
  walletBalance,
  totalInflows,
}: {
  firstName: string;
  walletBalance: number;
  totalInflows: number;
}) {
  return (
    <AtmCard>
      <CardTopRow firstName={firstName} />
      <CardLabel>Available to withdraw</CardLabel>
      <AnimatedAmount value={walletBalance} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ marginTop: "18px" }}>
          <button
            onClick={() => {}}
            style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              color: "#f25c19",
              border: "none",
              borderRadius: "99px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}
          >
            Send to my bank
          </button>
        </div>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 400 }}>
            Total earned: {formatNaira(totalInflows)}
          </p>
        </div>
      </div>
    </AtmCard>
  );
}

/* ── Card 2: Credit ── */

function CreditCard({
  firstName,
  creditLimit,
  virtualAccountNumber,
}: {
  firstName: string;
  creditLimit: number;
  virtualAccountNumber: string;
}) {
  return (
    <AtmCard>
      <CardTopRow firstName={firstName} />
      <CardLabel>Available to borrow</CardLabel>
      <AnimatedAmount value={creditLimit} />

      {virtualAccountNumber && (
        <div
          style={{
            marginTop: "auto",
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
    </AtmCard>
  );
}

/* ── Card 3: Payment number ── */

function NubanCard({
  firstName,
  virtualAccountNumber,
}: {
  firstName: string;
  virtualAccountNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(virtualAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AtmCard>
      <CardTopRow firstName={firstName} />
      <CardLabel>Your payment number</CardLabel>

      <p
        style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          color: "#fff",
          fontSize: "30px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          marginBottom: "12px",
        }}
      >
        {virtualAccountNumber || "—"}
      </p>

      <span
        style={{
          display: "inline-block",
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

      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.18)" }}>
        <button
          onClick={copy}
          style={{
            backgroundColor: "rgba(255,255,255,0.92)",
            color: copied ? "#059669" : "#f25c19",
            border: "none",
            borderRadius: "99px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            transition: "color 0.15s ease",
          }}
        >
          {copied ? "Copied!" : "Copy number"}
        </button>
      </div>
    </AtmCard>
  );
}

/* ── Animated big number ── */

function AnimatedAmount({ value }: { value: number }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const controls = animate(displayed, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => { el.textContent = formatNaira(Math.round(v)); },
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

/* ── Main carousel ── */

export default function DashboardCarousel({
  firstName,
  walletBalance,
  totalInflows,
  creditLimit,
  virtualAccountNumber,
}: DashboardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    startIndex: 0,
  });
  const [selectedSnap, setSelectedSnap] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedSnap(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ flex: "0 0 100%", minWidth: 0 }}>
            <WalletCard
              firstName={firstName}
              walletBalance={walletBalance}
              totalInflows={totalInflows}
            />
          </div>
          <div style={{ flex: "0 0 100%", minWidth: 0 }}>
            <CreditCard
              firstName={firstName}
              creditLimit={creditLimit}
              virtualAccountNumber={virtualAccountNumber}
            />
          </div>
          <div style={{ flex: "0 0 100%", minWidth: 0 }}>
            <NubanCard
              firstName={firstName}
              virtualAccountNumber={virtualAccountNumber}
            />
          </div>
        </div>
      </div>

      {/* Dot navigation */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          justifyContent: "center",
          marginTop: "12px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#f25c19",
              opacity: i === selectedSnap ? 1 : 0.3,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "opacity 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
