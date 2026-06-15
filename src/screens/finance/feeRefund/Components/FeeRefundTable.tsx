'use client';

import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import { Box, Tab, Card, Tabs, Typography, IconButton } from '@mui/material';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  useGetFeeRefundsQuery,
  type FeeRefundRequestDto,
} from 'src/redux/finance/RefundManagement/feeRefundManage';
import {
  useFinanceAcademicFilters,
  type UseFinanceAcademicFiltersResult,
} from 'src/screens/finance/hooks/useFinanceAcademicFilters';

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
    _studentId: item.studentId,
  } as IStudentFeeData;
}

interface StudentFeeRefundTableProps extends IStudentFeeTableProps {
  academicFilters?: UseFinanceAcademicFiltersResult;
}

const StudentFeeRefundTable: React.FC<StudentFeeRefundTableProps> = ({
  onView,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  academicFilters,
}) => {
  const localFilters = useFinanceAcademicFilters();
  const filters = academicFilters || localFilters;
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
  } = filters;

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

  const data: IStudentFeeData[] = useMemo(
    () =>
      (refundListData?.items ?? []).map((item: FeeRefundRequestDto, idx: number) =>
        mapRefundItem(item, idx)
      ),
    [refundListData?.items]
  );

  const tabCounts = useMemo(
    () =>
      REFUND_TABS.reduce(
        (acc: any, tab: any) => {
          acc[tab.value] = (data || []).filter((item: any) => item?.status === tab.value).length;
          return acc;
        },
        {} as Record<number, number>
      ),
    [data]
  );

  const filteredData = useMemo(
    () => (data || []).filter((item: any) => item?.status === tabs.value),
    [data, tabs.value]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FinanceAcademicContextFilter
            boards={boards}
            mediums={mediums}
            selectedBoard={selectedBoard}
            selectedMedium={selectedMedium}
            onBoardChange={setSelectedBoard}
            onMediumChange={setSelectedMedium}
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
              const isPending = row?.status === FeeRefundStatusType.Pending;
              return (
                <Box display="flex" gap={1} alignItems="center">
                  <ThreeDotsActions
                    showThreeDots={false}
                    showViewIcon
                    showEditIcon={isPending}
                    showDeleteIcon={isPending}
                    handleViewClick={() => {
                      onView?.(row as IStudentFeeData);
                    }}
                    handleEditClick={() => {
                      onEdit?.(row as IStudentFeeData);
                    }}
                    handleDeleteClick={() => {
                      onDelete?.(row as IStudentFeeData);
                    }}
                    placement="right-top"
                  />
                  {isPending && (
                    <Box sx={{ display: 'flex' }}>
                      <IconButton
                        size="small"
                        onClick={() => onApprove?.(row as IStudentFeeData)}
                        sx={{
                          color: 'success.main',
                          '&:hover': { backgroundColor: 'success.lighter' },
                        }}
                        title="Approve"
                      >
                        <Iconify icon="mdi:approve" width={20} height={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onReject?.(row as IStudentFeeData)}
                        sx={{
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'error.lighter' },
                        }}
                        title="Reject"
                      >
                        <Iconify icon="entypo:cross" width={20} height={20} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
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
