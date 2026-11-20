import { useState, useEffect } from 'react';
import { useLazyGetDetailedChargeQuery } from 'src/redux/library/charges-management/charges-get-api';

import type { ILibraryChargeData } from '../type';

export type FinanceAssessment = ILibraryChargeData & {
  currency?: string | null;
  academicYearName?: string | null;
};

export function useOpenedFinanceAssessment(open: boolean, id: string, allowed: boolean) {
  const [load, query] = useLazyGetDetailedChargeQuery();
  const [assessment, setAssessment] = useState<FinanceAssessment | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAssessment(null);
    if (!open || !id || !allowed) return undefined;
    let current = true;
    const request = load({ chargeId: id }, false);
    request
      .unwrap()
      .then((value) => {
        if (current) setAssessment(value);
      })
      .catch(() => undefined);
    return () => {
      current = false;
      request.unsubscribe();
    };
  }, [open, id, allowed, load, attempt]);
  return {
    assessment: assessment?.id === id ? assessment : null,
    query,
    retry: () => setAttempt((value) => value + 1),
  };
}
