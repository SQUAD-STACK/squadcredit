export const TIERS = [
  { tier: 0, name: "Trial",       minScore: 0,   maxAmount: 15000,   tenorDays: 7,  feeRate: 0.05,  holdback: 0    },
  { tier: 1, name: "Starter",     minScore: 500, maxAmount: 50000,   tenorDays: 14, feeRate: 0.06,  holdback: 0.15 },
  { tier: 2, name: "Builder",     minScore: 575, maxAmount: 150000,  tenorDays: 21, feeRate: 0.07,  holdback: 0.15 },
  { tier: 3, name: "Established", minScore: 625, maxAmount: 500000,  tenorDays: 30, feeRate: 0.075, holdback: 0.12 },
  { tier: 4, name: "Growth",      minScore: 675, maxAmount: 1500000, tenorDays: 45, feeRate: 0.09,  holdback: 0.10 },
  { tier: 5, name: "Scale",       minScore: 725, maxAmount: 5000000, tenorDays: 60, feeRate: 0.12,  holdback: 0.10 },
] as const;

export type Tier = typeof TIERS[number];

export function tierForScore(score: number): Tier {
  const eligible = [...TIERS].filter((t) => score >= t.minScore);
  return eligible[eligible.length - 1] ?? TIERS[0];
}

export function computeLoanCost(amount: number, tier: Tier) {
  const fee = Math.round(amount * tier.feeRate);
  return { fee, totalDue: amount + fee };
}
