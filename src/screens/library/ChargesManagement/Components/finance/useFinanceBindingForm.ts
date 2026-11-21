'use client';

import type { ChangeEvent } from 'react';
import type { FinanceOperatorOption } from 'src/redux/library/charges-management/finance-operator.types';
import type { BindFinanceExternalPolicy } from 'src/redux/library/charges-management/finance-external.commands';
import type { FinanceExternalCollectionForm } from 'src/redux/library/charges-management/finance-external.types';

import { useFormik } from 'formik';
import { useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';
import {
  useBindFinanceExternalPolicyMutation,
  useLazyGetFinanceExternalBindingContextQuery,
} from 'src/redux/library/charges-management/finance-external-api';

import { financeBindingSchema } from './finance-decision-form-schemas';
import { useFinanceActionBusy, useFinanceActionDirty } from './FinanceOperatorSelect';

import type { FinanceActionProps } from './finance-flow-types';

export function useFinanceBindingForm({
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
  const [loadContext, query] = useLazyGetFinanceExternalBindingContextQuery();
  const [bind, mutation] = useBindFinanceExternalPolicyMutation();
  const [error, setError] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const command = useRef<BindFinanceExternalPolicy | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const request = loadContext(selectedSource, false);
    return () => request.unsubscribe();
  }, [loadContext, selectedSource]);
  const context = query.currentData;
  const reading = query.isUninitialized || query.isLoading || query.isFetching;
  const available = !reading && !query.error && context?.canExecute === true;
  const formik = useFormik<{
    collection: FinanceOperatorOption | null;
    refund: FinanceOperatorOption | null;
    reason: string;
  }>({
    initialValues: { collection: null, refund: null, reason: '' },
    validationSchema: financeBindingSchema,
    onSubmit: async (values, helpers) => {
      if (disabled || mutation.isLoading || inFlight.current) return;
      if (!command.current) {
        if (!available || !context || !values.collection?.isSelectable) return;
        command.current = {
          source: { ...context.source },
          revision: context.revision,
          collectionPolicyVersionId: values.collection.id,
          refundPolicyVersionId: values.refund?.id ?? null,
          reason: values.reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        };
      }
      inFlight.current = true;
      setError(null);
      let result: FinanceExternalCollectionForm;
      try {
        result = await bind(command.current).unwrap();
      } catch (failure) {
        const unresolved = isCollectionOutcomeUncertain(failure);
        setUncertain(unresolved);
        if (!unresolved) {
          command.current = null;
          loadContext(selectedSource, false);
        }
        setError(
          parseApiProblemDetail(failure).detail || 'Unable to confirm the settlement policy.'
        );
        return;
      } finally {
        inFlight.current = false;
      }
      command.current = null;
      setUncertain(false);
      helpers.resetForm({ values });
      onChanged(result.receivable);
    },
  });
  const submitting = formik.isSubmitting || mutation.isLoading;
  const locked = disabled || submitting || uncertain || !available;
  useFinanceActionBusy(submitting || uncertain, onBusyChange);
  useFinanceActionDirty(formik.dirty, onDirtyChange);
  const fieldError = (name: 'collection' | 'refund' | 'reason') =>
    (formik.touched[name] || formik.submitCount > 0) && typeof formik.errors[name] === 'string'
      ? (formik.errors[name] as string)
      : undefined;

  const retry = () => {
    loadContext(selectedSource, false);
  };
  const choosePolicy = (name: 'collection' | 'refund', value: FinanceOperatorOption | null) => {
    command.current = null;
    setError(null);
    formik.setFieldValue(name, value);
  };
  const changeReason = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (locked) return;
    command.current = null;
    setError(null);
    formik.handleChange(event);
  };
  return {
    selectedSource,
    query,
    context,
    reading,
    available,
    formik,
    error,
    uncertain,
    submitting,
    locked,
    fieldError,
    retry,
    choosePolicy,
    changeReason,
  };
}
