'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import React, { useMemo, useEffect } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Tab, Tabs, Card, Chip, Typography } from '@mui/material';
import { useGetChargesQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';

import type { IChargeData } from './type';

/** Tab value 0 = Pending, 1 = Processed */
const PENDING = 0;
const PROCESSED = 1;

const ChargesTable = ({
  onView,
  onEdit,
  onAddCharge,
  onApprove,
  onReject,
  onRemove,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  selectedTab,
  setSelectedTab,
  refetchTrigger,
}: {
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
  onApprove: (data: IChargeData) => void;
  onReject: (data: IChargeData) => void;
  onRemove: (data: IChargeData) => void;
  selectedBoard: string;
  setSelectedBoard: (value: string) => void;
  selectedMedium: string;
  setSelectedMedium: (value: string) => void;
  selectedTab: string | number;
  setSelectedTab: (value: string | number) => void;
  refetchTrigger?: number;
}) => {
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
  } = useFinanceAcademicFilters();

  const tabs = useTabs(selectedTab);

  useEffect(() => {
    setSelectedTab(tabs.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.value]);

  // Fetch charge data — now passes standardId and divisionId to the backend
  const {
    data: chargesData,
    isLoading: chargesLoading,
    isFetching: chargesFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: {
      boardId: filterSelectedBoard,
      educationMediumId: filterSelectedMedium,
      standardId: filterPayload?.standardId,
      divisionId: filterPayload?.divisionId,
      status: tabs.value,
      _refetchTrigger: refetchTrigger,
    },
    options: {
      skip: !filterSelectedBoard || !filterSelectedMedium || !isReady,
    },
  });

  // Tab counts from the API (scope-aware — already filtered by board/medium/class/division)
  const chargeCounts = useMemo(
    () => ({
      pending: chargesData?.pendingCount ?? 0,
      processed: chargesData?.processedCount ?? 0,
    }),
    [chargesData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: PENDING,
        count: chargeCounts.pending,
        color: 'warning' as LabelColor,
      },
      {
        label: 'Processed',
        value: PROCESSED,
        count: chargeCounts.processed,
        color: 'success' as LabelColor,
      },
    ],
    [chargeCounts]
  );

  // Table data — backend already filters by status; no client-side status filter needed
  const tableData = useMemo(
    () =>
      chargesData?.items?.map((item: IChargeData) => ({
        ...item,
        amount:
          item.amount !== undefined && item.amount !== null
            ? parseFloat(String(item.amount).replace(/,/g, ''))
            : 0,
        description: item.purposeDescription || '-',
        dueDate: item.dueDate ? dayjs(item.dueDate).format('DD-MM-YYYY') : '-',
      })),
    [chargesData?.items]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
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
        isLoading={chargesLoading || chargesFetching}
        noDataText={
          <>
            No Charges Found{' '}
            <Box
              component="span"
              onClick={onAddCharge}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': { cursor: 'pointer', textDecoration: 'underline' },
              }}
            >
              Add Charge
            </Box>
          </>
        }
        columns={[
          {
            id: 'chargeName',
            label: 'Charge Name',
            align: 'left',
            isFilter: true,
            width: 160,
            minWidth: 140,
            maxWidth: 220,
            sticky: true,
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
            width: 140,
            minWidth: 120,
            maxWidth: 180,
            render: (_value, row: any) => {
              const total: number = row.studentCount ?? 0;
              const processed: number = row.processedCount ?? 0;
              const isPending = row.displayStatus === PENDING;
              return (
                <Chip
                  label={`${processed}/${total} processed`}
                  size="small"
                  color={isPending ? 'warning' : 'success'}
                  variant="outlined"
                  sx={{ fontSize: '11px', height: 22 }}
                />
              );
            },
          },
          {
            id: 'categoryName',
            label: 'Charge Category',
            align: 'left',
            isFilter: true,
            width: 180,
            minWidth: 150,
            maxWidth: 220,
          },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            align: 'left',
            isFilter: true,
            width: 120,
            minWidth: 100,
            maxWidth: 160,
            render: (value) => `₹ ${parseFloat(value).toLocaleString()}`,
          },
          {
            id: 'description',
            label: 'Description',
            align: 'left',
            width: 220,
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
            width: 120,
            minWidth: 100,
            maxWidth: 150,
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isSort: false,
            isFilter: false,
            width: 150,
            minWidth: 120,
            sticky: true,
            render(_value, row: any) {
              const isPending = row.displayStatus === PENDING;
              return (
                <Box display="flex" gap={1} alignItems="center">
                  <ThreeDotsActions
                    placement="right-top"
                    showViewIcon
                    showEditIcon={isPending}
                    showThreeDots={false}
                    showDeleteIcon={isPending}
                    handleDeleteClick={() => onRemove(row as IChargeData)}
                    handleViewClick={() => onView(row as IChargeData)}
                    handleEditClick={() => onEdit(row as IChargeData)}
                  />
                  {isPending && (
                    <>
                      <Typography
                        component="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onApprove(row as IChargeData);
                        }}
                        sx={{
                          p: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'success.lighter',
                          color: 'success.main',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: 'success.light' },
                          minWidth: '50px',
                        }}
                      >
                        Approve
                      </Typography>
                      <Typography
                        component="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onReject(row as IChargeData);
                        }}
                        sx={{
                          p: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'error.lighter',
                          color: 'error.main',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: 'error.light' },
                          minWidth: '50px',
                        }}
                      >
                        Reject
                      </Typography>
                    </>
                  )}
                </Box>
              );
            },
          },
        ]}
        data={tableData || []}
      />
    </>
  );
};

export default ChargesTable;
