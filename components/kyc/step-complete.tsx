"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS_SUMMARY = [
  "Personal details confirmed",
  "Identity document verified",
  "Liveness check passed",
  "Workspace environment verified",
  "Merchandise verified",
];

export default function StepComplete() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "32px" }}
    >
      {/* Animated shield */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          backgroundColor: "#059669",
          boxShadow: "0 8px 32px rgba(5,150,105,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <ShieldCheck size={46} color="#fff" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#111827",
          letterSpacing: "-0.025em",
          textAlign: "center",
          marginBottom: "8px",
          fontFamily: "inherit",
        }}
      >
        You&apos;re verified
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "28px",
          lineHeight: "20px",
          maxWidth: "280px",
        }}
      >
        Your identity has been confirmed. You now have full access to borrowing and savings.
      </motion.p>

      {/* Steps summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          width: "100%",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {STEPS_SUMMARY.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.08 }}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check size={13} strokeWidth={3} color="#059669" />
            </div>
            <span style={{ fontSize: "14px", color: "#374151", fontWeight: 400 }}>{step}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ width: "100%" }}
      >
        <Link
          href="/dashboard"
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: 600,
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            borderRadius: "14px",
            backgroundColor: "#f25c19",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          Go to your dashboard
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
