import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export interface FeeEstimate {
  amount: number;
  network_fee: number;
  service_fee: number;
  total_fee: number;
  recipient_gets: number;
  fee_percentage: number;
}

/**
 * Fetches a dynamic fee estimate from the backend for the given amount.
 * Falls back to null while loading or on error so callers can show a fallback.
 */
export function useFeeEstimate(amount: number): { estimate: FeeEstimate | null; isLoading: boolean } {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!amount || amount <= 0) {
      setEstimate(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    apiFetch(`/transfers/fee-estimate?amount=${amount}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setEstimate(data as FeeEstimate);
      })
      .catch(() => {
        if (!cancelled) setEstimate(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [amount]);

  return { estimate, isLoading };
}
