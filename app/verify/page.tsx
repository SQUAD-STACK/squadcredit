import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Trader, KycVerification } from "@/lib/supabase/types";
import VerifyFlow from "./verify-flow";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const session = await getSession();
  const traderId = session.traderId;

  if (!traderId) {
    redirect("/onboard");
  }

  const supabase = await createServiceClient();

  const { data: traderData } = await supabase
    .from("traders")
    .select("*")
    .eq("id", traderId)
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

  const { data: kycData } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("trader_id", traderId)
    .maybeSingle();

  const kyc = kycData as KycVerification | null;
  const currentStep = kyc?.current_step ?? 1;

  return (
    <VerifyFlow
      traderId={traderId}
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
