'use client';

import { useRef, useEffect } from 'react';

/** Setup opens in a new tab; returning refreshes lookups without resetting Formik state. */
export function useRefreshFinancePrerequisites(onRefresh?: () => void, enabled = true) {
  const latest = useRef(onRefresh);
  latest.current = onRefresh;
  const canRefresh = Boolean(onRefresh);
  useEffect(() => {
    if (!enabled || !canRefresh) return undefined;
    let hasLeftPage = document.visibilityState === 'hidden';
    const refreshOnReturn = () => {
      if (!hasLeftPage || document.visibilityState === 'hidden') return;
      hasLeftPage = false;
      latest.current?.();
    };
    const handleBlur = (event: Event) => {
      if (event.target === window) hasLeftPage = true;
    };
    const handleFocus = (event: Event) => {
      if (event.target === window) refreshOnReturn();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') hasLeftPage = true;
      else refreshOnReturn();
    };
    // Dialogs restore focus inside the same page; only an actual return from
    // another tab or window needs fresh prerequisite and eligibility data.
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, canRefresh]);
}
