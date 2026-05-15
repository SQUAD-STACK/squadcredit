import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px", padding: "52px 24px 40px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "44px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="SquadCredit" width={34} height={34} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em" }}>
            SquadCredit
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
