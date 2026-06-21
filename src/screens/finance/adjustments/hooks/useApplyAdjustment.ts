import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useApplyFeeAdjustmentMutation,
  useLazyGetAdjustmentApplyContextQuery,
} from 'src/redux/finance/adjustments/adjustmentApi';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type {
  AdjustmentApplyItem,
  AdjustmentApplySummary,
  ApplyAdjustmentDialogSubmitResult,
} from '../types/adjustmentApply.types';

interface UseApplyAdjustmentArgs {
  open: boolean;
  adjustment: AdjustmentRequest | null;
  approvedBy: string;
}

export const useApplyAdjustment = ({ open, adjustment }: UseApplyAdjustmentArgs) => {
  const approvedAmount =
    adjustment?.remainingAdjustmentBalance ?? adjustment?.adjustmentAmount ?? 0;
  const [items, setItems] = useState<AdjustmentApplyItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorText, setErrorText] = useState('');

  const [getApplyContext, applyContextResp] = useLazyGetAdjustmentApplyContextQuery();
  const [applyAdjustment, applyResp] = useApplyFeeAdjustmentMutation();

  useEffect(() => {
    let active = true;

    const loadPendingFees = async () => {
      if (!open || !adjustment?.id) {
        if (active) {
          setItems([]);
          setNotes('');
          setErrorText('');
        }
        return;
      }

      try {
        const result = await getApplyContext(adjustment.id, true).unwrap();
        if (!active) return;

        setItems(
          (result.pendingFees || []).map((fee) => ({
            installmentId: fee.installmentId,
            dueFeeId: fee.dueFeeId,
            installmentLabel: fee.installmentLabel,
            monthOrder: fee.monthOrder,
            feeHeadId: fee.feeHeadId,
            feeHeadName: fee.feeHeadName,
            totalFees: fee.totalFees,
            paidAmount: fee.paidAmount,
            pendingAmount: fee.pendingAmount,
            adjustableAmount: fee.maxApplicableAmount,
            appliedAmount: 0,
            finalPendingAmount: fee.pendingAmount,
            isSelected: false,
          }))
        );
      } catch {
        if (active) setItems([]);
      }
    };

    loadPendingFees();

    return () => {
      active = false;
    };
  }, [adjustment?.id, getApplyContext, open]);

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

        return { ...item, isSelected: true };
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
    const remaining = approvedAmount;

    // Compute allocations in chronological order (monthOrder priority),
    // but store the result in a map so the original display order is preserved.
    const allocationMap = new Map<
      string,
      { isSelected: boolean; appliedAmount: number; finalPendingAmount: number }
    >();

    setItems((prev) => {
      // 1. Sort a shallow copy to determine allocation order — don't mutate prev
      const sorted = [...prev].sort((a, b) => a.monthOrder - b.monthOrder);
      let rem = remaining;

      sorted.forEach((item) => {
        const applied = Math.min(item.pendingAmount, rem);
        rem -= applied;
        allocationMap.set(item.installmentId, {
          isSelected: applied > 0,
          appliedAmount: applied,
          finalPendingAmount: Math.max(item.pendingAmount - applied, 0),
        });
      });

      // 2. Apply the allocation back in the ORIGINAL order (no reordering)
      return prev.map((item) => {
        const allocation = allocationMap.get(item.installmentId);
        if (!allocation) return item;
        return { ...item, ...allocation };
      });
    });

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

    const result = await applyAdjustment({
      id: adjustment.id,
      idempotencyKey: crypto.randomUUID(),
      body: {
        approvalNotes: notes || undefined,
        allowPartialApply: true,
        lines: selectedLines.map((line) => ({
          dueFeeId: line.dueFeeId!,
          feeHeadId: line.feeHeadId,
          installmentLabel: line.installmentLabel,
          appliedAmount: line.appliedAmount,
        })),
      },
    }).unwrap();

    const mapped: ApplyAdjustmentDialogSubmitResult = {
      totalAppliedAmount: result.totalAppliedAmount,
      remainingAdjustmentBalance: result.remainingAmount,
      selectedInstallmentsCount: result.selectedInstallmentsCount,
      lines: result.lines.map((line) => ({
        installmentId: line.dueFeeId,
        dueFeeId: line.dueFeeId,
        feeHeadId: line.feeHeadId,
        feeHeadName: line.feeHeadName,
        installmentLabel: line.installmentLabel,
        originalPendingAmount: line.originalPendingAmount,
        appliedAmount: line.appliedAmount,
        finalPendingAmount: line.finalPendingAmount,
      })),
    };

    return mapped;
  }, [adjustment, applyAdjustment, notes, selectedLines]);

  return {
    items,
    notes,
    setNotes,
    errorText,
    summary,
    isLoadingPendingFees: applyContextResp.isLoading || applyContextResp.isFetching,
    isSubmitting: applyResp.isLoading,
    setSelection,
    setAppliedAmount,
    autoApply,
    clearAutoSelection,
    submit,
    selectedLines,
  };
};
