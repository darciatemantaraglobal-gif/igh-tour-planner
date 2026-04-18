import { useEffect, useState } from "react";
import { DEFAULT_FX, type Currency } from "@/lib/pricing";

interface FxState {
  rates: Record<Currency, number>;
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
}

/**
 * Fetches USD-based exchange rates from a free public API.
 * Falls back to DEFAULT_FX if the API is unreachable.
 */
export function useFxRates() {
  const [state, setState] = useState<FxState>({
    rates: DEFAULT_FX,
    loading: true,
    error: null,
    updatedAt: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD",
        );
        if (!res.ok) throw new Error("FX fetch failed");
        const data = await res.json();
        if (cancelled) return;
        setState({
          rates: {
            USD: 1,
            IDR: data.rates?.IDR ?? DEFAULT_FX.IDR,
            SAR: data.rates?.SAR ?? DEFAULT_FX.SAR,
          },
          loading: false,
          error: null,
          updatedAt: new Date(),
        });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e.message : "Unknown error",
          updatedAt: new Date(),
        }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
