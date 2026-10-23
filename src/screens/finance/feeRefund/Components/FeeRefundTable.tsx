'use client';

import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import { Box, Tab, Card, Tabs, Typography, IconButton } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
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
  { label: 'Draft', value: FeeRefundStatusType.Draft, color: 'default' },
  { label: 'Submitted', value: FeeRefundStatusType.Submitted, color: 'warning' },
  { label: 'Review', value: FeeRefundStatusType.UnderReview, color: 'info' },
  { label: 'Approved', value: FeeRefundStatusType.Approved, color: 'success' },
  { label: 'Processing', value: FeeRefundStatusType.Processing, color: 'info' },
  { label: 'Processed', value: FeeRefundStatusType.Processed, color: 'success' },
  { label: 'Failed', value: FeeRefundStatusType.Failed, color: 'error' },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected, color: 'error' },
  { label: 'Cancelled', value: FeeRefundStatusType.Cancelled, color: 'default' },
  { label: 'Reversed', value: FeeRefundStatusType.Reversed, color: 'warning' },
] as const;

function mapRefundItem(item: FeeRefundRequestDto, idx: number): IStudentFeeData {
  return {
    id: idx + 1,
    name: item.studentName || item.studentId,
    board: item.boardName ?? '',
    medium: item.educationMediumName ?? '',
    class: item.standardName ?? '',
    division: item.divisionName ?? '',
    grNo: item.studentGrNo != null ? String(item.studentGrNo) : '',
    rollNo: item.studentRollNo != null ? String(item.studentRollNo) : '',
    contactNo: item.studentContactNo ?? '',
    totalPaidFees: item.totalAmount,
    totalPendingFees: 0,
    refundAmount: item.approvedAmount > 0 ? item.approvedAmount : item.calculatedAmount,
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
    _availableActions: item.availableActions,
    _approvedAmount: item.approvedAmount,
    _settlementId: item.settlements?.find((x) => x.status === 1)?.id,
    _refundMethod: item.refundMethod ?? undefined,
    _expenseCategoryId: item.expenseCategoryId ?? undefined,
    _payingBankAccountId: item.payingBankAccountId ?? undefined,
    _defaultExpenseCategoryId: item.defaultExpenseCategoryId ?? undefined,
    _defaultPayingBankAccountId: item.defaultPayingBankAccountId ?? undefined,
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
  onSubmit,
  onCancel,
  onStartReview,
  onProcess,
  onReverse,
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

  const tabs = useTabs(FeeRefundStatusType.Submitted);

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
      status: Number(tabs.value),
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

  const tabCounts = { [Number(tabs.value)]: refundListData?.totalCount ?? 0 } as Record<
    number,
    number
  >;

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
        getRowAction={(row) =>
          onView
            ? {
                label: `Open ${row.name || 'record'}`,
                onClick: () => {
                  onView?.(row as IStudentFeeData);
                },
              }
            : undefined}
        tableId="student-fee-table"
        isLoading={isLoading || isFetching}
        noDataText={<>No student refund fee data found.</>}
        columns={[
          {
            stickyPosition: 'left',
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
            render: (value) => (value ? `${value}` : '-'),
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
            stickyPosition: 'right',
            excludeFromExport: true,
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            width: 96,
            minWidth: 80,
            sticky: true,
            render(value, row) {
              const actions = row?._availableActions ?? [];
              const isDraft = actions.includes('edit');
              return (
                <Box display="flex" gap={1} alignItems="center">
                  <AdaptiveThreeDotsActions directActionLimit={3}
                    actions={[
                      ...(isDraft
                        ? [
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: 'solar:pen-bold',
                            onClick: () => {
                              onEdit?.(row as IStudentFeeData);
                            },
                          },
                        ]
                        : []),
                      ...(actions.includes('delete')
                        ? [
                          {
                            id: 'delete',
                            label: 'Delete',
                            icon: 'solar:trash-bin-trash-bold',
                            onClick: () => {
                              onDelete?.(row as IStudentFeeData);
                            },
                            color: 'error.main',
                          },
                        ]
                        : []),
                    ]}
                    placement="right-top"
                  />
                  {(actions.includes('approve') || actions.includes('reject')) && (
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
                  {actions.includes('startReview') && (
                    <IconButton
                      size="small"
                      color="info"
                      title="Start review"
                      onClick={() => onStartReview?.(row as IStudentFeeData)}
                    >
                      <Iconify icon="mdi:clipboard-search-outline" width={20} />
                    </IconButton>
                  )}
                  {actions.includes('submit') && (
                    <IconButton
                      size="small"
                      color="primary"
                      title="Submit for review"
                      onClick={() => onSubmit?.(row as IStudentFeeData)}
                    >
                      <Iconify icon="mdi:send-outline" width={20} />
                    </IconButton>
                  )}
                  {(actions.includes('process') || actions.includes('retryProcessing')) && (
                    <IconButton
                      size="small"
                      color="primary"
                      title="Process refund"
                      onClick={() => onProcess?.(row as IStudentFeeData)}
                    >
                      <Iconify icon="mdi:bank-transfer-out" width={20} />
                    </IconButton>
                  )}
                  {actions.includes('reverse') && (
                    <IconButton
                      size="small"
                      color="warning"
                      title="Reverse refund"
                      onClick={() => onReverse?.(row as IStudentFeeData)}
                    >
                      <Iconify icon="mdi:undo-variant" width={20} />
                    </IconButton>
                  )}
                  {actions.includes('cancel') && (
                    <IconButton
                      size="small"
                      color="error"
                      title="Cancel request"
                      onClick={() => onCancel?.(row as IStudentFeeData)}
                    >
                      <Iconify icon="mdi:cancel" width={20} />
                    </IconButton>
                  )}
                </Box>
              );
            },
          },
        ]}
        data={data}
      />
    </>
  );
};

export default StudentFeeRefundTable;
