"use server";

import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Trader } from "@/lib/supabase/types";

export async function getTraderAccount() {
  const session = await getSession();
  if (!session.traderId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("traders")
    .select("id, first_name, last_name, virtual_account_number, beneficiary_account, bank_code, phone, kyc_status")
    .eq("id", session.traderId)
    .single();

  const trader = data as Pick<
    Trader,
    "id" | "first_name" | "last_name" | "virtual_account_number" | "beneficiary_account" | "bank_code" | "phone" | "kyc_status"
  > | null;

  if (!trader) {
    return { error: "Trader not found" };
  }

  return {
    success: true,
    account: {
      name: `${trader.first_name} ${trader.last_name}`,
      phone: trader.phone,
      virtualAccount: trader.virtual_account_number,
      bankName: trader.bank_code === "058" ? "GTBank" : trader.bank_code,
      beneficiaryAccount: trader.beneficiary_account,
      verificationStatus: trader.kyc_status,
    },
  };
}

export async function deactivateTraderAccount() {
  const session = await getSession();
  if (!session.traderId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createServiceClient();

  // Mark the trader account as deactivated by setting a flag or status
  // (You may want to add a status column to the traders table for this)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("traders")
    .update({ kyc_status: "deactivated" })
    .eq("id", session.traderId);

  if (error) {
    return { error: `Failed to deactivate: ${error.message}` };
  }

  return { success: true, message: "Account deactivated. You can contact Squad support to fully close the virtual account." };
}
