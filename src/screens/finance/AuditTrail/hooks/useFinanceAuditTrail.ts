import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useGetFinanceAuditEventsQuery,
  useLazyGetFinanceAuditStudentLookupQuery,
} from 'src/redux/finance/audit/financeAuditApi';

import {
  mapActionFilterToApiCode,
  mapFinanceAuditEventsToLogs,
  mapSubModuleFilterToApiCode,
} from '../utils/financeAudit.mapper';

import type { AuditFilterValues, FinanceAuditStudentLookup } from '../types/financeAudit.types';

const PAGE_SIZE = 20;

const KEYWORD_DEBOUNCE_MS = 400;

const DEFAULT_FILTERS: AuditFilterValues = {
  startDate: null,

  endDate: null,

  studentId: '',

  selectedStudentLabel: '',

  subModule: '',

  action: '',

  search: '',

  correlationId: '',
};

function buildQueryParams(
  filters: AuditFilterValues,

  debouncedSearch: string,

  academicYearId: string | undefined,

  skipCount: number
) {
  const keyword = debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined;

  return {
    academicYearId: academicYearId || undefined,

    subModuleCode: mapSubModuleFilterToApiCode(filters.subModule),

    action: mapActionFilterToApiCode(filters.action),

    studentId: filters.studentId || undefined,

    correlationId: filters.correlationId || undefined,

    fromDate: filters.startDate || undefined,

    toDate: filters.endDate || undefined,

    search: keyword,

    skipCount,

    maxResultCount: PAGE_SIZE,

    sorting: 'occurredAt desc',
  };
}

export function useFinanceAuditTrail(initialFilters?: Partial<AuditFilterValues>) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [filters, setFilters] = useState<AuditFilterValues>({
    ...DEFAULT_FILTERS,

    ...initialFilters,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  const [skipCount, setSkipCount] = useState(0);

  const [accumulatedIds, setAccumulatedIds] = useState<string[]>([]);

  const [logMap, setLogMap] = useState<
    Record<string, ReturnType<typeof mapFinanceAuditEventsToLogs>[0]>
  >({});

  const [lookupStudents] = useLazyGetFinanceAuditStudentLookupQuery();

  useDebounceEffect(
    () => {
      setDebouncedSearch(filters.search);
    },

    KEYWORD_DEBOUNCE_MS,

    [filters.search]
  );

  const queryArgs = useMemo(
    () => buildQueryParams(filters, debouncedSearch, currentYear?.id, skipCount),

    [filters, debouncedSearch, currentYear?.id, skipCount]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceAuditEventsQuery(
    queryArgs,
    {
      skip: !currentYear?.id,
    }
  );

  useEffect(() => {
    setSkipCount(0);

    setAccumulatedIds([]);

    setLogMap({});
  }, [
    filters.startDate,

    filters.endDate,

    filters.studentId,

    filters.subModule,

    filters.action,

    debouncedSearch,

    filters.correlationId,

    currentYear?.id,
  ]);

  useEffect(() => {
    if (!data?.items) return;

    const mapped = mapFinanceAuditEventsToLogs(data.items);

    setLogMap((prev) => {
      const next = { ...prev };

      mapped.forEach((log) => {
        next[log.id] = log;
      });

      return next;
    });

    setAccumulatedIds((prev) => {
      if (skipCount === 0) {
        return mapped.map((l) => l.id);
      }

      const newIds = mapped.map((l) => l.id).filter((id) => !prev.includes(id));

      return [...prev, ...newIds];
    });
  }, [data, skipCount]);

  const resolveStudentLabel = useCallback(
    async (studentId: string) => {
      if (!currentYear?.id || !studentId) return;

      try {
        const result = await lookupStudents({
          academicYearId: currentYear.id,

          search: studentId,

          maxResultCount: 1,
        }).unwrap();

        const match = result[0];

        if (match) {
          setFilters((prev) => ({
            ...prev,

            studentId,

            selectedStudentLabel: match.label,
          }));
        }
      } catch {
        /* label resolution is best-effort for deep links */
      }
    },

    [currentYear?.id, lookupStudents]
  );

  useEffect(() => {
    const studentId = initialFilters?.studentId;

    if (!studentId || initialFilters?.selectedStudentLabel) return;

    resolveStudentLabel(studentId);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for URL deep link
  }, [initialFilters?.studentId, initialFilters?.selectedStudentLabel, resolveStudentLabel]);

  const visibleLogs = useMemo(
    () => accumulatedIds.map((id) => logMap[id]).filter(Boolean),

    [accumulatedIds, logMap]
  );

  const totalCount = data?.totalCount ?? 0;

  const hasMore = accumulatedIds.length < totalCount;

  const handleFilterChange = useCallback(
    <K extends keyof AuditFilterValues>(key: K, value: AuditFilterValues[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

        if (key === 'studentId' && !value) {
          next.selectedStudentLabel = '';
        }

        return next;
      });
    },

    []
  );

  const handleSelectStudent = useCallback((student: FinanceAuditStudentLookup | null) => {
    if (!student) {
      setFilters((prev) => ({
        ...prev,

        studentId: '',

        selectedStudentLabel: '',
      }));

      return;
    }

    setFilters((prev) => ({
      ...prev,

      studentId: student.studentId,

      selectedStudentLabel: student.label,
    }));
  }, []);

  const handleFilterByStudent = useCallback(
    (studentId: string, label: string) => {
      setFilters((prev) => ({
        ...prev,

        studentId,

        selectedStudentLabel: label,
      }));
    },

    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });

    setDebouncedSearch(initialFilters?.search ?? '');
  }, [initialFilters]);

  const loadMore = useCallback(() => {
    if (!hasMore || isFetching) return;

    setSkipCount((prev) => prev + PAGE_SIZE);
  }, [hasMore, isFetching]);

  const isFiltered =
    (filters.subModule !== '' && filters.subModule !== 'All Modules') ||
    (filters.action !== '' && filters.action !== 'All Actions') ||
    filters.studentId !== '' ||
    filters.search !== '' ||
    filters.correlationId !== '' ||
    filters.startDate !== null ||
    filters.endDate !== null;

  return {
    filters,

    visibleLogs,

    totalCount,

    filteredCount: totalCount,

    hasMore,

    isFiltered,

    isLoading: isLoading && skipCount === 0,

    isFetching,

    isError,

    refetch,

    handleFilterChange,

    handleSelectStudent,

    handleFilterByStudent,

    handleResetFilters,

    loadMore,
  };
}
