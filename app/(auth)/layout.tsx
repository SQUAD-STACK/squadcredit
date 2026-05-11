import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#fafaf7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px", padding: "48px 24px 32px" }}>
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#f25c19",
              letterSpacing: "-0.01em",
            }}
          >
            SquadCredit
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
