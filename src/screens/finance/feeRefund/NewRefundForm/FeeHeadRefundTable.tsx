'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Alert, Button, Typography, FormHelperText } from '@mui/material';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import { useGetAdjustmentEligibilityQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import { useGetRefundEligibilityQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';

import FeeHeadGroup from './feeHeadRefundTable/FeeHeadGroup';
import { refundAllocationLabel } from './initialValuesAndValidation';
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
  compact?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FeeHeadRefundTable: React.FC<FeeHeadRefundTableProps> = ({
  formik,
  showError,
  errorMessage,
  onHasRecords,
  mode = 'refund',
  compact = false,
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
    { skip: skipEligibility || !isAdj, refetchOnMountOrArgChange: true }
  );

  const eligibility = isAdj ? adjustmentEligibility.currentData : refundEligibility.currentData;
  const eligibilityError = isAdj ? adjustmentEligibility.error : refundEligibility.error;
  const isLoading = isAdj ? adjustmentEligibility.isLoading : refundEligibility.isLoading;
  const isFetching = isAdj ? adjustmentEligibility.isFetching : refundEligibility.isFetching;
  const refetchEligibility = isAdj ? adjustmentEligibility.refetch : refundEligibility.refetch;

  const [showValidation, setShowValidation] = useState(false);

  // Per-head bulk amount drafts stay independent of the selected line values.
  const [applyInAllState, setApplyInAllState] = useState<
    Record<string, { amount: number | string }>
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

  const selectedReceiptId = useMemo(
    () =>
      formik.values.feeHeadRefunds.flatMap((x) => x.months).find((x) => x.sourceReceiptId)
        ?.sourceReceiptId,
    [formik.values.feeHeadRefunds]
  );

  // Map eligibility API response to IFeeHeadPayment shape used by child components
  const feeHeads: IFeeHeadPayment[] = useMemo(() => {
    if (!eligibility?.feeHeads) return [];
    return eligibility.feeHeads.map((fh) => ({
      feeHeadId:
        fh.feeHeadId ??
        (fh.months.some((m) => 'lateFeeDueFeeId' in m && m.lateFeeDueFeeId)
          ? 'paid-late-fees'
          : 'paid-charges'),
      feeHeadName: fh.feeHeadName,
      items: fh.months.map((m): IMonthItem => {
        const monthIndex = typeof m.month === 'number' ? m.month : 0;
        const monthName = FeeMonth[monthIndex] ?? `Month ${m.month}`;
        const repeated =
          !isAdj &&
          fh.months.filter(
            (other) =>
              other.month === m.month &&
              other.year === m.year &&
              (other as any).receiptNumber === (m as any).receiptNumber
          ).length > 1;
        const monthLabel = (m as any).chargeName
          ? `${(m as any).chargeName} · ${(m as any).receiptNumber}${repeated ? ` · allocation ${(m as any).sourceAllocationId.slice(0, 8)}` : ''}`
          : refundAllocationLabel(
              monthName,
              m.year,
              (m as any).receiptNumber ?? '',
              (m as any).sourceAllocationId ?? '',
              repeated
            );
        const refunded = isAdj ? ((m as any).adjusted ?? 0) : ((m as any).refunded ?? 0);
        const refundable = isAdj ? ((m as any).adjustable ?? 0) : ((m as any).refundable ?? 0);
        const concession = (m as any).concession ?? 0;
        return {
          dueFeeId: m.dueFeeId ?? '',
          chargeId: (m as any).chargeId ?? undefined,
          lateFeeDueFeeId: 'lateFeeDueFeeId' in m ? (m.lateFeeDueFeeId ?? undefined) : undefined,
          sourceAllocationId: (m as any).sourceAllocationId,
          sourceReceiptId: (m as any).sourceReceiptId,
          receiptNumber: (m as any).receiptNumber,
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

  const prevStudentIdRef = React.useRef(studentId);

  // Reset refund state when student changes
  useEffect(() => {
    if (studentId !== prevStudentIdRef.current) {
      prevStudentIdRef.current = studentId;
      setApplyInAllState({});
      if (studentId) {
        setShowValidation(false);
        formik.setFieldValue('feeHeadRefunds', [], false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Propagate parent validation touch state to inline input errors
  useEffect(() => {
    if (formik.touched.feeHeadRefunds) setShowValidation(true);
  }, [formik.touched.feeHeadRefunds]);

  // Effect to handle refundType change to 'full'
  useEffect(() => {
    if (!eligibility || isLoading || isFetching || eligibilityError) return;
    if (formik.values.refundType === 'full' && formik.values.feeHeadRefunds.length > 0) {
      const refunds = formik.values.feeHeadRefunds;
      let needsUpdate = false;
      // Whole-receipt policies require every source; the server apportions their capped payout.
      let remainingPolicyAmount =
        isAdj || ('allowPartialRefund' in eligibility && eligibility.allowPartialRefund === false)
          ? Number.POSITIVE_INFINITY
          : Number((eligibility as any)?.totalRefundable ?? 0);
      const updated = refunds.map((fh) => {
        const fhInfo = feeHeads.find((f) => f.feeHeadId === fh.feeHeadId);
        if (!fhInfo) return fh;
        const newMonths = fh.months.map((m) => {
          const item = fhInfo.items.find((i) => i.month === m.month);
          const refundable = item ? Math.max(0, item.refundable) : 0;
          const allowedAmount = Math.min(refundable, Math.max(0, remainingPolicyAmount));
          remainingPolicyAmount -= allowedAmount;
          if (m.amount !== allowedAmount) {
            needsUpdate = true;
            return { ...m, amount: allowedAmount };
          }
          return m;
        });
        return { ...fh, months: newMonths };
      });
      if (needsUpdate) {
        formik.setFieldValue('feeHeadRefunds', updated, false);
      }
    }
  }, [
    formik.values.refundType,
    formik.values.feeHeadRefunds,
    feeHeads,
    formik,
    eligibility,
    isAdj,
    isLoading,
    isFetching,
    eligibilityError,
  ]);

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
      const fhInfo = feeHeads.find((f) => f.feeHeadId === feeHeadId);
      const itemInfo = fhInfo?.items.find((i) => i.month === month);
      if (!isAdj && selectedReceiptId && itemInfo?.sourceReceiptId !== selectedReceiptId) return;
      const refundable = itemInfo ? Math.max(0, itemInfo.refundable) : 0;
      const initialAmount = formik.values.refundType === 'full' ? refundable : '';

      if (!existing) {
        updated = [
          ...refunds,
          {
            feeHeadId,
            months: [
              {
                month,
                dueFeeId,
                chargeId: itemInfo?.chargeId,
                lateFeeDueFeeId: itemInfo?.lateFeeDueFeeId,
                sourceAllocationId: itemInfo?.sourceAllocationId,
                sourceReceiptId: itemInfo?.sourceReceiptId,
                amount: initialAmount,
              },
            ],
          },
        ];
      } else {
        const hasMonth = existing.months.some((m) => m.month === month);
        const updatedMonths = hasMonth
          ? existing.months.filter((m) => m.month !== month)
          : [
              ...existing.months,
              {
                month,
                dueFeeId,
                chargeId: itemInfo?.chargeId,
                lateFeeDueFeeId: itemInfo?.lateFeeDueFeeId,
                sourceAllocationId: itemInfo?.sourceAllocationId,
                sourceReceiptId: itemInfo?.sourceReceiptId,
                amount: initialAmount,
              },
            ];

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
    [formik, feeHeads, isAdj, selectedReceiptId]
  );

  /**
   * Memoization Justification:
   * - toggleAll is passed as a prop to FeeHeadGroup children
   * - Same rationale as toggleMonth: prevents unnecessary re-renders
   */
  const toggleAll = useCallback(
    (feeHead: IFeeHeadPayment): void => {
      const availableItems = feeHead.items.filter(
        (i) => Math.max(0, isAdj ? i.refundable : (i.refundable ?? i.paid - i.refunded)) > 0
      );
      // Bulk selection follows the same one-receipt contract as an individual row.
      const receiptId = selectedReceiptId || availableItems[0]?.sourceReceiptId;
      const refundableItems = isAdj
        ? availableItems
        : availableItems.filter((item) => item.sourceReceiptId === receiptId);
      if (refundableItems.length === 0) return;
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
              chargeId: i.chargeId,
              lateFeeDueFeeId: i.lateFeeDueFeeId,
              sourceAllocationId: i.sourceAllocationId,
              sourceReceiptId: i.sourceReceiptId,
              amount: formik.values.refundType === 'full' ? Math.max(0, i.refundable) : '',
            })),
          },
        ];
      } else {
        const toAdd = refundableItems
          .filter((i) => !existing.months.some((e) => e.month === i.month))
          .map((i) => ({
            month: i.month,
            dueFeeId: i.dueFeeId,
            chargeId: i.chargeId,
            lateFeeDueFeeId: i.lateFeeDueFeeId,
            sourceAllocationId: i.sourceAllocationId,
            sourceReceiptId: i.sourceReceiptId,
            amount: formik.values.refundType === 'full' ? Math.max(0, i.refundable) : '',
          }));
        updated = refunds.map((fh) =>
          fh.feeHeadId === feeHead.feeHeadId ? { ...fh, months: [...fh.months, ...toAdd] } : fh
        );
      }
      formik.setFieldValue('feeHeadRefunds', updated);
      formik.setFieldTouched('feeHeadRefunds', true, false);
    },
    [formik, isAdj, selectedReceiptId]
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

  const handleApplyInAllAmountChange = useCallback(
    (feeHeadId: string, amount: number | string): void => {
      setApplyInAllState((prev) => ({ ...prev, [feeHeadId]: { amount } }));
    },
    []
  );

  // Apply is a repeatable command. Clearing an amount is an explicit field edit.
  const handleApplyInAll = useCallback(
    (feeHeadId: string): void => {
      const amountToApply = Number(applyInAllState[feeHeadId]?.amount);
      if (!Number.isFinite(amountToApply) || amountToApply <= 0) return;
      const items = feeHeads.find((head) => head.feeHeadId === feeHeadId)?.items ?? [];
      const updated = formik.values.feeHeadRefunds.map((head) =>
        head.feeHeadId === feeHeadId
          ? {
              ...head,
              months: head.months.map((month) => ({
                ...month,
                amount: Math.min(
                  amountToApply,
                  Math.max(0, items.find((item) => item.month === month.month)?.refundable ?? 0)
                ),
              })),
            }
          : head
      );
      formik.setFieldValue('feeHeadRefunds', updated);
      formik.setFieldTouched('feeHeadRefunds', true, false);
    },
    [applyInAllState, feeHeads, formik]
  );

  const feeHeadsWithPayments = useMemo(
    () =>
      feeHeads.filter((fh) =>
        fh.items.some((m) => (isAdj ? m.refundable > 0 || m.refunded > 0 : m.paid > 0))
      ),
    [feeHeads, isAdj]
  );

  useEffect(() => {
    onHasRecords?.(
      Boolean(
        studentId &&
        !isLoading &&
        !isFetching &&
        !eligibilityError &&
        feeHeadsWithPayments.length > 0
      )
    );
  }, [studentId, isLoading, isFetching, eligibilityError, feeHeadsWithPayments, onHasRecords]);

  if (!studentId)
    return (
      <Typography variant="body2" color="text.secondary">
        Select a student to load refundable fees.
      </Typography>
    );
  if (isLoading || isFetching) return <RefundTableSkeleton compact={compact} />;
  if (eligibilityError) {
    const { detail, errorCode } = parseApiProblemDetail(eligibilityError);
    const message =
      !isAdj && errorCode === 'Finance:RefundPolicy:010016'
        ? 'No refund is possible. This student has no paid fees eligible for a refund.'
        : detail === 'Something went wrong' ||
            detail === 'One or more business rules were violated.'
          ? 'Unable to check refund eligibility. Please try again.'
          : detail;
    const isBusinessRule =
      typeof errorCode === 'string' &&
      (errorCode.startsWith('Finance:FeeRefund:') || errorCode === 'Finance:RefundPolicy:010016');
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 3 }}
        action={
          isBusinessRule ? undefined : (
            <Button color="inherit" size="small" onClick={() => refetchEligibility()}>
              Retry
            </Button>
          )
        }
      >
        {message}
      </Alert>
    );
  }

  if (
    !isAdj &&
    refundEligibility.currentData &&
    refundEligibility.currentData.totalRefundable <= 0
  ) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {refundEligibility.currentData.totalPaid <= 0
          ? 'No refund is possible. This student has not paid any fees yet.'
          : 'No refund is possible. No refundable paid balance remains for this student.'}
      </Alert>
    );
  }

  if (feeHeadsWithPayments.length === 0) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {isAdj
          ? 'No adjustable fee records found for this student. Adjustments can only be raised for students with adjustable fees.'
          : eligibility && eligibility.totalPaid <= 0
            ? 'No refund is possible. This student has not paid any fees yet.'
            : 'No refund is possible. No refundable paid balance remains for this student.'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Overall Summary KPI Cards ── */}
      {!compact && (
        <OverallSummaryCard feeHeads={feeHeadsWithPayments} formik={formik} mode={mode} />
      )}

      {/* ── Validation error ── */}
      {showError && errorMessage && (
        <FormHelperText error role="alert" sx={{ mb: 1 }}>
          {errorMessage}
        </FormHelperText>
      )}

      {/* ── Guidance info banner ── */}
      {isAdj && !compact && totalSelectedMonthsCount === 0 && (
        <Box
          display="flex"
          alignItems="flex-start"
          gap={1}
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
          </Box>
        </Box>
      )}

      {/* ── Fee Head-wise Section Title ── */}
      {!compact && (
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
      )}

      {feeHeadsWithPayments.map((feeHead) => (
        <FeeHeadGroup
          key={feeHead.feeHeadId}
          feeHead={feeHead}
          selectedMonths={selectedMonths[feeHead.feeHeadId] ?? []}
          formik={formik}
          showValidation={showValidation}
          mode={mode}
          selectedReceiptId={isAdj ? undefined : selectedReceiptId}
          onToggleMonth={(month, dueFeeId) => toggleMonth(feeHead.feeHeadId, month, dueFeeId)}
          onToggleAll={() => toggleAll(feeHead)}
          applyInAllState={applyInAllState[feeHead.feeHeadId] ?? { amount: '' }}
          onApplyInAllAmountChange={(amount: number | string) =>
            handleApplyInAllAmountChange(feeHead.feeHeadId, amount)
          }
          onApplyInAll={() => handleApplyInAll(feeHead.feeHeadId)}
        />
      ))}
    </Box>
  );
};

export default FeeHeadRefundTable;
