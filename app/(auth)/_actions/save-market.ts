"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { MARKETS } from "@/lib/constants";

const schema = z.object({ market: z.enum(MARKETS) });

export async function saveMarket(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const session = await getSession();
  if (!session.phone || !session.firstName) {
    return { error: "Session expired. Start again." };
  }

  const parsed = schema.safeParse({ market: formData.get("market") });
  if (!parsed.success) return { error: "Select a market to continue." };

  session.market = parsed.data.market;
  await session.save();

  redirect("/onboard/business-type");
}
