"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { getCameraErrorMessage, waitForVideoReady } from "@/lib/camera";

interface CameraViewProps {
  onCapture: (base64: string, mimeType: string) => void;
  facing?: "user" | "environment";
  showToggle?: boolean;
  overlay?: React.ReactNode;
  guideText?: string;
}

export default function CameraView({
  onCapture,
  facing = "environment",
  showToggle = false,
  overlay,
  guideText,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [currentFacing, setCurrentFacing] = useState(facing);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facingMode: string) => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }

      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("Camera access requires HTTPS or localhost.");
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await waitForVideoReady(videoRef.current);

        try {
          await videoRef.current.play();
        } catch {
          await new Promise((resolve) => window.requestAnimationFrame(resolve));
          await videoRef.current.play();
        }

        setIsReady(true);
        setError(null);
      }
    } catch (error) {
      setError(getCameraErrorMessage(error));
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    startCamera(currentFacing);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [currentFacing, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];

    onCapture(base64, "image/jpeg");
  };

  const toggleCamera = () => {
    setCurrentFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl p-8 text-center"
        style={{
          backgroundColor: "var(--color-danger-bg, #fae8e6)",
          minHeight: 300,
        }}
      >
        <X
          size={40}
          style={{ color: "var(--color-danger, #a8211a)", marginBottom: 12 }}
        />
        <p
          className="text-sm"
          style={{ color: "var(--color-danger, #a8211a)" }}
        >
          {error}
        </p>
        <button
          onClick={() => startCamera(currentFacing)}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "var(--color-squad-orange, #f25c19)",
            color: "#fff",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ backgroundColor: "#000" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full"
        style={{
          minHeight: 300,
          objectFit: "cover",
          transform: currentFacing === "user" ? "scaleX(-1)" : "none",
        }}
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay (face guide, bounding boxes, etc.) */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none">{overlay}</div>
      )}

      {/* Guide text */}
      {guideText && isReady && (
        <div
          className="absolute top-4 left-0 right-0 text-center"
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {guideText}
        </div>
      )}

      {/* Controls */}
      {isReady && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6">
          {showToggle && (
            <button
              onClick={toggleCamera}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                color: "#fff",
              }}
            >
              <SwitchCamera size={20} />
            </button>
          )}

          <button
            onClick={handleCapture}
            className="flex items-center justify-center rounded-full transition-transform active:scale-90"
            style={{
              width: 64,
              height: 64,
              backgroundColor: "#fff",
              border: "4px solid var(--color-squad-orange, #f25c19)",
            }}
          >
            <Camera
              size={24}
              style={{ color: "var(--color-squad-orange, #f25c19)" }}
            />
          </button>
        </div>
      )}

      {/* Loading state */}
      {!isReady && !error && (
        <div
          className="flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <div
            className="animate-spin rounded-full"
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(255,255,255,0.2)",
              borderTopColor: "var(--color-squad-orange, #f25c19)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Expose the video ref for components that need direct access (e.g., liveness).
 */
export { CameraView };
