"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";

const schema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export async function saveName(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const session = await getSession();
  if (!session.phone) return { error: "Session expired. Start again." };

  const parsed = schema.safeParse({
    firstName: (formData.get("firstName") as string)?.trim(),
    lastName: (formData.get("lastName") as string)?.trim(),
  });
  if (!parsed.success) return { error: "Enter your first and last name." };

  session.firstName = parsed.data.firstName;
  session.lastName = parsed.data.lastName;
  await session.save();

  redirect("/onboard/market");
}
