"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowUpRight, PiggyBank, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/borrow", label: "Borrow", Icon: ArrowUpRight },
  { href: "/savings", label: "Savings", Icon: PiggyBank },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        backgroundColor: "rgba(250, 250, 247, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(26,24,21,0.06)",
        zIndex: 30,
      }}
    >
      {navItems.map(({ href, label, Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              flex: 1,
              padding: "8px 0",
              textDecoration: "none",
              color: active ? "#f25c19" : "rgba(26,24,21,0.6)",
              borderRadius: "12px",
              transition: "color 0.15s ease",
              position: "relative",
            }}
          >
            {active && (
              <span
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "2px",
                  height: "3px",
                  backgroundColor: "#f25c19",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
