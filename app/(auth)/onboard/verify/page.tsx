import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import VerifyForm from "./_form";

export default async function VerifyPage() {
  const session = await getSession();
  if (!session.phone) redirect("/onboard");

  const maskedPhone = session.phone.replace(
    /(\+234)(\d{3})(\d{4})(\d{4})/,
    "0$2 $3 ****"
  );

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Step 2 of 5
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        Enter the code
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "32px" }}>
        We sent a 6-digit code to <strong style={{ color: "#1a1815", fontWeight: 500 }}>{maskedPhone}</strong>.
      </p>
      <VerifyForm phone={session.phone} />
    </div>
  );
}
