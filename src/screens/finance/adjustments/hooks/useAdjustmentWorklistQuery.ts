'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { AdjustmentTabEnum } from '../enums/adjustment.enum';

type Query = {
  tab: AdjustmentTabEnum;
  page: number;
  pageSize: number;
  search: string;
  filters: IParams['filters'];
};
const columns = new Set([
  'studentName',
  'className',
  'rollNumber',
  'requestedBy',
  'status',
  'adjustmentAmount',
  'createdAt',
]);
function read(params: URLSearchParams, initialTab: AdjustmentTabEnum): Query {
  const tabValue = params.get('adjustmentTab');
  const tab = tabValue === null ? initialTab : Number(tabValue);
  let filters: IParams['filters'] = [];
  try {
    const parsed: unknown = JSON.parse(params.get('adjustmentFilters') || '[]');
    if (Array.isArray(parsed))
      filters = parsed
        .slice(0, 30)
        .filter(
          (filter) =>
            filter &&
            typeof filter === 'object' &&
            columns.has(filter.column) &&
            typeof filter.type === 'string' &&
            typeof filter.valueType === 'string' &&
            ['string', 'number'].includes(typeof filter.value)
        )
        .map(({ column, type, value, valueType, label, displayValue }) => ({
          column,
          type,
          value,
          valueType,
          ...(typeof label === 'string' ? { label } : {}),
          ...(typeof displayValue === 'string' ? { displayValue } : {}),
        }));
  } catch {
    /* An invalid shared URL starts with no header criteria. */
  }
  const page = Number(params.get('adjustmentPage') || 1);
  const size = Number(params.get('adjustmentSize') || 10);
  return {
    tab: [0, 1, 2].includes(tab) ? tab : AdjustmentTabEnum.Pending,
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page - 1, 2147483646) : 0,
    pageSize: Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 10,
    search: params.get('adjustmentSearch') || '',
    filters,
  };
}

/** Native history is integrated with Next's search params and supports Back/Forward without a route fetch. */
export function useAdjustmentWorklistQuery(initialTab: AdjustmentTabEnum) {
  const params = useSearchParams();
  const initial = useRef(initialTab);
  const [raw, setRaw] = useUrlFilterValue(params.toString());
  const query = useMemo(() => read(new URLSearchParams(raw), initial.current), [raw]);
  const update = useCallback(
    (updater: (previous: Query) => Query, replace = false) => {
      const nextParams = new URLSearchParams(window.location.search);
      const next = updater(read(nextParams, initial.current));
      const values = {
        adjustmentTab: next.tab === AdjustmentTabEnum.Pending ? '' : String(next.tab),
        adjustmentPage: next.page === 0 ? '' : String(next.page + 1),
        adjustmentSize: next.pageSize === 10 ? '' : String(next.pageSize),
        adjustmentSearch: next.search,
        adjustmentFilters: next.filters.length ? JSON.stringify(next.filters) : '',
      };
      Object.entries(values).forEach(([key, value]) =>
        value ? nextParams.set(key, value) : nextParams.delete(key)
      );
      const search = nextParams.toString();
      const href = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      if (replace) window.history.replaceState(null, '', href);
      else window.history.pushState(null, '', href);
      setRaw(search);
    },
    [setRaw]
  );
  return [query, update] as const;
}
