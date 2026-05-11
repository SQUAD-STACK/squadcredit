import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MarketForm from "./_form";

export default async function MarketPage() {
  const session = await getSession();
  if (!session.phone || !session.firstName) redirect("/onboard");

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Step 4 of 5
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        Which market do you trade in?
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "28px" }}>
        Your market helps us tailor your credit and connect you to other traders.
      </p>
      <MarketForm defaultMarket={session.market ?? ""} />
    </div>
  );
}
