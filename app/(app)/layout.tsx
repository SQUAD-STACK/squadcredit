import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BottomNav from "@/components/bottom-nav";
import AppHeader from "@/components/app-header";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.traderId) {
    if (!session.phone) redirect("/onboard");
    if (!session.firstName) redirect("/onboard/name");
    if (!session.market) redirect("/onboard/market");
    if (!session.businessType) redirect("/onboard/business-type");
    redirect("/onboard");
  }

  return (
    <>
      <AppHeader />
      <div
        style={{
          maxWidth: "440px",
          margin: "0 auto",
          padding: "60px 20px 84px",
        }}
      >
        {children}
      </div>
      <BottomNav />
    </>
  );
}
