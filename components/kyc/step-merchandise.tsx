"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShoppingBag, RotateCcw, Check, AlertTriangle } from "lucide-react";
import CameraView from "./camera-view";
import { submitMerchandisePhoto } from "@/app/verify/actions";
import type { MerchandiseResult, DetectedObject } from "@/lib/ai/gemini";

interface StepMerchandiseProps {
  traderId: string;
  businessType: string;
  onComplete: () => void;
}

export default function StepMerchandise({
  traderId,
  businessType,
  onComplete,
}: StepMerchandiseProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MerchandiseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string, mimeType: string) => {
    setCapturedImage(`data:${mimeType};base64,${base64}`);
    setProcessing(true);
    setError(null);

    try {
      const response = await submitMerchandisePhoto({
        traderId,
        base64Image: base64,
        mimeType,
        businessType,
      });

      if (response.success && response.result) {
        setResult(response.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze merchandise");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  // Phase 1: Camera
  if (!capturedImage && !processing && !result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="mb-4">
          <h2 className="text-xl font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            Show your goods
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Take a close-up photo of your {businessType} merchandise
          </p>
        </div>

        <CameraView
          onCapture={handleCapture}
          facing="environment"
          showToggle
          guideText={`Photograph your ${businessType} goods up close`}
        />
      </motion.div>
    );
  }

  // Phase 2: Processing
  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 flex flex-col items-center justify-center py-16"
      >
        <Loader2
          size={48}
          className="animate-spin mb-4"
          style={{ color: "var(--color-squad-orange)" }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Verifying your merchandise...
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          Checking if your goods match your {businessType} business
        </p>
      </motion.div>
    );
  }

  // Phase 3: Results
  if (result && capturedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={20} style={{ color: "var(--color-success)" }} />
            <h2 className="text-xl font-medium" style={{ color: "var(--color-text-primary)" }}>
              Goods verified
            </h2>
          </div>
        </div>

        {/* Image with bounding boxes */}
        <div className="relative w-full overflow-hidden rounded-xl mb-4">
          <img
            src={capturedImage}
            alt="Merchandise"
            className="w-full"
            style={{ objectFit: "cover" }}
          />

          {result.items.map((item: DetectedObject, i: number) => {
            const [ymin, xmin, ymax, xmax] = item.bbox;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${ymin / 10}%`,
                  left: `${xmin / 10}%`,
                  width: `${(xmax - xmin) / 10}%`,
                  height: `${(ymax - ymin) / 10}%`,
                  border: "2px solid var(--color-squad-orange)",
                  borderRadius: 4,
                }}
              >
                <span
                  className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-white"
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    backgroundColor: "var(--color-squad-orange)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label} {Math.round(item.confidence * 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Detected items tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {result.items.map((item: DetectedObject, i: number) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "var(--color-squad-orange-50)",
                color: "var(--color-squad-orange-700)",
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Match assessment card */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: result.matches_business
              ? "var(--color-success-bg)"
              : "var(--color-warning-bg)",
            border: `1px solid ${
              result.matches_business ? "var(--color-success)" : "var(--color-warning)"
            }`,
          }}
        >
          <div className="flex items-start gap-3">
            {result.matches_business ? (
              <Check size={20} style={{ color: "var(--color-success)", flexShrink: 0, marginTop: 1 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: "var(--color-warning)", flexShrink: 0, marginTop: 1 }} />
            )}
            <p
              className="text-sm"
              style={{
                color: result.matches_business
                  ? "var(--color-success)"
                  : "var(--color-warning)",
              }}
            >
              {result.assessment}
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--color-text-tertiary)" }}>Match confidence</span>
            <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {Math.round(result.score * 100)}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: "var(--color-surface-muted)" }}
          >
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${result.score * 100}%`,
                backgroundColor: result.score > 0.6
                  ? "var(--color-success)"
                  : "var(--color-warning)",
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--color-surface-muted)",
              color: "var(--color-text-secondary)",
            }}
          >
            <RotateCcw size={16} />
            Retake
          </button>
          <button
            onClick={onComplete}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-squad-orange)",
              color: "#fff",
            }}
          >
            Complete verification
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
