import { useRef, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  usePayrollPreviewStatusQuery,
  useStartPayrollPreviewMutation,
  usePayrollPreviewEmployeesQuery,
} from 'src/redux/runPayroll/payroll-preview-run-api';

export function usePayrollPreviewRun(month: string, academicYearId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = `${academicYearId}:${month}`;
  const currentKey = useRef(key);
  currentKey.current = key;
  const runId = params.get('month') === month ? params.get('previewRunId') || '' : '';
  const page = Math.min(1000000, Math.max(0, Math.floor(Number(params.get('page')) || 0)));
  const pageSize = [10, 25, 50].includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 25;
  const search = params.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [display, setDisplay] = useState({ key: '', id: '' });
  const [failure, setFailure] = useState<{ message: string; errorCode?: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState(2000);
  const [start, startState] = useStartPayrollPreviewMutation();
  const lastStarted = useRef('');
  const serializedParams = params.toString();
  const queryState = useRef({ observed: serializedParams, pending: serializedParams, writes: new Set<string>() });
  if (queryState.current.observed !== serializedParams) {
    const state = queryState.current;
    state.observed = serializedParams;
    // Preserve later writes when Next acknowledges an intermediate navigation.
    // A navigation we did not issue (including Back/Forward) is authoritative.
    if (!state.writes.has(serializedParams)) {
      state.pending = serializedParams;
      state.writes.clear();
    } else if (state.pending === serializedParams) {
      state.writes.clear();
    } else {
      state.writes.delete(serializedParams);
    }
  }
  const updateQuery = useCallback((updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(queryState.current.pending);
    Object.entries(updates).forEach(([name, value]) => value === null ? next.delete(name) : next.set(name, String(value)));
    queryState.current.pending = next.toString();
    queryState.current.writes.add(next.toString());
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [pathname, router]);
  const statusQuery = usePayrollPreviewStatusQuery(runId, {
    skip: !runId || !academicYearId,
    pollingInterval,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const status = statusQuery.currentData;
  const matches = status?.month === month && status.academicYearId === academicYearId;
  const busy = startState.isLoading || Boolean(runId && !statusQuery.isError && (!status || (matches && ['QUEUED', 'RUNNING'].includes(status.status))));
  const completedId = matches && status.status === 'SUCCEEDED' ? runId : matches && status.lastCompletedRunId ? status.lastCompletedRunId : display.key === key ? display.id : '';
  const pageQuery = usePayrollPreviewEmployeesQuery({ id: completedId, page, pageSize, search }, {
    skip: !completedId,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const loadPreview = useCallback(async (refresh = false) => {
    if (!month || !academicYearId) return;
    const requestedKey = key;
    setFailure(null);
    try {
      const result = await start({ month, academicYearId, refresh }).unwrap();
      if (currentKey.current !== requestedKey) return;
      setPollingInterval(2000);
      updateQuery({ month, previewRunId: result.id });
      if (result.id === runId) { statusQuery.refetch(); if (completedId) pageQuery.refetch(); }
    } catch (error) {
      if (currentKey.current !== requestedKey) return;
      const problem = parseApiProblemDetail(error);
      setFailure({ message: problem.detail, errorCode: problem.errorCode });
    }
  }, [academicYearId, completedId, key, month, pageQuery, runId, start, statusQuery, updateQuery]);

  useEffect(() => {
    if (!month || !academicYearId || (runId && (!status || matches)) || lastStarted.current === key) return;
    lastStarted.current = key;
    loadPreview();
  }, [academicYearId, key, loadPreview, matches, month, runId, status]);
  useEffect(() => {
    if (!matches) return;
    if (status.status === 'SUCCEEDED') setDisplay({ key, id: runId });
    setPollingInterval(['QUEUED', 'RUNNING'].includes(status.status) ? 5000 : 0);
  }, [key, matches, runId, status]);
  useEffect(() => { setSearchInput(search); }, [search]);
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => updateQuery({ search: searchInput.trim() || null, page: 0 }), 350);
    return () => clearTimeout(timer);
  }, [search, searchInput, updateQuery]);

  const data = pageQuery.currentData || (display.key === key ? pageQuery.data : undefined);
  const queryError = statusQuery.error || pageQuery.error;
  const error = failure || (matches && status.errorMessage ? { message: status.errorMessage, errorCode: status.errorCode || undefined } : null)
    || (queryError ? { message: parseApiProblemDetail(queryError).detail } : null);
  return {
    data, runId: completedId, busy, fetching: pageQuery.isFetching, error, status,
    isCurrent: !busy && !pageQuery.isFetching && !error && matches && status.isCurrent && data?.previewRunId === runId && data.isCurrent,
    loadPreview, page, pageSize, searchInput, setSearchInput, updateQuery,
  };
}
