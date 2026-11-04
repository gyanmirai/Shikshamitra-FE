'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import { Box, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { auditTableColumns } from './auditTableColumns';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
  loading?: boolean;
  refreshing?: boolean;
  error?: unknown;
  onRetry?: () => void;
  totalCount?: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number, rowsPerPage: number) => void;
  onRowClick?: (log: AuditLog) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  action?: string;
  onActionChange?: (action: string) => void;
}

export default function AuditLogsTable({
  logs,
  loading,
  refreshing,
  error,
  onRetry,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowClick,
  hasActiveFilters,
  onResetFilters,
  action = '',
  onActionChange,
}: Props) {
  const filters: IParams['filters'] = action
    ? [{ column: 'action', type: 'equals', value: action, valueType: 'enum', label: 'Action' }]
    : [];
  return (
    <CustomizableTable
      tableTitle="Calendar Audit Logs"
      tableId="calendar-audit-logs-intelligence"
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      isPagination
      serverSidePagination
      totalCount={totalCount}
      onServerPagination={(next, size) => onPageChange(next - 1, size)}
      isSearch={false}
      showColumns
      showFullScreen
      showExport={false}
      isShowedDense
      serverSideFilter={Boolean(onActionChange)}
      filters={filters}
      onServerFilter={
        onActionChange
          ? (next) =>
              onActionChange(String(next.find((item) => item.column === 'action')?.value ?? ''))
          : undefined
      }
      columns={auditTableColumns(onRowClick)}
      data={logs}
      getRowAction={
        onRowClick
          ? (row) => ({
              label: `View details for ${row.entityName || row.actionLabel}`,
              onClick: () => onRowClick(row as AuditLog),
            })
          : undefined
      }
      wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      page={page}
      rowsPerPage={rowsPerPage}
      paginationDisabled={loading}
      rowsPerPageOptions={[10, 20, 25, 50, 100]}
      maxServerRowsPerPage={100}
      noDataText={
        <Box
          component="span"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
        >
          <Typography component="span" variant="body2" color="text.secondary">
            {hasActiveFilters
              ? 'No logs on this page match your filters.'
              : 'No audit logs recorded yet.'}
          </Typography>
          <Typography component="span" variant="caption" color="text.secondary">
            {hasActiveFilters
              ? 'Clear filters or check another page. Action filters apply to the full history.'
              : 'Calendar activity will appear here after records change.'}
          </Typography>
          {hasActiveFilters && onResetFilters && (
            <Button size="small" variant="outlined" color="inherit" onClick={onResetFilters}>
              Clear filters
            </Button>
          )}
        </Box>
      }
    />
  );
}
