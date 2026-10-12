'use client';

import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  useLazyGetAdmissionOfferingQuery,
  useActivateAdmissionOfferingMutation,
} from 'src/redux/student/admissions/admission-offerings-api';

import { getAdmissionApiError } from './admission-offering-model';

export type BulkOfferingActivationFailure = { id: string; name: string; message: string };
export type BulkOfferingActivationProgress = { completed: number; total: number };

type BulkOfferingActivationOptions = {
  rows: AdmissionOfferingListItem[];
  /** Include the tenant, signed-in user, academic year, and current table scope. */
  scopeKey: string;
  canActivate: boolean;
  disabled: boolean;
};

type ActivationBatch = { cancelled: boolean; abortRead: (() => void) | null };

const isEligible = (row: AdmissionOfferingListItem) =>
  !row.isActive && (row.canActivate || row.configurationStatus === 1);

/**
 * The API exposes individual activation commands, not an atomic bulk command.
 * Process sequentially using fresh stamps and keep failures selected for recovery.
 * A scope change stops remaining commands; an already-sent write may still finish.
 */
export function useBulkAdmissionOfferingActivation({
  rows,
  scopeKey,
  canActivate,
  disabled,
}: BulkOfferingActivationOptions) {
  const [loadOffering] = useLazyGetAdmissionOfferingQuery();
  const [activateOffering] = useActivateAdmissionOfferingMutation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [failures, setFailures] = useState<BulkOfferingActivationFailure[]>([]);
  const [progress, setProgress] = useState<BulkOfferingActivationProgress | null>(null);
  const { value: busy, onTrue: startBusy, onFalse: stopBusy } = useBoolean();
  const {
    value: confirmationOpen,
    onTrue: openConfirmation,
    onFalse: closeConfirmation,
  } = useBoolean();
  const batchRef = useRef<ActivationBatch | null>(null);
  const mounted = useRef(false);
  const context = useMemo(() => ({ scopeKey, canActivate }), [scopeKey, canActivate]);
  const currentContext = useRef(context);
  const eligibleRows = useMemo(
    () => (canActivate ? rows.filter(isEligible) : []),
    [rows, canActivate]
  );
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds]
  );

  useEffect(() => {
    mounted.current = true;
    currentContext.current = context;
    setSelectedIds([]);
    setFailures([]);
    setProgress(null);
    closeConfirmation();
    return () => {
      mounted.current = false;
      if (batchRef.current) {
        batchRef.current.cancelled = true;
        batchRef.current.abortRead?.();
      }
    };
  }, [context, closeConfirmation]);

  useEffect(() => {
    if (busy) return;
    const eligibleIds = new Set(eligibleRows.map((row) => row.id));
    setSelectedIds((ids) =>
      ids.every((id) => eligibleIds.has(id)) ? ids : ids.filter((id) => eligibleIds.has(id))
    );
  }, [eligibleRows, busy]);

  useEffect(() => {
    if (!busy && !selectedRows.some(isEligible)) closeConfirmation();
  }, [selectedRows, busy, closeConfirmation]);

  const toggleSelection = useCallback(
    (row: AdmissionOfferingListItem, checked: boolean) => {
      if (batchRef.current || disabled || !canActivate) return;
      if (checked && !eligibleRows.some((eligible) => eligible.id === row.id)) return;
      setSelectedIds((ids) =>
        checked ? [...new Set([...ids, row.id])] : ids.filter((id) => id !== row.id)
      );
      if (!checked) setFailures((items) => items.filter((item) => item.id !== row.id));
    },
    [disabled, canActivate, eligibleRows]
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (batchRef.current || disabled || !canActivate) return;
      const ids = checked ? eligibleRows.map((row) => row.id) : [];
      setSelectedIds(ids);
      setFailures((items) => items.filter((item) => ids.includes(item.id)));
    },
    [disabled, canActivate, eligibleRows]
  );

  const clearSelection = useCallback(() => {
    if (batchRef.current) return;
    setSelectedIds([]);
    setFailures([]);
    closeConfirmation();
  }, [closeConfirmation]);

  const requestActivation = useCallback(() => {
    if (batchRef.current || disabled || !canActivate || !selectedRows.some(isEligible)) return;
    openConfirmation();
  }, [disabled, canActivate, selectedRows, openConfirmation]);

  const cancelActivation = useCallback(() => {
    if (!batchRef.current) closeConfirmation();
  }, [closeConfirmation]);

  const confirmActivation = useCallback(async () => {
    if (batchRef.current || disabled || !canActivate || !confirmationOpen) return;
    const snapshot = selectedRows.filter(isEligible);
    if (!snapshot.length) return;
    const batch: ActivationBatch = { cancelled: false, abortRead: null };
    batchRef.current = batch;
    startBusy();
    setFailures([]);
    setProgress({ completed: 0, total: snapshot.length });
    const failed: BulkOfferingActivationFailure[] = [];
    let activeCount = 0;
    const isCurrent = () =>
      mounted.current && !batch.cancelled && currentContext.current === context;

    try {
      for (let index = 0; index < snapshot.length; index += 1) {
        const row = snapshot[index];
        if (!isCurrent()) break;
        try {
          // The lazy trigger requests fresh details rather than preferring cached data.
          const request = loadOffering(row.id);
          batch.abortRead = () => request.abort();
          let detail: AdmissionOffering;
          try {
            // Read/write pairs are sequential to bound API load and stop safely on scope changes.
            // eslint-disable-next-line no-await-in-loop
            detail = await request.unwrap();
          } finally {
            batch.abortRead = null;
            request.unsubscribe();
          }
          if (!isCurrent()) break;
          if (!detail.isActive) {
            // eslint-disable-next-line no-await-in-loop -- Complete each write before starting the next.
            await activateOffering({
              id: detail.id,
              concurrencyStamp: detail.concurrencyStamp,
            }).unwrap();
          }
          if (!isCurrent()) break;
          activeCount += 1;
        } catch (error) {
          if (!isCurrent()) break;
          failed.push({
            id: row.id,
            name: row.name,
            message: getAdmissionApiError(
              error,
              'Unable to activate this offering. Please try again.'
            ),
          });
        }
        if (isCurrent()) {
          setProgress({ completed: activeCount + failed.length, total: snapshot.length });
        }
      }

      if (!isCurrent()) return;
      setSelectedIds(failed.map((item) => item.id));
      setFailures(failed);
      closeConfirmation();
      if (!failed.length) {
        shikshaMitraToast.success({
          message: `${activeCount} selected offering${activeCount === 1 ? ' is' : 's are'} active.`,
        });
      } else if (activeCount) {
        shikshaMitraToast.warning({
          message: `${activeCount} of ${snapshot.length} offerings are active. ${failed.length} could not be activated; review the issues and retry.`,
        });
      } else {
        shikshaMitraToast.error({
          message: 'Unable to activate the selected offerings. Review the issues and try again.',
        });
      }
    } finally {
      if (batchRef.current === batch) {
        batchRef.current = null;
        if (mounted.current) {
          stopBusy();
          setProgress(null);
        }
      }
    }
  }, [
    disabled,
    canActivate,
    confirmationOpen,
    selectedRows,
    context,
    startBusy,
    stopBusy,
    loadOffering,
    activateOffering,
    closeConfirmation,
  ]);

  return {
    selectedIds,
    selectedRows,
    eligibleRows,
    busy,
    progress,
    confirmationOpen,
    failures,
    toggleSelection,
    toggleAll,
    clearSelection,
    requestActivation,
    cancelActivation,
    confirmActivation,
  };
}
