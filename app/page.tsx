import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LandingPage from "./landing-page";

export default async function Home() {
  const session = await getSession();
  
  if (session.traderId) {
    redirect("/dashboard");
  }
  
  return <LandingPage />;
}
