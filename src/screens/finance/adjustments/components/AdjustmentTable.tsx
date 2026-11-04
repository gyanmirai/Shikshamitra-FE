'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IParams } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { financePermissions } from 'src/constants/finance-menu';
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { Box, Tab, Card, Tabs, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetAdjustmentApplicationsQuery } from 'src/redux/finance/adjustments/adjustmentApi';

import FinanceListActionRow from '../../components/FinanceListActionRow';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';
import { serializeFinanceTableFilters } from '../../components/financeTableQuery';
import { mapAdjustmentApplicationItem } from '../utils/mapAdjustmentApplication';
import { useFinanceAcademicFilters } from '../../hooks/useFinanceAcademicFilters';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from '../enums/adjustment.enum';
import FinanceClassDivisionFilter from '../../components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from '../../components/FinanceAcademicContextFilter';
import {
  ADJUSTMENT_TABS,
  ADJUSTMENT_STATUS_COLORS,
  formatAdjustmentStatusLabel,
} from '../constants/adjustmentOptions';

import type { IAdjustmentTableProps } from '../types/adjustment.types';
import { useAdjustmentWorklistQuery } from '../hooks/useAdjustmentWorklistQuery';

const AdjustmentTable: React.FC<IAdjustmentTableProps> = ({
  activeTab = AdjustmentTabEnum.Pending,
  onTabChange,
  tabCounts,
  onView,
  onApprove,
  onReject,
  academicFilters,
  primaryAction,
}) => {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.sub);

  const localFilters = useFinanceAcademicFilters();
  const filters = academicFilters || localFilters;

  // Use the finance academic filters hook
  const {
    boards,
    mediums,
    selectedBoard: filterSelectedBoard,
    selectedMedium: filterSelectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard: setFilterBoard,
    setSelectedMedium: setFilterMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  } = filters;

  const [tableQuery, setTableQuery] = useAdjustmentWorklistQuery(activeTab);
  const tabs = { value: tableQuery.tab };
  const scope = JSON.stringify([currentYear?.id, filterPayload]);
  const previousScope = useRef<string | null>(null);
  const page =
    previousScope.current !== null && previousScope.current !== scope ? 0 : tableQuery.page;
  useEffect(() => {
    if (!isReady) return;
    if (
      previousScope.current !== null &&
      previousScope.current !== scope &&
      tableQuery.page !== 0
    ) {
      setTableQuery((previous) => ({ ...previous, page: 0 }), true);
    }
    previousScope.current = scope;
  }, [scope, isReady, tableQuery.page, setTableQuery]);

  const listParams = useMemo(() => {
    if (!isReady || !filterPayload || !currentYear?.id) return null;

    const base = {
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      academicYearId: currentYear.id,
      standardId: filterPayload.standardId,
      divisionId: filterPayload.divisionId,
      page: page + 1,
      pageSize: tableQuery.pageSize,
      filter: tableQuery.search || undefined,
      filters: serializeFinanceTableFilters(tableQuery.filters),
    };

    if (tabs.value === AdjustmentTabEnum.Pending) {
      return { ...base, status: 0 };
    }
    if (tabs.value === AdjustmentTabEnum.Rejected) {
      return { ...base, status: 1 };
    }
    return { ...base, completedOnly: true };
  }, [
    currentYear?.id,
    filterPayload,
    isReady,
    tabs.value,
    page,
    tableQuery.pageSize,
    tableQuery.search,
    tableQuery.filters,
  ]);

  const {
    currentData: applicationsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdjustmentApplicationsQuery,
    params: listParams,
    options: { skip: !listParams || !access.canView },
  });

  const data = useMemo(
    () => (applicationsData?.items ?? []).map(mapAdjustmentApplicationItem),
    [applicationsData?.items]
  );
  const counts = {
    [AdjustmentTabEnum.Pending]:
      applicationsData?.pendingCount ?? tabCounts?.[AdjustmentTabEnum.Pending] ?? 0,
    [AdjustmentTabEnum.Approved]:
      applicationsData?.appliedCount != null || applicationsData?.partiallyAppliedCount != null
        ? (applicationsData.appliedCount ?? 0) + (applicationsData.partiallyAppliedCount ?? 0)
        : (tabCounts?.[AdjustmentTabEnum.Approved] ?? 0),
    [AdjustmentTabEnum.Rejected]:
      applicationsData?.rejectedCount ?? tabCounts?.[AdjustmentTabEnum.Rejected] ?? 0,
  };

  const renderActions = useCallback(
    (params: { row: any }) => {
      const { row } = params;
      const isPending = row.status === AdjustmentStatusEnum.Pending;
      const isPartial = row.status === AdjustmentStatusEnum.PartiallyApplied;
      const canDecide = access.canAdd && !!currentUserId && row.requestedByUserId !== currentUserId;
      return (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          moreLabel={`More adjustment actions for ${row.studentName}`}
          placement="right-top"
          actions={[
            ...(canDecide && (isPending || isPartial) && onApprove
              ? [
                  {
                    id: 'approve',
                    label: `${isPartial ? 'Apply remaining' : 'Approve'} for ${row.studentName}`,
                    icon: 'mdi:approve',
                    color: 'success.main',
                    onClick: () => onApprove?.(row),
                  },
                ]
              : []),
            ...(canDecide && isPending && onReject
              ? [
                  {
                    id: 'reject',
                    label: `Reject for ${row.studentName}`,
                    icon: 'mdi:close',
                    color: 'error.main',
                    onClick: () => onReject?.(row),
                  },
                ]
              : []),
          ]}
        />
      );
    },
    [access.canAdd, currentUserId, onApprove, onReject]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Card sx={{ p: 1, mb: 1, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FinanceAcademicContextFilter
            boards={boards}
            mediums={mediums}
            selectedBoard={filterSelectedBoard}
            selectedMedium={filterSelectedMedium}
            onBoardChange={setFilterBoard}
            onMediumChange={setFilterMedium}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
          <FinanceClassDivisionFilter
            classOptions={classOptions}
            divisionOptions={divisionOptions}
            selectedStandardId={selectedStandardId}
            selectedDivisionId={selectedDivisionId}
            isDivisionDisabled={isDivisionDisabled}
            onClassChange={setSelectedStandardId}
            onDivisionChange={setSelectedDivisionId}
            classesLoading={classesLoading}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
        </Box>
      </Card>
      <FinanceListActionRow action={primaryAction}>
        <Tabs
          variant="scrollable"
          value={tabs.value}
          onChange={(_e, value) => {
            setTableQuery((previous) => ({
              ...previous,
              tab: value,
              page: 0,
              filters: previous.filters.filter((filter) => filter.column !== 'status'),
            }));
            onTabChange?.(value as AdjustmentTabEnum);
          }}
          aria-label="Adjustment status"
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, px: 1 }}
        >
          {ADJUSTMENT_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}
                  <Label color={tab.color as LabelColor}>{counts[tab.value]}</Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </FinanceListActionRow>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          getRowAction={(row) =>
            access.canView
              ? {
                  label: `Open ${row.studentName || 'record'}`,
                  onClick: () => {
                    onView(row as Parameters<typeof onView>[0]);
                  },
                }
              : undefined
          }
          tableId="adjustment-table"
          tableTitle="Fee adjustments"
          serverSidePagination
          serverSideSearch
          serverSideFilter
          page={page}
          rowsPerPage={tableQuery.pageSize}
          searchTerm={tableQuery.search}
          filters={tableQuery.filters}
          totalCount={applicationsData?.totalCount ?? 0}
          maxServerRowsPerPage={100}
          exportLabel="Export current page"
          exportScope="loaded"
          onServerPagination={(nextPage, pageSize) =>
            setTableQuery((previous) => ({ ...previous, scope, page: nextPage - 1, pageSize }))
          }
          onServerSearch={(search) =>
            setTableQuery((previous) => ({ ...previous, scope, page: 0, search }))
          }
          onServerFilter={(nextFilters) =>
            setTableQuery((previous) => ({ ...previous, scope, page: 0, filters: nextFilters }))
          }
          onClearCriteria={() =>
            setTableQuery((previous) => ({ ...previous, scope, page: 0, search: '', filters: [] }))
          }
          isLoading={isLoading || (isFetching && !applicationsData)}
          isRefreshing={Boolean(applicationsData && isFetching && !isLoading)}
          error={isError ? { message: 'Could not load adjustments. Please try again.' } : undefined}
          onRetry={refetch}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, width: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText={
            listParams
              ? 'No adjustment records found.'
              : 'Select an academic context to load adjustments.'
          }
          columns={[
            {
              stickyPosition: 'left',
              id: 'studentName',
              isSort: false,
              label: 'Student (GR No.)',
              isFilter: true,
              filterType: 'string',
              align: 'left',
              width: 150,
              minWidth: 150,
              maxWidth: 220,
              sticky: true,
              render: (value, row) => (
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {value || '—'}{' '}
                  {row.studentGrNo && (
                    <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                      ({row.studentGrNo})
                    </Box>
                  )}
                </Typography>
              ),
            },
            {
              id: 'className',
              isSort: false,
              label: 'Class / Division',
              isFilter: true,
              filterType: 'string',
              align: 'left',
              width: 130,
              minWidth: 80,
              maxWidth: 150,
              render: (_v: any, row: any) =>
                row.className && row.divisionName
                  ? `${row.className} / ${row.divisionName}`
                  : row.className || '-',
            },
            {
              id: 'rollNumber',
              isSort: false,
              label: 'Roll no.',
              align: 'left',
              isFilter: true,
              filterType: 'string',
              width: 100,
              minWidth: 100,
              maxWidth: 130,
            },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'adjustmentAmount',
              isSort: false,
              label: 'Requested amount',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              valueType: 'money',
              width: 130,
              minWidth: 110,
              maxWidth: 160,
              render: (value: number | null) =>
                value == null ? '—' : formatNumber(value, 'INR', { fractionDigits: 2 }),
            },
            {
              id: 'requestedBy',
              isSort: false,
              label: 'Requested by',
              isFilter: true,
              filterType: 'string',
              align: 'left',
              width: 140,
              minWidth: 120,
              maxWidth: 170,
            },
            {
              id: 'createdAt',
              isSort: false,
              label: 'Requested on',
              align: 'left',
              isFilter: true,
              filterType: 'date',
              width: 180,
              minWidth: 130,
              maxWidth: 180,
              render: (value: any) => (
                <Typography variant="body2">
                  {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
                </Typography>
              ),
            },
            {
              stickyPosition: 'right',
              id: 'status',
              isSort: false,
              label: 'Status',
              align: 'left',
              isFilter: true,
              filterType: 'string',
              width: 110,
              minWidth: 90,
              maxWidth: 140,
              sticky: true,
              render: (value: any) => {
                const statusKey = value as keyof typeof ADJUSTMENT_STATUS_COLORS;
                const color = (ADJUSTMENT_STATUS_COLORS[statusKey] ?? 'default') as LabelColor;
                return (
                  <Label color={color}>
                    {typeof value === 'number' ? formatAdjustmentStatusLabel(value) : value}
                  </Label>
                );
              },
            },
            {
              stickyPosition: 'right',
              excludeFromExport: true,
              id: 'actions',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              align: 'left',
              width: 140,
              minWidth: 120,
              sticky: true,
              render: (_v: any, row: any) => renderActions({ row }),
            },
          ]}
          data={data}
          searchFieldProps={{ placeholder: 'Search' }}
        />
      </Box>
    </Box>
  );
};

export default AdjustmentTable;
