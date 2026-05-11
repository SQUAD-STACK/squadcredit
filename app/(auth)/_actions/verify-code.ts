"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";

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
  await session.save();

  redirect("/onboard/name");
}
