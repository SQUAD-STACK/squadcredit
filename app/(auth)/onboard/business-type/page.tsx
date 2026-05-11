import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import BusinessTypeForm from "./_form";

export default async function BusinessTypePage() {
  const session = await getSession();
  if (!session.phone || !session.market) redirect("/onboard");

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Step 5 of 5
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        What do you sell?
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "28px" }}>
        We&apos;ll use this to find the right credit terms for your business.
      </p>
      <BusinessTypeForm defaultType={session.businessType ?? ""} />
    </div>
  );
}
