import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import {
  useGetAuditLogsQuery,
  useAddAuditLogReviewNoteMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import { matchesAuditFilters } from './utils/auditFilters';
import { EMPTY_FILTERS } from './constants/auditLogs.constants';

import type { AuditLog, AuditView, AuditFilterState } from './types/auditLogs.types';

export default function useCalendarAuditLogs() {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.View`
  );
  const canAddNote = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.Add`
  );
  const [view, setView] = useState<AuditView>('table');
  const [filters, setFilters] = useState<AuditFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLog, setSummaryLog] = useState<AuditLog | null>(null);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [addNote] = useAddAuditLogReviewNoteMutation();
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        !canView ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target.closest(
          'input, textarea, button, [role="combobox"], [role="dialog"], [contenteditable="true"]'
        )
      )
        return;
      if (event.key.toLowerCase() === 't')
        setView((current) => (current === 'table' ? 'timeline' : 'table'));
      if (event.key.toLowerCase() === 'a') {
        setSummaryLog(null);
        setSummaryOpen(true);
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [canView]);
  const query = useGetAuditLogsQuery(
    {
      ...(filters.action ? { action: Number(filters.action) } : {}),
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    { skip: !canView }
  );
  const pending = query.isLoading || (query.isFetching && !query.currentData);
  const logs = (query.currentData?.items ?? []) as AuditLog[];
  const displayedLogs = logs.filter((log) => matchesAuditFilters(log, filters));
  const totalCount = query.currentData?.totalCount;
  const changeFilters = (next: AuditFilterState) => {
    if (next.action !== filters.action) setPage(0);
    setFilters(next);
  };
  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };
  const saveNote = async (log: AuditLog, note: string) => {
    const persistedNote = await addNote({ auditLogId: log.id, note }).unwrap();
    setSelectedLog((previous) =>
      previous?.id === log.id
        ? { ...previous, reviewNotes: [...(previous.reviewNotes ?? []), persistedNote] }
        : previous
    );
  };
  return {
    canView,
    canAddNote,
    view,
    setView,
    filters,
    changeFilters,
    resetFilters,
    page,
    rowsPerPage,
    changePage: (next: number, size: number) => {
      setPage(next);
      setRowsPerPage(size);
    },
    selectedLog,
    setSelectedLog,
    summaryOpen,
    setSummaryOpen,
    summaryLog,
    setSummaryLog,
    exportAnchor,
    setExportAnchor,
    saveNote,
    displayedLogs,
    entityTypes: Array.from(
      new Set(logs.map((log) => log.entityType).filter((value): value is string => Boolean(value)))
    ),
    totalCount,
    pending,
    refreshing: query.isFetching && !pending,
    error: query.isError ? query.error : undefined,
    retry: query.refetch,
    hasActiveFilters: Object.values(filters).some(Boolean),
  };
}
