"use server";

import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

export async function saveDisbursementAccount(data: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session.traderId) return { error: "Session expired. Please sign in again." };

  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("traders")
    .update({
      disbursement_bank_code: data.bankCode,
      disbursement_account_number: data.accountNumber,
      disbursement_account_name: data.accountName,
    })
    .eq("id", session.traderId);

  if (error) {
    console.error("[saveDisbursementAccount] DB error:", error);
    return { error: "Couldn't save your bank details. Try again." };
  }

  return { success: true };
}
