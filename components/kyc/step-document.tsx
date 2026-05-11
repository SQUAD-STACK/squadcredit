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
      const result = await submitDocumentScan({
        traderId,
        documentType,
        base64Image: base64,
        mimeType,
      });

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

    // Do NOT set processing here, we set it after the canvas loads
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          // Compress and standardize image using canvas
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setError("Failed to process image");
            setProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const base64 = dataUrl.split(",")[1];
          const mimeType = "image/jpeg";

          setPreviewImage(dataUrl);
          setProcessing(true);
          setError(null);

          try {
            const result = await submitDocumentScan({
              traderId,
              documentType,
              base64Image: base64,
              mimeType,
            });

            if (result.success && result.extracted) {
              setExtracted(result.extracted as unknown as Record<string, string>);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process document");
          } finally {
            setProcessing(false);
          }
        };
        img.onerror = () => {
          setError("Invalid image file");
        };
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
        className="px-4"
      >
        <div className="mb-6">
          <h2
            className="text-xl font-medium mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Scan your ID
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Choose the document you would like to verify with
          </p>
        </div>

        <div className="space-y-3">
          {DOCUMENT_OPTIONS.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setDocumentType(type)}
              className="w-full flex items-center gap-4 rounded-xl p-4 transition-all"
              style={{
                backgroundColor: "var(--color-surface-raised, #fff)",
                border: "1px solid var(--border-default, rgba(26,24,21,0.14))",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "var(--color-squad-orange-50, #fef1eb)",
                  color: "var(--color-squad-orange, #f25c19)",
                }}
              >
                {icon}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Phase 2: Camera or upload
  if (showCamera) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4"
      >
        <CameraView
          onCapture={handleCapture}
          facing="environment"
          showToggle
          guideText="Position the document within the frame"
        />
      </motion.div>
    );
  }

  // Phase 3: Processing
  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4"
      >
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            Scanning Document
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Please wait while we extract the details...
          </p>
        </div>

        {previewImage ? (
          <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewImage} 
              alt="Document preview" 
              className="max-w-full max-h-full object-contain opacity-75"
            />
            {/* Scanner Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                className="absolute left-0 right-0 h-32 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent, rgba(242, 92, 25, 0.2) 90%, rgba(242, 92, 25, 0.8) 100%)",
                  borderBottom: "2px solid #f25c19",
                  transform: "translateY(-100%)",
                }}
              />
            </div>
            
            {/* Loader overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
               <div className="bg-black/40 backdrop-blur-md p-4 rounded-full" style={{ color: "var(--color-squad-orange, #f25c19)" }}>
                  <Loader2 size={32} className="animate-spin" />
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={48} className="animate-spin mb-4" style={{ color: "var(--color-squad-orange, #f25c19)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Reading your document...</p>
          </div>
        )}
      </motion.div>
    );
  }

  // Phase 4: Show extracted results
  if (extracted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="mb-6">
          <div
            className="flex items-center gap-2 mb-1"
          >
            <Check
              size={20}
              style={{ color: "var(--color-success, #0f7a4d)" }}
            />
            <h2
              className="text-xl font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              Document scanned
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Please confirm the information below
          </p>
        </div>

        <div
          className="rounded-xl p-5 space-y-3 mb-6"
          style={{
            backgroundColor: "var(--color-surface-raised, #fff)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {Object.entries(extracted)
            .map(([key, value]) => (
              <div key={key}>
                <p
                  className="text-xs mb-0.5"
                  style={{
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    fontSize: 10,
                  }}
                >
                  {key.replace(/_/g, " ")}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {String(value) || "—"}
                </p>
              </div>
            ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setExtracted(null);
              setPreviewImage(null);
              setShowCamera(false);
            }}
            className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--color-surface-muted, #edebe3)",
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
              backgroundColor: "var(--color-squad-orange, #f25c19)",
              color: "#fff",
            }}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    );
  }

  // Phase 2b: Choose capture method
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="mb-6">
        <h2
          className="text-xl font-medium mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Capture your {DOCUMENT_OPTIONS.find((d) => d.type === documentType)?.label}
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Take a clear photo or upload an existing image
        </p>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "var(--color-danger, #a8211a)" }}>
          {error}
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={() => setShowCamera(true)}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-4 text-sm font-semibold transition-all"
          style={{
            backgroundColor: "var(--color-squad-orange, #f25c19)",
            color: "#fff",
          }}
        >
          Take a photo
        </button>

        <label
          className="w-full flex items-center justify-center gap-3 rounded-xl py-4 text-sm font-medium cursor-pointer transition-all"
          style={{
            backgroundColor: "var(--color-surface-raised, #fff)",
            border: "1px solid var(--border-default)",
            color: "var(--color-text-primary)",
          }}
        >
          Upload from gallery
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <button
        onClick={() => setDocumentType(null)}
        className="w-full mt-4 text-sm"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Choose a different document
      </button>
    </motion.div>
  );
}
