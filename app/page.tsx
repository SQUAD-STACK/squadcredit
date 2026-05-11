import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Trader } from "@/lib/supabase/types";

const DEMO_TRADER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const FORCE_VERIFY =
  process.env.NEXT_PUBLIC_FORCE_VERIFY === "true" ||
  process.env.NODE_ENV !== "production";

export default async function Home() {
  if (FORCE_VERIFY) {
    redirect("/verify");
  }

  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("traders")
    .select("kyc_status")
    .eq("id", DEMO_TRADER_ID)
    .single();

  const trader = data as Pick<Trader, "kyc_status"> | null;

  if (!trader || trader.kyc_status !== "verified") {
    redirect("/verify");
  }

  redirect("/dashboard");
}
