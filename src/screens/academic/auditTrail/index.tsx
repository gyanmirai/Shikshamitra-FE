'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AcademicAuditEvent,
  AcademicAuditEventListArgs,
} from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Stack, Alert, Tooltip, Typography, IconButton } from '@mui/material';
import { useGetAcademicAuditEventsQuery } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import AcademicAuditFilter, { type AcademicAuditFilters } from './components/AcademicAuditFilter';
import AcademicAuditDetailsDrawer from './components/AcademicAuditDetailsDrawer';
import { ACADEMIC_AUDIT_SOURCE_LABELS } from './academicAudit.constants';

const DEFAULT_FILTERS: AcademicAuditFilters = {
  search: '',
  subModuleCode: '',
  action: '',
  fromDate: null,
  toDate: null,
};

const actionColor = (action: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  if (action.includes('delete') || action.includes('cancel') || action.includes('archive'))
    return 'error';
  if (action.includes('publish') || action.includes('resolve') || action.includes('final'))
    return 'success';
  if (action.includes('update') || action.includes('change') || action.includes('generate'))
    return 'warning';
  if (action.includes('create') || action.includes('declare')) return 'info';
  return 'default';
};

const isFiltered = (filters: AcademicAuditFilters) =>
  Boolean(
    filters.search || filters.subModuleCode || filters.action || filters.fromDate || filters.toDate
  );

const buildQueryArgs = (
  filters: AcademicAuditFilters,
  academicYearId: string | undefined,
  page: number,
  rowsPerPage: number
): AcademicAuditEventListArgs => ({
  academicYearId,
  subModuleCode: filters.subModuleCode || undefined,
  action: filters.action || undefined,
  fromDate: filters.fromDate || undefined,
  toDate: filters.toDate || undefined,
  search: filters.search.trim().length >= 2 ? filters.search.trim() : undefined,
  skipCount: page * rowsPerPage,
  maxResultCount: rowsPerPage,
  sorting: 'occurredAt desc',
});

const AcademicAuditTrail = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<AcademicAuditEvent | null>(null);

  /**
   * Memoization Justification:
   * - RTK Query uses the argument object as a cache key.
   * - Keeping this object stable avoids unnecessary query argument churn when only drawer state changes.
   * - The computation depends only on active filters, academic year, and pagination.
   */
  const queryArgs = useMemo(
    () => buildQueryArgs(filters, currentYear?.id, page, rowsPerPage),
    [filters, currentYear?.id, page, rowsPerPage]
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAcademicAuditEventsQuery(queryArgs);

  /**
   * Memoization Justification:
   * - CustomizableTable recalculates table state when the columns array identity changes.
   * - This keeps column definitions stable across data fetches and drawer open/close renders.
   * - Only the row detail setter is captured.
   */
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'summary',
        label: 'Academic Action',
        minWidth: 340,
        filterType: 'string',
        sticky: true,
        stickyPosition: 'left',
        cellSx: { bgcolor: 'background.paper', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.12)' },
        headerSx: {
          bgcolor: 'background.paper',
          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.12)',
        },
        render: (_value, row) => {
          const item = row as AcademicAuditEvent;
          return (
            <Stack spacing={0.35}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {item.summary}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  {item.entityName}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {item.entityType}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        id: 'subModuleDisplayName',
        label: 'Sub Module',
        minWidth: 190,
        filterType: 'string',
        render: (value) => <Chip size="small" variant="soft" color="info" label={value || '-'} />,
      },
      {
        id: 'actionLabel',
        label: 'Action',
        minWidth: 140,
        filterType: 'string',
        render: (_value, row) => {
          const item = row as AcademicAuditEvent;
          return (
            <Label color={actionColor(item.action)} variant="soft">
              {item.actionLabel}
            </Label>
          );
        },
      },
      {
        id: 'actorDisplayName',
        label: 'Performed By',
        minWidth: 180,
        filterType: 'string',
      },
      {
        id: 'occurredAtDisplay',
        label: 'Occurred At',
        minWidth: 170,
        filterType: 'dateTime',
        render: (value, row) => value || (row as AcademicAuditEvent).occurredAt,
      },
      {
        id: 'changedFieldCount',
        label: 'Changes',
        minWidth: 110,
        align: 'center',
        filterType: 'number',
      },
      {
        id: 'source',
        label: 'Source',
        minWidth: 160,
        filterType: 'string',
        render: (value) => ACADEMIC_AUDIT_SOURCE_LABELS[String(value)] ?? value ?? '-',
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 96,
        align: 'center',
        isFilter: false,
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        excludeFromExport: true,
        render: (_value, row) => (
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => setSelectedEvent(row as AcademicAuditEvent)}>
              <Iconify icon="mdi:eye-outline" width={18} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

  /**
   * Memoization Justification:
   * - Passed to AcademicAuditFilter, which debounces search changes with this callback.
   * - Stable identity prevents the debounce timer from restarting on unrelated table/drawer renders.
   * - The handler only depends on state setters, which are stable.
   */
  const handleFilterChange = useCallback(
    <K extends keyof AcademicAuditFilters>(key: K, value: AcademicAuditFilters[K]) => {
      setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
      setPage(0);
    },
    []
  );

  /**
   * Memoization Justification:
   * - Passed to AcademicAuditFilter beside the debounced search handler.
   * - Stable identity avoids child-side debounce churn during unrelated screen updates.
   * - The handler only resets local screen state.
   */
  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Academic Audits"
        description="Unified audit trail for calendar, curriculum, timetable, and examination actions."
        links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Academic Audits' }]}
      />

      <AcademicAuditFilter
        filters={filters}
        isFiltered={isFiltered(filters)}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {isError && (
        <Alert
          severity="error"
          action={
            <IconButton size="small" color="inherit" onClick={() => refetch()}>
              <Iconify icon="mdi:refresh" width={18} />
            </IconButton>
          }
        >
          Unable to load academic audit events.
        </Alert>
      )}

      <CustomizableTable
        tableId="academic-audit-trail"
        tableTitle="Academic Audits"
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading || isFetching}
        isSearch={false}
        isFilter={false}
        isPagination
        serverSidePagination
        defaultRowsPerPage={10}
        maxServerRowsPerPage={100}
        handleRowClick={(row) => setSelectedEvent(row as AcademicAuditEvent)}
        onServerPagination={(nextPage, nextRowsPerPage) => {
          setPage(Math.max(nextPage - 1, 0));
          setRowsPerPage(nextRowsPerPage);
        }}
        noDataText={
          <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
            <Iconify icon="mdi:history" width={42} sx={{ color: 'text.disabled' }} />
            <Typography variant="subtitle2" color="text.secondary">
              No academic audit history found
            </Typography>
          </Stack>
        }
      />

      <AcademicAuditDetailsDrawer
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </Box>
  );
};

export default AcademicAuditTrail;
