"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CreditCard, BookOpen, Loader2, Check, RotateCcw } from "lucide-react";
import CameraView from "./camera-view";
import { submitDocumentScan } from "@/app/verify/actions";

interface StepDocumentProps {
  traderId: string;
  onComplete: () => void;
}

type DocumentType = "nin" | "passport" | "voters_card";

const DOCUMENT_OPTIONS: { type: DocumentType; label: string; icon: React.ReactNode }[] = [
  { type: "nin", label: "NIN slip", icon: <CreditCard size={20} /> },
  { type: "passport", label: "Passport", icon: <BookOpen size={20} /> },
  { type: "voters_card", label: "Voter's card", icon: <FileText size={20} /> },
];

export default function StepDocument({ traderId, onComplete }: StepDocumentProps) {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCapture = async (base64: string, mimeType: string) => {
    if (!documentType) return;
    setPreviewImage(`data:${mimeType};base64,${base64}`);
    setShowCamera(false);
    setProcessing(true);
    setError(null);

    try {
      const result = await submitDocumentScan({ traderId, documentType, base64Image: base64, mimeType });
      if (result.success && result.extracted) {
        setExtracted(result.extracted as unknown as Record<string, string>);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process document");
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !documentType) return;
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { setError("Failed to process image"); setProcessing(false); return; }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const base64 = dataUrl.split(",")[1];
          const mimeType = "image/jpeg";

          setPreviewImage(dataUrl);
          setProcessing(true);
          setError(null);

          try {
            const result = await submitDocumentScan({ traderId, documentType, base64Image: base64, mimeType });
            if (result.success && result.extracted) {
              setExtracted(result.extracted as unknown as Record<string, string>);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process document");
          } finally {
            setProcessing(false);
          }
        };
        img.onerror = () => { setError("Invalid image file"); };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to read file");
      setProcessing(false);
    }
  };

  // Phase 1: Select document type
  if (!documentType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "20px" }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", marginBottom: "4px", fontFamily: "inherit" }}>
            Scan your ID
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Choose the document you would like to verify with
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {DOCUMENT_OPTIONS.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setDocumentType(type)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                borderRadius: "16px",
                padding: "16px",
                backgroundColor: "#fff",
                border: "1.5px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f25c19"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(242,92,25,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "#fff4ef",
                  color: "#f25c19",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827", fontFamily: "inherit" }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Phase 2: Camera
  if (showCamera) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
        <CameraView onCapture={handleCapture} facing="environment" showToggle guideText="Position the document within the frame" />
      </motion.div>
    );
  }

  // Phase 3: Processing
  if (processing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", marginBottom: "4px", fontFamily: "inherit" }}>
            Scanning document
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Please wait while we extract the details...</p>
        </div>

        {previewImage ? (
          <div style={{ position: "relative", width: "100%", borderRadius: "16px", overflow: "hidden", backgroundColor: "#000", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Document preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: 0.75 }} />
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                style={{ position: "absolute", left: 0, right: 0, height: 120, background: "linear-gradient(to bottom, transparent, rgba(242,92,25,0.2) 90%, rgba(242,92,25,0.8) 100%)", borderBottom: "2px solid #f25c19", transform: "translateY(-100%)" }}
              />
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
              <div style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", padding: "14px", borderRadius: "50%", color: "#f25c19" }}>
                <Loader2 size={28} className="animate-spin" />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
            <Loader2 size={44} className="animate-spin" style={{ color: "#f25c19", marginBottom: "16px" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>Reading your document...</p>
          </div>
        )}
      </motion.div>
    );
  }

  // Phase 4: Extracted results
  if (extracted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Check size={20} color="#059669" />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", fontFamily: "inherit" }}>
              Document scanned
            </h2>
          </div>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Please confirm the information below</p>
        </div>

        <div
          style={{
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "24px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {Object.entries(extracted).map(([key, value]) => (
            <div key={key}>
              <p style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", fontWeight: 500 }}>
                {key.replace(/_/g, " ")}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{String(value) || "—"}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => { setExtracted(null); setPreviewImage(null); setShowCamera(false); }}
            style={{ flex: 1, padding: "14px", borderRadius: "14px", fontSize: "14px", fontWeight: 500, fontFamily: "inherit", border: "none", backgroundColor: "#f3f4f6", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <RotateCcw size={15} /> Retake
          </button>
          <button
            onClick={onComplete}
            style={{ flex: 1, padding: "14px", borderRadius: "14px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", border: "none", backgroundColor: "#f25c19", color: "#fff", cursor: "pointer" }}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    );
  }

  // Phase 2b: Choose capture method
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", marginBottom: "4px", fontFamily: "inherit" }}>
          Capture your {DOCUMENT_OPTIONS.find((d) => d.type === documentType)?.label}
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Take a clear photo or upload an existing image</p>
      </div>

      {error && (
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626", marginBottom: "16px" }}>{error}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          onClick={() => setShowCamera(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", borderRadius: "14px", padding: "16px", fontSize: "15px", fontWeight: 600, fontFamily: "inherit", border: "none", backgroundColor: "#f25c19", color: "#fff", cursor: "pointer" }}
        >
          Take a photo
        </button>

        <label
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px", padding: "16px", fontSize: "15px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer", backgroundColor: "#fff", border: "1.5px solid rgba(0,0,0,0.08)", color: "#374151" }}
        >
          Upload from gallery
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      <button
        onClick={() => setDocumentType(null)}
        style={{ width: "100%", marginTop: "16px", fontSize: "13px", fontFamily: "inherit", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
      >
        Choose a different document
      </button>
    </motion.div>
  );
}
