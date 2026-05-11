"use client";

import { useActionState } from "react";
import { verifyCode } from "../../_actions/verify-code";
import { sendCode } from "../../_actions/send-code";
import { PrimaryButton, FieldError } from "@/components/ui/form";

export default function VerifyForm({ phone }: { phone: string }) {
  const [state, action, pending] = useActionState(verifyCode, null);

  async function resend() {
    const fd = new FormData();
    fd.set("phone", phone);
    await sendCode(null, fd);
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <input
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          autoFocus
          autoComplete="one-time-code"
          style={{
            width: "100%",
            padding: "18px 16px",
            fontSize: "28px",
            fontWeight: 500,
            letterSpacing: "0.4em",
            textAlign: "center",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            backgroundColor: "#f4f3ee",
            color: "#1a1815",
            boxShadow: "0 0 0 1.5px transparent",
            transition: "box-shadow 0.15s ease, background-color 0.15s ease",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 0 0 2px #f25c19";
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = "#f4f3ee";
            e.currentTarget.style.boxShadow = "0 0 0 1.5px transparent";
          }}
        />
        <FieldError message={state?.error} />
      </div>

      <PrimaryButton pending={pending}>Verify</PrimaryButton>

      <button
        type="button"
        onClick={resend}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "14px",
          color: "#5c5852",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        Resend code
      </button>
    </form>
  );
}
