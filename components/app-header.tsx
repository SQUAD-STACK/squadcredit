"use client";

import Link from "next/link";

export default function AppHeader() {
  return (
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
          textDecoration: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="SquadCredit"
          width={34}
          height={34}
          style={{ flexShrink: 0 }}
        />
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

      {/* Profile avatar */}
      <Link
        href="/profile"
        aria-label="Profile"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "rgba(233,30,99,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E91E63"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </Link>
    </header>
  );
}
