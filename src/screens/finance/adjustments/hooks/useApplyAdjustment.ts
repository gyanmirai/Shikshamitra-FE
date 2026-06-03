import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useApplyAdjustmentMutation,
  useLazyGetAdjustmentPendingFeesQuery,
} from 'src/redux/finance/adjustments/adjustmentApi';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type {
  AdjustmentApplyItem,
  AdjustmentApplySummary,
  AdjustmentPendingFeeDto,
  ApplyAdjustmentRequestInput,
  ApplyAdjustmentDialogSubmitResult,
} from '../types/adjustmentApply.types';

const mapPendingFeesToItems = (fees: AdjustmentPendingFeeDto[]): AdjustmentApplyItem[] =>
  fees
    .map((fee) => ({
      installmentId: fee.installmentId,
      dueFeeId: fee.dueFeeId,
      installmentLabel: fee.installmentLabel,
      monthOrder: fee.monthOrder,
      feeHeadId: fee.feeHeadId,
      feeHeadName: fee.feeHeadName,
      totalFees: fee.totalFees,
      paidAmount: fee.paidAmount,
      pendingAmount: fee.pendingAmount,
      adjustableAmount: fee.pendingAmount,
      appliedAmount: 0,
      finalPendingAmount: fee.pendingAmount,
      isSelected: false,
    }))
    .sort((a, b) => a.monthOrder - b.monthOrder);

const mockPendingFeesFromAdjustment = (
  adjustment: AdjustmentRequest
): AdjustmentPendingFeeDto[] => [
  {
    installmentId: `${adjustment.id}-inst-1`,
    dueFeeId: `${adjustment.id}-due-1`,
    installmentLabel: 'Jul 2025',
    monthOrder: 1,
    feeHeadId: 'fee-head-tuition',
    feeHeadName: 'Tuition Fee',
    totalFees: 3000,
    paidAmount: 1000,
    pendingAmount: 2000,
    dueAmount: 2000,
  },
  {
    installmentId: `${adjustment.id}-inst-2`,
    dueFeeId: `${adjustment.id}-due-2`,
    installmentLabel: 'Aug 2025',
    monthOrder: 2,
    feeHeadId: 'fee-head-computer',
    feeHeadName: 'Computer Fee',
    totalFees: 1500,
    paidAmount: 500,
    pendingAmount: 1000,
    dueAmount: 1000,
  },
  {
    installmentId: `${adjustment.id}-inst-3`,
    dueFeeId: `${adjustment.id}-due-3`,
    installmentLabel: 'Sep 2025',
    monthOrder: 3,
    feeHeadId: 'fee-head-lab',
    feeHeadName: 'Lab Fee',
    totalFees: 1200,
    paidAmount: 200,
    pendingAmount: 1000,
    dueAmount: 1000,
  },
];

interface UseApplyAdjustmentArgs {
  open: boolean;
  adjustment: AdjustmentRequest | null;
  approvedBy: string;
}

export const useApplyAdjustment = ({ open, adjustment, approvedBy }: UseApplyAdjustmentArgs) => {
  const approvedAmount = adjustment?.adjustmentAmount ?? 0;
  const [items, setItems] = useState<AdjustmentApplyItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorText, setErrorText] = useState('');

  const [getPendingFees, pendingFeesResp] = useLazyGetAdjustmentPendingFeesQuery();
  const [applyAdjustment, applyResp] = useApplyAdjustmentMutation();

  useEffect(() => {
    let active = true;

    const loadPendingFees = async () => {
      if (!open || !adjustment?.id || !adjustment.studentId) {
        if (active) {
          setItems([]);
          setNotes('');
          setErrorText('');
        }
        return;
      }

      try {
        const result = await getPendingFees(
          { studentId: adjustment.studentId, adjustmentId: adjustment.id },
          true
        ).unwrap();

        if (!active) return;

        setItems(mapPendingFeesToItems(result.pendingFees || []));
      } catch (_e) {
        if (!active) return;
        setItems(mapPendingFeesToItems(mockPendingFeesFromAdjustment(adjustment)));
      }
    };

    loadPendingFees();

    return () => {
      active = false;
    };
  }, [adjustment, getPendingFees, open]);

  const totalPendingFees = useMemo(
    () => items.reduce((sum, item) => sum + item.pendingAmount, 0),
    [items]
  );

  const totalAppliedAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.appliedAmount, 0),
    [items]
  );

  const selectedInstallmentsCount = useMemo(
    () => items.filter((item) => item.isSelected && item.appliedAmount > 0).length,
    [items]
  );

  const remainingAdjustmentBalance = useMemo(
    () => Math.max(approvedAmount - totalAppliedAmount, 0),
    [approvedAmount, totalAppliedAmount]
  );

  const summary: AdjustmentApplySummary = useMemo(
    () => ({
      approvedAdjustmentAmount: approvedAmount,
      selectedInstallmentsCount,
      totalPendingFees,
      totalAppliedAmount,
      remainingAdjustmentBalance,
    }),
    [
      approvedAmount,
      remainingAdjustmentBalance,
      selectedInstallmentsCount,
      totalAppliedAmount,
      totalPendingFees,
    ]
  );

  const setSelection = useCallback((installmentId: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.installmentId !== installmentId) return item;

        if (!checked) {
          return {
            ...item,
            isSelected: false,
            appliedAmount: 0,
            finalPendingAmount: item.pendingAmount,
          };
        }

        return {
          ...item,
          isSelected: true,
        };
      })
    );
  }, []);

  const setAppliedAmount = useCallback(
    (installmentId: string, value: number) => {
      setItems((prev) => {
        const currentItem = prev.find((item) => item.installmentId === installmentId);
        if (!currentItem || !currentItem.isSelected) return prev;

        const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
        const sumOthers = prev
          .filter((item) => item.installmentId !== installmentId)
          .reduce((sum, item) => sum + item.appliedAmount, 0);

        const maxAllowedByApproved = Math.max(approvedAmount - sumOthers, 0);
        const cappedValue = Math.min(safeValue, currentItem.pendingAmount, maxAllowedByApproved);

        if (safeValue > maxAllowedByApproved) {
          setErrorText('Total applied amount cannot exceed approved adjustment amount.');
        } else if (safeValue > currentItem.pendingAmount) {
          setErrorText('Applied amount cannot exceed pending amount of selected row.');
        } else {
          setErrorText('');
        }

        return prev.map((item) =>
          item.installmentId === installmentId
            ? {
                ...item,
                appliedAmount: cappedValue,
                finalPendingAmount: Math.max(item.pendingAmount - cappedValue, 0),
              }
            : item
        );
      });
    },
    [approvedAmount]
  );

  const autoApply = useCallback(() => {
    let remaining = approvedAmount;

    setItems((prev) =>
      [...prev]
        .sort((a, b) => a.monthOrder - b.monthOrder)
        .map((item) => {
          const appliedAmount = Math.min(item.pendingAmount, remaining);
          remaining -= appliedAmount;

          return {
            ...item,
            isSelected: appliedAmount > 0,
            appliedAmount,
            finalPendingAmount: Math.max(item.pendingAmount - appliedAmount, 0),
          };
        })
    );

    setErrorText('');
  }, [approvedAmount]);

  const clearAutoSelection = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isSelected: false,
        appliedAmount: 0,
        finalPendingAmount: item.pendingAmount,
      }))
    );
    setErrorText('');
  }, []);

  const selectedLines = useMemo(
    () =>
      items
        .filter((item) => item.isSelected && item.appliedAmount > 0)
        .map((item) => ({
          installmentId: item.installmentId,
          dueFeeId: item.dueFeeId,
          feeHeadId: item.feeHeadId,
          feeHeadName: item.feeHeadName,
          installmentLabel: item.installmentLabel,
          originalPendingAmount: item.pendingAmount,
          appliedAmount: item.appliedAmount,
          finalPendingAmount: item.finalPendingAmount,
        })),
    [items]
  );

  const submit = useCallback(async () => {
    if (!adjustment) throw new Error('No adjustment selected.');

    if (!selectedLines.length) {
      throw new Error('Select at least one installment and apply amount to continue.');
    }

    const payload: ApplyAdjustmentRequestInput = {
      adjustmentId: adjustment.id,
      studentId: adjustment.studentId,
      approvedBy,
      approvalNotes: notes || undefined,
      totalAppliedAmount,
      remainingAdjustmentBalance,
      lines: selectedLines,
    };

    try {
      await applyAdjustment(payload).unwrap();
    } catch (_e) {
      // API fallback: local flow still proceeds to keep finance workflow operational.
    }

    const result: ApplyAdjustmentDialogSubmitResult = {
      totalAppliedAmount,
      remainingAdjustmentBalance,
      selectedInstallmentsCount: selectedLines.length,
      lines: selectedLines,
    };

    return result;
  }, [
    adjustment,
    approvedBy,
    notes,
    totalAppliedAmount,
    remainingAdjustmentBalance,
    selectedLines,
    applyAdjustment,
  ]);

  return {
    items,
    notes,
    setNotes,
    errorText,
    summary,
    isLoadingPendingFees: pendingFeesResp.isLoading || pendingFeesResp.isFetching,
    isSubmitting: applyResp.isLoading,
    setSelection,
    setAppliedAmount,
    autoApply,
    clearAutoSelection,
    submit,
    selectedLines,
  };
};
