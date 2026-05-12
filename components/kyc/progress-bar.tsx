"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  highestStep?: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = ["Details", "Document", "Liveness", "Workspace", "Goods"];

export default function KycProgressBar({
  currentStep,
  totalSteps = 5,
  highestStep,
  onStepClick,
}: ProgressBarProps) {
  const maxStep = highestStep ?? currentStep;

  return (
    <div style={{ width: "100%", padding: "16px 20px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < maxStep && !isActive;
          const isClickable = step <= maxStep;

          return (
            <div
              key={step}
              style={{ display: "flex", alignItems: "center", flex: step < totalSteps ? 1 : "none" }}
            >
              {/* Step circle + label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: isClickable ? "pointer" : "default",
                }}
                onClick={() => isClickable && onStepClick?.(step)}
              >
                <motion.div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted ? "#059669" : isActive ? "#f25c19" : "#f3f4f6",
                    color: isCompleted || isActive ? "#fff" : "#9ca3af",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : step}
                </motion.div>
                <span
                  style={{
                    marginTop: "4px",
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: "inherit",
                    color: isActive ? "#f25c19" : isCompleted ? "#059669" : "#9ca3af",
                    letterSpacing: "0.02em",
                  }}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: step < maxStep ? "#059669" : "#f3f4f6",
                    margin: "0 4px",
                    marginBottom: 18,
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
