/**
 * IGH Tour — Tiered Land Arrangement Pricing Engine
 * Source: Package #3345 (Pullman Zamzam Makkah + Frontel Al Harithia Madinah)
 * All prices in USD per pax.
 */

export type RoomType = "quad" | "triple" | "double";

export interface PriceTier {
  minPax: number;
  maxPax: number;
  quad: number;
  triple: number;
  double: number;
}

export const PRICE_TIERS: PriceTier[] = [
  { minPax: 44, maxPax: 47, quad: 815, triple: 943, double: 1197 },
  { minPax: 40, maxPax: 43, quad: 823, triple: 950, double: 1205 },
  { minPax: 36, maxPax: 39, quad: 832, triple: 960, double: 1216 },
  { minPax: 32, maxPax: 35, quad: 843, triple: 972, double: 1228 },
  { minPax: 28, maxPax: 31, quad: 858, triple: 987, double: 1245 },
  { minPax: 24, maxPax: 27, quad: 878, triple: 1008, double: 1267 },
  { minPax: 20, maxPax: 23, quad: 907, triple: 1037, double: 1299 },
  { minPax: 16, maxPax: 19, quad: 950, triple: 1082, double: 1346 },
  { minPax: 12, maxPax: 15, quad: 1023, triple: 1158, double: 1428 },
];

export function findTier(pax: number): PriceTier | null {
  if (pax < 12) return null;
  // For PAX > 47, use the best tier (44-47)
  if (pax > 47) return PRICE_TIERS[0];
  return PRICE_TIERS.find((t) => pax >= t.minPax && pax <= t.maxPax) ?? null;
}

export type Currency = "USD" | "IDR" | "SAR";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  IDR: "Rp",
  SAR: "﷼",
};

export const DEFAULT_FX: Record<Currency, number> = {
  USD: 1,
  IDR: 16200,
  SAR: 3.75,
};

export function formatCurrency(amount: number, currency: Currency, fx: number) {
  const value = amount * fx;
  if (currency === "IDR") {
    return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  }
  if (currency === "SAR") {
    return `SAR ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export interface AdditionalServices {
  visa: number; // USD per pax
  muthowif: number;
  siskopatuh: number;
  handling: number;
}

export const DEFAULT_ADDITIONAL: AdditionalServices = {
  visa: 0,
  muthowif: 0,
  siskopatuh: 0,
  handling: 0,
};

export function totalAdditionalPerPax(s: AdditionalServices): number {
  return s.visa + s.muthowif + s.siskopatuh + s.handling;
}

export function calculateGrandTotal(
  basePerPax: number,
  additional: AdditionalServices,
  pax: number,
): number {
  return (basePerPax + totalAdditionalPerPax(additional)) * pax;
}

export const DEFAULT_INCLUSIONS = [
  "Hotel Bintang 5 di Makkah & Madinah (sesuai pilihan)",
  "Fullboard meals (3x sehari menu Indonesia)",
  "Air Zamzam 5 liter per jamaah",
  "Bus AC eksekutif untuk seluruh perjalanan",
  "Muthowif/Muthowifah berbahasa Indonesia",
  "Visa Umrah",
  "Airport handling Jeddah & Madinah",
  "Ziarah Makkah & Madinah",
];

export const DEFAULT_EXCLUSIONS = [
  "Tiket pesawat international (PP)",
  "Asuransi perjalanan",
  "Pengeluaran pribadi (laundry, telepon, dll)",
  "Vaksin Meningitis",
  "Kelebihan bagasi (excess baggage)",
  "Tipping untuk muthowif & driver",
];
