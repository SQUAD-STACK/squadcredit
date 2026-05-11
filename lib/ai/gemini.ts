"use server";

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/* ------------------------------------------------------------------ */
/*  Step 2 — Document OCR                                              */
/* ------------------------------------------------------------------ */

export interface DocumentFields {
  full_name: string;
  date_of_birth: string;
  document_number: string;
  gender: string;
  confidence: number;
}

export async function extractDocumentFields(
  base64Image: string,
  mimeType: string,
  documentType: string
): Promise<DocumentFields> {
  const documentLabels: Record<string, string> = {
    nin: "Nigerian National Identification Number (NIN) slip",
    passport: "Nigerian international passport",
    voters_card: "Nigerian voter's card (PVC)",
  };

  const docLabel = documentLabels[documentType] ?? "identity document";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an identity document analysis system. Extract the requested fields from the provided image. The document is expected to be a ${docLabel}, but try to extract the fields even if it looks like a test image, mockup, or a different type of ID. If a field is completely missing and cannot be inferred, use an empty string.`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          full_name: { type: Type.STRING, description: "Full name as shown on the document" },
          date_of_birth: { type: Type.STRING, description: "Date of birth in DD/MM/YYYY format" },
          document_number: { type: Type.STRING, description: "The NIN number, passport number, or voter's card VIN" },
          gender: { type: Type.STRING, description: "Gender: Male or Female" },
          confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1 indicating document readability" },
        },
        required: ["full_name", "date_of_birth", "document_number", "gender", "confidence"],
      },
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as DocumentFields;
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Liveness pose verification (Gemini Vision)                */
/* ------------------------------------------------------------------ */

export type LivenessPose = "turn_left" | "turn_right" | "smile";

export interface LivenessPoseResult {
  is_pose: boolean;
  confidence: number;
  notes: string;
}

export async function analyzeLivenessPose(
  base64Images: string[],
  mimeType: string,
  pose: LivenessPose
): Promise<LivenessPoseResult> {
  const poseLabels: Record<LivenessPose, string> = {
    turn_left: "turn head left",
    turn_right: "turn head right",
    smile: "smile",
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a liveness verification system. Determine if the person is correctly performing the pose: "${poseLabels[pose]}". You will receive multiple frames from a short capture. Return is_pose=true only if the pose is clearly present in most frames. If the face is missing or unclear, return is_pose=false with low confidence.`,
          },
          ...base64Images.map((data) => ({
            inlineData: {
              data,
              mimeType,
            },
          })),
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_pose: { type: Type.BOOLEAN, description: "Whether the pose is correctly performed" },
          confidence: { type: Type.NUMBER, description: "Pose confidence from 0 to 1" },
          notes: { type: Type.STRING, description: "Short reason or observation" },
        },
        required: ["is_pose", "confidence", "notes"],
      },
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as LivenessPoseResult;
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Workspace environment analysis                            */
/* ------------------------------------------------------------------ */

export interface DetectedObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface WorkspaceResult {
  objects: DetectedObject[];
  assessment: string;
  is_workspace: boolean;
  score: number;
}

export async function analyzeWorkspace(
  base64Image: string,
  mimeType: string
): Promise<WorkspaceResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a workspace verification system for a Nigerian market trader lending platform. Analyze this image and determine if it shows a legitimate market stall, shop, or business workspace. Detect all visible objects and provide bounding boxes in [ymin, xmin, ymax, xmax] format normalized to 0-1000. Provide a plain-language assessment and a confidence score from 0 to 1.`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Object name" },
                confidence: { type: Type.NUMBER, description: "Detection confidence 0-1" },
                bbox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "Bounding box [ymin, xmin, ymax, xmax] normalized to 0-1000",
                },
              },
              required: ["label", "confidence", "bbox"],
            },
          },
          assessment: { type: Type.STRING, description: "Plain-language assessment of the workspace" },
          is_workspace: { type: Type.BOOLEAN, description: "Whether this appears to be a legitimate market or business workspace" },
          score: { type: Type.NUMBER, description: "Overall workspace confidence score 0-1" },
        },
        required: ["objects", "assessment", "is_workspace", "score"],
      },
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as WorkspaceResult;
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Merchandise verification                                  */
/* ------------------------------------------------------------------ */

export interface MerchandiseResult {
  items: DetectedObject[];
  matches_business: boolean;
  assessment: string;
  score: number;
}

export async function analyzeMerchandise(
  base64Image: string,
  mimeType: string,
  businessType: string
): Promise<MerchandiseResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a merchandise verification system for a Nigerian market trader lending platform. The trader claims their business type is "${businessType}". Analyze this image of their goods/merchandise. Detect all visible items with bounding boxes in [ymin, xmin, ymax, xmax] format normalized to 0-1000. Determine if the visible goods are consistent with a "${businessType}" business. Provide a plain-language explanation and a confidence score from 0 to 1.`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Item name" },
                confidence: { type: Type.NUMBER, description: "Detection confidence 0-1" },
                bbox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "Bounding box [ymin, xmin, ymax, xmax] normalized to 0-1000",
                },
              },
              required: ["label", "confidence", "bbox"],
            },
          },
          matches_business: { type: Type.BOOLEAN, description: "Whether detected items are consistent with the declared business type" },
          assessment: { type: Type.STRING, description: "Plain-language explanation of what was detected and whether it matches" },
          score: { type: Type.NUMBER, description: "Overall match confidence score 0-1" },
        },
        required: ["items", "matches_business", "assessment", "score"],
      },
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as MerchandiseResult;
}
