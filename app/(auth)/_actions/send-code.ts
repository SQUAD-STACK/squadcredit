"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { generateOtp, sendOtp } from "@/lib/sms";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  throw new Error("invalid");
}

const schema = z.object({ phone: z.string().min(1) });

export async function sendCode(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const parsed = schema.safeParse({ phone: formData.get("phone") });
  if (!parsed.success) return { error: "Enter your phone number." };

  let phone: string;
  try {
    phone = normalizePhone(parsed.data.phone);
  } catch {
    return { error: "Enter a valid Nigerian phone number." };
  }

  const otp = generateOtp();
  await sendOtp(phone, otp);

  const session = await getSession();
  session.phone = phone;
  session.otp = otp;
  session.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  await session.save();

  redirect("/onboard/verify");
}
