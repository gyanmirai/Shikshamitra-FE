import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
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
  const requestedBalance =
    adjustment?.remainingAdjustmentBalance ?? adjustment?.adjustmentAmount ?? 0;
  const [serverBalance, setServerBalance] = useState<number | null>(null);
  const approvedAmount = serverBalance ?? requestedBalance;
  const [items, setItems] = useState<AdjustmentApplyItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isContextError, setContextError] = useState(false);
  const [loadingContext, setLoadingContext] = useState(Boolean(open && adjustment?.id));
  const [loadAttempt, setLoadAttempt] = useState(0);
  const lastAttempt = useRef<{ fingerprint: string; key: string } | null>(null);

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
        setLoadingContext(true);
        setContextError(false);
        setErrorText('');
        setItems([]);
        setServerBalance(null);
        const result = await getApplyContext(adjustment.id, true).unwrap();
        if (!active) return;
        setServerBalance(result.remainingAmount);

        const pendingItems = (result.pendingFees || []).map((fee) => ({
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
            amountDraft: '',
            finalPendingAmount: fee.pendingAmount,
            isSelected: false,
          }));
        let remaining = result.remainingAmount;
        const allocations = new Map<string, number>();
        [...pendingItems]
          .sort((a, b) => a.monthOrder - b.monthOrder)
          .forEach((fee) => {
            const amount = Math.round(Math.min(fee.pendingAmount, fee.adjustableAmount, remaining) * 100) / 100;
            allocations.set(fee.installmentId, amount);
            remaining = Math.max(Math.round((remaining - amount) * 100) / 100, 0);
          });
        setItems(pendingItems.map((fee) => {
          const appliedAmount = allocations.get(fee.installmentId) ?? 0;
          return {
            ...fee,
            isSelected: appliedAmount > 0,
            appliedAmount,
            amountDraft: appliedAmount > 0 ? String(appliedAmount) : '',
            finalPendingAmount: Math.max(fee.pendingAmount - appliedAmount, 0),
          };
        }));
      } catch {
        if (active) {
          setItems([]);
          setContextError(true);
          setErrorText('Could not load pending fees. Please retry before applying the adjustment.');
        }
      } finally {
        if (active) setLoadingContext(false);
      }
    };

    loadPendingFees();

    return () => {
      active = false;
    };
  }, [adjustment?.id, getApplyContext, open, loadAttempt]);

  const totalPendingFees = useMemo(
    () => items.reduce((sum, item) => sum + item.pendingAmount, 0),
    [items]
  );

  const totalAppliedAmount = useMemo(
    () => Math.round(items.reduce((sum, item) => sum + item.appliedAmount, 0) * 100) / 100,
    [items]
  );

  const selectedInstallmentsCount = useMemo(
    () => items.filter((item) => item.isSelected && item.appliedAmount > 0).length,
    [items]
  );

  const remainingAdjustmentBalance = useMemo(
    () => Math.max(Math.round((approvedAmount - totalAppliedAmount) * 100) / 100, 0),
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
            amountDraft: '',
            finalPendingAmount: item.pendingAmount,
          };
        }

        return { ...item, isSelected: true };
      })
    );
  }, []);

  const setAppliedAmount = useCallback(
    (installmentId: string, value: number | string) => {
      setItems((prev) => {
        const currentItem = prev.find((item) => item.installmentId === installmentId);
        if (!currentItem || !currentItem.isSelected) return prev;

        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
        const sumOthers = prev
          .filter((item) => item.installmentId !== installmentId)
          .reduce((sum, item) => sum + item.appliedAmount, 0);

        const maxAllowedByApproved = Math.max(
          Math.round((approvedAmount - sumOthers) * 100) / 100,
          0
        );
        const rowLimit = Math.min(currentItem.pendingAmount, currentItem.adjustableAmount);
        const cappedValue =
          Math.round(Math.min(safeValue, rowLimit, maxAllowedByApproved) * 100) / 100;

        if (safeValue > maxAllowedByApproved) {
          setErrorText('Total applied amount cannot exceed approved adjustment amount.');
        } else if (safeValue > rowLimit) {
          setErrorText('Applied amount cannot exceed the available amount of the selected row.');
        } else {
          setErrorText('');
        }

        return prev.map((item) =>
          item.installmentId === installmentId
            ? {
                ...item,
                appliedAmount: cappedValue,
                amountDraft: String(value),
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
      {
        isSelected: boolean;
        appliedAmount: number;
        amountDraft: string;
        finalPendingAmount: number;
      }
    >();

    setItems((prev) => {
      // 1. Sort a shallow copy to determine allocation order — don't mutate prev
      const sorted = [...prev].sort((a, b) => a.monthOrder - b.monthOrder);
      let rem = remaining;

      sorted.forEach((item) => {
        const applied =
          Math.round(Math.min(item.pendingAmount, item.adjustableAmount, rem) * 100) / 100;
        rem = Math.max(Math.round((rem - applied) * 100) / 100, 0);
        allocationMap.set(item.installmentId, {
          isSelected: applied > 0,
          appliedAmount: applied,
          amountDraft: applied > 0 ? String(applied) : '',
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
        amountDraft: '',
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

  const hasInvalidAmounts = items.some((item) => {
    if (!item.isSelected) return false;
    const draft = item.amountDraft ?? String(item.appliedAmount);
    return (
      !/^\d+(\.\d{1,2})?$/.test(draft) ||
      Number(draft) <= 0 ||
      Math.abs(Number(draft) - item.appliedAmount) > 0.00001
    );
  });

  const submit = useCallback(async () => {
    if (!adjustment) throw new Error('No adjustment selected.');
    if (loadingContext || isContextError)
      throw new Error('Load current pending fees before applying the adjustment.');
    if (hasInvalidAmounts) throw new Error('Review the adjustment amounts before continuing.');

    if (!selectedLines.length) {
      throw new Error('No eligible outstanding fees are available for this adjustment.');
    }

    const body = {
      approvalNotes: notes || undefined,
      allowPartialApply: true,
      lines: selectedLines.map((line) => ({
        dueFeeId: line.dueFeeId!,
        feeHeadId: line.feeHeadId,
        installmentLabel: line.installmentLabel,
        appliedAmount: line.appliedAmount,
      })),
    };
    const fingerprint = JSON.stringify({ id: adjustment.id, body });
    if (lastAttempt.current?.fingerprint !== fingerprint) {
      lastAttempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    const result = await applyAdjustment({
      id: adjustment.id,
      idempotencyKey: lastAttempt.current.key,
      body,
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
  }, [
    adjustment,
    applyAdjustment,
    notes,
    selectedLines,
    loadingContext,
    isContextError,
    hasInvalidAmounts,
  ]);

  return {
    items,
    notes,
    setNotes,
    errorText,
    summary,
    isLoadingPendingFees:
      loadingContext || applyContextResp.isLoading || applyContextResp.isFetching,
    isContextError,
    hasInvalidAmounts,
    retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
    isSubmitting: applyResp.isLoading,
    setSelection,
    setAppliedAmount,
    autoApply,
    clearAutoSelection,
    submit,
    selectedLines,
  };
};
