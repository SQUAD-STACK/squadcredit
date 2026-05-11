"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { extractDocumentFields } from "@/lib/ai/gemini";
import { analyzeLivenessPose } from "@/lib/ai/gemini";
import { analyzeWorkspace } from "@/lib/ai/gemini";
import { analyzeMerchandise } from "@/lib/ai/gemini";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Schemas                                                            */
/* ------------------------------------------------------------------ */

const personalDetailsSchema = z.object({
  traderId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  market: z.string().min(1, "Select a market"),
  businessType: z.string().min(1, "Select a business type"),
});

const documentSchema = z.object({
  traderId: z.string().uuid(),
  documentType: z.enum(["nin", "passport", "voters_card"]),
  base64Image: z.string().min(1),
  mimeType: z.string().min(1),
});

const livenessSchema = z.object({
  traderId: z.string().uuid(),
  score: z.number().min(0).max(1),
  challenges: z.object({
    turn_left: z.boolean(),
    turn_right: z.boolean(),
    smile: z.boolean(),
  }),
});

const poseCheckSchema = z.object({
  pose: z.enum(["turn_left", "turn_right", "smile"]),
  frames: z.array(z.string().min(1)).min(1).max(5),
  mimeType: z.string().min(1),
});

const photoAnalysisSchema = z.object({
  traderId: z.string().uuid(),
  base64Image: z.string().min(1),
  mimeType: z.string().min(1),
});

/* ------------------------------------------------------------------ */
/*  Helper: typed Supabase operations                                  */
/* ------------------------------------------------------------------ */

async function updateTrader(traderId: string, data: Record<string, unknown>) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("traders")
    .update(data as never)
    .eq("id", traderId);
  if (error) throw new Error(error.message);
}

async function upsertKyc(traderId: string, data: Record<string, unknown>) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("kyc_verifications")
    .upsert(
      { trader_id: traderId, ...data } as never,
      { onConflict: "trader_id" }
    );
  if (error) throw new Error(error.message);
}

async function updateKyc(traderId: string, data: Record<string, unknown>) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("kyc_verifications")
    .update(data as never)
    .eq("trader_id", traderId);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Personal details                                          */
/* ------------------------------------------------------------------ */

export async function submitPersonalDetails(data: z.infer<typeof personalDetailsSchema>) {
  const parsed = personalDetailsSchema.parse(data);

  await updateTrader(parsed.traderId, {
    first_name: parsed.firstName,
    last_name: parsed.lastName,
    phone: parsed.phone,
    email: parsed.email,
    market: parsed.market,
    business_type: parsed.businessType,
    kyc_status: "in_progress",
  });

  await upsertKyc(parsed.traderId, {
    status: "in_progress",
    current_step: 2,
    personal_completed_at: new Date().toISOString(),
  });

  return { success: true, nextStep: 2 };
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Document scan (Gemini Vision)                             */
/* ------------------------------------------------------------------ */

export async function submitDocumentScan(data: z.infer<typeof documentSchema>) {
  const parsed = documentSchema.parse(data);

  // Call Gemini Vision to extract document fields
  const extracted = await extractDocumentFields(
    parsed.base64Image,
    parsed.mimeType,
    parsed.documentType
  );

  await updateKyc(parsed.traderId, {
    document_type: parsed.documentType,
    document_extracted: extracted,
    document_confidence: extracted.confidence,
    document_completed_at: new Date().toISOString(),
    current_step: 3,
  });

  return { success: true, nextStep: 3, extracted };
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Liveness result (client-orchestrated)                     */
/* ------------------------------------------------------------------ */

export async function submitLivenessResult(data: z.infer<typeof livenessSchema>) {
  const parsed = livenessSchema.parse(data);

  const allPassed =
    parsed.challenges.turn_left &&
    parsed.challenges.turn_right &&
    parsed.challenges.smile;

  if (!allPassed) {
    return { success: false, error: "All liveness challenges must be passed" };
  }

  await updateKyc(parsed.traderId, {
    liveness_score: parsed.score,
    liveness_challenges: parsed.challenges,
    liveness_completed_at: new Date().toISOString(),
    current_step: 4,
  });

  return { success: true, nextStep: 4 };
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Liveness pose verification (Gemini Vision)                */
/* ------------------------------------------------------------------ */

export async function checkLivenessPoseWithGemini(
  data: z.infer<typeof poseCheckSchema>
) {
  const parsed = poseCheckSchema.parse(data);
  const result = await analyzeLivenessPose(parsed.frames, parsed.mimeType, parsed.pose);
  return { success: true, result };
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Workspace photo (Gemini Vision)                           */
/* ------------------------------------------------------------------ */

export async function submitWorkspacePhoto(data: z.infer<typeof photoAnalysisSchema>) {
  const parsed = photoAnalysisSchema.parse(data);

  const result = await analyzeWorkspace(parsed.base64Image, parsed.mimeType);

  await updateKyc(parsed.traderId, {
    workspace_objects: result.objects,
    workspace_assessment: result.assessment,
    workspace_score: result.score,
    workspace_completed_at: new Date().toISOString(),
    current_step: 5,
  });

  return { success: true, nextStep: 5, result };
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Merchandise photo (Gemini Vision)                         */
/* ------------------------------------------------------------------ */

export async function submitMerchandisePhoto(
  data: z.infer<typeof photoAnalysisSchema> & { businessType: string }
) {
  const parsed = photoAnalysisSchema.parse(data);

  const result = await analyzeMerchandise(
    parsed.base64Image,
    parsed.mimeType,
    data.businessType
  );

  // Finalize KYC
  await updateKyc(parsed.traderId, {
    merchandise_objects: result.items,
    merchandise_assessment: result.assessment,
    merchandise_match: result.matches_business,
    merchandise_score: result.score,
    merchandise_completed_at: new Date().toISOString(),
    current_step: 6,
    status: "verified",
    completed_at: new Date().toISOString(),
  });

  // Update trader status
  await updateTrader(parsed.traderId, { kyc_status: "verified" });

  return { success: true, result };
}
