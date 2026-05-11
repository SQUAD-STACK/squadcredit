import type { Transaction } from "./supabase/types";

export interface ScoreResult {
  trustScore: number;
  tier: number;
  creditLimit: number;
  explanations: string[];
}

const TIER_LIMITS: [number, number][] = [
  [5_000, 15_000],
  [15_000, 50_000],
  [50_000, 150_000],
  [150_000, 500_000],
  [500_000, 1_500_000],
  [1_500_000, 5_000_000],
  [5_000_000, 25_000_000],
];

const INFLOW_CAPS = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function tierFromScore(score: number): number {
  if (score >= 800) return 6;
  if (score >= 700) return 5;
  if (score >= 600) return 4;
  if (score >= 500) return 3;
  if (score >= 400) return 2;
  if (score >= 300) return 1;
  return 0;
}

export function computeTierAndLimit(
  trustScore: number,
  trailing30dInflow: number
): { tier: number; creditLimit: number } {
  const tier = tierFromScore(trustScore);
  const [minLimit, maxLimit] = TIER_LIMITS[tier];
  const inflowCap = trailing30dInflow * INFLOW_CAPS[tier];
  const creditLimit = Math.round(clamp(inflowCap, minLimit, maxLimit));
  return { tier, creditLimit };
}

export function computeScore(
  transactions: Transaction[],
  createdAt: string
): ScoreResult {
  const now = new Date();
  const ms30d = 30 * 24 * 60 * 60 * 1000;
  const ms7d = 7 * 24 * 60 * 60 * 1000;
  const ms14d = 14 * 24 * 60 * 60 * 1000;

  const last30 = transactions.filter(
    (tx) => now.getTime() - new Date(tx.transaction_date).getTime() <= ms30d
  );

  // ── Feature 1: Inflow total last 30d ──
  const inflowTotal30d = last30.reduce(
    (sum, tx) => sum + Number(tx.settled_amount),
    0
  );
  const f1 = clamp(Math.log1p(inflowTotal30d) / Math.log1p(3_000_000), 0, 1);

  // ── Feature 2: Active days last 30d ──
  const activeDays = new Set(
    last30.map(
      (tx) => new Date(tx.transaction_date).toISOString().split("T")[0]
    )
  ).size;
  const f2 = clamp(activeDays / 26, 0, 1); // 26 = 6 days/wk

  // ── Feature 3: Coefficient of variation of daily inflows ──
  const dailyMap = new Map<string, number>();
  last30.forEach((tx) => {
    const day = new Date(tx.transaction_date).toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + Number(tx.settled_amount));
  });
  const dailyAmounts = Array.from(dailyMap.values());
  const mean = dailyAmounts.reduce((a, b) => a + b, 0) / (dailyAmounts.length || 1);
  const variance =
    dailyAmounts.reduce((s, x) => s + (x - mean) ** 2, 0) /
    (dailyAmounts.length || 1);
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const f3 = clamp(1 - cv / 2, 0, 1); // lower CV is better

  // ── Feature 4: Week-over-week growth slope ──
  const thisWeek = last30
    .filter((tx) => now.getTime() - new Date(tx.transaction_date).getTime() <= ms7d)
    .reduce((s, tx) => s + Number(tx.settled_amount), 0);
  const lastWeek = last30
    .filter((tx) => {
      const age = now.getTime() - new Date(tx.transaction_date).getTime();
      return age > ms7d && age <= ms14d;
    })
    .reduce((s, tx) => s + Number(tx.settled_amount), 0);
  const growth = lastWeek > 0 ? (thisWeek - lastWeek) / lastWeek : 0;
  const f4 = clamp((growth + 0.5) / 1.0, 0, 1);

  // ── Feature 5: Mean transaction amount ──
  const meanAmount = inflowTotal30d / (last30.length || 1);
  const f5 = clamp(Math.log1p(meanAmount) / Math.log1p(50_000), 0, 1);

  // ── Feature 6: Repeat sender share ──
  const senderCounts = new Map<string, number>();
  transactions.forEach((tx) =>
    senderCounts.set(tx.sender_name, (senderCounts.get(tx.sender_name) ?? 0) + 1)
  );
  const repeatSenders = new Set(
    [...senderCounts.entries()].filter(([, n]) => n > 1).map(([k]) => k)
  );
  const repeatShare =
    last30.length > 0
      ? last30.filter((tx) => repeatSenders.has(tx.sender_name)).length /
        last30.length
      : 0;
  const f6 = clamp(repeatShare / 0.5, 0, 1);

  // ── Feature 7: Sender concentration (Herfindahl index — lower is better) ──
  const senderTotals = new Map<string, number>();
  last30.forEach((tx) =>
    senderTotals.set(
      tx.sender_name,
      (senderTotals.get(tx.sender_name) ?? 0) + Number(tx.settled_amount)
    )
  );
  const hhi =
    inflowTotal30d > 0
      ? [...senderTotals.values()].reduce(
          (s, v) => s + (v / inflowTotal30d) ** 2,
          0
        )
      : 1;
  const f7 = clamp(1 - hhi, 0, 1);

  // ── Feature 8: Weekend share (neutral stub) ──
  const f8 = 0.5;

  // ── Feature 9: App sessions (stub) ──
  const f9 = 0.5;

  // ── Feature 10: Business-hours borrow attempts (stub) ──
  const f10 = 0.5;

  // ── Feature 11: Days since onboarding ──
  const tenure = Math.floor(
    (now.getTime() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
  );
  const f11 = clamp(tenure / 90, 0, 1);

  // ── Feature 12: Network-of-trust (stub) ──
  const f12 = 0.3;

  const weightedSum =
    f1 * 0.20 +
    f2 * 0.15 +
    f3 * 0.10 +
    f4 * 0.08 +
    f5 * 0.05 +
    f6 * 0.15 +
    f7 * 0.10 +
    f8 * 0.03 +
    f9 * 0.02 +
    f10 * 0.02 +
    f11 * 0.07 +
    f12 * 0.03;

  const trustScore = Math.round(clamp(weightedSum, 0, 1) * 1000);
  const { tier, creditLimit } = computeTierAndLimit(trustScore, inflowTotal30d);
  const explanations = buildExplanations({ f1, f2, f3, f4, f6, f7, f11 });

  return { trustScore, tier, creditLimit, explanations };
}

function buildExplanations(scores: Record<string, number>): string[] {
  const out: string[] = [];
  if (scores.f1 < 0.35) out.push("Your total payments this month are below what we need to offer more credit.");
  if (scores.f2 < 0.5) out.push("More active trading days would strengthen your score.");
  if (scores.f3 < 0.4) out.push("More consistent daily sales would improve your score.");
  if (scores.f6 < 0.4) out.push("More repeat customers would increase your trust score.");
  if (scores.f7 < 0.5) out.push("A more diverse customer base would improve your score.");
  if (scores.f11 < 0.5) out.push("Your score will grow as your account history builds up.");
  if (scores.f4 > 0.7) out.push("Your sales are growing — your score reflects this.");
  return out.length > 0
    ? out
    : ["Keep receiving payments consistently to grow your score."];
}
