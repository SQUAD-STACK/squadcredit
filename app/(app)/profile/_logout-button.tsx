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
        color: "#a8211a",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: 500,
        textAlign: "center",
        border: "none",
        boxShadow: "0 0 0 1px rgba(26,24,21,0.08)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.6 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
