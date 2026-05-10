import type { ReactNode } from "react";
import BottomNav from "@/components/bottom-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface-base, #fafaf7)" }}>
      <main className="pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
