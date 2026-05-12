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

export default function StepMerchandise({ traderId, businessType, onComplete }: StepMerchandiseProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MerchandiseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string, mimeType: string) => {
    setCapturedImage(`data:${mimeType};base64,${base64}`);
    setProcessing(true);
    setError(null);

    try {
      const response = await submitMerchandisePhoto({ traderId, base64Image: base64, mimeType, businessType });
      if (response.success && response.result) {
        setResult(response.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze merchandise");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setCapturedImage(null); setResult(null); setError(null); };

  // Phase 1: Camera
  if (!capturedImage && !processing && !result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ paddingTop: "20px", paddingRight: "20px", paddingBottom: "20px", paddingLeft: "20px" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", marginBottom: "4px", fontFamily: "inherit" }}>
            Show your goods
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Take a close-up photo of your {businessType} merchandise
          </p>
        </div>
        <CameraView onCapture={handleCapture} facing="environment" showToggle guideText={`Photograph your ${businessType} goods up close`} />
      </motion.div>
    );
  }

  // Phase 2: Processing
  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          paddingTop: "64px",
          paddingRight: "20px",
          paddingBottom: "64px",
          paddingLeft: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={44} className="animate-spin" style={{ color: "#f25c19", marginBottom: "16px" }} />
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Verifying your merchandise...</p>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
          Checking if your goods match your {businessType} business
        </p>
      </motion.div>
    );
  }

  // Phase 3: Results
  if (result && capturedImage) {
    const isMatch = result.matches_business;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ paddingTop: "20px", paddingRight: "20px", paddingBottom: "20px", paddingLeft: "20px" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <ShoppingBag size={20} color="#059669" />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", fontFamily: "inherit" }}>
              Goods verified
            </h2>
          </div>
        </div>

        {/* Image with bounding boxes */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: "16px", marginBottom: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={capturedImage} alt="Merchandise" style={{ width: "100%", objectFit: "cover" }} />
          {result.items.map((item: DetectedObject, i: number) => {
            const [ymin, xmin, ymax, xmax] = item.bbox;
            return (
              <div key={i} style={{ position: "absolute", top: `${ymin / 10}%`, left: `${xmin / 10}%`, width: `${(xmax - xmin) / 10}%`, height: `${(ymax - ymin) / 10}%`, border: "2px solid #f25c19", borderRadius: 4 }}>
                <span style={{ position: "absolute", top: -20, left: 0, padding: "1px 6px", borderRadius: 4, color: "#fff", fontSize: 9, fontWeight: 600, backgroundColor: "#f25c19", whiteSpace: "nowrap" }}>
                  {item.label} {Math.round(item.confidence * 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Detected items tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {result.items.map((item: DetectedObject, i: number) => (
            <span key={i} style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 500, backgroundColor: "#fff4ef", color: "#c44112" }}>
              {item.label}
            </span>
          ))}
        </div>

        {/* Match assessment */}
        <div
          style={{
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "16px",
            backgroundColor: isMatch ? "#f0fdf4" : "#fef3c7",
            border: `1px solid ${isMatch ? "#059669" : "#d97706"}`,
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          {isMatch ? (
            <Check size={18} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
          ) : (
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <p style={{ fontSize: "14px", color: isMatch ? "#059669" : "#d97706", fontWeight: 500 }}>
            {result.assessment}
          </p>
        </div>

        {/* Confidence bar */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Match confidence</span>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>{Math.round(result.score * 100)}%</span>
          </div>
          <div style={{ width: "100%", height: 6, borderRadius: "99px", backgroundColor: "#f3f4f6" }}>
            <div style={{ height: 6, borderRadius: "99px", width: `${result.score * 100}%`, backgroundColor: result.score > 0.6 ? "#059669" : "#d97706", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {error && <p style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626", marginBottom: "16px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={reset} style={{ flex: 1, padding: "14px", borderRadius: "14px", fontSize: "14px", fontWeight: 500, fontFamily: "inherit", border: "none", backgroundColor: "#f3f4f6", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <RotateCcw size={15} /> Retake
          </button>
          <button onClick={onComplete} style={{ flex: 1, padding: "14px", borderRadius: "14px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", border: "none", backgroundColor: "#f25c19", color: "#fff", cursor: "pointer" }}>
            Complete verification
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
