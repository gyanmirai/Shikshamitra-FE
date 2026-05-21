import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';
import type {
  FeeReceiptListItem,
  GetFeeReceiptListParams,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import { useSelector } from 'react-redux';
import { Box, Chip } from '@mui/material';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  FeeReceiptKind,
  FEE_RECEIPT_KIND_COLORS,
  FEE_RECEIPT_KIND_LABELS,
  useGetFeeReceiptListQuery,
  FeeReceiptVerificationStatus,
  FEE_RECEIPT_VERIFICATION_LABELS,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import ReceiptPreviewDialog from './Components/ReceiptPreviewDialog';

// ── Month options ─────────────────────────────────────────────────────────────

const MONTHS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const RECEIPT_KIND_OPTIONS = [
  { label: 'All Types', value: '' },
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

const ReceiptManagement = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // ── Filter state ──────────────────────────────────────────────────────────

  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedKind, setSelectedKind] = useState<string>('');

  // ── Pagination state ──────────────────────────────────────────────────────

  const [skipCount, setSkipCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(DEFAULT_PAGE_SIZE);

  // ── Preview state ──────────────────────────────────────────────────────────

  const [previewReceiptId, setPreviewReceiptId] = useState<string | null>(null);

  // ── Board/Medium cascade from global state ────────────────────────────────

  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear?.boards]);

  useEffect(() => {
    const board = boards.find((b: Board) => b.id === selectedBoard);
    setMediums(board?.educationMediums || []);
    setSelectedMedium('');
  }, [boards, selectedBoard]);

  const resetPagination = useCallback(() => setSkipCount(0), []);

  // ── RTK Query ─────────────────────────────────────────────────────────────

  const queryParams = useMemo<GetFeeReceiptListParams | null>(() => {
    if (!currentYear?.id || !selectedBoard || !selectedMedium) return null;
    return {
      academicYearId: currentYear.id,
      boardId: selectedBoard,
      educationMediumId: selectedMedium,
      month: selectedMonth ? Number(selectedMonth) : undefined,
      receiptKind: selectedKind ? (Number(selectedKind) as FeeReceiptKind) : undefined,
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

  const { data, isFetching } = useGetFeeReceiptListQuery(queryParams!, {
    skip: queryParams === null,
  });

  const tableData: FeeReceiptListItem[] = data?.items ?? [];
  const totalCount: number = data?.totalCount ?? 0;

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        id: 'receiptNumber',
        label: 'Receipt No.',
        renderCell: (value: string, row: FeeReceiptListItem) => (
          <Box
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setPreviewReceiptId(row.id)}
          >
            {value}
          </Box>
        ),
      },
      {
        id: 'receiptKind',
        label: 'Receipt Type',
        renderCell: (value: FeeReceiptKind, row: FeeReceiptListItem) => (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Label variant="soft" color={FEE_RECEIPT_KIND_COLORS[value] as LabelColor}>
              {FEE_RECEIPT_KIND_LABELS[value] ?? row.receiptKindLabel}
            </Label>
            {row.verificationStatus !== FeeReceiptVerificationStatus.NotApplicable &&
              row.verificationStatus !== FeeReceiptVerificationStatus.PendingVerification && (
                <Chip
                  size="small"
                  label={FEE_RECEIPT_VERIFICATION_LABELS[row.verificationStatus]}
                  color={
                    row.verificationStatus === FeeReceiptVerificationStatus.Verified
                      ? 'success'
                      : 'error'
                  }
                  sx={{ height: 18, fontSize: 10 }}
                />
              )}
          </Box>
        ),
      },
      {
        id: 'studentName',
        label: 'Student Name',
        renderCell: (value: string, row: FeeReceiptListItem) => (
          <Box>
            <Box fontWeight={600}>{value}</Box>
            {row.grNo && (
              <Box component="span" fontSize={11} color="text.secondary">
                GR: {row.grNo}
              </Box>
            )}
          </Box>
        ),
      },
      {
        id: 'rollNo',
        label: 'Roll No.',
        renderCell: (value: string | null) => value ?? '—',
      },
      {
        id: 'totalPaidAmount',
        label: 'Paid Amount',
        renderCell: (value: number) =>
          `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
      {
        id: 'receiptDate',
        label: 'Receipt Date',
        renderCell: (value: string) => {
          const d = new Date(value);
          return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
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
          p: 1.5,
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
          options={[{ label: 'All Months', value: '' }, ...MONTHS]}
          label="Month"
          value={selectedMonth}
          onChange={(val) => {
            setSelectedMonth(val as string);
            resetPagination();
          }}
          labelKey="label"
          valueKey="value"
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
        isLoading={isFetching}
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
