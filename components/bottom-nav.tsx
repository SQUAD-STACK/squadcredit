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
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2"
      style={{
        backgroundColor: "var(--color-surface-raised, #fff)",
        borderTop: "1px solid var(--border-subtle, rgba(26,24,21,0.08))",
        boxShadow: "0 -1px 0 rgba(26,24,21,0.04)",
      }}
    >
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-colors"
            style={{
              color: active
                ? "var(--color-squad-orange, #f25c19)"
                : "var(--color-text-tertiary, #8b867e)",
            }}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: active ? 500 : 400,
                letterSpacing: "0.01em",
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
