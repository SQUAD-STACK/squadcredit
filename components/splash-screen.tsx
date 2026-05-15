"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    const seen = sessionStorage.getItem("sc_splashed");

    if (!isStandalone || seen) return;

    sessionStorage.setItem("sc_splashed", "1");
    setPhase("visible");

    const fadeTimer = setTimeout(() => setPhase("fading"), 1500);
    const hideTimer = setTimeout(() => setPhase("hidden"), 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <>
      <style>{`
        @keyframes sc-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.86); opacity: 0.45; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.3s ease",
          opacity: phase === "fading" ? 0 : 1,
          pointerEvents: phase === "fading" ? "none" : "auto",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="SquadCredit"
          width={72}
          height={72}
          style={{ animation: "sc-pulse 1s ease-in-out infinite" }}
        />
      </div>
    </>
  );
}
