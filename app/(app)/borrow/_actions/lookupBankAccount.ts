"use server";

import { lookupAccount } from "@/lib/squad";

export async function lookupBankAccount(data: {
  bank_code: string;
  account_number: string;
}): Promise<{ accountName: string } | { error: string }> {
  if (!/^\d{10}$/.test(data.account_number)) {
    return { error: "Account number must be exactly 10 digits." };
  }
  if (!data.bank_code) {
    return { error: "Select a bank first." };
  }
  try {
    const result = await lookupAccount({
      bank_code: data.bank_code,
      account_number: data.account_number,
    });
    return { accountName: result.accountName };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[lookupBankAccount]", msg);
    if (msg.includes("SQUAD_SECRET_KEY") || msg.includes("SQUAD_API_BASE_URL")) {
      return { error: "Payment service not configured. Contact support." };
    }
    return { error: "Couldn't find that account. Check the number and bank." };
  }
}
