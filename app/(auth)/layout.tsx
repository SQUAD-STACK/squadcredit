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
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "#f25c19",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              SC
            </span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em" }}>
            Squad <span style={{ color: "#f25c19" }}>Credit</span>
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
