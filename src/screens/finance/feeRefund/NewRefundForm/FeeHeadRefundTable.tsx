'use client';

import type { RootState } from 'src/redux/store';

import { isNaN } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import { useGetAdjustmentEligibilityQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import { useGetRefundEligibilityQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';

import FeeHeadGroup from './feeHeadRefundTable/FeeHeadGroup';
import OverallSummaryCard from './feeHeadRefundTable/OverallSummaryCard';
import RefundTableSkeleton from './feeHeadRefundTable/RefundTableSkeleton';

import type { IMonthItem, RefundFormik, IFeeHeadPayment } from './types';

// ─── Month name mapping (matches backend MonthEnum integer values) ─────────────

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeeHeadRefundTableProps {
  formik: RefundFormik;
  showError?: boolean;
  errorMessage?: string;
  onHasRecords?: (has: boolean) => void;
  mode?: 'refund' | 'adjustment';
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FeeHeadRefundTable: React.FC<FeeHeadRefundTableProps> = ({
  formik,
  showError,
  errorMessage,
  onHasRecords,
  mode = 'refund',
}): React.ReactElement | null => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const { studentId } = formik.values;
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const skipEligibility = !studentId || !currentYear?.id;

  const refundEligibility = useGetRefundEligibilityQuery(
    { studentId, academicYearId: currentYear?.id ?? '' },
    { skip: skipEligibility || isAdj }
  );

  const adjustmentEligibility = useGetAdjustmentEligibilityQuery(
    { studentId, academicYearId: currentYear?.id ?? '' },
    { skip: skipEligibility || !isAdj }
  );

  const eligibility = isAdj ? adjustmentEligibility.data : refundEligibility.data;
  const isLoading = isAdj ? adjustmentEligibility.isLoading : refundEligibility.isLoading;
  const isFetching = isAdj ? adjustmentEligibility.isFetching : refundEligibility.isFetching;
  const refetchEligibility = isAdj ? adjustmentEligibility.refetch : refundEligibility.refetch;

  useEffect(() => {
    if (studentId && currentYear?.id) {
      refetchEligibility();
    }
  }, [studentId, currentYear?.id, refetchEligibility]);

  const [showValidation, setShowValidation] = useState(false);

  // State for "apply in all" per fee head: { feeHeadId: { isApplying: boolean, amount: number } }
  const [applyInAllState, setApplyInAllState] = useState<
    Record<string, { isApplying: boolean; amount: number | string }>
  >({});

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

  // Map eligibility API response to IFeeHeadPayment shape used by child components
  const feeHeads: IFeeHeadPayment[] = useMemo(() => {
    if (!eligibility?.feeHeads) return [];
    return eligibility.feeHeads.map((fh) => ({
      feeHeadId: fh.feeHeadId,
      feeHeadName: fh.feeHeadName,
      items: fh.months.map((m): IMonthItem => {
        const monthIndex = typeof m.month === 'number' ? m.month : 0;
        const monthLabel = FeeMonth[monthIndex] ?? `Month ${m.month}`;
        const refunded = isAdj ? ((m as any).adjusted ?? 0) : ((m as any).refunded ?? 0);
        const refundable = isAdj ? ((m as any).adjustable ?? 0) : ((m as any).refundable ?? 0);
        const concession = (m as any).concession ?? 0;
        return {
          dueFeeId: m.dueFeeId,
          month: monthLabel,
          year: m.year,
          total: m.total,
          paid: m.paid,
          refunded,
          refundable,
          concession,
          status:
            m.paid >= m.total
              ? FeeCollectionStatusType.Paid
              : m.paid > 0
                ? FeeCollectionStatusType.Pending
                : FeeCollectionStatusType.Pending,
        };
      }),
    }));
  }, [eligibility, isAdj]);

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
    (feeHeadId: string, month: string, dueFeeId: string): void => {
      const refunds = formik.values.feeHeadRefunds;
      const existing = refunds.find((fh) => fh.feeHeadId === feeHeadId);

      let updated;
      if (!existing) {
        updated = [...refunds, { feeHeadId, months: [{ month, dueFeeId, amount: '' }] }];
      } else {
        const hasMonth = existing.months.some((m) => m.month === month);
        const updatedMonths = hasMonth
          ? existing.months.filter((m) => m.month !== month)
          : [...existing.months, { month, dueFeeId, amount: '' }];

        if (updatedMonths.length === 0) {
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
      const refundableItems = feeHead.items.filter(
        (i) => Math.max(0, i.refundable ?? i.paid - i.refunded) > 0
      );
      const refundableMonths = refundableItems.map((i) => i.month);
      const refunds = formik.values.feeHeadRefunds;
      const existing = refunds.find((fh) => fh.feeHeadId === feeHead.feeHeadId);
      const curr = existing?.months.map((m) => m.month) ?? [];
      const isAllSelected = refundableMonths.every((m) => curr.includes(m));

      let updated;
      if (isAllSelected) {
        updated = refunds.filter((fh) => fh.feeHeadId !== feeHead.feeHeadId);
      } else if (!existing) {
        updated = [
          ...refunds,
          {
            feeHeadId: feeHead.feeHeadId,
            months: refundableItems.map((i) => ({
              month: i.month,
              dueFeeId: i.dueFeeId,
              amount: '',
            })),
          },
        ];
      } else {
        const toAdd = refundableItems
          .filter((i) => !existing.months.some((e) => e.month === i.month))
          .map((i) => ({ month: i.month, dueFeeId: i.dueFeeId, amount: '' }));
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

  /**
   * Handle "apply in all" amount input change for a fee head
   * Reset toggle state when amount becomes 0 to avoid confusion
   */
  const handleApplyInAllAmountChange = useCallback(
    (feeHeadId: string, amount: number | string): void => {
      setApplyInAllState((prev) => ({
        ...prev,
        [feeHeadId]: {
          isApplying: amount === 0 ? false : (prev[feeHeadId]?.isApplying ?? false),
          amount,
        },
      }));
    },
    []
  );

  /**
   * Handle "apply in all" toggle - applies/removes amount for all selected months
   */
  const handleApplyInAllToggle = useCallback(
    (feeHeadId: string): void => {
      setApplyInAllState((prev) => {
        const current = prev[feeHeadId] ?? { isApplying: false, amount: '' };
        const newIsApplying = !current.isApplying;
        const refunds = formik.values.feeHeadRefunds;
        const existing = refunds.find((fh) => fh.feeHeadId === feeHeadId);

        if (existing) {
          if (newIsApplying && current.amount !== '') {
            // Find items for this fee head to get their refundable amounts
            const fhItems = feeHeads.find((f) => f.feeHeadId === feeHeadId)?.items || [];

            // Apply clamped amount to all selected months
            const updated = refunds.map((fh) =>
              fh.feeHeadId === feeHeadId
                ? {
                    ...fh,
                    months: fh.months.map((m) => {
                      const item = fhItems.find((i) => i.month === m.month);
                      const refundable = Math.max(0, item?.refundable ?? 0);
                      const amountToApply = Number(current.amount);
                      const clampedAmount = isNaN(amountToApply)
                        ? 0
                        : Math.min(Math.max(0, amountToApply), refundable);

                      return {
                        ...m,
                        amount: clampedAmount,
                      };
                    }),
                  }
                : fh
            );
            formik.setFieldValue('feeHeadRefunds', updated);
            formik.setFieldTouched('feeHeadRefunds', true, false);
          } else if (!newIsApplying) {
            // Remove amounts from all selected months when toggle is OFF
            const updated = refunds.map((fh) =>
              fh.feeHeadId === feeHeadId
                ? {
                    ...fh,
                    months: fh.months.map((m) => ({
                      ...m,
                      amount: '',
                    })),
                  }
                : fh
            );
            formik.setFieldValue('feeHeadRefunds', updated);
            formik.setFieldTouched('feeHeadRefunds', true, false);
          }
        }

        return {
          ...prev,
          [feeHeadId]: {
            isApplying: newIsApplying,
            amount: current.amount,
          },
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik]
  );

  if (!studentId) return null;
  if (isLoading || isFetching) return <RefundTableSkeleton />;

  const feeHeadsWithPayments = feeHeads.filter((fh) => fh.items.some((m) => m.paid > 0));

  // Notify parent whether any payment records exist
  onHasRecords?.(feeHeadsWithPayments.length > 0);

  if (feeHeadsWithPayments.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        No fee payment records found for this student. Refunds can only be raised for students with
        existing fee payments.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Overall Summary KPI Cards ── */}
      <OverallSummaryCard feeHeads={feeHeadsWithPayments} formik={formik} mode={mode} />

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
              {isAdj ? 'How to create an adjustment request' : 'How to create a refund request'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAdj
                ? 'Select fee months below to calculate the adjustment automatically. Enter the adjustment amount for each selected month.'
                : 'Select fee months below to calculate the refund request automatically. Enter the refund amount for each selected month.'}
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
          {isAdj ? 'Fee Head-Wise Adjustment Details' : 'Fee Head-Wise Refund Details'}
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
          mode={mode}
          onToggleMonth={(month, dueFeeId) => toggleMonth(feeHead.feeHeadId, month, dueFeeId)}
          onToggleAll={() => toggleAll(feeHead)}
          applyInAllState={applyInAllState[feeHead.feeHeadId] ?? { isApplying: false, amount: '' }}
          onApplyInAllAmountChange={(amount: number | string) =>
            handleApplyInAllAmountChange(feeHead.feeHeadId, amount)
          }
          onApplyInAllToggle={() => handleApplyInAllToggle(feeHead.feeHeadId)}
        />
      ))}
    </Box>
  );
};

export default FeeHeadRefundTable;
