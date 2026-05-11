"use client";

import { useActionState } from "react";
import { saveName } from "../../_actions/save-name";
import { Input, PrimaryButton, FieldError } from "@/components/ui/form";

export default function NameForm({
  defaultFirst,
  defaultLast,
}: {
  defaultFirst: string;
  defaultLast: string;
}) {
  const [state, action, pending] = useActionState(saveName, null);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Input
        name="firstName"
        type="text"
        placeholder="Sade"
        defaultValue={defaultFirst}
        autoFocus
        autoComplete="given-name"
        label="First name"
      />
      <Input
        name="lastName"
        type="text"
        placeholder="Adebayo"
        defaultValue={defaultLast}
        autoComplete="family-name"
        label="Last name"
      />
      <FieldError message={state?.error} />
      <div style={{ paddingTop: "4px" }}>
        <PrimaryButton pending={pending}>Continue</PrimaryButton>
      </div>
    </form>
  );
}
