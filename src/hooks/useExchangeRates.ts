import { useState, useEffect } from 'react';
import type { ExchangeRates } from '../types';

const CACHE_KEY = 'findash_exchange_rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
const API_URL = 'https://open.er-api.com/v6/latest/EUR';

interface ApiResponse {
  result: string;
  rates: Record<string, number>;
}

/**
 * Fetches EUR-based exchange rates from open.er-api.com with a 1-hour
 * localStorage cache.
 *
 * On error the hook falls back to the stale cache rather than setting rates
 * to null — this keeps the app usable when the device is offline or the API
 * is down, at the cost of showing slightly outdated conversions.
 */
export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The cancelled flag prevents setState calls on an unmounted component.
    // Without it, a slow fetch that resolves after navigation would write to
    // the old component's state, causing a React warning and a potential
    // second render on the wrong page.
    let cancelled = false;

    async function fetchRates() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as ExchangeRates;
          if (Date.now() - parsed.lastUpdated < CACHE_TTL) {
            if (!cancelled) {
              setRates(parsed);
              setLoading(false);
            }
            return;
          }
        }

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data: ApiResponse = await response.json();
        if (data.result !== 'success') throw new Error('API returned non-success result');

        const exchangeRates: ExchangeRates = {
          base: 'EUR',
          rates: data.rates,
          lastUpdated: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(exchangeRates));

        if (!cancelled) setRates(exchangeRates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch rates';
        if (!cancelled) setError(message);

        // Fall back to stale cache rather than leaving rates null
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          setRates(JSON.parse(cached) as ExchangeRates);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRates();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading, error };
}
