export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string, otp: string): Promise<void> {
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_OTP === "true") {
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
    return;
  }
  // TODO: integrate Squad VAS SMS endpoint in production
  throw new Error("SMS not configured for production yet");
}
