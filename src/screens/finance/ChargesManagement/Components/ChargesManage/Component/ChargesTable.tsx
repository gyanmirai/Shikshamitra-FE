'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import React, { useMemo, useEffect } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Tab, Tabs, Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ChargesPaymentStatus } from 'src/enums/fee-charges-status';
import { useGetChargesQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';

import type { IChargeData } from './type';

const ChargesTable = ({
  onView,
  onEdit,
  onAddCharge,
  onApprove,
  onReject,
  onRemove,
  onRefetch,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  selectedTab,
  setSelectedTab,
}: {
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
  onApprove: (data: IChargeData) => void;
  onReject: (data: IChargeData) => void;
  onRemove: (data: IChargeData) => void;
  onRefetch?: (refetchFn: () => void) => void;
  selectedBoard: string;
  setSelectedBoard: (value: string) => void;
  selectedMedium: string;
  setSelectedMedium: (value: string) => void;
  selectedTab: string | number;
  setSelectedTab: (value: string | number) => void;
}) => {
  const {
    boards,
    mediums,
    selectedBoard: filterSelectedBoard,
    selectedMedium: filterSelectedMedium,
    isReady,
    setSelectedBoard: setFilterBoard,
    setSelectedMedium: setFilterMedium,
  } = useFinanceAcademicFilters();

  const tabs = useTabs(selectedTab);

  useEffect(() => {
    setSelectedTab(tabs.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.value]);

  // Fetch charge data using custom query hook
  const {
    data: chargesData,
    isLoading: chargesLoading,
    isFetching: chargesFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: {
      boardId: filterSelectedBoard,
      educationMediumId: filterSelectedMedium,
      status: tabs.value,
    },
    options: {
      skip: !filterSelectedBoard || !filterSelectedMedium || !isReady,
    },
  });

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetch && refetch) {
      // Pass the refetch function to parent
      const refetchHandler = () => {
        refetch();
      };
      onRefetch(refetchHandler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);
  // Tab Counts
  const chargeCounts = useMemo(
    () => ({
      pending: chargesData?.pendingCount || 0,
      approved: chargesData?.approvedCount || 0,
      rejected: chargesData?.rejectedCount || 0,
    }),
    [chargesData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ChargesPaymentStatus.Pending,
        count: chargeCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ChargesPaymentStatus.Approved,
        count: chargeCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ChargesPaymentStatus.Rejected,
        count: chargeCounts.rejected,
        color: 'error',
      },
    ],
    [chargeCounts]
  );

  // Filter Table Data by Selected Tab
  const tableData = useMemo(
    () =>
      chargesData?.items
        ?.filter((i: IChargeData) => i.status === tabs.value)
        ?.map((item: IChargeData) => ({
          ...item,
          amount:
            item.amount !== undefined && item.amount !== null
              ? parseFloat(String(item.amount).replace(/,/g, ''))
              : 0,
          description: item.purposeDescription || '-',
          dueDate: item.dueDate ? dayjs(item.dueDate).format('DD-MM-YYYY') : '-',
        })),
    [chargesData?.items, tabs.value]
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
                    <Label color={tab.color as LabelColor}>{tab.count}</Label>
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
            id: 'studentName',
            label: 'Name(Gr No.)',
            align: 'left',
            isFilter: true,
            width: 150,
            minWidth: 150,
            maxWidth: 200,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.grNumber && `(${row.grNumber})`}
              </Typography>
            ),
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            align: 'left',
            width: 100,
            minWidth: 100,
            maxWidth: 150,
            filterType: 'number',
            isFilter: true,
          },
          {
            id: 'standardName',
            label: 'Class/Div',
            align: 'left',
            width: 110,
            minWidth: 90,
            maxWidth: 140,
            isFilter: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {row.standardName
                  ? `${row.standardName}${row.divisionName ? ` - ${row.divisionName}` : ''}`
                  : '-'}
              </Typography>
            ),
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
            // render: (value) => (
            //   <Typography fontSize="13px">
            //     {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            //   </Typography>
            // ),
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
            render(value, row) {
              const isPending = row.status === 0;
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
