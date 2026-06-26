'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAuditLogsQuery } from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import { CalendarAuditAction, CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Select,
  Avatar,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOGS = {
  items: [
    {
      id: 'a1',
      changedAt: '2025-06-10T09:14:00Z',
      action: CalendarAuditAction.CalendarCreated,
      changedByUserId: 'usr-admin-001',
      changedByName: 'Rajesh Sharma',
      reason: 'New academic year calendar initialization',
      oldValueJson: null,
      newValueJson: JSON.stringify({
        name: 'Academic Year 2025–26',
        startDate: '2025-06-01',
        endDate: '2026-03-31',
      }),
    },
    {
      id: 'a2',
      changedAt: '2025-06-12T11:32:00Z',
      action: CalendarAuditAction.DayAdded,
      changedByUserId: 'usr-admin-001',
      changedByName: 'Rajesh Sharma',
      reason: null,
      oldValueJson: null,
      newValueJson: JSON.stringify({ date: '2025-08-15', dayType: 2, title: 'Independence Day' }),
    },
    {
      id: 'a3',
      changedAt: '2025-06-15T14:05:00Z',
      action: CalendarAuditAction.CalendarPublished,
      changedByUserId: 'usr-principal-001',
      changedByName: 'Priya Nair',
      reason: 'Calendar reviewed and approved for academic year',
      oldValueJson: JSON.stringify({ status: 1 }),
      newValueJson: JSON.stringify({ status: 2 }),
    },
    {
      id: 'a4',
      changedAt: '2025-07-01T08:45:00Z',
      action: CalendarAuditAction.DayUpdated,
      changedByUserId: 'usr-admin-001',
      changedByName: 'Rajesh Sharma',
      reason: 'Updated holiday category after government notification',
      oldValueJson: JSON.stringify({ holidayCategory: 1 }),
      newValueJson: JSON.stringify({ holidayCategory: 6, title: 'Gandhi Jayanti (State)' }),
    },
    {
      id: 'a5',
      changedAt: '2025-07-20T10:22:00Z',
      action: CalendarAuditAction.EmergencyClosureDeclared,
      changedByUserId: 'usr-principal-001',
      changedByName: 'Priya Nair',
      reason: 'Heavy rainfall and local flooding warning issued by municipality',
      oldValueJson: null,
      newValueJson: JSON.stringify({
        date: '2025-07-20',
        title: 'Emergency Closure — Flooding',
        appliesToAll: true,
      }),
    },
    {
      id: 'a6',
      changedAt: '2025-07-21T09:10:00Z',
      action: CalendarAuditAction.ImpactResolved,
      changedByUserId: 'usr-teacher-005',
      changedByName: 'Anjali Mehta',
      reason: 'Timetable rescheduled to compensate for missed class',
      oldValueJson: JSON.stringify({ status: 1 }),
      newValueJson: JSON.stringify({
        status: 5,
        resolutionNote: 'Rescheduled to Saturday 26th July',
      }),
    },
  ],
  totalCount: 6,
};

// ─── Action metadata ──────────────────────────────────────────────────────────

const ACTION_META: Record<CalendarAuditAction, { icon: string; color: string }> = {
  [CalendarAuditAction.CalendarCreated]: { icon: 'mdi:calendar-plus', color: '#2e7d32' },
  [CalendarAuditAction.CalendarUpdated]: { icon: 'mdi:calendar-edit', color: '#1565c0' },
  [CalendarAuditAction.CalendarPublished]: { icon: 'mdi:publish', color: '#00838f' },
  [CalendarAuditAction.CalendarArchived]: { icon: 'mdi:archive', color: '#e65100' },
  [CalendarAuditAction.DayAdded]: { icon: 'mdi:calendar-check', color: '#4caf50' },
  [CalendarAuditAction.DayUpdated]: { icon: 'mdi:calendar-edit', color: '#2196f3' },
  [CalendarAuditAction.DayDeleted]: { icon: 'mdi:calendar-remove', color: '#f44336' },
  [CalendarAuditAction.EmergencyClosureDeclared]: { icon: 'mdi:alert-octagon', color: '#b71c1c' },
  [CalendarAuditAction.ImpactResolved]: { icon: 'mdi:check-circle', color: '#2e7d32' },
  [CalendarAuditAction.OverrideApplied]: { icon: 'mdi:shield-check', color: '#6a1b9a' },
};

const ACTION_OPTIONS = [
  { label: 'All Actions', value: '' },
  ...Object.entries(CALENDAR_AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

// ─── JSON Diff Helper ─────────────────────────────────────────────────────────

const formatJson = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

// ─── Main Component ────────────────────────────────────────────────────────────

const CalendarAuditLogs = () => {
  const theme = useTheme();
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data: logsRaw, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAuditLogsQuery,
    params: {
      ...(actionFilter ? { action: Number(actionFilter) } : {}),
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    popupConfig: { error: false },
  });

  const logsData = (logsRaw?.items?.length ?? 0) > 0 ? logsRaw : MOCK_AUDIT_LOGS;
  const logs: any[] = logsData?.items ?? [];
  const total: number = logsData?.totalCount ?? 0;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'changedAt',
        label: 'Timestamp',
        align: 'left',
        minWidth: 160,
        render: (value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {dayjs(row.changedAt).format('DD MMM YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dayjs(row.changedAt).format('HH:mm')}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        minWidth: 200,
        render: (value, row) => {
          const action = row.action as CalendarAuditAction;
          const meta = ACTION_META[action] ?? { icon: 'mdi:history', color: '#9e9e9e' };
          return (
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  backgroundColor: alpha(meta.color, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={meta.icon} width={18} sx={{ color: meta.color }} />
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: meta.color }}>
                {CALENDAR_AUDIT_ACTION_LABELS[action] ?? '—'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'changedByName',
        label: 'Changed By',
        align: 'left',
        minWidth: 220,
        render: (value, row) => (
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              {(row.changedByName ?? row.changedByUserId ?? 'U').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              {row.changedByName && (
                <Typography variant="body2" fontWeight={500}>
                  {row.changedByName}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {row.changedByUserId?.slice(0, 10)}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'reason',
        label: 'Reason',
        align: 'left',
        minWidth: 260,
        render: (value, row) =>
          row.reason ? (
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
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        id: 'changes',
        label: 'Changes',
        align: 'right',
        minWidth: 120,
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          const hasChanges = row.oldValueJson || row.newValueJson;
          if (!hasChanges) {
            return (
              <Label variant="soft" color="default" sx={{ fontSize: '11px', height: 20 }}>
                No Diff
              </Label>
            );
          }
          return (
            <Label variant="soft" color="info" sx={{ fontSize: '11px', height: 20 }}>
              Has Diff
            </Label>
          );
        },
        children: (row) => {
          const hasChanges = row.oldValueJson || row.newValueJson;
          if (!hasChanges) {
            return (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                  No changes details recorded for this action.
                </Typography>
              </Box>
            );
          }
          return (
            <Box
              sx={{
                p: 2.5,
                backgroundColor: alpha(theme.palette.grey[500], 0.02),
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Grid container spacing={2.5}>
                {row.oldValueJson && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.error.main,
                        }}
                      />
                      <Typography variant="caption" fontWeight={700} color="error.main">
                        Before
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: 140,
                        overflowY: 'auto',
                        color: 'error.dark',
                      }}
                    >
                      {formatJson(row.oldValueJson)}
                    </Box>
                  </Grid>
                )}
                {row.newValueJson && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.success.main,
                        }}
                      />
                      <Typography variant="caption" fontWeight={700} color="success.main">
                        After
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: 140,
                        overflowY: 'auto',
                        color: 'success.dark',
                      }}
                    >
                      {formatJson(row.newValueJson)}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        },
      },
    ],
    [theme]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <CustomBreadcrumbs
        heading="Audit Logs"
        description="Track every change made to the academic calendar — who changed what and when."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Audit Logs' },
        ]}
      />

      {/* Filters */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.customShadows?.card || '0px 2px 12px rgba(0, 0, 0, 0.03)',
          backgroundColor: 'background.paper',
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Filter by Action</InputLabel>
              <Select
                label="Filter by Action"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(0);
                }}
              >
                {ACTION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.value && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            ACTION_META[Number(opt.value) as CalendarAuditAction]?.color ??
                            '#9e9e9e',
                          display: 'inline-block',
                          mr: 1,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1.5}>
              {actionFilter && (
                <Label
                  variant="soft"
                  color="error"
                  onClick={() => setActionFilter('')}
                  sx={{ cursor: 'pointer' }}
                  endIcon={<Iconify icon="mdi:close" width={12} />}
                >
                  Clear Filters
                </Label>
              )}
              <Label
                variant="outlined"
                color="default"
                startIcon={<Iconify icon="mdi:history" width={14} />}
                sx={{ py: 1.5, px: 1.5 }}
              >
                {`${total} total entries`}
              </Label>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <CustomizableTable
        tableId="calendar-audit-logs"
        isLoading={isLoading}
        isPagination
        serverSidePagination
        totalCount={total}
        onServerPagination={(p, r) => {
          setPage(p - 1);
          setRowsPerPage(r);
        }}
        isSearch={false}
        isFilter={false}
        isShowedDense={false}
        columns={columns}
        data={logs}
        noDataText={
          <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:history" width={32} color="text.disabled" />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              No audit logs found
            </Typography>
          </Stack>
        }
      />
    </Box>
  );
};

export default CalendarAuditLogs;
