'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { FeeRefundRequestDto } from 'src/redux/finance/RefundManagement/feeRefundManage';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Tab, Card, Tabs, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import FinanceListActionRow from 'src/screens/finance/components/FinanceListActionRow';
import { useGetFeeRefundsQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';

import { serializeRefundWorklistFilters } from './refundWorklistFilters';

import type { IStudentFeeData } from '../type';

const STATUSES = [
  { value: FeeRefundStatusType.Pending, label: 'Pending', color: 'warning' },
  { value: FeeRefundStatusType.Approved, label: 'Approved', color: 'info' },
  { value: FeeRefundStatusType.Processed, label: 'Completed', color: 'success' },
  { value: FeeRefundStatusType.Rejected, label: 'Rejected', color: 'error' },
  { value: FeeRefundStatusType.Failed, label: 'Failed', color: 'error' },
] as const;

const historicalLabels: Record<number, string> = {
  0: 'Submitted',
  1: 'Under review',
  2: 'Approved',
  3: 'Rejected',
  4: 'Cancelled',
  5: 'Draft',
  6: 'Processing',
  7: 'Completed',
  8: 'Failed',
  9: 'Reversed',
};

type WorklistProps = {
  primaryAction?: React.ReactNode;
  filters: ReturnType<typeof useFinanceAcademicFilters>;
  onView: (row: IStudentFeeData) => void;
  onEdit: (row: IStudentFeeData) => void;
  onApprove: (row: IStudentFeeData) => void;
  onReject: (row: IStudentFeeData) => void;
  onRecord: (row: IStudentFeeData) => void;
  onReplace: (row: IStudentFeeData) => void;
  onReturn: (row: IStudentFeeData) => void;
};

function toRow(item: FeeRefundRequestDto, index: number): IStudentFeeData {
  const payout = item.settlements?.[item.settlements.length - 1];
  return {
    id: index + 1,
    name: item.studentName || item.studentId,
    board: item.boardName ?? '',
    medium: item.educationMediumName ?? '',
    class: item.standardName ?? '',
    division: item.divisionName ?? '',
    classDivision: `${item.standardName || '—'} / ${item.divisionName || '—'}`,
    grNo: String(item.studentGrNo ?? ''),
    rollNo: String(item.studentRollNo ?? ''),
    totalPaidFees: 0,
    totalPendingFees: 0,
    refundAmount: item.approvedAmount || item.calculatedAmount,
    refundMethod: item.refundMethod ?? '',
    status: item.status,
    requestDate: item.submittedAt || item.creationTime,
    _refundRequestId: item.id,
    _studentId: item.studentId,
    _availableActions: item.availableActions,
    _approvedAmount: item.approvedAmount,
    _refundMethod: item.refundMethod ?? undefined,
    _allowedPayoutMethods: item.allowedPayoutMethods,
    _expenseCategoryId: item.expenseCategoryId ?? undefined,
    _payingBankAccountId: item.payingBankAccountId ?? undefined,
    _defaultExpenseCategoryId: item.defaultExpenseCategoryId ?? undefined,
    _defaultPayingBankAccountId: item.defaultPayingBankAccountId ?? undefined,
    _settlementId: payout?.id,
    _voucherNumber: item.voucherNumber,
    _receiptNumber: item.originalReceiptNumber ?? '',
    _payoutPending: payout?.status === 0,
    _payoutReference: payout?.externalReference,
    _paymentDate: payout?.settlementDate,
    _workflowVersion: item.workflowVersion,
  };
}

export default function RefundWorklist({
  primaryAction,
  filters,
  onView,
  onEdit,
  onApprove,
  onReject,
  onRecord,
  onReplace,
  onReturn,
}: WorklistProps) {
  const [status, setStatus] = useState<FeeRefundStatusType>(FeeRefundStatusType.Pending);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const serializedFilters = useMemo(
    () => serializeRefundWorklistFilters(columnFilters),
    [columnFilters]
  );
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  useEffect(() => {
    setPage(0);
  }, [
    currentYear?.id,
    filters.filterPayload?.educationMediumId,
    filters.filterPayload?.standardId,
    filters.filterPayload?.divisionId,
  ]);
  const {
    currentData: data,
    isLoading,
    isFetching,
    isError,
  } = useGetFeeRefundsQuery(
    {
      academicYearId: currentYear?.id,
      academicMediumId: filters.filterPayload?.educationMediumId,
      standardId: filters.filterPayload?.standardId,
      divisionId: filters.filterPayload?.divisionId,
      status,
      legacyHistory: false,
      workflowVersion: 1,
      search,
      filters: serializedFilters,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !filters.isReady || !currentYear?.id }
  );
  const counts = STATUSES.map((entry) => ({
    status: entry.value,
    args: {
      academicYearId: currentYear?.id,
      academicMediumId: filters.filterPayload?.educationMediumId,
      standardId: filters.filterPayload?.standardId,
      divisionId: filters.filterPayload?.divisionId,
      status: entry.value,
      legacyHistory: false,
      workflowVersion: 1,
      search,
      filters: serializedFilters,
      skipCount: 0,
      maxResultCount: 1,
    },
  }));
  const pending = useGetFeeRefundsQuery(counts[0].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const approved = useGetFeeRefundsQuery(counts[1].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const processed = useGetFeeRefundsQuery(counts[2].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const rejected = useGetFeeRefundsQuery(counts[3].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const failed = useGetFeeRefundsQuery(counts[4].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const tabCounts = [
    pending.data?.totalCount,
    approved.data?.totalCount,
    processed.data?.totalCount,
    rejected.data?.totalCount,
    failed.data?.totalCount,
  ];
  const rows = useMemo(() => (data?.items ?? []).map(toRow), [data?.items]);
  const action = (
    row: IStudentFeeData,
    name: string,
    icon: string,
    handler: (row: IStudentFeeData) => void
  ) => ({ id: name, label: `${name} for ${row.name}`, icon, onClick: () => handler(row) });

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column', gap: 1 }}>
      <Card sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <FinanceAcademicContextFilter
          boards={filters.boards}
          mediums={filters.mediums}
          selectedBoard={filters.selectedBoard}
          selectedMedium={filters.selectedMedium}
          onBoardChange={filters.setSelectedBoard}
          onMediumChange={filters.setSelectedMedium}
          selectSx={{ maxWidth: '248px', width: '100%' }}
        />
        <FinanceClassDivisionFilter
          classOptions={filters.classOptions}
          divisionOptions={filters.divisionOptions}
          selectedStandardId={filters.selectedStandardId}
          selectedDivisionId={filters.selectedDivisionId}
          isDivisionDisabled={filters.isDivisionDisabled}
          onClassChange={filters.setSelectedStandardId}
          onDivisionChange={filters.setSelectedDivisionId}
          classesLoading={filters.classesLoading}
          selectSx={{ maxWidth: '248px', width: '100%' }}
        />
      </Card>
      <FinanceListActionRow action={primaryAction}>
        <Tabs
          value={status}
          onChange={(_, value) => {
            setStatus(value);
            setPage(0);
            setColumnFilters((current) => current.filter((filter) => filter.column !== 'status'));
          }}
          variant="scrollable"
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
            px: 1,
          }}
        >
          {STATUSES.map((entry, index) => (
            <Tab
              key={entry.value}
              value={entry.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {entry.label}
                  <Label color={entry.color}>{tabCounts[index] ?? 0}</Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </FinanceListActionRow>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          getRowAction={(row) => ({
            label: `Open refund for ${row.name}`,
            onClick: () => onView(row as IStudentFeeData),
          })}
          tableId="fee-refunds"
          tableTitle="Fee refunds"
          data={rows}
          columns={(
            [
              {
                id: 'name',
                label: 'Student (GR No.)',
                minWidth: 180,
                sticky: true,
                stickyPosition: 'left',
                filterType: 'string',
                isFilter: true,
                isSort: false,
                render: (value, row) => (
                  <Typography variant="body2">
                    {value}
                    {row.grNo && (
                      <Box component="span" sx={{ display: 'block' }}>
                        ({row.grNo})
                      </Box>
                    )}
                  </Typography>
                ),
              },
              {
                id: '_voucherNumber',
                label: 'Refund no.',
                minWidth: 135,
                filterType: 'string',
                isFilter: true,
                isSort: false,
              },
              {
                id: 'classDivision',
                label: 'Class / Division',
                minWidth: 150,
                filterType: 'string',
                isFilter: true,
                isSort: false,
              },
              {
                id: '_receiptNumber',
                label: 'Original receipt',
                minWidth: 150,
                filterType: 'string',
                isFilter: true,
                isSort: false,
              },
              {
                id: 'refundAmount',
                label: 'Amount',
                minWidth: 125,
                filterType: 'formattedNumber',
                isFilter: true,
                isSort: false,
                render: (value) => (value == null ? '—' : `₹${fNumber(value)}`),
              },
              {
                id: 'refundMethod',
                label: 'Method',
                minWidth: 130,
                filterType: 'string',
                isFilter: true,
                isSort: false,
              },
              {
                id: 'requestDate',
                label: 'Requested',
                minWidth: 115,
                filterType: 'date',
                isFilter: true,
                isSort: false,
                render: (value) => (value ? fDate(value, 'DD-MM-YYYY') : '—'),
              },
              {
                id: 'status',
                label: 'Status',
                minWidth: 125,
                sticky: true,
                stickyPosition: 'right',
                filterType: 'enum',
                isFilter: true,
                isSort: false,
                enumOptions: STATUSES.map(({ value, label }) => ({ value, label })),
                render: (value, row) => {
                  const entry = STATUSES.find((item) => item.value === value);
                  return (
                    <Box>
                      <Label
                        color={row._workflowVersion === 0 ? 'default' : (entry?.color ?? 'default')}
                      >
                        {row._workflowVersion === 0
                          ? (historicalLabels[Number(value)] ?? 'Historical')
                          : (entry?.label ?? 'Historical')}
                      </Label>
                    </Box>
                  );
                },
              },
              {
                align: 'left',
                id: 'actions',
                label: 'Actions',
                sticky: true,
                stickyPosition: 'right',
                isFilter: false,
                isSort: false,
                excludeFromExport: true,
                minWidth: 150,
                render: (_, row) => {
                  const actions: string[] = row._availableActions ?? [];
                  const refund = row as IStudentFeeData;
                  return (
                    <AdaptiveThreeDotsActions
                      directActionLimit={3}
                      moreLabel={`More refund actions for ${row.name}`}
                      placement="right-top"
                      actions={[
                        ...(actions.includes('edit')
                          ? [action(refund, 'Edit', 'solar:pen-bold', onEdit)]
                          : []),
                        ...(actions.includes('approve')
                          ? [action(refund, 'Approve', 'mdi:approve', onApprove)]
                          : []),
                        ...(actions.includes('reject') &&
                        (refund.status === FeeRefundStatusType.Pending ||
                          refund.status === FeeRefundStatusType.UnderReview)
                          ? [action(refund, 'Reject', 'mdi:close', onReject)]
                          : []),
                        ...(actions.includes('recordPayout')
                          ? [action(refund, 'Record payment', 'mdi:bank-transfer-out', onRecord)]
                          : []),
                        ...(actions.includes('createReplacement')
                          ? [action(refund, 'Create linked request', 'mdi:content-copy', onReplace)]
                          : []),
                        ...(actions.includes('returnPayout')
                          ? [
                              action(
                                refund,
                                'Record returned payment',
                                'mdi:undo-variant',
                                onReturn
                              ),
                            ]
                          : []),
                      ]}
                    />
                  );
                },
              },
            ] satisfies IColumn[]
          ).filter(
            (column) =>
              ![
                FeeRefundStatusType.Processed,
                FeeRefundStatusType.Rejected,
                FeeRefundStatusType.Failed,
              ].includes(status) || column.id !== 'actions'
          )}
          isLoading={isLoading || isFetching}
          noDataText={isError ? 'Could not load refunds. Retry the page.' : 'No refunds found.'}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideFilter
          filters={columnFilters}
          onServerFilter={(nextFilters) => {
            setColumnFilters(nextFilters);
            setPage(0);
          }}
          totalCount={data?.totalCount ?? 0}
          page={page}
          rowsPerPage={pageSize}
          searchTerm={search}
          onServerPagination={(nextPage, nextSize) => {
            setPage(nextPage - 1);
            setPageSize(nextSize);
          }}
          onServerSearch={(value) => {
            setSearch(value);
            setPage(0);
          }}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, width: '100%' } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
    </Box>
  );
}
