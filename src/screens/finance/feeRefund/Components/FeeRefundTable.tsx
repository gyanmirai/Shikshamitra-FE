'use client';

import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import { Box, Tab, Card, Tabs, MenuList, MenuItem, Typography } from '@mui/material';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  useGetFeeRefundsQuery,
  type FeeRefundRequestDto,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import type { IStudentFeeData, IStudentFeeTableProps } from '../type';

const REFUND_TABS = [
  { label: 'Pending', value: FeeRefundStatusType.Pending, color: 'warning' },
  { label: 'Approved', value: FeeRefundStatusType.Approved, color: 'success' },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected, color: 'error' },
] as const;

function mapRefundItem(item: FeeRefundRequestDto, idx: number): IStudentFeeData {
  return {
    id: idx + 1,
    name: item.studentName || item.studentId,
    board: '',
    medium: '',
    class: item.className ?? '',
    division: item.divisionName ?? '',
    grNo: item.studentGrNo != null ? String(item.studentGrNo) : '',
    rollNo: item.studentRollNo != null ? String(item.studentRollNo) : '',
    contactNo: item.studentContactNo ?? '',
    totalPaidFees: item.totalAmount,
    totalPendingFees: 0,
    refundAmount: item.totalAmount,
    requestDate: item.creationTime
      ? new Date(item.creationTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '',
    reasonOfRefund: item.reason ?? '',
    status: item.status as FeeRefundStatusType,
    refundMethod: item.refundMethod ?? '',
    _refundRequestId: item.id,
  } as IStudentFeeData;
}

const StudentFeeRefundTable: React.FC<IStudentFeeTableProps> = ({ onRequestRefund, onView }) => {
  const {
    boards,
    mediums,
    selectedBoard,
    selectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard,
    setSelectedMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  } = useFinanceAcademicFilters();

  const tabs = useTabs(FeeRefundStatusType.Pending);

  const {
    data: refundListData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeRefundsQuery,
    params: {
      academicMediumId: filterPayload?.educationMediumId,
      standardId: filterPayload?.standardId,
      divisionId: filterPayload?.divisionId,
      maxResultCount: 100,
    },
    options: {
      skip: !isReady,
    },
  });

  const data = useMemo(
    () => (refundListData?.items ?? []).map((item, idx) => mapRefundItem(item, idx)),
    [refundListData?.items]
  );

  const tabCounts = useMemo(
    () =>
      REFUND_TABS.reduce(
        (acc, tab) => {
          acc[tab.value] = (data || []).filter((item) => item.status === tab.value).length;
          return acc;
        },
        {} as Record<number, number>
      ),
    [data]
  );

  const filteredData = useMemo(
    () => (data || []).filter((item) => item.status === tabs.value),
    [data, tabs.value]
  );

  // Memoized callback function to render action menu items
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem disabled>
          <Iconify icon="uil:process" sx={{ height: '16px', width: '16px' }} />
          No actions
        </MenuItem>
      </MenuList>
    ),
    []
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FinanceAcademicContextFilter
              boards={boards}
              mediums={mediums}
              selectedBoard={selectedBoard}
              selectedMedium={selectedMedium}
              onBoardChange={setSelectedBoard}
              onMediumChange={setSelectedMedium}
              selectSx={{ minWidth: '248px', width: '100%' }}
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
              selectSx={{ minWidth: '248px', width: '100%' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}
            >
              {REFUND_TABS.map((tab) => (
                <Tab
                  key={String(tab.value)}
                  value={tab.value}
                  sx={{ fontSize: '12px' }}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color as LabelColor}>{tabCounts[tab.value] ?? 0}</Label>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Card>

      <CustomizableTable
        tableId="student-fee-table"
        isLoading={isLoading || isFetching}
        noDataText={<>No student refund fee data found.</>}
        columns={[
          {
            id: 'name',
            label: 'Name(Gr No.)',
            align: 'left',
            width: 150,
            minWidth: 150,
            maxWidth: 200,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.grNo && `(${row.grNo})`}
              </Typography>
            ),
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            isFilter: true,
            filterType: 'number',
            width: 100,
            minWidth: 100,
            maxWidth: 150,
          },
          {
            id: 'class',
            label: 'Class/Div',
            align: 'left',
            width: 150,
            minWidth: 100,
            maxWidth: 150,
            render(value, row) {
              return `${row.class} / ${row.division}`;
            },
          },
          {
            id: 'contactNo',
            label: 'Contact No.',
            align: 'left',
            width: 140,
            minWidth: 120,
            maxWidth: 160,
          },
          {
            id: 'refundAmount',
            label: 'Refund Amount',
            align: 'left',
            width: 150,
            minWidth: 130,
            maxWidth: 180,
            isFilter: true,
            render: (value) => (value ? `₹ ${value.toLocaleString()}` : '-'),
          },
          {
            id: 'requestDate',
            label: 'Request Date',
            align: 'left',
            width: 140,
            minWidth: 120,
            maxWidth: 170,
            isFilter: true,
            filterType: 'date',
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            width: 96,
            minWidth: 80,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    onView?.(row as IStudentFeeData);
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={filteredData}
      />
    </>
  );
};

export default StudentFeeRefundTable;
