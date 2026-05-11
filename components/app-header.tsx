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
          backgroundColor: "rgba(249,250,251,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* Logo */}
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
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              SC
            </span>
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
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
            padding: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: "10px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "20px",
                height: "2px",
                backgroundColor: "#111827",
                borderRadius: "2px",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform:
                  menuOpen && i === 0
                    ? "translateY(7px) rotate(45deg)"
                    : menuOpen && i === 2
                    ? "translateY(-7px) rotate(-45deg)"
                    : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
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
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />
      )}

      {/* Slide-down menu */}
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          right: 0,
          zIndex: 45,
          backgroundColor: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
          maxHeight: menuOpen ? "280px" : "0",
          transition: "max-height 0.25s ease",
        }}
      >
        {[
          { label: "Home", href: "/dashboard" },
          { label: "Borrow", href: "/borrow" },
          { label: "Savings", href: "/savings" },
          { label: "Profile", href: "/profile" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              padding: "16px 20px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#111827",
              textDecoration: "none",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              letterSpacing: "-0.01em",
            }}
          >
            {item.label}
          </Link>
        ))}
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
            fontWeight: 600,
            fontFamily: "inherit",
            color: "#dc2626",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );
}
