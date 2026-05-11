"use client";

import { useActionState, useState } from "react";
import { saveBusinessType } from "../../_actions/save-business-type";
import { BUSINESS_TYPES } from "@/lib/constants";
import { PillCard, PrimaryButton, FieldError } from "@/components/ui/form";

export default function BusinessTypeForm({ defaultType }: { defaultType: string }) {
  const [state, action, pending] = useActionState(saveBusinessType, null);
  const [selected, setSelected] = useState(defaultType);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {BUSINESS_TYPES.map((t) => (
          <PillCard key={t} value={t} selected={selected === t} onSelect={setSelected}>
            {t}
          </PillCard>
        ))}
      </div>

      <input type="hidden" name="businessType" value={selected} />
      <FieldError message={state?.error} />

      <div style={{ paddingTop: "4px" }}>
        <PrimaryButton pending={pending} disabled={!selected}>
          {pending ? "Setting up your account…" : "Set up my account"}
        </PrimaryButton>
      </div>
    </form>
  );
}
