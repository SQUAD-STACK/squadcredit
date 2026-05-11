import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import NameForm from "./_form";

export default async function NamePage() {
  const session = await getSession();
  if (!session.phone) redirect("/onboard");

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Step 3 of 5
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        What&apos;s your name?
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "32px" }}>
        This will appear on your account and payment receipts.
      </p>
      <NameForm
        defaultFirst={session.firstName ?? ""}
        defaultLast={session.lastName ?? ""}
      />
    </div>
  );
}
