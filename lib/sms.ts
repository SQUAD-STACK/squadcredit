export const TEST_OTPS = ["483921", "716054", "294817", "638502", "157349"];

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string, otp: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`OTP for ${phone}: ${otp}`);
  }
  // In production, no SMS is sent — TEST_OTPS are accepted in verify-code.ts
}
