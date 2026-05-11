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
      className="px-4 flex flex-col items-center pt-8"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex items-center justify-center rounded-full mb-6"
        style={{
          width: 100,
          height: 100,
          backgroundColor: "var(--color-success, #0f7a4d)",
          boxShadow: "0 8px 32px rgba(15, 122, 77, 0.3)",
        }}
      >
        <ShieldCheck size={48} color="#fff" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-medium mb-2 text-center"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        You&apos;re verified!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-center mb-8"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Your identity has been confirmed. You now have full access to borrowing and savings.
      </motion.p>

      {/* Steps summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full rounded-xl p-4 mb-8"
        style={{
          backgroundColor: "var(--color-surface-raised, #fff)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="space-y-3">
          {STEPS_SUMMARY.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: "var(--color-success-bg, #e8f4ed)",
                }}
              >
                <Check size={14} style={{ color: "var(--color-success, #0f7a4d)" }} />
              </div>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="w-full"
      >
        <Link
          href="/dashboard"
          className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-squad-orange, #f25c19)",
            color: "#fff",
            display: "flex",
          }}
        >
          Go to your dashboard
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
