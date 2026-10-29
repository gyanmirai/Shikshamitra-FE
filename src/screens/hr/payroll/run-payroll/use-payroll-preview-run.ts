import type { HrFailure } from 'src/screens/hr/recovery/hr-failure';
import type {
  PayrollPreviewPage,
  PayrollPreviewStatus,
} from 'src/redux/runPayroll/payroll-preview-run-api';

import { useRef, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  usePayrollPreviewStatusQuery,
  useStartPayrollPreviewMutation,
  usePayrollPreviewEmployeesQuery,
} from 'src/redux/runPayroll/payroll-preview-run-api';

type PreviewRequest = { context: { key: string }; id: string; awaitingUrl: boolean };
type PreviewFailure = HrFailure & { errorCode?: string };

function normalizePreviewFailure(error: unknown): PreviewFailure {
  return { ...normalizeHrFailure(error), errorCode: parseApiProblemDetail(error).errorCode };
}

export function usePayrollPreviewRun(month: string, academicYearId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = `${academicYearId}:${month}`;
  const context = useRef({ key });
  if (context.current.key !== key) context.current = { key };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const urlRunId = params.get('month') === month ? params.get('previewRunId') || '' : '';
  const page = Math.min(1000000, Math.max(0, Math.floor(Number(params.get('page')) || 0)));
  const pageSize = [10, 25, 50].includes(Number(params.get('pageSize')))
    ? Number(params.get('pageSize'))
    : 25;
  const search = params.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [display, setDisplay] = useState<{ key: string; data: PayrollPreviewPage } | null>(null);
  const [failure, setFailure] = useState<(PreviewFailure & { key: string }) | null>(null);
  const [request, setRequest] = useState<PreviewRequest | null>(null);
  const requestLock = useRef<{ key: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState(2000);
  const [refreshingContext, setRefreshingContext] = useState<{ key: string } | null>(null);
  const statusRefreshRequest = useRef<{ key: string } | null>(null);
  const refreshingStatus = refreshingContext === context.current;
  const [start, startState] = useStartPayrollPreviewMutation();
  const lastStarted = useRef('');
  const serializedParams = params.toString();
  const queryState = useRef({
    observed: serializedParams,
    pending: serializedParams,
    writes: new Set<string>(),
  });
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
  const updateQuery = useCallback(
    (updates: Record<string, string | number | null>) => {
      const next = new URLSearchParams(queryState.current.pending);
      Object.entries(updates).forEach(([name, value]) =>
        value === null ? next.delete(name) : next.set(name, String(value))
      );
      queryState.current.pending = next.toString();
      queryState.current.writes.add(next.toString());
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [pathname, router]
  );
  const activeRequest = request?.context === context.current ? request : null;
  const requestedRunId =
    activeRequest?.awaitingUrl && activeRequest.id ? activeRequest.id : urlRunId;
  const statusQuery = usePayrollPreviewStatusQuery(requestedRunId, {
    skip: !requestedRunId || !academicYearId,
    pollingInterval,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const status = statusQuery.currentData;
  const matches = status?.month === month && status.academicYearId === academicYearId;
  const busy =
    Boolean(activeRequest && !activeRequest.id) ||
    Boolean(activeRequest && startState.isLoading) ||
    Boolean(
      requestedRunId &&
      !statusQuery.isError &&
      (!status || (matches && ['QUEUED', 'RUNNING'].includes(status.status)))
    );
  const completedId =
    matches && status.status === 'SUCCEEDED'
      ? requestedRunId
      : matches && status.lastCompletedRunId
        ? status.lastCompletedRunId
        : display?.key === key
          ? display.data.previewRunId
          : '';
  const pageQuery = useHrTableQuery(
    {
      table: 'payroll-monthly-workbench-table',
      query: { runId: completedId, search },
      page,
      size: pageSize,
      resetPage: () => updateQuery({ page: 0 }),
      skip: !completedId,
    },
    usePayrollPreviewEmployeesQuery(
      { id: completedId, page, pageSize, search },
      {
        skip: !completedId,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
      }
    )
  );

  const currentPage =
    pageQuery.currentData?.previewRunId === completedId ? pageQuery.currentData : undefined;
  const data = currentPage || (display?.key === key ? display.data : undefined);
  const queryError =
    (statusQuery.isError ? statusQuery.error : undefined) ||
    (matches && status.status === 'SUCCEEDED' && pageQuery.isError ? pageQuery.error : undefined);
  const isStarting = Boolean(activeRequest && !activeRequest.id);
  const isStale: boolean =
    !isStarting &&
    Boolean(
      matches &&
      (status.status === 'SUPERSEDED' ||
        (status.status === 'SUCCEEDED' &&
          (status.isCurrent === false || currentPage?.isCurrent === false)))
    );
  const error = isStarting
    ? null
    : (failure?.key === key ? failure : null) ||
      (queryError ? normalizePreviewFailure(queryError) : null) ||
      (matches && status.status === 'FAILED'
        ? normalizePreviewFailure({
            // The status API uses this generic copy even for known business codes.
            // Let the recovery contract explain those codes instead of hiding their reason.
            message:
              status.errorMessage ===
              'Payroll calculation could not finish. Retry the calculation or contact support with the run reference.'
                ? undefined
                : status.errorMessage,
            errorCode: status.errorCode || undefined,
          })
        : null);
  const hasPreparedRun = display?.key === key && display.data.previewRunId === requestedRunId;
  const awaitingResults =
    matches &&
    status.status === 'SUCCEEDED' &&
    !error &&
    !isStale &&
    ((!hasPreparedRun && (!currentPage || pageQuery.isFetching)) ||
      (activeRequest?.id === requestedRunId && pageQuery.isFetching));
  const isPreparing: boolean = !error && !isStale && (busy || Boolean(awaitingResults));
  const isCurrent =
    !isPreparing &&
    !isStale &&
    !pageQuery.isFetching &&
    !error &&
    matches &&
    status.isCurrent &&
    currentPage?.previewRunId === requestedRunId &&
    currentPage.isCurrent;
  const hasError = Boolean(error);

  const loadPreview = useCallback(
    async (refresh = false): Promise<PayrollPreviewStatus | null> => {
      if (
        !month ||
        !academicYearId ||
        requestLock.current === context.current ||
        (!hasError && matches && ['QUEUED', 'RUNNING'].includes(status.status))
      )
        return null;
      const requestedContext = context.current;
      const stillCurrent = () => mounted.current && context.current === requestedContext;
      requestLock.current = requestedContext;
      setRequest({ context: requestedContext, id: '', awaitingUrl: true });
      setFailure(null);
      try {
        const result = await start({ month, academicYearId, refresh }).unwrap();
        if (!stillCurrent()) return null;
        setRequest({
          context: requestedContext,
          id: result.id,
          awaitingUrl: result.id !== urlRunId,
        });
        setPollingInterval(2000);
        updateQuery({ month, previewRunId: result.id });
        if (result.id === urlRunId) {
          statusQuery.refetch();
          if (completedId) pageQuery.refetch();
        }
        return result;
      } catch (caught) {
        if (!stillCurrent()) return null;
        setFailure({ key, ...normalizePreviewFailure(caught) });
        setRequest(null);
        requestLock.current = null;
        return null;
      }
    },
    [
      academicYearId,
      completedId,
      hasError,
      key,
      matches,
      month,
      pageQuery,
      start,
      status,
      statusQuery,
      updateQuery,
      urlRunId,
    ]
  );

  useEffect(() => {
    if (
      !month ||
      !academicYearId ||
      (requestedRunId && (!status || matches)) ||
      lastStarted.current === key
    )
      return;
    lastStarted.current = key;
    loadPreview();
  }, [academicYearId, key, loadPreview, matches, month, requestedRunId, status]);
  useEffect(() => {
    if (currentPage && !pageQuery.isFetching) setDisplay({ key, data: currentPage });
  }, [currentPage, key, pageQuery.isFetching]);
  useEffect(() => {
    if (!matches) return;
    setPollingInterval(['QUEUED', 'RUNNING'].includes(status.status) ? 5000 : 0);
  }, [matches, status]);
  useEffect(() => {
    if (activeRequest?.awaitingUrl && activeRequest.id === urlRunId) {
      setRequest((previous) => (previous ? { ...previous, awaitingUrl: false } : null));
    }
    if (activeRequest?.id && !activeRequest.awaitingUrl && !isPreparing) {
      setRequest(null);
      requestLock.current = null;
    }
  }, [activeRequest, isPreparing, urlRunId]);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(
      () => updateQuery({ search: searchInput.trim() || null, page: 0 }),
      350
    );
    return () => clearTimeout(timer);
  }, [search, searchInput, updateQuery]);

  const refreshStatus = async () => {
    if (
      !requestedRunId ||
      !academicYearId ||
      busy ||
      statusRefreshRequest.current === context.current
    )
      return;
    const requestedContext = context.current;
    statusRefreshRequest.current = requestedContext;
    setRefreshingContext(requestedContext);
    setFailure(null);
    try {
      const result = await statusQuery.refetch();
      if (
        mounted.current &&
        context.current === requestedContext &&
        result.data?.status === 'SUCCEEDED' &&
        completedId
      )
        await pageQuery.refetch();
    } catch (caught) {
      if (mounted.current && context.current === requestedContext)
        setFailure({ key, ...normalizePreviewFailure(caught) });
    } finally {
      if (statusRefreshRequest.current === requestedContext) statusRefreshRequest.current = null;
      if (mounted.current)
        setRefreshingContext((current) => (current === requestedContext ? null : current));
    }
  };

  return {
    data,
    tableProps: pageQuery.tableProps,
    runId: completedId,
    requestedRunId,
    busy,
    fetching: pageQuery.isFetching,
    error,
    status,
    isPreparing,
    isStale,
    isCurrent,
    loadPreview,
    refreshStatus,
    refreshingStatus,
    page,
    pageSize,
    searchInput,
    setSearchInput,
    updateQuery,
  };
}
