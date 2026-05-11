"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { logout } from "@/app/(app)/_actions/logout";

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "60px",
          backgroundColor: "rgba(250,250,247,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(26,24,21,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* Logo mark + wordmark */}
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#f25c19",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                fontSize: "12px",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              SC
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#1a1815",
              letterSpacing: "-0.025em",
            }}
          >
            SquadCredit
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "5px",
            padding: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              backgroundColor: "#1a1815",
              borderRadius: "2px",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              backgroundColor: "#1a1815",
              borderRadius: "2px",
              opacity: menuOpen ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          />
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              backgroundColor: "#1a1815",
              borderRadius: "2px",
              transition: "transform 0.2s ease",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            backgroundColor: "rgba(26,24,21,0.25)",
          }}
        />
      )}

      {/* Dropdown menu */}
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          right: 0,
          zIndex: 45,
          backgroundColor: "#fff",
          borderBottom: "1px solid rgba(26,24,21,0.08)",
          boxShadow: "0 8px 24px rgba(26,24,21,0.1)",
          overflow: "hidden",
          maxHeight: menuOpen ? "320px" : "0",
          transition: "max-height 0.25s ease",
        }}
      >
        {(["Home:/dashboard", "Borrow:/borrow", "Savings:/savings", "Profile:/profile"] as const).map((item) => {
          const [label, href] = item.split(":");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "16px 20px",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
                color: "#1a1815",
                textDecoration: "none",
                borderBottom: "1px solid rgba(26,24,21,0.05)",
              }}
            >
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            setMenuOpen(false);
            startTransition(() => logout());
          }}
          disabled={pending}
          style={{
            display: "block",
            width: "100%",
            padding: "16px 20px",
            fontSize: "15px",
            fontWeight: 500,
            fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
            color: "#a8211a",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );
}
