"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, type Transition } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { submitLivenessResult, checkLivenessPoseWithGemini } from "@/app/verify/actions";

interface StepLivenessProps {
  traderId: string;
  onComplete: () => void;
}

type LivenessPose = "turn_left" | "turn_right" | "smile";
type PoseStatus = "idle" | "capturing" | "verifying" | "passed" | "failed";

const POSE_SEQUENCE: LivenessPose[] = ["turn_left", "turn_right", "smile"];
const POSE_LABELS: Record<LivenessPose, string> = {
  turn_left: "Turn your head left",
  turn_right: "Turn your head right",
  smile: "Smile",
};

const POSE_DURATION_MS = 6000;
const POSE_CAPTURE_INTERVAL_MS = 2000;
const POSE_PROGRESS_CAP = 0.9;
const POSE_TICK_MS = 200;
const POSE_CAPTURE_WIDTH = 360;
const POSE_COMPLETE_ANIM_MS = 800;
const POSE_GEMINI_THRESHOLD = 0.6;
const POSE_FRAME_COUNT = Math.max(3, Math.round(POSE_DURATION_MS / POSE_CAPTURE_INTERVAL_MS));

export default function StepLiveness({ traderId, onComplete }: StepLivenessProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseTimerRef = useRef<number | null>(null);
  const poseStartRef = useRef(0);
  const nextCaptureRef = useRef(0);
  const framesRef = useRef<string[]>([]);
  const verifyInFlightRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);
  const [poseAttempt, setPoseAttempt] = useState(0);
  const [poseProgress, setPoseProgress] = useState(0);
  const [poseStatus, setPoseStatus] = useState<PoseStatus>("idle");
  const [poseSecondsLeft, setPoseSecondsLeft] = useState(Math.ceil(POSE_DURATION_MS / 1000));
  const [completedChallenges, setCompletedChallenges] = useState<Record<LivenessPose, boolean>>({
    turn_left: false,
    turn_right: false,
    smile: false,
  });
  const [allDone, setAllDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPose = POSE_SEQUENCE[poseIndex];
  const totalPoses = POSE_SEQUENCE.length;

  const updatePoseStatus = useCallback((status: PoseStatus) => {
    setPoseStatus(status);
  }, []);

  const clearPoseTimer = useCallback(() => {
    if (poseTimerRef.current) {
      window.clearInterval(poseTimerRef.current);
      poseTimerRef.current = null;
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const targetWidth = Math.min(POSE_CAPTURE_WIDTH, video.videoWidth);
    const scale = targetWidth / video.videoWidth;
    const targetHeight = Math.max(1, Math.round(video.videoHeight * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64Image = dataUrl.split(",")[1] ?? "";
    return base64Image || null;
  }, []);

  const verifyPose = useCallback(
    async (pose: LivenessPose, frames: string[]) => {
      if (verifyInFlightRef.current) return;
      verifyInFlightRef.current = true;
      updatePoseStatus("verifying");

      try {
        if (frames.length === 0) {
          throw new Error("No frames captured");
        }

        const response = await checkLivenessPoseWithGemini({
          pose,
          frames,
          mimeType: "image/jpeg",
        });

        const confidence = Math.max(0, Math.min(1, response.result?.confidence ?? 0));
        const isPose = Boolean(response.result?.is_pose) && confidence >= POSE_GEMINI_THRESHOLD;

        if (isPose) {
          updatePoseStatus("passed");
          setPoseProgress(1);
          setCompletedChallenges((prev) => ({
            ...prev,
            [pose]: true,
          }));

          const nextIndex = poseIndex + 1;
          if (nextIndex >= POSE_SEQUENCE.length) {
            setTimeout(() => setAllDone(true), POSE_COMPLETE_ANIM_MS);
          } else {
            setTimeout(() => setPoseIndex(nextIndex), POSE_COMPLETE_ANIM_MS);
          }
        } else {
          updatePoseStatus("failed");
          setPoseProgress(0);
          setTimeout(() => setPoseAttempt((value) => value + 1), 900);
        }
      } catch {
        updatePoseStatus("failed");
        setPoseProgress(0);
        setTimeout(() => setPoseAttempt((value) => value + 1), 900);
      } finally {
        verifyInFlightRef.current = false;
      }
    },
    [poseIndex, updatePoseStatus, checkLivenessPoseWithGemini]
  );

  const startPoseCapture = useCallback(() => {
    if (!cameraReady || allDone) return;

    clearPoseTimer();
    framesRef.current = [];
    poseStartRef.current = performance.now();
    nextCaptureRef.current = 0;
    setPoseProgress(0);
    setPoseSecondsLeft(Math.ceil(POSE_DURATION_MS / 1000));
    updatePoseStatus("capturing");

    poseTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - poseStartRef.current;
      const nextProgress = Math.min(
        POSE_PROGRESS_CAP,
        (elapsed / POSE_DURATION_MS) * POSE_PROGRESS_CAP
      );
      setPoseProgress(nextProgress);
      setPoseSecondsLeft(Math.max(0, Math.ceil((POSE_DURATION_MS - elapsed) / 1000)));

      if (elapsed >= nextCaptureRef.current && framesRef.current.length < POSE_FRAME_COUNT) {
        const frame = captureFrame();
        if (frame) framesRef.current.push(frame);
        nextCaptureRef.current += POSE_CAPTURE_INTERVAL_MS;
      }

      if (elapsed >= POSE_DURATION_MS) {
        clearPoseTimer();
        setPoseProgress(POSE_PROGRESS_CAP);
        void verifyPose(currentPose, framesRef.current);
      }
    }, POSE_TICK_MS);
  }, [
    cameraReady,
    allDone,
    clearPoseTimer,
    captureFrame,
    currentPose,
    updatePoseStatus,
    verifyPose,
  ]);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions.");
      }
    };

    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearPoseTimer();
    };
  }, [clearPoseTimer]);

  useEffect(() => {
    if (cameraReady && !allDone) {
      startPoseCapture();
    }

    return () => {
      clearPoseTimer();
    };
  }, [cameraReady, allDone, poseIndex, poseAttempt, startPoseCapture, clearPoseTimer]);

  // Submit when all done
  useEffect(() => {
    if (!allDone || submitting) return;

    const submit = async () => {
      setSubmitting(true);
      try {
        await submitLivenessResult({
          traderId,
          score: 1.0,
          challenges: completedChallenges,
        });
        setTimeout(onComplete, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save liveness result");
        setSubmitting(false);
      }
    };

    submit();
  }, [allDone, submitting, traderId, completedChallenges, onComplete]);

  const ringRadius = 110;
  const ringDiameter = ringRadius * 2;
  const targetRadius = 70;
  const pulseSize = ringDiameter + 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = Math.min(1, (poseIndex + poseProgress) / totalPoses);
  const segmentAngles = [0, 120, 240];

  const accentColor = "var(--color-squad-orange, #f25c19)";
  const warningColor = "var(--color-warning, #f6c455)";
  const dangerColor = "var(--color-danger, #e2433f)";
  const successColor = "var(--color-success, #0f7a4d)";
  const neutralColor = "rgba(255,255,255,0.4)";

  const ringColor = allDone
    ? successColor
    : poseStatus === "verifying"
    ? warningColor
    : poseStatus === "failed"
    ? dangerColor
    : poseStatus === "passed"
    ? successColor
    : poseStatus === "capturing"
    ? accentColor
    : neutralColor;

  const pulseActive = poseStatus === "capturing" && !allDone;
  const pulseTransition: Transition = pulseActive
    ? { duration: 1.6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }
    : { duration: 0.3, ease: [0.42, 0, 0.58, 1] };

  const targetStroke = ringColor === neutralColor ? "rgba(255,255,255,0.35)" : ringColor;
  const targetFill = ringColor === neutralColor
    ? "rgba(255,255,255,0.2)"
    : ringColor === warningColor
    ? "rgba(246,196,85,0.25)"
    : ringColor === dangerColor
    ? "rgba(226,67,63,0.25)"
    : ringColor === successColor
    ? "rgba(15,122,77,0.25)"
    : "rgba(242,92,25,0.25)";

  if (error) {
    return (
      <div className="px-4 flex flex-col items-center justify-center py-16">
        <p className="text-sm" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="mb-4">
        <h2 className="text-xl font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
          Liveness check
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Follow the instructions to verify you are a real person
        </p>
      </div>

      {!cameraReady && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2
            size={48}
            className="animate-spin mb-4"
            style={{ color: "var(--color-squad-orange)" }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Starting camera...
          </p>
        </div>
      )}

      {/* Camera feed (always rendered so ref works, hidden if not ready) */}
      <div
        className={`relative w-full overflow-hidden rounded-xl ${!cameraReady ? "hidden" : "block"}`}
        style={{ backgroundColor: "#000" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
          style={{
            minHeight: 320,
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Timer / status */}
        {!allDone && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
                color: "#fff",
                backdropFilter: "blur(6px)",
              }}
            >
              {poseStatus === "verifying"
                ? "Checking pose..."
                : poseStatus === "failed"
                ? "Try that again"
                : `Hold for ${poseSecondsLeft}s`}
            </div>
          </div>
        )}

        {/* Intelligent Progress Ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute rounded-full"
            style={{
              width: pulseSize,
              height: pulseSize,
              border: "1px solid rgba(242,92,25,0.25)",
              boxShadow: "0 0 24px rgba(242,92,25,0.35), 0 0 60px rgba(242,92,25,0.2)",
            }}
            animate={
              pulseActive
                ? { opacity: [0.2, 0.6, 0.2], scale: [0.98, 1.02, 0.98] }
                : { opacity: 0, scale: 1 }
            }
            transition={pulseTransition}
          />
          <svg width="260" height="260" viewBox="0 0 240 240" className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx="120"
              cy="120"
              r={ringRadius}
              fill="transparent"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />

            {/* Segment markers */}
            {segmentAngles.map((angle) => {
              const radians = ((angle - 90) * Math.PI) / 180;
              const x = 120 + Math.cos(radians) * ringRadius;
              const y = 120 + Math.sin(radians) * ringRadius;
              return <circle key={angle} cx={x} cy={y} r="3" fill="rgba(255,255,255,0.5)" />;
            })}

            {/* Face target guide */}
            <circle
              cx="120"
              cy="120"
              r={targetRadius}
              fill="transparent"
              stroke={targetStroke}
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <circle cx="120" cy="120" r="4" fill={targetFill} />

            {/* Dynamic progress fill */}
            <motion.circle
              cx="120"
              cy="120"
              r={ringRadius}
              fill="transparent"
              strokeWidth="8"
              strokeLinecap="round"
              stroke={ringColor}
              animate={{
                strokeDasharray: ringCircumference,
                strokeDashoffset: allDone
                  ? 0
                  : ringCircumference - ringCircumference * ringProgress,
              }}
              transition={{
                ease: "linear",
                duration:
                  poseStatus === "passed" && !allDone
                    ? POSE_COMPLETE_ANIM_MS / 1000
                    : 0.2,
              }}
            />
          </svg>
        </div>

        {/* Challenge instruction */}
        {!allDone && currentPose && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <motion.p
              key={`${currentPose}-${poseStatus}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold"
              style={{
                color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              {poseStatus === "verifying"
                ? "Checking your pose..."
                : poseStatus === "failed"
                ? "Let\'s try that again"
                : POSE_LABELS[currentPose]}
            </motion.p>
          </div>
        )}

        {/* Success overlay */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 80,
                height: 80,
                backgroundColor: successColor,
              }}
            >
              <ShieldCheck size={40} color="#fff" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
