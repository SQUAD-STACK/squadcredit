"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import AccountManagerModal from "@/components/account-manager-modal";

export default function DashboardAccountMenu() {
  const [accountManagerOpen, setAccountManagerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setAccountManagerOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.08)",
          background: "#fff",
          color: "#111827",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(15,23,42,0.15)";
          e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
          e.currentTarget.style.backgroundColor = "#fff";
        }}
      >
        <Settings size={16} />
        Manage your account
      </button>

      <AccountManagerModal open={accountManagerOpen} onOpenChange={setAccountManagerOpen} />
    </>
  );
}
