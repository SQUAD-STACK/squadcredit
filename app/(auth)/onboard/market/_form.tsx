"use client";

import { useActionState, useState } from "react";
import { saveMarket } from "../../_actions/save-market";
import { MARKETS } from "@/lib/constants";
import { SelectCard, PrimaryButton, FieldError } from "@/components/ui/form";

export default function MarketForm({ defaultMarket }: { defaultMarket: string }) {
  const [state, action, pending] = useActionState(saveMarket, null);
  const [selected, setSelected] = useState(defaultMarket);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {MARKETS.map((m) => (
          <SelectCard key={m} value={m} selected={selected === m} onSelect={setSelected}>
            {m}
          </SelectCard>
        ))}
      </div>

      <input type="hidden" name="market" value={selected} />
      <FieldError message={state?.error} />

      <div style={{ paddingTop: "4px" }}>
        <PrimaryButton pending={pending} disabled={!selected}>
          Continue
        </PrimaryButton>
      </div>
    </form>
  );
}
