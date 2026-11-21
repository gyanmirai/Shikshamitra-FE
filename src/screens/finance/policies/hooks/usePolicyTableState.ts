import type { Dispatch, SetStateAction } from 'react';

import { useState, useEffect, useCallback } from 'react';

import type { FinancePolicyStatus } from '../types/finance-policy.types';

type PolicyTableQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: FinancePolicyStatus | '';
};

export function usePolicyTableState(scopeKey: string) {
  const [state, setState] = useState({
    scopeKey,
    query: { page: 1, pageSize: 10, search: '', status: '' } as PolicyTableQuery,
  });
  // Derive page 1 before the query hook runs, so a context change never requests
  // the old offset. Persist the new scope to avoid restoring an old page later.
  const query = state.scopeKey === scopeKey ? state.query : { ...state.query, page: 1 };
  useEffect(() => {
    setState((previous) => previous.scopeKey === scopeKey ? previous : {
      scopeKey, query: { ...previous.query, page: 1 },
    });
  }, [scopeKey]);
  const update: Dispatch<SetStateAction<PolicyTableQuery>> = useCallback((next) => {
    setState((previous) => {
      const current = previous.scopeKey === scopeKey ? previous.query : { ...previous.query, page: 1 };
      return { scopeKey, query: typeof next === 'function' ? next(current) : next };
    });
  }, [scopeKey]);
  return [query, update] as const;
}
