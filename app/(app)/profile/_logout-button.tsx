"use client";

import { useTransition } from "react";
import { logout } from "../_actions/logout";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      style={{
        width: "100%",
        padding: "16px 24px",
        backgroundColor: "#fff",
        color: "#dc2626",
        borderRadius: "14px",
        fontSize: "15px",
        fontWeight: 600,
        fontFamily: "inherit",
        letterSpacing: "-0.01em",
        textAlign: "center",
        border: "none",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.6 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
