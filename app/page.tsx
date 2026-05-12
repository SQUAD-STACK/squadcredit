import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  // Returning users who have completed onboarding go straight to the dashboard
  if (session.traderId) {
    redirect("/dashboard");
  }
  // New users start at onboarding
  redirect("/onboard");
}
