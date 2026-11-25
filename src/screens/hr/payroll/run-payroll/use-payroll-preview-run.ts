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
  usePayrollRegisterQuery,
  usePayrollRegisterRowsQuery,
  usePayrollPreviewLookupQuery,
  usePayrollPreviewStatusQuery,
  usePayrollRegisterQueryState,
  useStartPayrollPreviewMutation,
  usePayrollPreviewEmployeesQuery,
} from 'src/redux/runPayroll/payroll-preview-run-api';

type PreviewRequest = { context: { key: string }; id: string; awaitingUrl: boolean };
type PreviewFailure = HrFailure & { errorCode?: string };

function normalizePreviewFailure(error: unknown): PreviewFailure {
  return { ...normalizeHrFailure(error), errorCode: parseApiProblemDetail(error).errorCode };
}

export function usePayrollPreviewRun(month: string, academicYearId: string, useRegister = false) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = `${academicYearId}:${month}`;
  const context = useRef({ key });
  if (context.current.key !== key) context.current = { key };
  const renderedContext = context.current;
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
  const registerCriteria = {
    sort: params.get('registerSort') || undefined,
    descending: params.get('registerDirection') === 'desc',
    reviewState: params.get('registerState') || undefined,
    issueClass: params.get('registerIssue') || undefined,
    issueCode: params.get('registerIssueCode') || undefined,
  };
  const registerArgs = { month, academicYearId, page, pageSize, search, ...registerCriteria };
  const canReadRegister = Boolean(useRegister && month && academicYearId);
  const cachedRegister = usePayrollRegisterQueryState(registerArgs, { skip: !canReadRegister });
  const openWithRows = canReadRegister && page === 0 && !cachedRegister.currentData;
  const openingRows = usePayrollRegisterRowsQuery(
    { ...registerArgs, pageSize: Math.min(pageSize, 25) },
    { skip: !openWithRows }
  );
  const waitingForOpeningRows = openWithRows && !openingRows.currentData && !openingRows.isError;
  const [searchInput, setSearchInput] = useState(search);
  const [display, setDisplay] = useState<{ key: string; data: PayrollPreviewPage } | null>(null);
  const [failure, setFailure] = useState<(PreviewFailure & { key: string }) | null>(null);
  const [request, setRequest] = useState<PreviewRequest | null>(null);
  const requestLock = useRef<{ key: string } | null>(null);
  const pendingCommand = useRef<{ context: { key: string }; refresh: boolean; key: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState(2000);
  const [refreshingContext, setRefreshingContext] = useState<{ key: string } | null>(null);
  const statusRefreshRequest = useRef<{ key: string } | null>(null);
  const refreshingStatus = refreshingContext === context.current;
  const [start, startState] = useStartPayrollPreviewMutation();
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
  const lookupQuery = usePayrollPreviewLookupQuery(
    { month, academicYearId },
    {
      skip: !month || !academicYearId || Boolean(urlRunId) || waitingForOpeningRows,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const lookupFailed = !urlRunId && Boolean(lookupQuery.isError);
  const discoveredRun = lookupFailed ? null : lookupQuery.currentData?.currentRun;
  const requestedRunId =
    (activeRequest?.awaitingUrl && activeRequest.id) || urlRunId || discoveredRun?.id || '';
  const isLookingUp = Boolean(
    month && academicYearId && !requestedRunId && lookupQuery.isFetching && !lookupFailed
  );
  const statusQuery = usePayrollPreviewStatusQuery(requestedRunId, {
    skip: !requestedRunId || !academicYearId || waitingForOpeningRows,
    pollingInterval,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const status =
    statusQuery.currentData ||
    (discoveredRun?.id === requestedRunId ? discoveredRun ?? undefined : undefined);
  const matches = status?.month === month && status.academicYearId === academicYearId;
  const obsoleteUrlRun = Boolean(
    urlRunId &&
    requestedRunId === urlRunId &&
    ((status && !matches) ||
      (statusQuery.isError &&
        parseApiProblemDetail(statusQuery.error).errorCode === 'PAYROLL_PREVIEW_NOT_FOUND'))
  );
  useEffect(() => {
    if (obsoleteUrlRun) updateQuery({ previewRunId: null });
  }, [obsoleteUrlRun, updateQuery]);
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
          ? display.data.previewRunId || ''
          : '';
  const registerKey = JSON.stringify(registerArgs);
  const registerQuery = usePayrollRegisterQuery(
    registerArgs,
    { skip: !canReadRegister, refetchOnFocus: true, refetchOnMountOrArgChange: true }
  );
  const employeesQuery = usePayrollPreviewEmployeesQuery(
    { id: completedId, page, pageSize, search },
    { skip: useRegister || !completedId, refetchOnFocus: true, refetchOnMountOrArgChange: true }
  );
  const pageQuery = useHrTableQuery(
    {
      table: 'payroll-monthly-workbench-table',
      query: useRegister ? { month, academicYearId, search } : { runId: completedId, search },
      page,
      size: pageSize,
      resetPage: () => updateQuery({ page: 0 }),
      skip: useRegister || !completedId,
    },
    useRegister ? registerQuery : employeesQuery
  );

  const currentPage =
    useRegister || pageQuery.currentData?.previewRunId === completedId
      ? pageQuery.currentData
      : undefined;
  useEffect(() => {
    if (
      useRegister && matches && status.status === 'SUCCEEDED' && !status.isCurrent &&
      currentPage?.isCurrent && currentPage.previewRunId &&
      currentPage.previewRunId !== requestedRunId
    ) {
      updateQuery({ month, previewRunId: currentPage.previewRunId });
    }
  }, [currentPage, matches, month, requestedRunId, status, updateQuery, useRegister]);
  // The register resolves its own generation. Discovery alone must not re-read the
  // same page, but an in-flight page can predate a newly completed current run.
  const reconciledRegister = useRef<{ context: typeof renderedContext; signature: string } | null>(null);
  const { refetch: refetchRegister } = registerQuery;
  const needsReconciliation = Boolean(
    useRegister && matches && status.status === 'SUCCEEDED' && status.isCurrent &&
      !lookupFailed && !statusQuery.isError && !registerQuery.isError &&
      !registerQuery.isFetching && currentPage && currentPage.previewRunId !== requestedRunId
  );
  useEffect(() => {
    if (!needsReconciliation || statusRefreshRequest.current === renderedContext) return;
    const signature = JSON.stringify([registerKey, requestedRunId]);
    if (reconciledRegister.current?.context === renderedContext &&
        reconciledRegister.current.signature === signature) return;
    reconciledRegister.current = { context: renderedContext, signature };
    refetchRegister();
  }, [needsReconciliation, refetchRegister, registerKey, renderedContext, requestedRunId]);
  const previousPage = display?.key === key ? display.data : undefined;
  const data = (useRegister ? pageQuery.isError : lookupFailed) ? undefined : currentPage || previousPage;
  const queryError =
    (lookupFailed ? lookupQuery.error : undefined) ||
    (statusQuery.isError ? statusQuery.error : undefined) ||
    ((useRegister || (matches && status.status === 'SUCCEEDED')) && pageQuery.isError
      ? pageQuery.error
      : undefined);
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
  const isCalculating =
    isPreparing &&
    Boolean(
      isStarting ||
      (activeRequest && startState.isLoading) ||
      (matches && ['QUEUED', 'RUNNING'].includes(status.status))
    );
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
  const canRequestPreview =
    !waitingForOpeningRows &&
    !lookupFailed &&
    !statusQuery.isError &&
    (matches || (!requestedRunId && !isLookingUp && lookupQuery.currentData?.currentRun === null));

  const loadPreview = useCallback(
    async (refresh = false): Promise<PayrollPreviewStatus | null> => {
      if (
        !mounted.current ||
        context.current !== renderedContext ||
        !month ||
        !academicYearId ||
        !canRequestPreview ||
        requestLock.current === context.current ||
        (!hasError && matches && ['QUEUED', 'RUNNING'].includes(status.status))
      )
        return null;
      const requestedContext = renderedContext;
      const stillCurrent = () => mounted.current && context.current === requestedContext;
      requestLock.current = requestedContext;
      setRequest({ context: requestedContext, id: '', awaitingUrl: true });
      setFailure(null);
      try {
        if (pendingCommand.current?.context !== requestedContext || pendingCommand.current.refresh !== refresh)
          pendingCommand.current = { context: requestedContext, refresh, key: crypto.randomUUID() };
        const result = await start({ month, academicYearId, refresh, commandKey: pendingCommand.current.key }).unwrap();
        if (!stillCurrent()) return null;
        pendingCommand.current = null;
        setRequest({
          context: requestedContext,
          id: result.id,
          awaitingUrl: result.id !== urlRunId,
        });
        setPollingInterval(2000);
        updateQuery({ month, previewRunId: result.id });
        if (result.id === urlRunId) {
          statusQuery.refetch();
          if (completedId && !useRegister) pageQuery.refetch();
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
      canRequestPreview,
      completedId,
      hasError,
      key,
      matches,
      month,
      renderedContext,
      pageQuery,
      start,
      status,
      statusQuery,
      updateQuery,
      urlRunId,
      useRegister,
    ]
  );

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
      !month ||
      !academicYearId ||
      busy ||
      statusRefreshRequest.current === context.current
    )
      return false;
    const requestedContext = context.current;
    statusRefreshRequest.current = requestedContext;
    setRefreshingContext(requestedContext);
    setFailure(null);
    try {
      if (!requestedRunId) {
        const lookup = await lookupQuery.refetch();
        if (!mounted.current || context.current !== requestedContext || lookup.error) return false;
        if (useRegister) {
          const rows = await pageQuery.refetch();
          return mounted.current && context.current === requestedContext && !rows.error;
        }
        return true;
      }
      const result = await statusQuery.refetch();
      if (!mounted.current || context.current !== requestedContext) return false;
      if (result.error) {
        setFailure({ key, ...normalizePreviewFailure(result.error) });
        return false;
      }
      if (result.data?.status !== 'SUCCEEDED' || !completedId) return false;

      const rows = await pageQuery.refetch();
      if (!mounted.current || context.current !== requestedContext) return false;
      if (rows.error) {
        setFailure({ key, ...normalizePreviewFailure(rows.error) });
        return false;
      }
      return Boolean(
        result.data.isCurrent && rows.data?.previewRunId === completedId && rows.data.isCurrent
      );
    } catch (caught) {
      if (mounted.current && context.current === requestedContext)
        setFailure({ key, ...normalizePreviewFailure(caught) });
      return false;
    } finally {
      if (statusRefreshRequest.current === requestedContext) statusRefreshRequest.current = null;
      if (mounted.current)
        setRefreshingContext((current) => (current === requestedContext ? null : current));
    }
  };

  return {
    data,
    openingRows: !data && !queryError && openWithRows ? openingRows.currentData?.registerRows : undefined,
    waitingForOpeningRows,
    tableProps: useRegister ? { isFilter: false, serverSideSort: true } : pageQuery.tableProps,
    registerCriteria,
    runId: completedId,
    requestedRunId,
    busy,
    isLookingUp,
    isCalculating,
    lookupFailed,
    readFailed: Boolean(queryError) && !isStarting,
    canRequestPreview,
    fetching: waitingForOpeningRows || pageQuery.isFetching,
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
