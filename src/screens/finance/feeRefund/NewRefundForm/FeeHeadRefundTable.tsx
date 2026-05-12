'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Alert, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import FeeHeadGroup from './feeHeadRefundTable/FeeHeadGroup';
import OverallSummaryCard from './feeHeadRefundTable/OverallSummaryCard';
import RefundTableSkeleton from './feeHeadRefundTable/RefundTableSkeleton';

import type { RefundFormik, IFeeHeadPayment } from './types';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
// TODO: Replace with API call → useGetStudentFeePaymentsQuery(studentId)

const DUMMY_REFUND_FEE_HEAD_WISE: IFeeHeadPayment[] = [
  {
    feeHeadId: 'fh-1',
    feeHeadName: 'Tuition Fee',
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 3000,
        refunded: 1000,
        status: FeeCollectionStatusType.Partial,
      },
      { month: 'May', total: 3000, paid: 3000, refunded: 0, status: FeeCollectionStatusType.Paid },
      {
        month: 'June',
        total: 3000,
        paid: 3000,
        refunded: 1000,
        status: FeeCollectionStatusType.Partial,
      },
    ],
  },
  {
    feeHeadId: 'fh-2',
    feeHeadName: 'Hostel Fee',
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 3000,
        refunded: 0,
        status: FeeCollectionStatusType.Paid,
      },
      { month: 'May', total: 3000, paid: 3000, refunded: 0, status: FeeCollectionStatusType.Paid },
    ],
  },
  {
    feeHeadId: 'fh-3',
    feeHeadName: 'Exam Fee',
    items: [
      {
        month: 'April',
        total: 1200,
        paid: 1200,
        refunded: 0,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'August',
        total: 1200,
        paid: 800,
        refunded: 0,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'December',
        total: 1200,
        paid: 1200,
        refunded: 1200,
        status: FeeCollectionStatusType.Paid,
      },
    ],
  },
  {
    feeHeadId: 'fh-4',
    feeHeadName: 'Transport Fee',
    items: [
      {
        month: 'April',
        total: 2000,
        paid: 2000,
        refunded: 0,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'May',
        total: 2000,
        paid: 2000,
        refunded: 500,
        status: FeeCollectionStatusType.Partial,
      },
      {
        month: 'July',
        total: 2000,
        paid: 2000,
        refunded: 2000,
        status: FeeCollectionStatusType.Paid,
      },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeeHeadRefundTableProps {
  formik: RefundFormik;
  showError?: boolean;
  errorMessage?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FeeHeadRefundTable: React.FC<FeeHeadRefundTableProps> = ({
  formik,
  showError,
  errorMessage,
}): React.ReactElement | null => {
  const theme = useTheme();
  const { studentId } = formik.values;
  const isLoading = false; // TODO: replace with RTK Query isLoading

  const [showValidation, setShowValidation] = useState(false);

  /**
   * Memoization Justification:
   * - Derives a feeHeadId → selectedMonths map from formik.values.feeHeadRefunds
   * - feeHeadRefunds reference changes on every setFieldValue; this prevents
   *   recomputation in every FeeHeadGroup on unrelated field changes
   */
  const selectedMonths: Record<string, string[]> = useMemo(() => {
    const result: Record<string, string[]> = {};
    formik.values.feeHeadRefunds.forEach((fh) => {
      result[fh.feeHeadId] = fh.months.map((m) => m.month);
    });
    return result;
  }, [formik.values.feeHeadRefunds]);

  const feeHeads: IFeeHeadPayment[] = studentId ? DUMMY_REFUND_FEE_HEAD_WISE : [];

  // Reset refund state when student changes
  useEffect(() => {
    if (!studentId) return;
    setShowValidation(false);
    formik.setFieldValue('feeHeadRefunds', [], false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Propagate parent validation touch state to inline input errors
  useEffect(() => {
    if (formik.touched.feeHeadRefunds) setShowValidation(true);
  }, [formik.touched.feeHeadRefunds]);

  /**
   * Memoization Justification:
   * - toggleMonth is passed as a prop to FeeHeadGroup children
   * - Stable reference prevents FeeHeadGroup from re-rendering when
   *   parent re-renders for unrelated state changes
   */
  const toggleMonth = useCallback(
    (feeHeadId: string, month: string): void => {
      const refunds = formik.values.feeHeadRefunds;
      const existing = refunds.find((fh) => fh.feeHeadId === feeHeadId);

      let updated;
      if (!existing) {
        // Fee head not yet in formik — add it with this month
        updated = [...refunds, { feeHeadId, months: [{ month, amount: 0 }] }];
      } else {
        const hasMonth = existing.months.some((m) => m.month === month);
        const updatedMonths = hasMonth
          ? existing.months.filter((m) => m.month !== month)
          : [...existing.months, { month, amount: 0 }];

        if (updatedMonths.length === 0) {
          // Last month deselected — remove the fee head entry entirely
          updated = refunds.filter((fh) => fh.feeHeadId !== feeHeadId);
        } else {
          updated = refunds.map((fh) =>
            fh.feeHeadId === feeHeadId ? { ...fh, months: updatedMonths } : fh
          );
        }
      }
      formik.setFieldValue('feeHeadRefunds', updated);
      formik.setFieldTouched('feeHeadRefunds', true, false);
    },
    [formik]
  );

  /**
   * Memoization Justification:
   * - toggleAll is passed as a prop to FeeHeadGroup children
   * - Same rationale as toggleMonth: prevents unnecessary re-renders
   */
  const toggleAll = useCallback(
    (feeHead: IFeeHeadPayment): void => {
      const refundableMonths = feeHead.items
        .filter((i) => Math.max(0, i.paid - i.refunded) > 0)
        .map((i) => i.month);
      const refunds = formik.values.feeHeadRefunds;
      const existing = refunds.find((fh) => fh.feeHeadId === feeHead.feeHeadId);
      const curr = existing?.months.map((m) => m.month) ?? [];
      const isAllSelected = refundableMonths.every((m) => curr.includes(m));

      let updated;
      if (isAllSelected) {
        // Deselect all — remove this fee head entry entirely
        updated = refunds.filter((fh) => fh.feeHeadId !== feeHead.feeHeadId);
      } else if (!existing) {
        // Fee head not yet in formik — add it with all refundable months
        updated = [
          ...refunds,
          {
            feeHeadId: feeHead.feeHeadId,
            months: refundableMonths.map((m) => ({ month: m, amount: 0 })),
          },
        ];
      } else {
        // Add only missing months, preserve existing amounts
        const toAdd = refundableMonths
          .filter((m) => !existing.months.some((e) => e.month === m))
          .map((m) => ({ month: m, amount: 0 }));
        updated = refunds.map((fh) =>
          fh.feeHeadId === feeHead.feeHeadId ? { ...fh, months: [...fh.months, ...toAdd] } : fh
        );
      }
      formik.setFieldValue('feeHeadRefunds', updated);
      formik.setFieldTouched('feeHeadRefunds', true, false);
    },
    [formik]
  );

  /**
   * Memoization Justification:
   * - Derives total selected months count across all fee heads
   * - selectedMonths already memoized; this prevents extra reduce on each render
   */
  const totalSelectedMonthsCount = useMemo(
    () => Object.values(selectedMonths).reduce((s, months) => s + months.length, 0),
    [selectedMonths]
  );

  if (!studentId) return null;
  if (isLoading) return <RefundTableSkeleton />;

  const feeHeadsWithPayments = feeHeads.filter((fh) => fh.items.some((m) => m.paid > 0));

  if (feeHeadsWithPayments.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        No fee payment records found for this student.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Overall Summary KPI Cards ── */}
      <OverallSummaryCard feeHeads={feeHeadsWithPayments} formik={formik} />

      {/* ── Validation error ── */}
      {showError && errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {errorMessage}
        </Alert>
      )}

      {/* ── Guidance info banner ── */}
      {totalSelectedMonthsCount === 0 && (
        <Box
          display="flex"
          alignItems="flex-start"
          gap={1.5}
          px={2}
          py={1.5}
          mb={1}
          sx={{
            borderRadius: '12px',
            borderLeft: `3px solid ${theme.palette.info.main}`,
            bgcolor: alpha(theme.palette.info.main, 0.06),
            border: `1px solid ${alpha(theme.palette.info.main, 0.18)}`,
            borderLeftWidth: 3,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.12),
              mt: 0.1,
            }}
          >
            <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: 'info.main' }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} color="info.main" sx={{ lineHeight: 1.3 }}>
              How to create a refund request
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select fee months below to calculate the refund request automatically. Enter the
              refund amount for each selected month.
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Fee Head-wise Section Title ── */}
      <Box display="flex" alignItems="center" gap={1} pb={1}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}
        >
          Fee Head-wise Refund Details
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: '1px',
            bgcolor: 'divider',
          }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          {feeHeadsWithPayments.length} fee head{feeHeadsWithPayments.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {feeHeadsWithPayments.map((feeHead) => (
        <FeeHeadGroup
          key={feeHead.feeHeadId}
          feeHead={feeHead}
          selectedMonths={selectedMonths[feeHead.feeHeadId] ?? []}
          formik={formik}
          showValidation={showValidation}
          onToggleMonth={(month) => toggleMonth(feeHead.feeHeadId, month)}
          onToggleAll={() => toggleAll(feeHead)}
        />
      ))}
    </Box>
  );
};

export default FeeHeadRefundTable;
