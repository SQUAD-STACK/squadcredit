"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { animate } from "framer-motion";
import { formatNaira } from "@/lib/format";
import { withdrawBalance } from "@/app/(app)/_actions/withdrawBalance";
import { getBank } from "@/lib/banks";

interface DashboardCarouselProps {
  firstName: string;
  walletBalance: number;
  totalInflows: number;
  creditLimit: number;
  virtualAccountNumber: string;
  disbursementAccountNumber: string;
  disbursementBankCode: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Shared card chrome — flat orange, brand-tinted shadow ── */

function AtmCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#F25C19",
        borderRadius: "24px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(26,24,21,0.04), 0 12px 32px -12px rgba(242,92,25,0.18)",
      }}
    >
      {/* Subtle ring decorations — monochrome, not gradient */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-16px",
          right: "-16px",
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.07)",
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
        marginBottom: "24px",
      }}
    >
      <div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 400, marginBottom: "1px" }}>
          {greeting()}
        </p>
        <p style={{ color: "#fff", fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          {firstName}
        </p>
      </div>
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "14px",
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
        color: "rgba(255,255,255,0.55)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "6px",
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
        <div
          style={{
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: 400 }}>
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
            paddingTop: "14px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "rgba(255,255,255,0.65)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {virtualAccountNumber}
          </p>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              padding: "3px 10px",
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
          fontSize: "26px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          marginBottom: "10px",
        }}
      >
        {virtualAccountNumber || "—"}
      </p>

      <span
        style={{
          display: "inline-block",
          backgroundColor: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: "99px",
          letterSpacing: "0.03em",
        }}
      >
        GTBank
      </span>

      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <button
          onClick={copy}
          style={{
            backgroundColor: "rgba(255,255,255,0.92)",
            color: copied ? "#059669" : "#f25c19",
            border: "none",
            borderRadius: "99px",
            padding: "7px 16px",
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

/* ── Animated hero number — Instrument Serif ── */

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
        fontSize: "52px",
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

type WithdrawState = "idle" | "confirming" | "sending" | "success" | "error";

export default function DashboardCarousel({
  firstName,
  walletBalance,
  totalInflows,
  creditLimit,
  virtualAccountNumber,
  disbursementAccountNumber,
  disbursementBankCode,
}: DashboardCarouselProps) {

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    startIndex: 0,
  });
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [copied, setCopied] = useState(false);
  const [withdrawState, setWithdrawState] = useState<WithdrawState>("idle");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawInput, setWithdrawInput] = useState("");
  const [, startTransition] = useTransition();

  const bankName = getBank(disbursementBankCode)?.name ?? "your bank";
  const maskedAccount = disbursementAccountNumber
    ? `****${disbursementAccountNumber.slice(-4)}`
    : "—";

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

  const handleShareNumber = () => {
    navigator.clipboard.writeText(virtualAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedWithdrawAmount = Number(withdrawInput.replace(/,/g, "")) || 0;
  const withdrawAmountValid = parsedWithdrawAmount >= 100 && parsedWithdrawAmount <= walletBalance;

  const handleWithdrawOpen = () => {
    setWithdrawInput(walletBalance.toLocaleString("en-NG"));
    setWithdrawError(null);
    setWithdrawState("confirming");
  };

  const handleWithdrawConfirm = () => {
    if (!withdrawAmountValid) return;
    setWithdrawState("sending");
    setWithdrawError(null);
    startTransition(async () => {
      const res = await withdrawBalance(parsedWithdrawAmount);
      if ("success" in res && res.success) {
        setWithdrawState("success");
        setTimeout(() => {
          setWithdrawState("idle");
        }, 2200);
      } else if ("error" in res) {
        if (res.error === "NEED_BANK_DETAILS") {
          setWithdrawError("Add a bank account in the Borrow section first, then come back to withdraw.");
        } else {
          setWithdrawError(res.error);
        }
        setWithdrawState("error");
      }
    });
  };

  return (
    <div>
      {/* Carousel viewport — overflow hidden so peek is clipped */}
      <div ref={emblaRef} style={{ overflow: "hidden", marginRight: "-20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
          {[
            <WalletCard key="wallet" firstName={firstName} walletBalance={walletBalance} totalInflows={totalInflows} />,
            <CreditCard key="credit" firstName={firstName} creditLimit={creditLimit} virtualAccountNumber={virtualAccountNumber} />,
            <NubanCard key="nuban" firstName={firstName} virtualAccountNumber={virtualAccountNumber} />,
          ].map((card, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 calc(100% - 32px)",
                minWidth: 0,
              }}
            >
              {card}
            </div>
          ))}
        </div>
      </div>

      {/* Dot navigation */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          justifyContent: "center",
          marginTop: "12px",
          marginBottom: "4px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: i === selectedSnap ? 16 : 6,
              height: 6,
              borderRadius: "99px",
              backgroundColor: i === selectedSnap ? "#f25c19" : "rgba(26,24,21,0.16)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s ease",
            }}
          />
        ))}
      </div>

      {/* Quick action row */}
      <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
        <button
          onClick={() => {
            if (walletBalance < 100) return;
            handleWithdrawOpen();
          }}
          disabled={walletBalance < 100}
          style={{
            flex: 1,
            height: "44px",
            borderRadius: "99px",
            backgroundColor: "#fff",
            border: `1.5px solid ${walletBalance >= 100 ? "#f25c19" : "#e5e7eb"}`,
            color: walletBalance >= 100 ? "#f25c19" : "#9ca3af",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: walletBalance >= 100 ? "pointer" : "not-allowed",
            letterSpacing: "-0.01em",
            transition: "all 0.15s ease",
          }}
        >
          Withdraw
        </button>
        <button
          onClick={handleShareNumber}
          style={{
            flex: 1,
            height: "44px",
            borderRadius: "99px",
            backgroundColor: "#f3f4f6",
            border: "none",
            color: copied ? "#059669" : "#374151",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "color 0.15s ease",
          }}
        >
          {copied ? "Copied!" : "Share number"}
        </button>
      </div>

      {/* Withdraw confirmation sheet */}
      {withdrawState !== "idle" && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => {
              if (withdrawState === "sending") return;
              setWithdrawState("idle");
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 61,
              backgroundColor: "#fff",
              borderRadius: "24px 24px 0 0",
              padding: "28px 24px 40px",
            }}
          >
            {/* Handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "99px", backgroundColor: "rgba(26,24,21,0.12)", margin: "0 auto 28px" }} />

            {withdrawState === "success" ? (
              <div style={{ textAlign: "center", paddingBottom: "8px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(5,150,105,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  {formatNaira(parsedWithdrawAmount)} sent
                </p>
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                  On its way to {maskedAccount}
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "20px" }}>
                  Withdraw funds
                </p>

                {/* Amount input */}
                <div
                  style={{
                    backgroundColor: "#fafafa",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "14px",
                    border: `1.5px solid ${withdrawAmountValid || !withdrawInput ? "transparent" : "rgba(220,38,38,0.3)"}`,
                  }}
                >
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Amount</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "24px", fontWeight: 700, color: withdrawInput ? "#111827" : "#d1d5db" }}>₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={withdrawInput}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setWithdrawInput(digits ? Number(digits).toLocaleString("en-NG") : "");
                        setWithdrawError(null);
                      }}
                      disabled={withdrawState === "sending"}
                      placeholder="0"
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#111827",
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        padding: 0,
                        letterSpacing: "-0.03em",
                        fontFeatureSettings: '"tnum"',
                        width: "100%",
                        caretColor: "#f25c19",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Available: {formatNaira(walletBalance)}
                    </span>
                    <button
                      onClick={() => setWithdrawInput(walletBalance.toLocaleString("en-NG"))}
                      style={{ fontSize: "12px", fontWeight: 600, color: "#f25c19", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div style={{ backgroundColor: "#fafafa", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>To</span>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "14px", fontWeight: 500, color: "#111827", letterSpacing: "0.04em" }}>
                      {maskedAccount}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{bankName}</p>
                  </div>
                </div>

                {withdrawState === "error" && withdrawError && (
                  <p style={{ fontSize: "13px", color: "#dc2626", textAlign: "center", marginBottom: "12px" }}>
                    {withdrawError}
                  </p>
                )}

                <button
                  onClick={handleWithdrawConfirm}
                  disabled={!withdrawAmountValid || withdrawState === "sending"}
                  style={{
                    width: "100%",
                    height: "54px",
                    borderRadius: "14px",
                    backgroundColor: withdrawAmountValid && withdrawState !== "sending" ? "#f25c19" : "#f3f4f6",
                    color: withdrawAmountValid && withdrawState !== "sending" ? "#fff" : "#9ca3af",
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    border: "none",
                    cursor: withdrawAmountValid && withdrawState !== "sending" ? "pointer" : "not-allowed",
                    letterSpacing: "-0.02em",
                    marginBottom: "12px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {withdrawState === "sending"
                    ? "Sending..."
                    : withdrawAmountValid
                    ? `Send ${formatNaira(parsedWithdrawAmount)}`
                    : "Enter an amount"}
                </button>

                {withdrawState !== "sending" && (
                  <button
                    onClick={() => setWithdrawState("idle")}
                    style={{
                      width: "100%",
                      height: "44px",
                      borderRadius: "14px",
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      fontSize: "14px",
                      fontWeight: 500,
                      fontFamily: "inherit",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
