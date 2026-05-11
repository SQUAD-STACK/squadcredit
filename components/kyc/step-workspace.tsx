"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, RotateCcw } from "lucide-react";
import CameraView from "./camera-view";
import { submitWorkspacePhoto } from "@/app/verify/actions";
import type { WorkspaceResult, DetectedObject } from "@/lib/ai/gemini";

interface StepWorkspaceProps {
  traderId: string;
  onComplete: () => void;
}

export default function StepWorkspace({ traderId, onComplete }: StepWorkspaceProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<WorkspaceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string, mimeType: string) => {
    setCapturedImage(`data:${mimeType};base64,${base64}`);
    setProcessing(true);
    setError(null);

    try {
      const response = await submitWorkspacePhoto({
        traderId,
        base64Image: base64,
        mimeType,
      });

      if (response.success && response.result) {
        setResult(response.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze workspace");
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
            Show your workspace
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Take a photo of your market stall or shop
          </p>
        </div>

        <CameraView
          onCapture={handleCapture}
          facing="environment"
          showToggle
          guideText="Capture your stall, shop, or workspace"
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
          Analyzing your workspace...
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          Our AI is scanning for your business environment
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
            <MapPin size={20} style={{ color: "var(--color-success)" }} />
            <h2 className="text-xl font-medium" style={{ color: "var(--color-text-primary)" }}>
              Workspace analyzed
            </h2>
          </div>
        </div>

        {/* Image with bounding boxes */}
        <div className="relative w-full overflow-hidden rounded-xl mb-4">
          <img
            src={capturedImage}
            alt="Workspace"
            className="w-full"
            style={{ objectFit: "cover" }}
          />

          {/* Bounding boxes overlay */}
          {result.objects.map((obj: DetectedObject, i: number) => {
            const [ymin, xmin, ymax, xmax] = obj.bbox;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${ymin / 10}%`,
                  left: `${xmin / 10}%`,
                  width: `${(xmax - xmin) / 10}%`,
                  height: `${(ymax - ymin) / 10}%`,
                  border: "2px solid var(--color-squad-orange, #f25c19)",
                  borderRadius: 4,
                }}
              >
                <span
                  className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-white"
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    backgroundColor: "var(--color-squad-orange, #f25c19)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {obj.label} {Math.round(obj.confidence * 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Detected objects tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {result.objects.map((obj: DetectedObject, i: number) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "var(--color-squad-orange-50, #fef1eb)",
                color: "var(--color-squad-orange-700, #a93808)",
              }}
            >
              {obj.label}
            </span>
          ))}
        </div>

        {/* Assessment card */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: result.is_workspace
              ? "var(--color-success-bg, #e8f4ed)"
              : "var(--color-warning-bg, #fbf1dc)",
            border: `1px solid ${
              result.is_workspace ? "var(--color-success)" : "var(--color-warning)"
            }`,
          }}
        >
          <p
            className="text-sm"
            style={{
              color: result.is_workspace
                ? "var(--color-success, #0f7a4d)"
                : "var(--color-warning, #b8730a)",
            }}
          >
            {result.assessment}
          </p>
        </div>

        {/* Confidence */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--color-text-tertiary)" }}>Confidence</span>
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
            Continue
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
