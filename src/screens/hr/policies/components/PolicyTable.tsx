'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { PayrollPolicy, AttendancePolicy } from 'src/redux/hr/hr-policy-api';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { Card, Chip, Alert, Stack, Button, MenuItem, MenuList } from '@mui/material';
import {
  useGetPayrollPoliciesQuery,
  useGetAttendancePoliciesQuery,
} from 'src/redux/hr/hr-policy-api';

import { InfoTooltipIcon } from './HRPolicySharedUI';
import { formatDate, getErrorMessage } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- Types --------------------------------------------------------------------

type PolicyType = 'payroll' | 'attendance';

// --- ArchiveToggle -------------------------------------------------------------

function ArchiveToggle({
  current,
  archivedCount,
  onCurrent,
  onArchived,
}: {
  current: boolean;
  archivedCount: number;
  onCurrent: () => void;
  onArchived: () => void;
}) {
  return (
    <Stack direction="row" spacing={1}>
      <Button size="small" variant={current ? 'contained' : 'outlined'} onClick={onCurrent}>
        Current
      </Button>
      <Button size="small" variant={!current ? 'contained' : 'outlined'} onClick={onArchived}>
        Archived ({archivedCount})
      </Button>
    </Stack>
  );
}

// --- PolicyTable --------------------------------------------------------------

export function PolicyTable({ type, ctx }: { type: PolicyType; ctx: HRPolicyWorkspaceContext }) {
  const {
    academicYearId,
    calendars,
    activeCalendars,
    policyArchiveView,
    setPolicyArchiveView,
    canCreatePolicy,
    canEditPolicy,
    canArchivePolicy,
    canSetDefaultPolicy,
    canClonePolicy,
    canPreviewImpact,
    canViewAudit,
    clonePayrollState,
    cloneAttendanceState,
    deletePayrollState,
    deleteAttendanceState,
    unarchivePayrollState,
    unarchiveAttendanceState,
    payrollDefaultState,
    attendanceDefaultState,
    openPayrollDrawer,
    openAttendanceDrawer,
    openPolicyAudit,
    openVersionHistory,
    previewPolicyRowImpact,
    archivePolicy,
    unarchivePolicy,
    clonePolicy,
    setDefaultWithImpact,
  } = ctx;

  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 10, search: '' });
  const isCurrent = policyArchiveView[type] === 'current';
  const listArgs = {
    academicYearId,
    maxResultCount: tableQuery.pageSize,
    skipCount: (tableQuery.page - 1) * tableQuery.pageSize,
    search: tableQuery.search || undefined,
    isArchived: !isCurrent,
  };
  const exportTable = useHrTableExport(`hr-policy-${type}`, listArgs);
  const payrollPage = useGetPayrollPoliciesQuery(listArgs, {
    skip: !academicYearId || type !== 'payroll',
  });
  const attendancePage = useGetAttendancePoliciesQuery(listArgs, {
    skip: !academicYearId || type !== 'attendance',
  });
  const payrollArchiveSummary = useGetPayrollPoliciesQuery(
    { academicYearId, maxResultCount: 1, isArchived: true },
    { skip: !academicYearId || type !== 'payroll' }
  );
  const attendanceArchiveSummary = useGetAttendancePoliciesQuery(
    { academicYearId, maxResultCount: 1, isArchived: true },
    { skip: !academicYearId || type !== 'attendance' }
  );
  const pageResult = useHrTableQuery(
    {
      table: `hr-policy-${type}`,
      query: listArgs,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
      skip: !academicYearId,
    },
    type === 'payroll' ? payrollPage : attendancePage
  );
  const archiveSummary =
    type === 'payroll' ? payrollArchiveSummary.data : attendanceArchiveSummary.data;
  const items = (pageResult.currentData?.items || []) as Array<PayrollPolicy | AttendancePolicy>;
  const { error } = pageResult;
  const isLoading = pageResult.isFetching && !pageResult.currentData;
  const archivedCount = archiveSummary?.totalCount || 0;

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 160,
      sticky: true,
      stickyOnMobile: false,
      stickyPosition: 'left',
    },
    {
      id: 'calendar',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>Work Calendar</span>
          <InfoTooltipIcon title="The work calendar this policy is linked to for holiday and weekend calculations." />
        </Stack>
      ),
      minWidth: 160,
    },
    {
      id: 'modeOrThresholds',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>{type === 'payroll' ? 'Day Mode' : 'Thresholds'}</span>
          <InfoTooltipIcon
            title={
              type === 'payroll'
                ? 'Day calculation method and Saturday work policy applied to payroll.'
                : 'Full-day and half-day attendance threshold percentages used for payroll.'
            }
          />
        </Stack>
      ),
      minWidth: 160,
    },
    {
      id: 'integration',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>Integration</span>
          <InfoTooltipIcon title="Determines how attendance data is pulled - per staff or globally." />
        </Stack>
      ),
      minWidth: 140,
      render: () => <Chip size="small" label="Per staff attendance" variant="outlined" />,
    },
    { id: 'version', label: 'Ver.', width: 70 },
    { id: 'updatedAt', label: 'Updated', minWidth: 140 },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      sticky: true,
      stickyOnMobile: false,
      stickyPosition: 'right' as const,
      enumOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      render: (_, row) => {
        const statusValue = String(row.status);
        const color = (
          statusValue === 'active' ? 'success' : statusValue === 'archived' ? 'default' : 'warning'
        ) as LabelColor;

        return (
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Label color={color}>{statusValue}</Label>
            {row.isCurrentDefault ? (
              <Chip size="small" label="Default" color="primary" variant="outlined" />
            ) : null}
          </Stack>
        );
      },
    },
    {
      isSort: false,
      excludeFromExport: true,
      id: 'actions',
      label: 'Actions',
      align: 'right',
      width: 120,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => {
        const item = row.policyItem as PayrollPolicy | AttendancePolicy;
        const isPayroll = type === 'payroll';
        const { isCurrentDefault } = row;
        return (
          <ThreeDotsActions
            viewLabel={`View ${String(row.name || row.id)}`}
            editLabel={`Edit ${String(row.name || row.id)}`}
            deleteLabel={`Delete ${String(row.name || row.id)}`}
            moreLabel={`More actions for ${String(row.name || row.id)}`}
            showViewIcon={canPreviewImpact}
            handleViewClick={() =>
              previewPolicyRowImpact(isPayroll ? 'payroll' : 'attendance', item)
            }
            showEditIcon={canEditPolicy && item.status !== 'archived'}
            handleEditClick={() =>
              isPayroll
                ? openPayrollDrawer(item as PayrollPolicy)
                : openAttendanceDrawer(item as AttendancePolicy)
            }
            actions={({ popover }) => (
              <MenuList>
                {canClonePolicy && (
                  <MenuItem
                    disabled={clonePayrollState.isLoading || cloneAttendanceState.isLoading}
                    onClick={() => {
                      popover.onClose();
                      clonePolicy(isPayroll ? 'payroll' : 'attendance', item);
                    }}
                  >
                    <Iconify icon="mdi:content-copy" />
                    Clone
                  </MenuItem>
                )}
                {canSetDefaultPolicy && (
                  <MenuItem
                    disabled={
                      isCurrentDefault ||
                      item.status !== 'active' ||
                      payrollDefaultState.isLoading ||
                      attendanceDefaultState.isLoading
                    }
                    onClick={() => {
                      popover.onClose();
                      setDefaultWithImpact(isPayroll ? 'payroll' : 'attendance', item);
                    }}
                  >
                    <Iconify icon="mdi:star-check-outline" />
                    {isCurrentDefault ? 'Current Default' : 'Set as Default'}
                  </MenuItem>
                )}
                {canViewAudit && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      openPolicyAudit(isPayroll ? 'payroll' : 'attendance', item);
                    }}
                  >
                    <Iconify icon="mdi:history" />
                    Audit Trail
                  </MenuItem>
                )}
                {canViewAudit && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      openVersionHistory(isPayroll ? 'payroll' : 'attendance', item);
                    }}
                  >
                    <Iconify icon="mdi:timeline-clock-outline" />
                    Version History
                  </MenuItem>
                )}
                {canArchivePolicy && (
                  <MenuItem
                    disabled={
                      deletePayrollState.isLoading ||
                      deleteAttendanceState.isLoading ||
                      unarchivePayrollState.isLoading ||
                      unarchiveAttendanceState.isLoading
                    }
                    onClick={() => {
                      popover.onClose();
                      if (item.status === 'archived') {
                        unarchivePolicy(isPayroll ? 'payroll' : 'attendance', item);
                      } else {
                        archivePolicy(isPayroll ? 'payroll' : 'attendance', item);
                      }
                    }}
                  >
                    <Iconify
                      icon={
                        item.status === 'archived'
                          ? 'mdi:archive-arrow-up-outline'
                          : 'mdi:archive-outline'
                      }
                    />
                    {item.status === 'archived' ? 'Restore' : 'Archive'}
                  </MenuItem>
                )}
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const rows = items.map((item: PayrollPolicy | AttendancePolicy) => ({
    id: item.id,
    policyItem: item,
    name: item.name,
    status: item.status,
    isCurrentDefault: item.isDefault === true,
    calendar: calendars.find((c) => c.id === item.workCalendarPolicyId)?.name || '-',
    modeOrThresholds:
      'dayCalculationType' in item
        ? `${item.dayCalculationType} / ${item.saturdayWorkPolicy}`
        : item.captureMode === 'manual_status'
          ? 'Manual status'
          : `${item.captureMode === 'manual_with_time' ? 'Manual with time' : 'Integrated'} / ${item.fullDayThresholdPercentage}%`,
    integration: 'Per staff attendance',
    version: `v${item.version}`,
    updatedAt: formatDate(item.lastModificationTime || item.lastUpdatedAt || item.creationTime),
  }));

  const noDataMessage =
    policyArchiveView[type] === 'archived'
      ? `No removed ${type} policies.`
      : type === 'attendance'
        ? 'No attendance policy yet. Create one standard policy for the academic year to start.'
        : `No ${type} policies.`;

  return (
    <Stack spacing={1} sx={{ width: 1, minWidth: 0, minHeight: 0, flex: 1 }}>
      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
          <Stack spacing={0.25}>
            <ArchiveToggle
              current={isCurrent}
              archivedCount={archivedCount}
              onCurrent={() => {
                setTableQuery((current) => ({ ...current, page: 1 }));
                setPolicyArchiveView((cur) => ({ ...cur, [type]: 'current' }));
              }}
              onArchived={() => {
                setTableQuery((current) => ({ ...current, page: 1 }));
                setPolicyArchiveView((cur) => ({ ...cur, [type]: 'archived' }));
              }}
            />
          </Stack>
          {isCurrent ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => (type === 'payroll' ? openPayrollDrawer() : openAttendanceDrawer())}
              disabled={!academicYearId || activeCalendars.length === 0 || !canCreatePolicy}
              size="small"
              sx={{ borderRadius: 1, flexShrink: 0 }}
            >
              {type === 'attendance' ? 'New Standard Policy' : 'New Policy'}
            </Button>
          ) : null}
        </Stack>
        {activeCalendars.length === 0 ? (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Create an active work calendar first.
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(error, `Could not load ${type} policies.`)}
          </Alert>
        ) : null}
      </Card>
      <CustomizableTable
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId={`hr-${type}-policies`}
        tableTitle={type === 'payroll' ? 'Payroll policies' : 'Attendance policies'}
        onExport={exportTable}
        columns={columns}
        data={rows}
        error={error}
        onRetry={pageResult.refetch}
        isRefreshing={pageResult.isFetching && Boolean(pageResult.currentData)}
        paginationDisabled={pageResult.isFetching}
        isLoading={isLoading}
        isSearch
        serverSidePagination
        serverSideSearch
        totalCount={pageResult.data?.totalCount || 0}
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        searchTerm={tableQuery.search}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        isFilter={false}
        isPagination
        noDataText={noDataMessage}
        {...pageResult.tableProps}
      />
    </Stack>
  );
}
