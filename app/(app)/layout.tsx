import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.traderId) {
    // Redirect to the furthest onboarding step they've reached
    if (!session.phone) redirect("/onboard");
    if (!session.firstName) redirect("/onboard/name");
    if (!session.market) redirect("/onboard/market");
    if (!session.businessType) redirect("/onboard/business-type");
    redirect("/onboard");
  }

  return <>{children}</>;
}
