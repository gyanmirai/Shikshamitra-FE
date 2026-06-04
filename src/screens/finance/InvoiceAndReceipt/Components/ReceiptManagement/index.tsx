import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
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
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
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

  // ── Filter state ──────────────────────────────────────────────────────────

  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
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

  // ── Board/Medium cascade from global state ────────────────────────────────
  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
      setSelectedBoard(currentYear.boards[0].id);
      setSelectedMedium(currentYear.boards[0].educationMediums[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear.boards]);
  // State to store the selected student concession data
  // null when no student is selected
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);

    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  const resetPagination = useCallback(() => setSkipCount(0), []);

  // ── RTK Query ─────────────────────────────────────────────────────────────

  const queryParams = useMemo<GetFeeReceiptListParams | null>(() => {
    if (!currentYear?.id || !selectedBoard || !selectedMedium) return null;
    return {
      academicYearId: currentYear.id,
      boardId: selectedBoard,
      educationMediumId: selectedMedium,
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
    selectedBoard,
    selectedMedium,
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
        <CustomSelect
          options={boards}
          label="Board *"
          value={selectedBoard}
          onChange={(val) => {
            setSelectedBoard(val as string);
            resetPagination();
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: 180, width: '100%' } }}
        />
        <CustomSelect
          options={mediums}
          label="Medium *"
          value={selectedMedium}
          onChange={(val) => {
            setSelectedMedium(val as string);
            resetPagination();
          }}
          labelKey="name"
          valueKey="id"
          disabled={!selectedBoard}
          formControlProps={{ sx: { maxWidth: 180, width: '100%' } }}
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
          formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
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
          !selectedBoard || !selectedMedium ? (
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
