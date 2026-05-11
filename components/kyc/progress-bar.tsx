"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  highestStep?: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  "Details",
  "Document",
  "Liveness",
  "Workspace",
  "Goods",
];

export default function KycProgressBar({ 
  currentStep, 
  totalSteps = 5,
  highestStep,
  onStepClick
}: ProgressBarProps) {
  const maxStep = highestStep ?? currentStep;

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < maxStep && !isActive;
          const isClickable = step <= maxStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div 
                className="flex flex-col items-center"
                style={{ cursor: isClickable ? "pointer" : "default" }}
                onClick={() => isClickable && onStepClick?.(step)}
              >
                <motion.div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: isCompleted
                      ? "var(--color-success, #0f7a4d)"
                      : isActive
                        ? "var(--color-squad-orange, #f25c19)"
                        : "var(--color-surface-muted, #edebe3)",
                    color: isCompleted || isActive ? "#fff" : "var(--color-text-tertiary, #8b867e)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step}
                </motion.div>
                <span
                  className="mt-1"
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? "var(--color-squad-orange, #f25c19)"
                      : isCompleted
                        ? "var(--color-success, #0f7a4d)"
                        : "var(--color-text-tertiary, #8b867e)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className="flex-1 mx-1"
                  style={{
                    height: 2,
                    backgroundColor: step < maxStep
                      ? "var(--color-success, #0f7a4d)"
                      : "var(--color-surface-muted, #edebe3)",
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
