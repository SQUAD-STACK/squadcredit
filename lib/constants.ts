export const MARKETS = [
  "Balogun Market",
  "Computer Village",
  "Ariaria International Market",
  "CAPDAN",
  "OMATA",
  "Ladipo Market",
  "Wuse Market",
  "Oshodi Market",
  "Other",
] as const;

export type Market = (typeof MARKETS)[number];

export const BUSINESS_TYPES = [
  "Fabric & textiles",
  "Electronics",
  "Food & provisions",
  "Phones & accessories",
  "Fashion & clothing",
  "Building materials",
  "Cosmetics & beauty",
  "Household items",
  "Other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
