'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Merge rapid filter edits while Next is still committing the previous navigation.
// Displayed values always come from the URL; the ref only serializes pending writes.
export function useReportingSearchParams() {
  const query = useSearchParams();
  const router = useRouter();
  const pending = useRef<string | null>(null);
  const queryString = query.toString();

  useEffect(() => {
    if (pending.current === queryString) pending.current = null;
  }, [queryString]);

  useEffect(() => {
    const resetPending = () => {
      pending.current = null;
    };
    window.addEventListener('popstate', resetPending);
    return () => window.removeEventListener('popstate', resetPending);
  }, []);

  const updateQuery = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(pending.current ?? queryString);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      pending.current = next.toString();
      router.push(`?${next}`, { scroll: false });
    },
    [queryString, router]
  );

  return { query, updateQuery };
}
