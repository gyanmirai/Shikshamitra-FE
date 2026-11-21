'use client';

import type { ChangeEvent } from 'react';
import type { FinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.types';
import type { ApproveFinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.commands';

import { useFormik } from 'formik';
import { useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';
import {
  useApproveFinanceExternalReceivableMutation,
  useLazyGetFinanceExternalApprovalContextQuery,
} from 'src/redux/library/charges-management/finance-external-api';

import { financeApprovalSchema } from './finance-decision-form-schemas';
import { useFinanceActionBusy, useFinanceActionDirty } from './FinanceOperatorSelect';

import type { FinanceActionProps } from './finance-flow-types';

export function useFinanceApprovalForm({
  source,
  disabled,
  onChanged,
  onBusyChange,
  onDirtyChange,
}: FinanceActionProps) {
  const selectedSource = useMemo(
    () => ({ kind: source.kind, sourceId: source.sourceId, sourceVersion: source.sourceVersion }),
    [source.kind, source.sourceId, source.sourceVersion]
  );
  const [loadContext, query] = useLazyGetFinanceExternalApprovalContextQuery();
  const [approve, mutation] = useApproveFinanceExternalReceivableMutation();
  const [error, setError] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const command = useRef<ApproveFinanceExternalReceivable | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const request = loadContext(selectedSource, false);
    return () => request.unsubscribe();
  }, [loadContext, selectedSource]);
  const context = query.currentData;
  const reading = query.isUninitialized || query.isLoading || query.isFetching;
  const available = !reading && !query.error && context?.canExecute === true;
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: financeApprovalSchema,
    onSubmit: async (values, helpers) => {
      if (disabled || mutation.isLoading || inFlight.current) return;
      if (!command.current) {
        if (!available || !context) return;
        command.current = {
          source: { ...context.source },
          revision: context.revision,
          reason: values.reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        };
      }
      inFlight.current = true;
      setError(null);
      let result: FinanceExternalReceivable;
      try {
        result = await approve(command.current).unwrap();
      } catch (failure) {
        const unresolved = isCollectionOutcomeUncertain(failure);
        setUncertain(unresolved);
        if (!unresolved) {
          command.current = null;
          loadContext(selectedSource, false);
        }
        setError(
          parseApiProblemDetail(failure).detail || 'Unable to approve the Finance assessment.'
        );
        return;
      } finally {
        inFlight.current = false;
      }
      command.current = null;
      setUncertain(false);
      helpers.resetForm({ values });
      onChanged(result);
    },
  });
  const submitting = formik.isSubmitting || mutation.isLoading;
  const locked = disabled || submitting || uncertain || !available;
  useFinanceActionBusy(submitting || uncertain, onBusyChange);
  useFinanceActionDirty(formik.dirty, onDirtyChange);
  const reasonError =
    formik.touched.reason || formik.submitCount > 0 ? formik.errors.reason : undefined;

  const retry = () => {
    loadContext(selectedSource, false);
  };
  const changeReason = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (locked) return;
    command.current = null;
    setError(null);
    formik.handleChange(event);
  };
  return {
    query,
    context,
    reading,
    available,
    formik,
    error,
    uncertain,
    submitting,
    locked,
    reasonError,
    retry,
    changeReason,
  };
}
