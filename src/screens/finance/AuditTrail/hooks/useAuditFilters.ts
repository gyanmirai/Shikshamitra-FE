import { useMemo, useState, useCallback } from 'react';

import type { FinanceAuditLog, AuditFilterValues } from '../types/financeAudit.types';

const DEFAULT_FILTERS: AuditFilterValues = {
  startDate: null,
  endDate: null,
  studentId: '',
  subModule: '',
  search: '',
};

const PAGE_SIZE = 20;

export function useAuditFilters(logs: FinanceAuditLog[]) {
  const [filters, setFilters] = useState<AuditFilterValues>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleFilterChange = useCallback(
    <K extends keyof AuditFilterValues>(key: K, value: AuditFilterValues[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setVisibleCount(PAGE_SIZE);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (
          filters.subModule &&
          filters.subModule !== 'All Modules' &&
          log.subModule !== filters.subModule
        )
          return false;
        if (filters.studentId && log.studentId !== filters.studentId) return false;
        if (filters.startDate) {
          const logDate = new Date(log.createdAt);
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (filters.endDate) {
          const logDate = new Date(log.createdAt);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const match =
            log.description.toLowerCase().includes(q) ||
            (log.studentName?.toLowerCase().includes(q) ?? false) ||
            log.performedBy.toLowerCase().includes(q) ||
            log.subModule.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      }),
    [logs, filters]
  );

  const visibleLogs = useMemo(
    () => filteredLogs.slice(0, visibleCount),
    [filteredLogs, visibleCount]
  );

  const hasMore = visibleCount < filteredLogs.length;

  const isFiltered =
    (filters.subModule !== '' && filters.subModule !== 'All Modules') ||
    filters.studentId !== '' ||
    filters.search !== '' ||
    filters.startDate !== null ||
    filters.endDate !== null;

  return {
    filters,
    filteredLogs,
    visibleLogs,
    hasMore,
    isFiltered,
    handleFilterChange,
    handleResetFilters,
    loadMore,
  };
}
