'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function usePayrollMonth(): [Dayjs, (value: Dayjs | null) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get('month');
  const month = useMemo(
    () =>
      value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
        ? dayjs(`${value}-01`)
        : dayjs().startOf('month'),
    [value]
  );
  const setMonth = useCallback(
    (nextMonth: Dayjs | null) => {
      if (!nextMonth?.isValid() || nextMonth.format('YYYY-MM') === month.format('YYYY-MM')) return;
      const next = new URLSearchParams(params.toString());
      next.set('month', nextMonth.format('YYYY-MM'));
      next.delete('previewRunId');
      next.delete('page');
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [month, params, pathname, router]
  );
  return [month, setMonth];
}
