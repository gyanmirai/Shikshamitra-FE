import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { readAssessmentWorkbench } from './assessment-workbench-model';

export function useAssessmentWorkbench() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryString = params.toString();
  const state = readAssessmentWorkbench(new URLSearchParams(queryString));
  const href = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(queryString);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      });
      return `${pathname}?${next.toString()}`;
    },
    [queryString, pathname]
  );
  const update = useCallback(
    (changes: Record<string, string | number | undefined>, replace = false) => {
      router[replace ? 'replace' : 'push'](href(changes), { scroll: false });
    },
    [router, href]
  );
  return { state, href, update };
}
