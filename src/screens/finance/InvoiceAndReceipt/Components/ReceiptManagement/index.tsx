import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  FeeReceiptListItem,
  GetFeeReceiptListParams,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { FeeMonth } from 'src/enums/fee-collection-type';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  FeeReceiptKind,
  FEE_RECEIPT_KIND_LABELS,
  useGetFeeReceiptListQuery,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import ReceiptPreviewDialog from './Components/ReceiptPreviewDialog';

const RECEIPT_KIND_OPTIONS = [
  { label: 'All', value: 'All' },
  { label: FEE_RECEIPT_KIND_LABELS[FeeReceiptKind.FinalFee], value: FeeReceiptKind.FinalFee },
  {
    label: FEE_RECEIPT_KIND_LABELS[FeeReceiptKind.ProvisionalFee],
    value: FeeReceiptKind.ProvisionalFee,
  },
  {
    label: FEE_RECEIPT_KIND_LABELS[FeeReceiptKind.ProvisionalCharge],
    value: FeeReceiptKind.ProvisionalCharge,
  },
];

const DEFAULT_PAGE_SIZE = 20;

const getAcademicYearMonthOptions = (data: { month: number; year: number }[] | undefined) => [
  { label: 'All', value: 'All' },
  ...(data?.map((item) => ({
    label: `${FeeMonth[item.month]}-${item.year}`,
    value: `${item.month}-${item.year}`,
  })) ?? []),
];

const ReceiptManagement = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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

  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<string>('All');

  // ── Pagination state ──────────────────────────────────────────────────────

  const [skipCount, setSkipCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(DEFAULT_PAGE_SIZE);

  // ── Academic year months from API ─────────────────────────────────────────

  const {
    data: academicYearMonthsData,
    isLoading: isMonthsLoading,
    isFetching: isMonthsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicYearMonthsQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id },
  });

  const monthOptions = useMemo(
    () => getAcademicYearMonthOptions(academicYearMonthsData),
    [academicYearMonthsData]
  );

  // ── Preview state ──────────────────────────────────────────────────────────

  const [previewReceiptId, setPreviewReceiptId] = useState<string | null>(null);

  const resetPagination = useCallback(() => setSkipCount(0), []);

  const handleBoardChange = useCallback(
    (boardId: string) => {
      setSelectedBoard(boardId);
      resetPagination();
    },
    [resetPagination, setSelectedBoard]
  );

  const handleMediumChange = useCallback(
    (mediumId: string) => {
      setSelectedMedium(mediumId);
      resetPagination();
    },
    [resetPagination, setSelectedMedium]
  );

  const handleClassChange = useCallback(
    (standardId: string) => {
      setSelectedStandardId(standardId);
      resetPagination();
    },
    [resetPagination, setSelectedStandardId]
  );

  const handleDivisionChange = useCallback(
    (divisionId: string) => {
      setSelectedDivisionId(divisionId);
      resetPagination();
    },
    [resetPagination, setSelectedDivisionId]
  );

  // ── RTK Query ─────────────────────────────────────────────────────────────

  const queryParams = useMemo<GetFeeReceiptListParams | null>(() => {
    if (!currentYear?.id || !isReady || !filterPayload) return null;
    return {
      academicYearId: currentYear.id,
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      standardId: filterPayload.standardId,
      divisionId: filterPayload.divisionId,
      month:
        selectedMonth && selectedMonth !== 'All' ? Number(selectedMonth.split('-')[0]) : undefined,
      receiptKind:
        selectedKind && selectedKind !== 'All'
          ? (Number(selectedKind) as FeeReceiptKind)
          : undefined,
      skipCount,
      maxResultCount,
    };
  }, [
    currentYear?.id,
    isReady,
    filterPayload,
    selectedMonth,
    selectedKind,
    skipCount,
    maxResultCount,
  ]);

  const {
    data,
    isLoading: isReceiptListLoading,
    isFetching: isReceiptListFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeReceiptListQuery,
    params: queryParams,
    options: { skip: queryParams === null },
  });

  const tableData: FeeReceiptListItem[] = data?.items ?? [];
  const totalCount: number = data?.totalCount ?? 0;

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'receiptNumber',
        label: 'Receipt No.',
        align: 'left',
        width: 140,
        minWidth: 120,
        maxWidth: 160,
        sticky: true,
      },
      {
        id: 'studentName',
        label: 'Name(Gr No.)',
        align: 'left',
        width: 150,
        minWidth: 150,
        maxWidth: 200,
        sticky: true,
        render: (value, row) => (row.grNo ? `${value} (${row.grNo})` : value),
      },
      {
        id: 'receiptKind',
        label: 'Receipt Type',
        align: 'left',
        width: 140,
        minWidth: 140,
        maxWidth: 200,
        sticky: true,
        render: (value) => FEE_RECEIPT_KIND_LABELS[value as FeeReceiptKind] ?? '—',
      },
      {
        id: 'rollNo',
        label: 'Roll No.',
        align: 'left',
        width: 96,
        minWidth: 100,
        maxWidth: 120,
        render: (value) => value ?? '—',
      },
      {
        id: 'totalPaidAmount',
        label: 'Paid Amount',
        align: 'left',
        width: 120,
        minWidth: 100,
        filterType: 'number',
        maxWidth: 160,
        render: (value) => `₹ ${formatNumber(value ?? 0)}`,
      },
      {
        id: 'receiptDate',
        label: 'Receipt Date',
        align: 'left',
        width: 120,
        filterType: 'date',
        minWidth: 110,
        maxWidth: 160,
        render: (value) => {
          const d = new Date(value);
          return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
        },
      },
      {
        id: 'actions',
        label: 'Action',
        isFilter: false,
        isSort: false,
        sticky: true,
        width: 80,
        minWidth: 64,
        render(_value: any, row: any) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              showViewIcon
              handleViewClick={() => setPreviewReceiptId(row.id)}
            />
          );
        },
      },
    ],
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1.5}
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
          mb: 1,
          p: 1,
        }}
      >
        <FinanceAcademicContextFilter
          boards={boards}
          mediums={mediums}
          selectedBoard={selectedBoard}
          selectedMedium={selectedMedium}
          onBoardChange={handleBoardChange}
          onMediumChange={handleMediumChange}
        />
        <FinanceClassDivisionFilter
          classOptions={classOptions}
          divisionOptions={divisionOptions}
          selectedStandardId={selectedStandardId}
          selectedDivisionId={selectedDivisionId}
          isDivisionDisabled={isDivisionDisabled}
          onClassChange={handleClassChange}
          onDivisionChange={handleDivisionChange}
          classesLoading={classesLoading}
        />
        <CustomSelect
          options={monthOptions}
          label="Month"
          value={selectedMonth}
          onChange={(val) => {
            setSelectedMonth(val as string);
            resetPagination();
          }}
          labelKey="label"
          valueKey="value"
          isLoading={isMonthsLoading || isMonthsFetching}
          formControlProps={{ sx: { maxWidth: 160, width: '100%' } }}
        />
        <CustomSelect
          options={RECEIPT_KIND_OPTIONS}
          label="Receipt Type"
          value={selectedKind}
          onChange={(val) => {
            setSelectedKind(val as string);
            resetPagination();
          }}
          labelKey="label"
          valueKey="value"
          formControlProps={{ sx: { maxWidth: 160, width: '100%' } }}
        />
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <CustomizableTable
        tableId="fee-receipts"
        columns={columns}
        data={tableData}
        isLoading={isReceiptListLoading || isReceiptListFetching}
        serverSide
        onServerPagination={(page: number, rowsPerPage: number) => {
          setSkipCount(page * rowsPerPage);
          setMaxResultCount(rowsPerPage);
        }}
        totalCount={totalCount}
        maxServerRowsPerPage={maxResultCount}
        noDataText={
          !isReady ? (
            <>Select a Board and Medium to view receipts</>
          ) : (
            <>No receipts found for the selected filters</>
          )
        }
      />

      {/* ── Preview dialog ────────────────────────────────────────────────────── */}
      {previewReceiptId && (
        <ReceiptPreviewDialog
          receiptId={previewReceiptId}
          onClose={() => setPreviewReceiptId(null)}
        />
      )}
    </Box>
  );
};

export default ReceiptManagement;
