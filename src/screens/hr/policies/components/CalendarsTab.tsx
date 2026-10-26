'use client';

import { serverColumnFilters, nameContains } from 'src/screens/hr/utils/server-column-filters';
import type { LabelColor } from 'src/components/label';
import type { WorkCalendarPolicy } from 'src/redux/hr/hr-policy-api';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useGetWorkCalendarPoliciesQuery } from 'src/redux/hr/hr-policy-api';
import { Card, Alert, Stack, Button, MenuItem, MenuList } from '@mui/material';

import { InfoTooltipIcon } from './HRPolicySharedUI';
import {
  formatDate,
  formatRange,
  getErrorMessage,
  getCalendarWeeklyRuleLabel,
} from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- ArchiveToggle -------------------------------------------------------------

function ArchiveToggle({
  current,
  onCurrent,
  onArchived,
  archivedCount,
}: {
  current: boolean;
  onCurrent: () => void;
  onArchived: () => void;
  archivedCount: number;
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

// --- CalendarsTab --------------------------------------------------------------

export function CalendarsTab({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    academicYearId,
    policyArchiveView,
    setPolicyArchiveView,
    canCreatePolicy,
    canEditPolicy,
    canArchivePolicy,
    canClonePolicy,
    canPreviewImpact,
    canViewAudit,
    cloneCalendarState,
    deleteCalendarState,
    unarchiveCalendarState,
    openCalendarDrawer,
    openPolicyAudit,
    openVersionHistory,
    previewPolicyRowImpact,
    archivePolicy,
    unarchivePolicy,
    clonePolicy,
  } = ctx;
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 10, search: '' });
  const isCurrent = policyArchiveView.calendar === 'current';
  const listArgs = {
    academicYearId,
    maxResultCount: tableQuery.pageSize,
    skipCount: (tableQuery.page - 1) * tableQuery.pageSize,
    search: tableQuery.search || undefined,
    isArchived: !isCurrent,
  };
  const exportTable = useHrTableExport('hr-policy-calendar', listArgs);
  const {
    currentData: policyPage,
    isFetching: calendarsLoading,
    error: calendarsError,
    refetch,
  } = useGetWorkCalendarPoliciesQuery(listArgs, { skip: !academicYearId });
  const { data: archivedSummary } = useGetWorkCalendarPoliciesQuery(
    { academicYearId, maxResultCount: 1, isArchived: true },
    { skip: !academicYearId }
  );
  const visibleCalendars = policyPage?.items || [];
  const archivedCalendarCount = archivedSummary?.totalCount || 0;

  const calendarColumns: IColumn[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 160,
      sticky: true,
      stickyOnMobile: false,
      stickyPosition: 'left',
    },
    {
      id: 'effective',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>Effective</span>
          <InfoTooltipIcon title="Date range during which this work calendar is active for payroll and attendance." />
        </Stack>
      ),
      minWidth: 180,
    },
    {
      id: 'weeklyRule',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>Weekly Rule</span>
          <InfoTooltipIcon title="The recurring weekly off pattern applied to staff using this calendar." />
        </Stack>
      ),
      minWidth: 160,
    },
    {
      id: 'holidayCount',
      label: (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>Holidays</span>
          <InfoTooltipIcon title="Total holidays included in this calendar from Central Calendar and manual entries." />
        </Stack>
      ),
      minWidth: 120,
      render: (value) => (
        <Stack spacing={0.25}>
          <span>{value} included</span>
          <span style={{ fontSize: 12, color: 'var(--palette-text-secondary)' }}>
            From Calendar
          </span>
        </Stack>
      ),
    },
    { id: 'version', label: 'Version', width: 80 },
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
        return <Label color={color}>{statusValue}</Label>;
      },
    },
    {
      isSort: false,
      excludeFromExport: true,
      id: 'actions',
      label: 'Actions',
      align: 'right',
      width: 100,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => {
        const item = row.calendarItem as WorkCalendarPolicy;
        return (
          <ThreeDotsActions
            viewLabel={`View ${String(row.name || row.id)}`}
            editLabel={`Edit ${String(row.name || row.id)}`}
            deleteLabel={`Delete ${String(row.name || row.id)}`}
            moreLabel={`More actions for ${String(row.name || row.id)}`}
            showViewIcon={canPreviewImpact}
            handleViewClick={() => previewPolicyRowImpact('work_calendar', item)}
            showEditIcon={canEditPolicy && item.status !== 'archived'}
            handleEditClick={() => openCalendarDrawer(item)}
            placement="right-center"
            actions={({ popover }) => (
              <MenuList>
                {canClonePolicy && (
                  <MenuItem
                    disabled={cloneCalendarState.isLoading}
                    onClick={() => {
                      popover.onClose();
                      clonePolicy('calendar', item);
                    }}
                  >
                    <Iconify icon="mdi:content-copy" />
                    Clone
                  </MenuItem>
                )}
                {canViewAudit && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      openPolicyAudit('work_calendar', item);
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
                      openVersionHistory('work_calendar', item);
                    }}
                  >
                    <Iconify icon="mdi:timeline-clock-outline" />
                    Version History
                  </MenuItem>
                )}
                {canArchivePolicy && (
                  <MenuItem
                    disabled={deleteCalendarState.isLoading || unarchiveCalendarState.isLoading}
                    onClick={() => {
                      popover.onClose();
                      if (item.status === 'archived') {
                        unarchivePolicy('calendar', item);
                      } else {
                        archivePolicy('calendar', item);
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

  const calendarRows = visibleCalendars.map((item: WorkCalendarPolicy) => ({
    id: item.id,
    calendarItem: item,
    name: item.name,
    status: item.status,
    effective: formatRange(item.effectiveFrom, item.effectiveTo),
    weeklyRule: getCalendarWeeklyRuleLabel(item),
    holidayCount: item.holidaySummary?.includedCount ?? 0,
    version: item.version,
    updatedAt: formatDate(item.lastModificationTime || item.lastUpdatedAt || item.creationTime),
  }));

  return (
    <Stack spacing={1} sx={{ width: 1, minWidth: 0, minHeight: 0, flex: 1 }}>
      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={1}>
            <ArchiveToggle
              current={isCurrent}
              archivedCount={archivedCalendarCount}
              onCurrent={() => {
                setTableQuery((current) => ({ ...current, page: 1 }));
                setPolicyArchiveView((current) => ({ ...current, calendar: 'current' }));
              }}
              onArchived={() => {
                setTableQuery((current) => ({ ...current, page: 1 }));
                setPolicyArchiveView((current) => ({ ...current, calendar: 'archived' }));
              }}
            />
          </Stack>
          {isCurrent ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => openCalendarDrawer()}
              disabled={!academicYearId || !canCreatePolicy}
              size="small"
              sx={{ borderRadius: 1, flexShrink: 0 }}
            >
              New Calendar
            </Button>
          ) : null}
        </Stack>
        {calendarsError ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(calendarsError, 'Could not load work calendars.')}
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
        tableId="hr-work-calendars"
        tableTitle="Work calendars"
        onExport={exportTable}
        {...serverColumnFilters(calendarColumns, [nameContains('name')], tableQuery, ({ search }) =>
          setTableQuery((current) => ({ ...current, page: 1, search: String(search ?? '') }))
        )}
        data={calendarRows}
        error={calendarsError}
        onRetry={refetch}
        isRefreshing={calendarsLoading && Boolean(policyPage)}
        paginationDisabled={calendarsLoading}
        isLoading={calendarsLoading && !policyPage}
        isSearch
        serverSidePagination
        serverSideSearch
        totalCount={policyPage?.totalCount || 0}
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        searchTerm={tableQuery.search}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        isFilter={false}
        isPagination
        noDataText={
          policyArchiveView.calendar === 'archived'
            ? 'No removed work calendars.'
            : 'No work calendars.'
        }
      />
    </Stack>
  );
}
