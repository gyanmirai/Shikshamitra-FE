import type {
  FinanceExternalRefundForm,
  FinanceExternalRefundCommand,
  FinanceExternalRefundPreview,
  FinanceExternalRefundRequest,
} from 'src/redux/library/charges-management/finance-corrections.types';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';
import {
  useCreateFinanceExternalRefundMutation,
  usePreviewFinanceExternalRefundMutation,
} from 'src/redux/library/charges-management/finance-external-api';

import { financeRefundRequestSchema } from './finance-refund-request-schema';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceRefundRequestValues } from './finance-refund-request-schema';

export type FinanceRefundRequestProps = FinanceActionProps & {
  data: FinanceExternalRefundForm;
  onCreated: (request: FinanceExternalRefundRequest) => void;
  refreshing: boolean;
};

export function useFinanceRefundRequest(props: FinanceRefundRequestProps) {
  const { source, data, disabled, refreshing, onCreated, onBusyChange, onDirtyChange } = props;
  const [previewRefund, previewMutation] = usePreviewFinanceExternalRefundMutation();
  const [createRefund, mutation] = useCreateFinanceExternalRefundMutation();
  const [preview, setPreview] = useState<FinanceExternalRefundPreview | null>(null);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const frozen = useRef<FinanceExternalRefundCommand | null>(null);
  const inFlight = useRef(false);
  const formik = useFormik<FinanceRefundRequestValues>({
    initialValues: { lines: [{ allocationId: '', amount: '' }], method: '', reason: '' },
    validationSchema: financeRefundRequestSchema(data),
    onSubmit: async (values) => {
      if (disabled || refreshing || !data.canRequest || inFlight.current) return;
      setError('');
      try {
        const lines = values.lines.map((line) => {
          const selected = data.sources.find(
            (item) => item.sourceAllocationId === line.allocationId
          );
          if (!selected) throw new Error('Select a current settled receipt allocation.');
          return {
            sourceAllocationId: selected.sourceAllocationId,
            sourceReceiptId: selected.sourceReceiptId,
            amount: line.amount,
          };
        });
        const selection = {
          source,
          revision: data.revision,
          originalReceiptId: lines[0].sourceReceiptId,
          lines,
          method: values.method,
        };
        const value = await previewRefund(selection).unwrap();
        if (!value.isAllowed) {
          setError('Finance did not approve this refund calculation.');
          return;
        }
        frozen.current = {
          ...selection,
          reason: values.reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        };
        setPreview(value);
      } catch (failure) {
        setError(parseApiProblemDetail(failure).detail);
      }
    },
  });
  const submit = async () => {
    if (!frozen.current || inFlight.current || disabled) return;
    inFlight.current = true;
    setError('');
    try {
      const result = await createRefund(frozen.current).unwrap();
      frozen.current = null;
      setUncertain(false);
      setPreview(null);
      formik.resetForm();
      onCreated(result);
    } catch (failure) {
      const unknown = isCollectionOutcomeUncertain(failure);
      setUncertain(unknown);
      setError(parseApiProblemDetail(failure).detail);
      if (!unknown) {
        frozen.current = null;
        setPreview(null);
      }
    } finally {
      inFlight.current = false;
    }
  };
  const working = mutation.isLoading || previewMutation.isLoading || formik.isSubmitting;
  useEffect(() => {
    onBusyChange(working || Boolean(preview) || uncertain);
    return () => onBusyChange(false);
  }, [working, preview, uncertain, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(formik.dirty);
    return () => onDirtyChange?.(false);
  }, [formik.dirty, onDirtyChange]);
  const cancel = () => {
    if (!mutation.isLoading && !uncertain) {
      setPreview(null);
      frozen.current = null;
    }
  };
  return {
    formik,
    preview,
    error,
    uncertain,
    submit,
    cancel,
    working,
    mutation,
    locked: disabled || working || Boolean(preview) || uncertain || refreshing || !data.canRequest,
  };
}
