import PhoneForm from "./_form";

export default function PhonePage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#1a1815", letterSpacing: "-0.01em", lineHeight: "34px", marginBottom: "8px" }}>
        Enter your phone number
      </h1>
      <p style={{ fontSize: "15px", color: "#5c5852", lineHeight: "22px", marginBottom: "32px" }}>
        We&apos;ll send a one-time code. Existing members go straight to your account.
      </p>
      <PhoneForm />
    </div>
  );
}
