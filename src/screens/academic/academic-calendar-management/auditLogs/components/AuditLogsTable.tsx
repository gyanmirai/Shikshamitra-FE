'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Avatar, Tooltip, IconButton, Typography } from '@mui/material';

import AuditDiffViewer from './AuditDiffViewer';
import AuditActionBadge from './badges/AuditActionBadge';
import { AuditImpactLevel } from '../types/auditLogs.types';
import { IMPACT_LABELS, IMPACT_COLOR_KEYS } from '../constants/auditLogs.constants';
import { getUserInitials, summarizeImpact, formatAuditTimestamp } from '../utils/auditFormatters';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
  loading?: boolean;
  totalCount?: number;
  /** Current page (zero-indexed) — kept by parent for server-side pagination. */
  page: number;
  /** Rows per page — kept by parent for server-side pagination. */
  rowsPerPage: number;
  onPageChange: (page: number, rowsPerPage: number) => void;
  onRowClick?: (log: AuditLog) => void;
  hasActiveFilters?: boolean;
}

/** Enhanced audit logs table with entity, user, impact columns. */
const AuditLogsTable = ({
  logs,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowClick,
  hasActiveFilters,
}: Props) => {
  const theme = useTheme();

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'timestamp',
        label: 'Timestamp',
        align: 'left',
        minWidth: 150,
        render: (_v, row: any) => {
          const ts = formatAuditTimestamp(row.timestamp);
          return (
            <Tooltip title={ts.full} arrow>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {ts.date}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ts.short}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        minWidth: 180,
        render: (_v, row: any) => <AuditActionBadge action={row.action} />,
      },
      {
        id: 'entityName',
        label: 'Entity',
        align: 'left',
        minWidth: 200,
        render: (_v, row: any) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
              {row.entityName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.entityType}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'changedByName',
        label: 'Changed By',
        align: 'left',
        minWidth: 180,
        render: (_v, row: any) => (
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
            >
              {getUserInitials(row.changedByName)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {row.changedByName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.changedByRole}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'reason',
        label: 'Reason',
        align: 'left',
        minWidth: 200,
        render: (_v, row: any) =>
          row.reason ? (
            <Tooltip title={row.reason} arrow>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {row.reason}
              </Typography>
            </Tooltip>
          ) : (
            <Label variant="soft" color="warning" sx={{ fontSize: 10, height: 18 }}>
              No reason
            </Label>
          ),
      },
      {
        id: 'impact',
        label: 'Impact',
        align: 'left',
        minWidth: 160,
        render: (_v, row: any) => {
          const level = (row.impactLevel ?? AuditImpactLevel.None) as AuditImpactLevel;
          const summary = summarizeImpact(row.impact);
          return (
            <Tooltip title={summary} arrow>
              <Box>
                <Label
                  variant="soft"
                  color={IMPACT_COLOR_KEYS[level] as any}
                  sx={{ fontWeight: 600, fontSize: 10, mb: 0.25 }}
                >
                  {IMPACT_LABELS[level]}
                </Label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  display="block"
                  sx={{ maxWidth: 140 }}
                >
                  {summary}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
      },
      {
        id: 'changes',
        label: 'Changes',
        align: 'left',
        minWidth: 110,
        isSort: false,
        isFilter: false,
        render: (_v, row: any) => {
          if (!row.hasDiff) {
            return (
              <Label variant="soft" color="default" sx={{ fontSize: 10, height: 20 }}>
                No Diff
              </Label>
            );
          }
          return (
            <Label
              variant="filled"
              color="info"
              startIcon={<Iconify icon="mdi:compare-horizontal" width={12} />}
              sx={{ cursor: 'pointer', fontSize: 10, height: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(row);
              }}
            >
              View Diff
            </Label>
          );
        },
        children: (row: any) => (
          <Box sx={{ p: 2, width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <AuditDiffViewer diff={row.diff} variant="full" />
          </Box>
        ),
      },
      {
        id: 'actions',
        label: '',
        align: 'right',
        minWidth: 60,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_v, row: any) => (
          <Tooltip title="Open Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(row);
              }}
            >
              <Iconify icon="mdi:chevron-right" width={18} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [theme, onRowClick]
  );

  return (
    <CustomizableTable
      tableTitle="Calendar Audit Logs"
      tableId="calendar-audit-logs-intelligence"
      isLoading={loading}
      isPagination
      serverSidePagination
      totalCount={totalCount}
      // Server pagination callbacks use one-based pages; the controlled page stays zero-based.
      onServerPagination={(p, r) => onPageChange(p - 1, r)}
      isSearch={false}
      isFilter={false}
      isShowedDense={false}
      columns={columns}
      data={logs}
      handleRowClick={(row) => onRowClick?.(row as unknown as AuditLog)}
      noDataText={
        <Box width="100%" display="flex" flexDirection="column">
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters ? 'No logs match your filters' : 'No audit logs found'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {hasActiveFilters
              ? 'Try changing the date range, action, or search keyword.'
              : 'Audit logs will appear here when users create, update, delete, publish, or approve academic calendar records.'}
          </Typography>
        </Box>
      }
      page={page}
      rowsPerPage={rowsPerPage}
    />
  );
};

export default AuditLogsTable;
