import PhoneForm from "./_form";

export default function PhonePage() {
  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#f25c19", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Step 1 of 5
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        What&apos;s your phone number?
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "32px" }}>
        We&apos;ll send a one-time code to verify it&apos;s you.
      </p>
      <PhoneForm />
    </div>
  );
}
