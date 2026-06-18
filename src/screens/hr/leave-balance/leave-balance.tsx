'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Table,
  Tooltip,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  LinearProgress,
} from '@mui/material';

import { useLeaveOverview } from '../leave-request/use-leave-overview';
import { getLeaveStatusColor, getLeaveStatusLabel } from '../leave-request/leave-status.utils';
import { formatLeaveDays, type LeaveBucketBreakdown } from '../leave-request/leave-overview.utils';

// -----------------------------------------------------------------------

const getUsagePct = (row: LeaveBucketBreakdown) =>
  !row.isUnlimited && row.total > 0 ? Math.min(100, Math.round((row.used / row.total) * 100)) : 0;

const LeaveMetric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', fontWeight: 700, lineHeight: 1.1 }}
    >
      {label}
    </Typography>
    <Typography component="div" variant="body2" sx={{ mt: 0.25, fontWeight: 800 }}>
      {value}
    </Typography>
  </Box>
);

const LeaveSectionHeader = ({
  icon,
  title,
  meta,
}: {
  icon: string;
  title: string;
  meta?: React.ReactNode;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={1}
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    justifyContent="space-between"
  >
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Iconify icon={icon} sx={{ color: 'primary.main', width: 19, height: 19 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
    </Stack>
    {meta}
  </Stack>
);

const LeaveBalanceLedger = ({
  rows,
  isLoading,
}: {
  rows: LeaveBucketBreakdown[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          p: 1.25,
        }}
      >
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rounded" height={42} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {rows.length === 0 ? (
          <Stack spacing={0.75} alignItems="center" sx={{ px: 1.25, py: 4, textAlign: 'center' }}>
            <Iconify
              icon="solar:calendar-minimalistic-bold-duotone"
              sx={{ width: 34, height: 34, color: 'text.disabled' }}
            />
            <Typography color="text.secondary">No leave allocation found for this year.</Typography>
          </Stack>
        ) : (
          rows.map((row, index) => {
            const usagePct = getUsagePct(row);
            const isLowBalance = !row.isUnlimited && row.remaining <= 2 && row.total > 0;
            const rowKey = row.bucketId || row.bucketName;

            return (
              <Box
                key={rowKey}
                sx={{
                  p: 1.25,
                  borderTop: index === 0 ? 0 : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: row.isUnlimited
                        ? 'info.main'
                        : isLowBalance
                          ? 'error.main'
                          : 'primary.main',
                      bgcolor: row.isUnlimited
                        ? 'info.lighter'
                        : isLowBalance
                          ? 'error.lighter'
                          : 'primary.lighter',
                    }}
                  >
                    <Iconify icon="solar:calendar-mark-bold-duotone" width={18} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                      {row.bucketName}
                    </Typography>
                    {row.isUnlimited && (
                      <Typography variant="caption" color="text.secondary">
                        negative balance allowed
                      </Typography>
                    )}
                  </Box>
                  {row.isUnlimited ? (
                    <Chip size="small" color="info" variant="soft" label="Unlimited" />
                  ) : (
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {formatLeaveDays(row.remaining)}
                    </Typography>
                  )}
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <LeaveMetric
                    label="Accrued"
                    value={row.isUnlimited ? '-' : formatLeaveDays(row.total)}
                  />
                  <LeaveMetric label="Used" value={formatLeaveDays(row.used)} />
                  <LeaveMetric label="Pending" value={formatLeaveDays(row.pendingDays)} />
                </Box>

                <Box sx={{ mt: 1 }}>
                  {row.isUnlimited ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      No limit
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700 }}
                        >
                          Utilization
                        </Typography>
                        <Typography
                          variant="caption"
                          color={isLowBalance ? 'error.main' : 'text.secondary'}
                          sx={{ fontWeight: 800 }}
                        >
                          {isLowBalance ? `Low - ${usagePct}%` : `${usagePct}%`}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={usagePct}
                        color={usagePct >= 80 ? 'error' : usagePct >= 50 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 999, bgcolor: 'background.neutral' }}
                      />
                    </Stack>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <TableContainer
        sx={{
          display: { xs: 'none', sm: 'block' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          overflowX: 'auto',
        }}
      >
        <Table size="small" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: 'background.neutral',
                '& th': {
                  py: 1,
                  color: 'text.secondary',
                  fontSize: 12,
                  fontWeight: 800,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
              }}
            >
              <TableCell>Paid type</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell align="right">Accrued</TableCell>
              <TableCell align="right">Used</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell sx={{ width: 180 }}>Utilization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 4, borderBottom: 0 }}>
                  <Stack spacing={0.75} alignItems="center" sx={{ textAlign: 'center' }}>
                    <Iconify
                      icon="solar:calendar-minimalistic-bold-duotone"
                      sx={{ width: 34, height: 34, color: 'text.disabled' }}
                    />
                    <Typography color="text.secondary">
                      No leave allocation found for this year.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const usagePct = getUsagePct(row);
                const isLowBalance = !row.isUnlimited && row.remaining <= 2 && row.total > 0;
                const rowKey = row.bucketId || row.bucketName;

                return (
                  <TableRow
                    key={rowKey}
                    hover
                    sx={{
                      '& td': {
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                      '&:last-of-type td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: row.isUnlimited
                              ? 'info.main'
                              : isLowBalance
                                ? 'error.main'
                                : 'primary.main',
                            bgcolor: row.isUnlimited
                              ? 'info.lighter'
                              : isLowBalance
                                ? 'error.lighter'
                                : 'primary.lighter',
                          }}
                        >
                          <Iconify icon="solar:calendar-mark-bold-duotone" width={17} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            title={row.bucketName}
                            sx={{
                              fontWeight: 800,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.bucketName}
                          </Typography>
                          {row.isUnlimited && (
                            <Typography variant="caption" color="text.secondary">
                              negative balance allowed
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {row.isUnlimited ? (
                        <Chip size="small" color="info" variant="soft" label="Unlimited" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {formatLeaveDays(row.remaining)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {row.isUnlimited ? '-' : formatLeaveDays(row.total)}
                    </TableCell>
                    <TableCell align="right">{formatLeaveDays(row.used)}</TableCell>
                    <TableCell align="right">{formatLeaveDays(row.pendingDays)}</TableCell>
                    <TableCell>
                      {row.isUnlimited ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700 }}
                        >
                          No limit
                        </Typography>
                      ) : (
                        <Stack spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              {usagePct}%
                            </Typography>
                            {isLowBalance && (
                              <Typography
                                variant="caption"
                                color="error.main"
                                sx={{ fontWeight: 800 }}
                              >
                                Low
                              </Typography>
                            )}
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={usagePct}
                            color={
                              usagePct >= 80 ? 'error' : usagePct >= 50 ? 'warning' : 'success'
                            }
                            sx={{ height: 6, borderRadius: 999, bgcolor: 'background.neutral' }}
                          />
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

type LeaveBalanceProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
  showSelfAccessError?: boolean;
  /** Allows compact embeds to hide the detailed paid/unpaid bucket ledger when needed. */
  showBalanceLedger?: boolean;
  overviewState?: ReturnType<typeof useLeaveOverview>;
  /** When provided, displays leave data for this specific employee instead of the logged-in user. */
  employeeId?: string;
};

const LeaveBalance = ({
  mode = 'hr',
  showBreadcrumbs = true,
  showSelfAccessError = true,
  showBalanceLedger = true,
  overviewState,
  employeeId,
}: LeaveBalanceProps) => {
  const isSelfMode = mode === 'self';
  const isEmployeeProfileMode = Boolean(employeeId);
  const internalOverviewState = useLeaveOverview({
    mode,
    employeeId,
    enabled: !overviewState,
  });
  const leaveOverviewState = overviewState ?? internalOverviewState;
  const { historyData, overview, isLoadingBalance, isLoadingHistory, selfAccessError } =
    leaveOverviewState;

  const breakdownRows = useMemo(() => overview.bucketBreakdown, [overview.bucketBreakdown]);

  const historyColumns: IColumn[] = useMemo(
    () => [
      {
        id: 'paidType',
        label: 'Paid Type',
        align: 'left',
        minWidth: '140px',
        sticky: true,
      },
      {
        id: 'appliedDate',
        label: 'Applied Date',
        align: 'left',
        minWidth: '120px',
        filterType: 'date',
        isDateFilter: true,
        sticky: true,
      },
      {
        id: 'startDate',
        label: 'Start Date',
        align: 'left',
        minWidth: '110px',
        filterType: 'date',
        isDateFilter: true,
      },
      {
        id: 'endDate',
        label: 'End Date',
        align: 'left',
        minWidth: '110px',
        filterType: 'date',
        isDateFilter: true,
      },
      {
        id: 'totalDays',
        label: 'Days',
        align: 'center',
        filterType: 'number',
        minWidth: '70px',
      },
      {
        id: 'reason',
        label: 'Reason',
        align: 'left',
        minWidth: '180px',
        render(value) {
          return (
            <Tooltip title={value || ''} arrow placement="top">
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value || '-'}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        filterType: 'enum',
        enumOptions: EmployeeLeaveStatusOptions,
        sticky: true,
        minWidth: '110px',
        render(value) {
          return <Label color={getLeaveStatusColor(value)}>{getLeaveStatusLabel(value)}</Label>;
        },
      },
    ],
    []
  );

  const historyRows = useMemo(
    () =>
      (historyData?.items ?? []).map((item: any) => ({
        id: item.id,
        appliedDate: item.appliedDate ? dayjs(item.appliedDate).format('DD-MM-YYYY') : '-',
        paidType: item.paidType ?? item.leaveType ?? '-',
        startDate: item.startDate ? dayjs(item.startDate).format('DD-MM-YYYY') : '-',
        endDate: item.endDate ? dayjs(item.endDate).format('DD-MM-YYYY') : '-',
        totalDays: item.totalDays ?? '-',
        reason: item.reason ?? item.description ?? '-',
        status: item.status,
      })),
    [historyData]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {showBreadcrumbs && (
        <CustomBreadcrumbs
          heading={isSelfMode ? 'My Leave Balance' : 'Leave Balance'}
          links={
            isSelfMode
              ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave Balance' }]
              : [
                  { name: 'HR/Staff', href: '/hr/dashboard/' },
                  { name: 'Leave Management', href: '/hr/leave-center/' },
                  { name: 'Leave Balance' },
                ]
          }
          description="Leave quota, breakdown by paid type, and request history."
        />
      )}

      {showSelfAccessError && selfAccessError && (
        <Box
          sx={{
            p: 1.25,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
          }}
        >
          <Alert severity="warning">
            Your user is not linked to an employee profile. Contact admin/HR.
          </Alert>
        </Box>
      )}

      {!selfAccessError && (
        <>
          {showBalanceLedger && (
            <Stack spacing={1}>
              <LeaveSectionHeader
                icon="solar:pie-chart-2-bold-duotone"
                title="Leave Balance"
                meta={
                  <Chip
                    size="small"
                    variant="soft"
                    color="primary"
                    label={`${breakdownRows.length} bucket${breakdownRows.length === 1 ? '' : 's'}`}
                    sx={{ fontWeight: 800 }}
                  />
                }
              />
              <LeaveBalanceLedger rows={breakdownRows} isLoading={isLoadingBalance} />
            </Stack>
          )}

          <Stack spacing={1}>
            <LeaveSectionHeader
              icon="solar:history-bold-duotone"
              title={isEmployeeProfileMode ? 'Employee Leave History' : 'My Leave History'}
              meta={
                <Chip
                  size="small"
                  variant="soft"
                  color="info"
                  label={`${historyRows.length} shown`}
                  sx={{ fontWeight: 800 }}
                />
              }
            />

            <CustomizableTable
              tableId="leave-balance-history"
              columns={historyColumns}
              data={historyRows}
              isLoading={isLoadingHistory}
              tableTitle="Leave History"
              noDataText={
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Iconify
                    icon="solar:document-bold-duotone"
                    sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1 }}
                  />
                  <Typography color="text.secondary">
                    No leave history found for this academic year.
                  </Typography>
                </Box>
              }
            />
            {historyData &&
              typeof historyData.totalCount === 'number' &&
              historyData.totalCount > (historyData.items?.length ?? 0) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', px: 0.5 }}
                >
                  Showing {historyData.items?.length ?? 0} of {historyData.totalCount} leave
                  requests for this academic year (max {100} per page).
                </Typography>
              )}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default LeaveBalance;
