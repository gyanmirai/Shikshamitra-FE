'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import { Box, Chip, Alert, Stack, Tooltip, Typography } from '@mui/material';
import { useGetLeaveRequestsQuery, useGetMyLeaveRequestsQuery } from 'src/redux/hr/leaveApi';

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
    <Stack direction="row" alignItems="center" gap={1}>
      <Iconify icon={icon} sx={{ color: 'primary.main', width: 19, height: 19 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
    </Stack>
    {meta}
  </Stack>
);

export const LeaveBalanceLedger = ({
  rows,
  isLoading,
}: {
  rows: LeaveBucketBreakdown[];
  isLoading: boolean;
}) => (
  <CustomizableTable
    tableId="hr-leave-bucket-ledger"
    tableTitle="Leave balances"
    variant="embedded"
    showColumns
    showExport
    showFullScreen
    exportScope="all"
    isSearch={false}
    isFilter={false}
    isPagination={false}
    isLoading={isLoading}
    data={rows.map((row) => ({
      ...row,
      id: row.bucketId || row.bucketName,
      usage: getUsagePct(row),
    }))}
    columns={[
      { id: 'bucketName', label: 'Paid type', minWidth: 160, sticky: true },
      {
        filterType: 'number',
        id: 'remaining',
        label: 'Available',
        filterValue: (value, row) => (row.isUnlimited ? null : value),
        valueType: 'number',
        align: 'right',
        exportValue: (value, row) => (row.isUnlimited ? 'Unlimited' : Number(value)),
        render: (value, row) =>
          row.isUnlimited ? (
            <Chip size="small" variant="soft" label="Unlimited" />
          ) : (
            formatLeaveDays(value)
          ),
      },
      {
        filterType: 'number',
        id: 'total',
        label: 'Accrued',
        valueType: 'number',
        align: 'right',
        render: (value) => formatLeaveDays(value),
      },
      {
        filterType: 'number',
        id: 'used',
        label: 'Used',
        valueType: 'number',
        align: 'right',
        render: (value) => formatLeaveDays(value),
      },
      {
        filterType: 'number',
        id: 'pending',
        label: 'Pending',
        valueType: 'number',
        align: 'right',
        render: (value) => formatLeaveDays(value),
      },
      {
        id: 'usage',
        label: 'Utilization',
        align: 'right',
        exportValue: (value, row) => (row.isUnlimited ? 'Unlimited' : `${String(value)}%`),
        render: (value, row) => (row.isUnlimited ? '-' : `${String(value)}%`),
      },
    ]}
    noDataText="No leave allocation found for this year."
  />
);

type LeaveBalanceProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
  showSelfAccessError?: boolean;
  showBalanceLedger?: boolean;
  overviewState?: ReturnType<typeof useLeaveOverview>;
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
  const { overview, isLoadingBalance, selfAccessError } = leaveOverviewState;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const actor = useSelector((state: RootState) => state.auth.employee);
  const scopedEmployeeId = employeeId || actor?.id;
  const [historyPage, setHistoryPage] = useState({ page: 1, pageSize: 20, search: '' });
  useEffect(() => {
    setHistoryPage((current) => ({ ...current, page: 1 }));
  }, [currentYear?.id, scopedEmployeeId, mode]);
  const historyQuery = {
    academicYearId: currentYear?.id,
    employeeId: scopedEmployeeId,
    ...historyPage,
  };
  const hrHistory = useGetLeaveRequestsQuery(historyQuery, {
    skip: isSelfMode || !currentYear?.id || !scopedEmployeeId,
  });
  const selfHistory = useGetMyLeaveRequestsQuery(historyQuery, {
    skip: !isSelfMode || !currentYear?.id,
  });
  const historyResult = isSelfMode ? selfHistory : hrHistory;
  const historyData = historyResult.currentData;
  const isLoadingHistory = historyResult.isFetching;
  const exportHistory = useHrTableExport(
    isSelfMode ? 'hr-self-leave-history' : 'hr-leave-requests',
    historyQuery
  );

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
        stickyPosition: 'right' as const,
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
              title={isEmployeeProfileMode ? 'Staff Leave History' : 'My Leave History'}
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
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              tableId="leave-balance-history"
              variant="embedded"
              onExport={exportHistory}
              error={historyResult.error}
              onRetry={historyResult.refetch}
              serverSidePagination
              serverSideSearch
              page={historyPage.page - 1}
              rowsPerPage={historyPage.pageSize}
              totalCount={historyData?.totalCount || 0}
              onServerPagination={(page, pageSize) =>
                setHistoryPage((current) => ({ ...current, page, pageSize }))
              }
              onServerSearch={(search) =>
                setHistoryPage((current) => ({ ...current, page: 1, search }))
              }
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
          </Stack>
        </>
      )}
    </Box>
  );
};

export default LeaveBalance;
