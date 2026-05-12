"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createVirtualAccount } from "@/lib/squad";
import { createServiceClient } from "@/lib/supabase/server";
import { BUSINESS_TYPES } from "@/lib/constants";

const schema = z.object({ businessType: z.enum(BUSINESS_TYPES) });

export async function saveBusinessType(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const session = await getSession();
  const { phone, firstName, lastName, market } = session;

  if (!phone || !firstName || !lastName || !market) {
    return { error: "Session expired. Start again." };
  }

  const parsed = schema.safeParse({ businessType: formData.get("businessType") });
  if (!parsed.success) return { error: "Select a business type to continue." };

  const businessType = parsed.data.businessType;
  const mobile_num = "0" + phone.slice(4);
  const traderId = crypto.randomUUID();
  const customer_identifier = `trader_${traderId}`;

  let virtualAccountNumber = "";
  try {
    const vaRes = await createVirtualAccount({
      customer_identifier,
      first_name: firstName,
      last_name: lastName,
      mobile_num,
      dob: "01/01/1990",
      email: `${phone.replace("+", "")}@squadcredit.app`,
      bvn: "22343211654",
      gender: "2",
      address: market,
      beneficiary_account: "4920299492",
    });
    if (!vaRes.data?.virtual_account_number) {
      console.warn("[onboard] Squad returned no NUBAN — will proceed without one:", JSON.stringify(vaRes));
    } else {
      virtualAccountNumber = vaRes.data.virtual_account_number;
    }
  } catch (err: unknown) {
    // Non-blocking: log the error but allow onboarding to continue.
    // Common causes: account limit reached (422) or network timeout (ETIMEDOUT).
    // The virtual account can be assigned later manually via Squad support.
    console.warn("[onboard] Squad VA creation failed (non-blocking):", err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServiceClient()) as any;

  const { error: dbError } = await supabase.from("traders").insert({
    id: traderId,
    phone,
    first_name: firstName,
    last_name: lastName,
    email: `${phone.replace("+", "")}@squadcredit.app`,
    market,
    business_type: businessType,
    squad_customer_id: customer_identifier,
    virtual_account_number: virtualAccountNumber,
    beneficiary_account: "4920299492",
    bank_code: "000013",
    bvn: "22343211654",
  });

  if (dbError) {
    console.error("[onboard] DB insert failed:", dbError);
    return { error: "We couldn't save your details. Try again." };
  }

  await supabase.from("savings").insert({
    trader_id: traderId,
    rule_percentage: 0.05,
    rule_threshold: 5000,
    goal_label: "My savings",
  });

  session.businessType = businessType;
  session.traderId = traderId;
  await session.save();

  redirect("/onboard/welcome");
}
