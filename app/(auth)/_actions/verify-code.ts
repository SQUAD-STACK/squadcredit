"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader } from "@/lib/supabase/types";

const schema = z.object({ otp: z.string().length(6) });

export async function verifyCode(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const parsed = schema.safeParse({ otp: formData.get("otp") });
  if (!parsed.success) return { error: "Enter the 6-digit code." };

  const session = await getSession();

  if (!session.phone || !session.otp) {
    return { error: "Session expired. Start again." };
  }
  if (Date.now() > (session.otpExpiry ?? 0)) {
    return { error: "Code expired. Request a new one." };
  }
  if (parsed.data.otp !== session.otp) {
    return { error: "That code doesn't match. Try again." };
  }

  session.otp = undefined;
  session.otpExpiry = undefined;

  // Check if this phone belongs to an existing trader (returning user = login)
  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("traders")
    .select("id, first_name, last_name, market, business_type")
    .eq("phone", session.phone)
    .maybeSingle();

  const existing = data as Pick<Trader, "id" | "first_name" | "last_name" | "market" | "business_type"> | null;

  if (existing) {
    // Returning user — restore session and go straight to dashboard
    session.traderId = existing.id;
    session.firstName = existing.first_name;
    session.lastName = existing.last_name;
    session.market = existing.market;
    session.businessType = existing.business_type;
    await session.save();
    redirect("/dashboard");
  }

  // New user — continue signup flow
  await session.save();
  redirect("/onboard/name");
}
