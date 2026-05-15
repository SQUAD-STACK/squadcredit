import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { Trader } from "./supabase/types";

export interface SessionData {
  traderId?: string;
  phone?: string;         // normalised +234...
  otp?: string;
  otpExpiry?: number;     // unix ms
  firstName?: string;
  lastName?: string;
  market?: string;
  businessType?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "sc_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Returns the full trader row from DB if the session has a traderId. */
export async function getCurrentTrader(): Promise<Trader | null> {
  const session = await getSession();
  if (!session.traderId) return null;

  const { createServiceClient } = await import("./supabase/server");
  const supabase = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("traders")
    .select("*")
    .eq("id", session.traderId)
    .single();
  return (data ?? null) as Trader | null;
}
