'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';
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
import { useGetFeeRefundsQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';

import { serializeRefundWorklistFilters } from './refundWorklistFilters';

import type { IStudentFeeData } from '../type';

const STATUSES = [
  { value: FeeRefundStatusType.Pending, label: 'Pending', color: 'warning' },
  { value: FeeRefundStatusType.Approved, label: 'Approved', color: 'info' },
  { value: FeeRefundStatusType.Processed, label: 'Processed', color: 'success' },
  { value: FeeRefundStatusType.Rejected, label: 'Rejected', color: 'error' },
  { value: FeeRefundStatusType.Failed, label: 'Failed', color: 'error' },
  { value: -1, label: 'History', color: 'default' },
] as const;

const historicalLabels: Record<number, string> = {
  0: 'Submitted',
  1: 'Under review',
  2: 'Approved',
  3: 'Rejected',
  4: 'Cancelled',
  5: 'Draft',
  6: 'Processing',
  7: 'Processed',
  8: 'Failed',
  9: 'Reversed',
};

type WorklistProps = {
  filters: ReturnType<typeof useFinanceAcademicFilters>;
  onView: (row: IStudentFeeData) => void;
  onApprove: (row: IStudentFeeData) => void;
  onReject: (row: IStudentFeeData) => void;
  onRecord: (row: IStudentFeeData) => void;
  onVerify: (row: IStudentFeeData) => void;
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
    _workflowVersion: item.workflowVersion,
  };
}

export default function RefundWorklist({
  filters,
  onView,
  onApprove,
  onReject,
  onRecord,
  onVerify,
  onReplace,
  onReturn,
}: WorklistProps) {
  const [status, setStatus] = useState<FeeRefundStatusType | -1>(FeeRefundStatusType.Pending);
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
      status: status === -1 ? undefined : status,
      legacyHistory: status === -1,
      workflowVersion: status === -1 ? 0 : 1,
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
      status: entry.value === -1 ? undefined : entry.value,
      legacyHistory: entry.value === -1,
      workflowVersion: entry.value === -1 ? 0 : 1,
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
  const history = useGetFeeRefundsQuery(counts[5].args, {
    skip: !filters.isReady || !currentYear?.id,
  });
  const tabCounts = [
    pending.data?.totalCount,
    approved.data?.totalCount,
    processed.data?.totalCount,
    rejected.data?.totalCount,
    failed.data?.totalCount,
    history.data?.totalCount,
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
      <Card sx={{ p: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FinanceAcademicContextFilter
          boards={filters.boards}
          mediums={filters.mediums}
          selectedBoard={filters.selectedBoard}
          selectedMedium={filters.selectedMedium}
          onBoardChange={filters.setSelectedBoard}
          onMediumChange={filters.setSelectedMedium}
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
        />
      </Card>
      <Card sx={{ px: 1 }}>
        <Tabs
          value={status}
          onChange={(_, value) => {
            setStatus(value);
            setPage(0);
            setColumnFilters((current) => current.filter((filter) => filter.column !== 'status'));
          }}
          variant="scrollable"
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
      </Card>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="fee-refunds"
          tableTitle="Fee refunds"
          data={rows}
          columns={[
            {
              id: '_voucherNumber',
              label: 'Refund no.',
              minWidth: 135,
              filterType: 'string',
              isFilter: true,
              isSort: false,
            },
            {
              id: 'name',
              label: 'Student',
              minWidth: 180,
              filterType: 'string',
              isFilter: true,
              isSort: false,
              render: (value, row) => (
                <Typography variant="body2">
                  {value} {row.grNo ? `(${row.grNo})` : ''}
                </Typography>
              ),
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
              enumOptions:
                status === -1
                  ? Object.entries(historicalLabels).map(([value, label]) => ({
                      value: Number(value),
                      label,
                    }))
                  : STATUSES.filter((entry) => entry.value !== -1).map(({ value, label }) => ({
                      value,
                      label,
                    })),
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
                    {row._payoutPending && (
                      <Typography variant="caption" display="block">
                        Awaiting verification
                      </Typography>
                    )}
                  </Box>
                );
              },
            },
            {
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
                    moreLabel={`More refund actions for ${row.name}`}
                    placement="right-top"
                    actions={[
                      action(refund, 'View', 'mdi:eye', onView),
                      ...(actions.includes('approve')
                        ? [action(refund, 'Approve', 'mdi:approve', onApprove)]
                        : []),
                      ...(actions.includes('reject')
                        ? [action(refund, 'Reject', 'mdi:close', onReject)]
                        : []),
                      ...(actions.includes('recordPayout')
                        ? [action(refund, 'Record payment', 'mdi:bank-transfer-out', onRecord)]
                        : []),
                      ...(actions.includes('confirmPayout')
                        ? [action(refund, 'Confirm outcome', 'mdi:check-circle-outline', onVerify)]
                        : []),
                      ...(actions.includes('createReplacement')
                        ? [action(refund, 'Create linked request', 'mdi:content-copy', onReplace)]
                        : []),
                      ...(actions.includes('returnPayout')
                        ? [action(refund, 'Record returned payment', 'mdi:undo-variant', onReturn)]
                        : []),
                    ]}
                  />
                );
              },
            },
          ]}
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
            setPage(nextPage);
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
