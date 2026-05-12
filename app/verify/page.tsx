import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Trader, KycVerification } from "@/lib/supabase/types";
import VerifyFlow from "./verify-flow";

const DEMO_TRADER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const supabase = await createServiceClient();

  // Get trader
  const { data: traderData } = await supabase
    .from("traders")
    .select("*")
    .eq("id", DEMO_TRADER_ID)
    .single();

  const trader = traderData as Trader | null;

  if (!trader) {
    return (
      <div className="pt-16 text-center" style={{ color: "var(--color-text-secondary)" }}>
        <p>No trader found. Run the seed data first.</p>
      </div>
    );
  }

  // Already verified — go to dashboard
  if (trader.kyc_status === "verified") {
    redirect("/dashboard");
  }

  // Get existing KYC verification record
  const { data: kycData } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("trader_id", DEMO_TRADER_ID)
    .maybeSingle();

  const kyc = kycData as KycVerification | null;
  const currentStep = kyc?.current_step ?? 1;

  return (
    <VerifyFlow
      traderId={DEMO_TRADER_ID}
      initialStep={currentStep}
      traderData={{
        firstName: trader.first_name,
        lastName: trader.last_name,
        phone: trader.phone,
        email: trader.email,
        market: trader.market,
        businessType: trader.business_type,
      }}
    />
  );
}
