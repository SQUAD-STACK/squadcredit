"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/format";
import { computeLoanCost, type Tier, TIERS } from "@/lib/loan-tiers";
import { requestLoan } from "../_actions/requestLoan";
import BankSheet from "./bank-sheet";
import type { Loan } from "@/lib/supabase/types";

interface BorrowClientProps {
  creditLimit: number;
  trustScore: number;
  tier: Tier;
  hasDisbursementAccount: boolean;
  disbursementBankCode: string;
  disbursementAccountNumber: string;
  disbursementAccountName: string;
  activeLoan: Loan | null;
}

const MIN_AMOUNT = 5_000;

function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

function parseAmountInput(formatted: string): number {
  return Number(formatted.replace(/,/g, "")) || 0;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

/* ── Active loan view ── */

function ActiveLoanView({ loan }: { loan: Loan }) {
  const remaining = Math.max(0, Number(loan.total_due) - Number(loan.amount_repaid));
  const progressPct = Math.min(
    100,
    Math.round((Number(loan.amount_repaid) / Number(loan.total_due)) * 100)
  );

  return (
    <div style={{ paddingTop: "16px" }}>
      {/* Hero card — flat orange */}
      <div
        style={{
          backgroundColor: "#F25C19",
          borderRadius: "24px",
          padding: "28px 24px",
          marginBottom: "14px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(26,24,21,0.04), 0 12px 32px -12px rgba(242,92,25,0.18)",
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "160px", height: "160px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>
          Remaining to repay
        </p>
        <p
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "10px",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {formatNaira(remaining)}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>
          Due {formatDueDate(loan.due_at)}
        </p>
      </div>

      {/* Repayment progress */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase" }}>Repayment progress</p>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{progressPct}%</p>
        </div>
        <div style={{ height: "6px", borderRadius: "99px", backgroundColor: "rgba(26,24,21,0.06)", overflow: "hidden", marginBottom: "18px" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: "99px", backgroundColor: "#111827", transition: "width 0.4s ease" }} />
        </div>
        {[
          { label: "Original loan", value: formatNaira(Number(loan.principal)) },
          { label: "Total to repay", value: formatNaira(Number(loan.total_due)) },
          { label: "Repaid so far", value: formatNaira(Number(loan.amount_repaid)) },
          { label: "Still owed", value: formatNaira(remaining) },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(26,24,21,0.05)" : "none",
            }}
          >
            <span style={{ fontSize: "13px", color: "#9ca3af", letterSpacing: "0.01em" }}>{row.label}</span>
            <span
              style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: "14px",
                fontWeight: 500,
                color: "#111827",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(26,24,21,0.07)", backgroundColor: "#fafafa" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "20px" }}>
          Repayment is collected automatically as a percentage of each payment you receive. Once fully repaid, you can borrow again.
        </p>
      </div>
    </div>
  );
}

/* ── Main borrow client ── */

export default function BorrowClient({
  creditLimit,
  trustScore,
  tier,
  hasDisbursementAccount,
  disbursementBankCode,
  disbursementAccountNumber,
  disbursementAccountName,
  activeLoan,
}: BorrowClientProps) {
  const router = useRouter();
  const hasLimit = creditLimit > 0;
  const maxAmount = Math.min(creditLimit, tier.maxAmount);

  const [amountRaw, setAmountRaw] = useState(hasLimit ? formatAmountInput(String(maxAmount)) : "");
  const [tenorDays, setTenorDays] = useState(tier.tenorDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletPending, setWalletPending] = useState(false);
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const pendingLoanRef = useRef<{ amount: number; tenorDays: number } | null>(null);

  const amount = parseAmountInput(amountRaw);
  const isValidAmount = amount >= MIN_AMOUNT && amount <= maxAmount;
  const { fee, totalDue } = isValidAmount
    ? computeLoanCost(amount, tier)
    : { fee: 0, totalDue: 0 };

  const feePct = (tier.feeRate * 100).toFixed(1).replace(/\.0$/, "");

  const availableTenors = TIERS.filter(
    (t) => t.tenorDays <= tier.tenorDays && t.tenorDays > 0
  ).map((t) => t.tenorDays);
  const uniqueTenors = [...new Set(availableTenors)].sort((a, b) => a - b);

  // Slider fill percentage for gradient background
  const sliderPct = maxAmount > MIN_AMOUNT
    ? ((Math.min(Math.max(amount || MIN_AMOUNT, MIN_AMOUNT), maxAmount) - MIN_AMOUNT) / (maxAmount - MIN_AMOUNT)) * 100
    : 0;

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setAmountRaw(formatAmountInput(String(v)));
      setError(null);
    },
    []
  );

  const handleAmountInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountInput(e.target.value);
    setAmountRaw(formatted);
    setError(null);
  }, []);

  const doRequestLoan = useCallback(
    async (amt: number, tenor: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await requestLoan({ amount: amt, tenorDays: tenor });
        if ("success" in res && res.success) {
          router.push(`/borrow/success?ref=${res.loan.id}`);
          return;
        }
        if ("error" in res) {
          if (res.error === "NEED_BANK_DETAILS") {
            pendingLoanRef.current = { amount: amt, tenorDays: tenor };
            setBankSheetOpen(true);
          } else if (res.error === "WALLET_PENDING") {
            setWalletPending(true);
          } else {
            setError(res.error);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleBorrow = useCallback(() => {
    if (!isValidAmount || loading) return;
    doRequestLoan(amount, tenorDays);
  }, [amount, tenorDays, isValidAmount, loading, doRequestLoan]);

  const handleBankSaved = useCallback(() => {
    setBankSheetOpen(false);
    const pending = pendingLoanRef.current;
    if (pending) {
      pendingLoanRef.current = null;
      doRequestLoan(pending.amount, pending.tenorDays);
    }
  }, [doRequestLoan]);

  const displayTiers = TIERS.slice(0, 4);

  /* Active loan guard */
  if (activeLoan && (activeLoan.status === "active" || activeLoan.status === "pending")) {
    return <ActiveLoanView loan={activeLoan} />;
  }

  return (
    <div style={{ paddingTop: "16px" }}>

      {/* Hero card — flat orange */}
      <div
        style={{
          backgroundColor: "#F25C19",
          borderRadius: "24px",
          padding: "28px 24px",
          marginBottom: "14px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(26,24,21,0.04), 0 12px 32px -12px rgba(242,92,25,0.18)",
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "160px", height: "160px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>
          Your loan limit
        </p>
        <p
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: hasLimit ? "#fff" : "rgba(255,255,255,0.3)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "10px",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {hasLimit ? formatNaira(creditLimit) : "—"}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: "18px" }}>
          {hasLimit ? "Repaid automatically from your daily sales" : "Receive your first payment to unlock borrowing"}
        </p>
        {hasLimit && (
          <div style={{ display: "inline-flex", marginTop: "14px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "99px", padding: "4px 12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff" }}>
              {tier.name} tier
            </span>
          </div>
        )}
      </div>

      {/* Tier progress */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "16px" }}>
          Tier progress
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          {displayTiers.map((t) => {
            const unlocked = trustScore >= t.minScore;
            const current = tier.tier === t.tier;
            return (
              <div key={t.tier} style={{ flex: 1 }}>
                <div style={{ height: "3px", borderRadius: "99px", marginBottom: "8px", backgroundColor: current ? "#111827" : unlocked ? "#059669" : "#f3f4f6" }} />
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: current ? "#111827" : unlocked ? "#059669" : "#d1d5db", marginBottom: "2px" }}>
                  {t.name}
                </p>
                <p style={{ fontSize: "10px", color: current ? "#6b7280" : unlocked ? "#9ca3af" : "#d1d5db" }}>
                  {current ? "Current" : unlocked ? "Done" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallet pending */}
      {walletPending && (
        <div style={{ backgroundColor: "#fffbeb", borderRadius: "16px", padding: "18px 20px", marginBottom: "14px", border: "1px solid rgba(180,83,9,0.12)" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>Loan approved</p>
          <p style={{ fontSize: "13px", color: "#78350f", lineHeight: "20px" }}>
            Disbursement is queued while we top up our sandbox wallet. In production this happens in real time.
          </p>
        </div>
      )}

      {/* Borrow flow */}
      {hasLimit && !walletPending && (
        <>
          {/* Amount hero input */}
          <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "28px 24px 20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "20px" }}>
              How much do you need?
            </p>

            {/* Hero number input — centered, Instrument Serif */}
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ display: "inline-flex", alignItems: "baseline", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: amountRaw ? "#111827" : "#d1d5db",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountRaw}
                  onChange={handleAmountInput}
                  placeholder="0"
                  style={{
                    fontSize: "56px",
                    fontWeight: 700,
                    color: "#111827",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "0",
                    letterSpacing: "-0.04em",
                    fontFeatureSettings: '"tnum"',
                    width: `${Math.max((amountRaw || "0").length, 1)}ch`,
                    minWidth: "1ch",
                    maxWidth: "calc(100% - 40px)",
                    textAlign: "center",
                    caretColor: "#f25c19",
                  }}
                />
              </div>
            </div>

            {/* Divider + available caption */}
            <div style={{ height: "1px", backgroundColor: "rgba(26,24,21,0.07)", margin: "14px 0 10px" }} />
            <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", letterSpacing: "0.01em" }}>
              available: {formatNaira(maxAmount)}
            </p>

            {/* Custom slider */}
            <div style={{ marginTop: "20px" }}>
              <input
                type="range"
                className="squad-slider"
                min={MIN_AMOUNT}
                max={maxAmount}
                step={1000}
                value={Math.min(Math.max(amount || MIN_AMOUNT, MIN_AMOUNT), maxAmount)}
                onChange={handleSlider}
                style={{
                  background: `linear-gradient(to right, #f25c19 0%, #f25c19 ${sliderPct}%, rgba(26,24,21,0.1) ${sliderPct}%, rgba(26,24,21,0.1) 100%)`,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{formatNaira(MIN_AMOUNT)}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{formatNaira(maxAmount)}</span>
              </div>
            </div>
          </div>

          {/* Tenor picker */}
          {uniqueTenors.length > 1 && (
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "12px" }}>
                Repay in
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {uniqueTenors.map((d) => (
                  <button
                    key={d}
                    onClick={() => setTenorDays(d)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "99px",
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: tenorDays === d ? "#f25c19" : "#f3f4f6",
                      color: tenorDays === d ? "#fff" : "#6b7280",
                      transition: "all 0.15s ease",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loan breakdown — caption/mono layout */}
          {isValidAmount && (
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", marginBottom: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(26,24,21,0.05)" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase" }}>Loan breakdown</p>
              </div>
              {[
                { label: "Loan amount", value: formatNaira(amount) },
                { label: `Flat fee (${feePct}%)`, value: formatNaira(fee) },
                { label: "Total to repay", value: formatNaira(totalDue), bold: true },
                {
                  label: "Repayment",
                  value: tier.holdback > 0
                    ? `${(tier.holdback * 100).toFixed(0)}% of each payment`
                    : "Bullet at end of term",
                },
                { label: "Term", value: `${tenorDays} days` },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 20px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(26,24,21,0.05)" : "none",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "0.02em", textTransform: "uppercase" }}>{row.label}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      fontSize: "14px",
                      fontWeight: row.bold ? 600 : 400,
                      color: "#111827",
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626", textAlign: "center", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginBottom: "14px" }}>
            No hidden fees. The flat fee above is the total cost.
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleBorrow}
            disabled={!isValidAmount || loading}
            style={{
              width: "100%",
              height: "56px",
              backgroundColor: isValidAmount && !loading ? "#f25c19" : "#f3f4f6",
              color: isValidAmount && !loading ? "#fff" : "#9ca3af",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: "-0.02em",
              border: "none",
              cursor: isValidAmount && !loading ? "pointer" : "not-allowed",
              transition: "background-color 0.15s ease",
            }}
          >
            {loading ? "Disbursing..." : isValidAmount ? `Get ${formatNaira(amount)} now` : "Enter an amount"}
          </button>
        </>
      )}

      {!hasLimit && (
        <button
          disabled
          style={{ width: "100%", height: "56px", backgroundColor: "#f3f4f6", color: "#9ca3af", borderRadius: "16px", fontSize: "16px", fontWeight: 700, fontFamily: "inherit", border: "none", cursor: "not-allowed" }}
        >
          Build your score to borrow
        </button>
      )}

      {/* Bank details sheet */}
      <BankSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onSaved={handleBankSaved}
        pendingAmount={pendingLoanRef.current?.amount ?? 0}
        pendingTenorDays={pendingLoanRef.current?.tenorDays ?? tier.tenorDays}
      />
    </div>
  );
}
