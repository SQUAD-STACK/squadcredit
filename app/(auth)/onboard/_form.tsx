"use client";

import { useActionState } from "react";
import { sendCode } from "../_actions/send-code";
import { Input, PrimaryButton, FieldError } from "@/components/ui/form";

export default function PhoneForm() {
  const [state, action, pending] = useActionState(sendCode, null);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <Input
          name="phone"
          type="tel"
          placeholder="0801 234 5678"
          autoFocus
          autoComplete="tel"
          inputMode="tel"
          label="Phone number"
        />
        <FieldError message={state?.error} />
      </div>
      <PrimaryButton pending={pending}>Send code</PrimaryButton>
    </form>
  );
}
