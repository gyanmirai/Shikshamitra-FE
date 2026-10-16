'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Tab, Tabs, Card, Alert, Button, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetChargesQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import { ChargeWorkflowStatus, ChargeWorkflowStatusOptions } from 'src/enums/fee-charges-status';
import { useChargePermissions } from 'src/screens/finance/ChargesManagement/useChargePermissions';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  useFinanceAcademicFilters,
  type UseFinanceAcademicFiltersResult,
} from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import { serializeChargeTableFilters } from './chargeTableFilters';

import type { IChargeData } from './type';

const PENDING = ChargeWorkflowStatus.Pending;

const ChargesTable = ({
  onView,
  onEdit,
  onAddCharge,
  onApprove,
  onReject,
  onVoid,
  onRemove,
  academicFilters,
  selectedTab,
  setSelectedTab,
  refetchTrigger,
}: {
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
  onApprove: (data: IChargeData) => void;
  onReject: (data: IChargeData) => void;
  onVoid: (data: IChargeData) => void;
  onRemove: (data: IChargeData) => void;
  academicFilters?: UseFinanceAcademicFiltersResult;
  selectedTab: string | number;
  setSelectedTab: (value: string | number) => void;
  refetchTrigger?: number;
}) => {
  const localFilters = useFinanceAcademicFilters();
  const filters = academicFilters || localFilters;
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

  const tabs = useTabs(selectedTab);
  const permissions = useChargePermissions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const serializedFilters = useMemo(
    () => serializeChargeTableFilters(columnFilters),
    [columnFilters]
  );

  useEffect(() => {
    setSelectedTab(tabs.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.value]);

  useEffect(() => {
    setPage(1);
  }, [
    tabs.value,
    filterPayload?.academicYearId,
    filterSelectedBoard,
    filterSelectedMedium,
    filterPayload?.standardId,
    filterPayload?.divisionId,
  ]);

  // Fetch charge data — now passes standardId and divisionId to the backend
  const {
    data: chargesData,
    isLoading: chargesLoading,
    isFetching: chargesFetching,
    isError: chargesError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: {
      academicYearId: filterPayload?.academicYearId,
      boardId: filterSelectedBoard,
      educationMediumId: filterSelectedMedium,
      standardId: filterPayload?.standardId,
      divisionId: filterPayload?.divisionId,
      status: tabs.value,
      page,
      pageSize,
      search: search || undefined,
      filters: serializedFilters,
      sortBy: sorts[0]?.column,
      sortOrder: sorts[0]?.direction,
      _refetchTrigger: refetchTrigger,
    },
    options: {
      skip:
        !filterPayload?.academicYearId || !filterSelectedBoard || !filterSelectedMedium || !isReady,
    },
  });

  // Tab counts from the API (scope-aware — already filtered by board/medium/class/division)
  const chargeCounts = useMemo(
    () => ({
      pending: chargesData?.pendingCount ?? 0,
      inProcess: chargesData?.inProcessCount ?? 0,
      completed: chargesData?.completedCount ?? 0,
      rejected: chargesData?.rejectedCount ?? 0,
    }),
    [chargesData]
  );

  const TABS = useMemo(
    () =>
      ChargeWorkflowStatusOptions.map((option) => ({
        ...option,
        count: [
          chargeCounts.pending,
          chargeCounts.inProcess,
          chargeCounts.completed,
          chargeCounts.rejected,
        ][option.value],
      })),
    [chargeCounts]
  );

  // Table data — backend already filters by status; no client-side status filter needed
  const tableData = useMemo(
    () =>
      chargesData?.items?.map((item: IChargeData) => ({
        ...item,
        chargeId: item.chargeId || item.id || '',
        amount:
          item.amount !== undefined && item.amount !== null
            ? parseFloat(String(item.amount).replace(/,/g, ''))
            : 0,
        description: item.purposeDescription || '-',
        dueDate: item.dueDate,
      })),
    [chargesData?.items]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
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
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tabs
            value={tabs.value}
            onChange={(event, value) => {
              tabs.onChange(event, value);
              setPage(1);
              setColumnFilters((current) =>
                current.filter((filter) => filter.column !== 'workflowStatus')
              );
            }}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
              px: 1
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                sx={{ fontSize: '12px' }}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}
                    <Label color={tab.color}>{tab.count}</Label>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      <CustomizableTable
        tableId="charges-table"
        tableTitle="Charges"
        isLoading={chargesLoading || chargesFetching}
        errorContent={
          chargesError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load charges. Try again or clear the filters.
            </Alert>
          ) : undefined
        }
        noDataText={
          <>
            No Charges Found{' '}
            {permissions.canAdd && (
              <Button size="small" onClick={onAddCharge}>
                Add Charge
              </Button>
            )}
          </>
        }
        columns={[
          {
            id: 'chargeName',
            label: 'Charge Name',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            width: 140,
            minWidth: 140,
            maxWidth: 220,
            sticky: true,
            stickyPosition: 'left',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'studentCount',
            label: 'Students',
            align: 'left',
            filterType: 'number',
            isFilter: true,
            isSort: false,
            minWidth: 120,
            maxWidth: 180,
            render: (_value, row: any) => {
              const total: number = row.studentCount ?? 0;
              const processed: number = row.processedCount ?? 0;
              return (
                <Box>
                  <Typography variant="body2">{total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {processed} reviewed
                  </Typography>
                </Box>
              );
            },
          },
          {
            id: 'categoryName',
            label: 'Charge Category',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            isSort: false,
            minWidth: 150,
            maxWidth: 220,
          },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            align: 'left',
            isFilter: true,
            minWidth: 100,
            maxWidth: 160,
            render: (value) => (value == null ? '—' : formatNumber(value, 'INR')),
          },
          {
            id: 'description',
            label: 'Description',
            align: 'left',
            filterType: 'string',
            isFilter: true,
            isSort: false,
            minWidth: 160,
            maxWidth: 280,
            cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
            render: (value) => (
              <Typography
                variant="caption"
                fontSize="13px"
                sx={{
                  maxWidth: 250,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            isFilter: true,
            minWidth: 100,
            maxWidth: 150,
            render: (value) => (value ? fDate(value, 'DD-MM-YYYY') : '—'),
          },
          {
            id: 'workflowStatus',
            label: 'Status',
            align: 'left',
            sticky: true,
            stickyPosition: 'right',
            filterType: 'enum',
            enumOptions: [...ChargeWorkflowStatusOptions],
            isFilter: true,
            isSort: false,
            width: 110,
            minWidth: 110,
            render: (value) => {
              const option = ChargeWorkflowStatusOptions.find((item) => item.value === value);
              return <Label color={option?.color ?? 'default'}>{option?.label ?? 'Unknown'}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            isSort: false,
            isFilter: false,
            width: 150,
            minWidth: 120,
            sticky: true,
            stickyPosition: 'right',
            excludeFromExport: true,
            render(_value, row: any) {
              const isPending = row.displayStatus === PENDING;
              const actions: string[] = row.availableActions ?? [];
              const canEdit = isPending && permissions.canEdit && actions.includes('Edit');
              const canDelete = isPending && permissions.canDelete && actions.includes('Delete');
              const canApprove = isPending && permissions.canApprove && actions.includes('Approve');
              const canReject = isPending && permissions.canReject && actions.includes('Reject');
              const canVoid = permissions.canVoid && actions.includes('Void');
              const name = row.chargeName || 'charge';
              return (
                <AdaptiveThreeDotsActions
                  moreLabel={`More actions for ${name}`}
                  placement="right-top"
                  sx={{ justifyContent: 'flex-end' }}
                  actions={[
                    {
                      id: 'view',
                      label: `View ${name}`,
                      icon: GlobalIcons.eye,
                      onClick: () => onView(row as IChargeData),
                    },
                    ...(canEdit
                      ? [
                        {
                          id: 'edit',
                          label: `Edit ${name}`,
                          icon: GlobalIcons.edit,
                          onClick: () => onEdit(row as IChargeData),
                        },
                      ]
                      : []),
                    ...(canApprove
                      ? [
                        {
                          id: 'approve',
                          label: `Approve ${name}`,
                          icon: 'mdi:approve',
                          color: 'success.main',
                          onClick: () => onApprove(row as IChargeData),
                        },
                      ]
                      : []),
                    ...(canReject
                      ? [
                        {
                          id: 'reject',
                          label: `Reject ${name}`,
                          icon: 'mdi:close',
                          color: 'error.main',
                          onClick: () => onReject(row as IChargeData),
                        },
                      ]
                      : []),
                    ...(canDelete
                      ? [
                        {
                          id: 'delete',
                          label: `Delete ${name}`,
                          icon: GlobalIcons.delete,
                          color: 'error.main',
                          onClick: () => onRemove(row as IChargeData),
                        },
                      ]
                      : []),
                    ...(canVoid
                      ? [
                        {
                          id: 'void',
                          label: `Void uncollected ${name}`,
                          icon: 'mdi:cancel-circle-outline',
                          color: 'warning.main',
                          onClick: () => onVoid(row as IChargeData),
                        },
                      ]
                      : []),
                  ]}
                />
              );
            },
          },
        ]}
        data={tableData || []}
        serverSidePagination
        serverSideSearch
        totalCount={chargesData?.totalCount ?? 0}
        page={page - 1}
        rowsPerPage={pageSize}
        searchTerm={search}
        onServerPagination={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onServerSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        serverSideFilter
        filters={columnFilters}
        onServerFilter={(nextFilters) => {
          setColumnFilters(nextFilters);
          setPage(1);
        }}
        serverSideSort
        serverSideSortMode="single"
        sorts={sorts}
        onServerSort={(_column, nextSorts) => {
          setSorts(nextSorts);
          setPage(1);
        }}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
      />
    </>
  );
};

export default ChargesTable;
