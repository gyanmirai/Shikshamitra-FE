'use client';

import { useRef, useEffect } from 'react';

/** Setup opens in a new tab; returning refreshes lookups without resetting Formik state. */
export function useRefreshFinancePrerequisites(onRefresh?: () => void, enabled = true) {
  const latest = useRef(onRefresh);
  latest.current = onRefresh;
  const canRefresh = Boolean(onRefresh);
  useEffect(() => {
    if (!enabled || !canRefresh) return undefined;
    const refresh = () => {
      latest.current?.();
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [enabled, canRefresh]);
}
