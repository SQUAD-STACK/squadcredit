"use client";

import { useEffect, useState } from "react";
import { X, Maximize2, ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import VerifyFlow from "@/app/verify/verify-flow";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traderId: string;
  initialStep: number;
  traderData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    market: string;
    businessType: string;
  };
}

export default function KycModal({ open, onOpenChange, traderId, initialStep, traderData }: Props) {
  const [enlarged, setEnlarged] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    if (open) {
      setCurrentStep(initialStep);
    }
  }, [open, initialStep]);

  if (!open) return null;

  const goPrevious = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const goNext = () => {
    setCurrentStep((step) => Math.min(6, step + 1));
  };

  return (
    <div
      aria-modal
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop with blur */}
      <div
        onClick={() => {
          setOpen(false);
          onClose?.();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: "relative",
          width: enlarged ? "min(96vw, 1080px)" : "min(92vw, 820px)",
          maxWidth: "96vw",
          maxHeight: "90%",
          background: "linear-gradient(180deg, #fff 0%, #fffaf6 100%)",
          borderRadius: 20,
          boxShadow: "0 28px 80px rgba(15,23,42,0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        {/* Header with controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(15,23,42,0.06)", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button aria-label="previous step" onClick={goPrevious} style={{ background: "rgba(242,92,25,0.08)", border: "none", padding: 10, borderRadius: 999, cursor: "pointer", color: "#f25c19" }}>
              <ArrowLeft size={18} />
            </button>
            <button aria-label="next step" onClick={goNext} style={{ background: "rgba(242,92,25,0.08)", border: "none", padding: 10, borderRadius: 999, cursor: "pointer", color: "#f25c19" }}>
              <ArrowRight size={18} />
            </button>
            <div style={{ marginLeft: 10 }}>
              <div style={{ fontWeight: 700, color: "#111827" }}>Complete your verification</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>We only need a few quick checks to unlock your dashboard.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              aria-label="enlarge"
              onClick={() => setEnlarged((s) => !s)}
              style={{ background: "rgba(15,23,42,0.06)", border: "none", padding: 10, borderRadius: 999, cursor: "pointer", color: "#0f172a" }}
            >
              <Maximize2 size={18} />
            </button>
            <button
              aria-label="close"
              onClick={() => {
                onOpenChange(false);
              }}
              style={{ background: "rgba(15,23,42,0.06)", border: "none", padding: 10, borderRadius: 999, cursor: "pointer", color: "#0f172a" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 16, alignItems: "stretch", marginBottom: 12 }}>
            <div style={{ borderRadius: 18, padding: 18, background: "linear-gradient(135deg, rgba(242,92,25,0.12), rgba(245,158,11,0.12))", border: "1px solid rgba(242,92,25,0.16)", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(242,92,25,0.16)" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
                  style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, #f25c19, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                >
                  <ShieldCheck size={22} />
                </motion.div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#7c2d12", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <Sparkles size={14} />
                  Secure verification
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#1a1815", lineHeight: 1.15, marginBottom: 4 }}>
                  {traderData.firstName}, let&apos;s finish your KYC
                </div>
                <div style={{ fontSize: 13, color: "#5c5852", lineHeight: 1.5 }}>
                  Complete the steps below. You can close this modal and resume anytime from the dashboard.
                </div>
              </div>
            </div>
            <div>
              <div style={{ borderRadius: 18, padding: 18, background: "#fff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>What happens next</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#4b5563", lineHeight: 1.45 }}>
                  <div>1. We confirm your details</div>
                  <div>2. We verify your identity and liveness</div>
                  <div>3. We check your workspace and merchandise</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 10px 30px rgba(15,23,42,0.04)", overflow: "hidden" }}>
            <VerifyFlow
              traderId={traderId}
              initialStep={initialStep}
              activeStep={currentStep}
              onStepChange={setCurrentStep}
              completionHref="/dashboard"
              traderData={traderData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
