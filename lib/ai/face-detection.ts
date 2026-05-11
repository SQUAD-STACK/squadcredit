"use client";

import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

const MODEL_URL = "/models/face-api";

/**
 * Load face-api.js models. Safe to call multiple times — only loads once.
 */
export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

/**
 * Detect a single face from a video element.
 * Returns null if no face is detected.
 */
export async function detectFace(video: HTMLVideoElement) {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }))
    .withFaceLandmarks()
    .withFaceExpressions();

  return detection ?? null;
}

export type LivenessChallenge = "turn_left" | "turn_right" | "smile";

/**
 * Compute head yaw angle from 68-point face landmarks.
 * Negative = looking left, Positive = looking right.
 */
function computeYaw(landmarks: faceapi.FaceLandmarks68): number {
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();

  // Nose tip
  const noseTip = nose[3];
  // Left jaw edge and right jaw edge
  const leftJaw = jaw[0];
  const rightJaw = jaw[16];

  // Calculate relative horizontal position of nose tip between jaw edges
  const jawWidth = rightJaw.x - leftJaw.x;
  if (jawWidth === 0) return 0;

  const noseRelative = (noseTip.x - leftJaw.x) / jawWidth;

  // Center is ~0.5. Convert to angle-like value.
  // < 0.5 means looking right (from camera perspective), > 0.5 means looking left
  return (noseRelative - 0.5) * 2; // Range roughly -1 to 1
}

/**
 * Check if a liveness challenge is currently being satisfied.
 * Returns a confidence value 0-1 for how strongly the challenge is detected.
 */
export function checkChallenge(
  detection: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>,
  challenge: LivenessChallenge
): number {
  const turnDeadzone = 0.02;
  const turnRange = 0.12;
  switch (challenge) {
    case "turn_left": {
      const yaw = computeYaw(detection.landmarks);
      // User's left = camera's right = positive yaw
      return Math.max(0, Math.min(1, (yaw - turnDeadzone) / turnRange));
    }
    case "turn_right": {
      const yaw = computeYaw(detection.landmarks);
      // User's right = camera's left = negative yaw
      return Math.max(0, Math.min(1, (-yaw - turnDeadzone) / turnRange));
    }
    case "smile": {
      const happiness = detection.expressions.happy ?? 0;
      return Math.max(0, Math.min(1, (happiness - 0.1) / 0.3));
    }
    default:
      return 0;
  }
}

/**
 * Labels for each challenge to show the user.
 */
export const CHALLENGE_LABELS: Record<LivenessChallenge, string> = {
  turn_left: "Turn your head left",
  turn_right: "Turn your head right",
  smile: "Smile",
};

/**
 * The ordered sequence of challenges.
 */
export const CHALLENGE_SEQUENCE: LivenessChallenge[] = [
  "turn_left",
  "turn_right",
  "smile",
];
