'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { FeeMonth } from 'src/enums/fee-collection-type';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeAdjustmentQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import {
  Box,
  Card,
  Paper,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

import {
  ADJUSTMENT_STATUS_COLORS,
  formatAdjustmentStatusLabel,
} from '../constants/adjustmentOptions';

import type { IAdjustmentViewProps } from '../types/adjustment.types';

// ─── Info Item ─────────────────────────────────────────────────────────────────

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | number | null;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            mb: 0.2,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.65rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}
        >
          {value ?? 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

const ViewSkeleton = () => (
  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AdjustmentView: React.FC<IAdjustmentViewProps> = ({
  adjustmentId,
  viewMeta,
  onClose,
  onApprove,
  onReject,
  showApprove = false,
  showReject = false,
}) => {
  // ── Fetch detail data inside the view (common hook pattern) ──
  const { data: detail, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeAdjustmentQuery,
    params: adjustmentId,
    options: { skip: !adjustmentId },
  });

  const statusColor = (ADJUSTMENT_STATUS_COLORS[viewMeta.status] ?? 'default') as LabelColor;

  // ── Helper: derive a human-readable month label from 1-based month integer + year ──
  const formatMonthYear = (month: number, year: number): string => {
    // FeeMonth enum is 0-based, API sends 1-based month numbers
    const monthName = FeeMonth[month] ?? `Month ${month}`;
    return `${monthName} ${year}`;
  };

  // ── Source Lines columns ──
  const sourceLinesColumns: IColumn[] = useMemo(
    () => [
      {
        id: 'month',
        label: 'Installment',
        align: 'left',
        render: (_v: number, row: any) => (
          <Typography variant="body2" fontWeight={600}>
            {formatMonthYear(row.month, row.year)}
          </Typography>
        ),
      },
      { id: 'feeHeadName', label: 'Fee Head', align: 'left' },
      {
        id: 'adjustableAmount',
        label: 'Adjustable Amount',
        align: 'left',
        isFilter: true,
        filterType: 'number' as const,
        render: (v: number) => formatNumber(v, 'INR'),
      },
      {
        id: 'paidAmount',
        label: 'Paid Amount',
        align: 'left',
        isFilter: true,
        filterType: 'number' as const,
        render: (v: number) => formatNumber(v, 'INR'),
      },
      {
        id: 'requestedAmount',
        label: 'Requested Amount',
        align: 'left',
        isFilter: true,
        filterType: 'number' as const,
        render: (v: number) => (
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {formatNumber(v, 'INR')}
          </Typography>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Target Allocations columns ──
  const targetAllocColumns: IColumn[] = useMemo(
    () => [
      {
        id: 'month',
        label: 'Installment',
        align: 'left',
        render: (_v: number, row: any) => (
          <Typography variant="body2" fontWeight={600}>
            {formatMonthYear(row.month, row.year)}
          </Typography>
        ),
      },
      { id: 'feeHeadName', label: 'Fee Head', align: 'left' },
      {
        id: 'amount',
        label: 'Applied Amount',
        align: 'left',
        render: (v: number) => (
          <Typography variant="body2" fontWeight={700} color="success.main">
            {formatNumber(v, 'INR')}
          </Typography>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (isLoading || !detail) {
    return <ViewSkeleton />;
  }

  const requestedDate = new Date(detail.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const summaryItems = [
    {
      label: 'Voucher No.',
      value: detail.voucherNumber,
    },
    {
      label: 'Applied Amount',
      value: formatNumber(detail.appliedAmount, 'INR'),
    },
    {
      label: 'Remaining Amount',
      value: formatNumber(detail.remainingAmount, 'INR'),
    },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        {/* ── Student Info Card ──────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
          {/* Header row: Name + Status */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify
                icon="mdi:account-circle-outline"
                width={20}
                sx={{ color: 'primary.main' }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {detail.studentName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GR No: {detail.studentGrNo ?? 'N/A'}&nbsp;·&nbsp;
                  {detail.className}
                  {detail.divisionName ? ` / ${detail.divisionName}` : ''}
                  {detail.rollNo ? ` · Roll ${detail.rollNo}` : ''}
                </Typography>
              </Box>
            </Box>
            <Label color={statusColor} sx={{ fontWeight: 700, fontSize: 13 }}>
              {formatAdjustmentStatusLabel(detail.status)}
            </Label>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          {/* Info grid row 1: Contact, Requested By, Processed By, Type */}
          <Box display="flex" flexWrap="wrap" gap={1} mb={1.5}>
            {detail.contactNo && (
              <InfoItem icon="mdi:phone-outline" label="Contact No." value={detail.contactNo} />
            )}
            <InfoItem
              icon="mdi:account-tie-outline"
              label="Requested By"
              value={detail.requestedByName}
            />
            {detail.processedByName && (
              <InfoItem
                icon="mdi:check-decagram-outline"
                label="Processed By"
                value={detail.processedByName}
              />
            )}
            {detail.processedAt && (
              <InfoItem
                icon="mdi:calendar-check-outline"
                label="Processed Date"
                value={new Date(detail.processedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            )}
            <InfoItem
              icon="mdi:cash-multiple"
              label="Requested Amount"
              value={formatNumber(detail.requestedAmount, 'INR')}
            />
            <InfoItem icon="mdi:calendar-outline" label="Requested Date" value={requestedDate} />
            {detail.reason && (
              <InfoItem icon="mdi:comment-text-outline" label="Reason" value={detail.reason} />
            )}
          </Box>
        </Paper>

        {/* ── Approver / Rejection Notes ───────────────── */}
        {(detail.approverNotes || detail.rejectionReason) && (
          <Stack spacing={1.5} mb={1.5}>
            {detail.approverNotes && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                  letterSpacing={1}
                  display="block"
                  mb={0.5}
                >
                  Approver Notes
                </Typography>
                <Typography variant="body2">{detail.approverNotes}</Typography>
              </Card>
            )}
            {detail.rejectionReason && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2, borderColor: 'error.light' }}>
                <Typography
                  variant="caption"
                  color="error.main"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing={1}
                  display="block"
                  mb={0.5}
                >
                  Rejection Reason
                </Typography>
                <Typography variant="body2" color="error.dark">
                  {detail.rejectionReason}
                </Typography>
              </Card>
            )}
          </Stack>
        )}

        {/* ── Source Lines (Fee lines requested for adjustment) ── */}
        {detail.sourceLines && detail.sourceLines.length > 0 && (
          <Paper variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" gap={1} px={2} pt={1.5} pb={1}>
              <Iconify icon="mdi:cash-refund" width={18} sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Source Fee Lines
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fee installments included in this adjustment request
                </Typography>
              </Box>
            </Stack>
            <CustomizableTable
              tableId="adjustment-source-lines-table"
              columns={sourceLinesColumns}
              data={detail.sourceLines}
              isPagination={false}
              isFilter
              isSearch={false}
              noDataText="No source lines"
              wrapperProps={{ minHeight: 'unset' }}
            />
          </Paper>
        )}

        {/* ── Target Allocations (Applied fee relief) ── */}
        {detail.targetAllocations && detail.targetAllocations.length > 0 && (
          <Paper variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" gap={1} px={2} pt={1.5} pb={1}>
              <Iconify icon="mdi:check-circle-outline" width={18} sx={{ color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Applied Allocations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fee dues relieved by this adjustment
                </Typography>
              </Box>
            </Stack>
            <CustomizableTable
              tableId="adjustment-target-allocations-table"
              columns={targetAllocColumns}
              data={detail.targetAllocations}
              isPagination={false}
              isFilter={false}
              isSearch={false}
              noDataText="No allocations applied yet"
              wrapperProps={{ minHeight: 'unset' }}
            />
          </Paper>
        )}
      </Scrollbar>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Close
        </Button>

        {showReject && (
          <Button
            variant="soft"
            color="error"
            size="small"
            startIcon={<Iconify icon="mdi:close-circle-outline" />}
            onClick={onReject}
          >
            Reject
          </Button>
        )}
        {showApprove && (
          <Button
            variant="soft"
            color="success"
            size="small"
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            onClick={onApprove}
          >
            Approve & Apply
          </Button>
        )}
      </DialogActions>
    </Box>
  );
};

export default AdjustmentView;
