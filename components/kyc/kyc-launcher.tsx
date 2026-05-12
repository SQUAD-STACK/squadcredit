"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import KycModal from "@/components/kyc/kyc-modal";

interface KycLauncherProps {
  traderId: string;
  initialStep: number;
  initialOpen?: boolean;
  traderData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    market: string;
    businessType: string;
  };
}

export default function KycLauncher({ traderId, initialStep, initialOpen = false, traderData }: KycLauncherProps) {
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  return (
    <>
      {!open && (
        <div
          style={{
            borderRadius: 18,
            border: "1px solid rgba(242,92,25,0.18)",
            background: "linear-gradient(135deg, rgba(242,92,25,0.08), rgba(245,158,11,0.08))",
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f25c19",
                boxShadow: "0 10px 24px rgba(242,92,25,0.12)",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1815" }}>Finish your KYC verification</div>
              <div style={{ fontSize: 12, color: "#5c5852" }}>You can pause now and resume later from the dashboard.</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: "none",
              padding: "12px 16px",
              backgroundColor: "#f25c19",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Resume verification
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <KycModal
        open={open}
        onOpenChange={setOpen}
        traderId={traderId}
        initialStep={initialStep}
        traderData={traderData}
      />
    </>
  );
}
