/**
 * Format a naira amount for display.
 * ₦19,400 for whole amounts; ₦19,400.50 when there are kobo.
 */
export function formatNaira(
  amount: number,
  options: { showKobo?: boolean } = {}
): string {
  const hasKobo = amount % 1 !== 0;
  const decimals = options.showKobo !== undefined ? (options.showKobo ? 2 : 0) : hasKobo ? 2 : 0;

  return (
    "₦" +
    new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  );
}

/**
 * Format a relative date for display.
 * "Today, 2:45pm" / "Yesterday, 10am" / "Mon 5 May"
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const timeStr = d
    .toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase()
    .replace(":00", "");

  if (target.getTime() === today.getTime()) return `Today, ${timeStr}`;
  if (target.getTime() === yesterday.getTime()) return `Yesterday, ${timeStr}`;

  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Convert naira to kobo string for Squad API.
 * ₦19,400 → "1940000"
 */
export function nairaToKobo(naira: number): string {
  return Math.round(naira * 100).toString();
}
