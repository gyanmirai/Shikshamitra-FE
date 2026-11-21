import type { CollectFinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.commands';
import type {
  FinanceExternalCollection,
  FinanceExternalCollectionForm,
} from 'src/redux/library/charges-management/finance-external.types';

import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useCollectFinanceExternalReceivableMutation } from 'src/redux/library/charges-management/finance-external-api';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';

import { financeInstrumentFields } from './FinancePaymentFields';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceCollectionValues } from './FinancePaymentFields';

export type FinanceCollectionProps = FinanceActionProps & {
  canCollect: boolean;
  onReceipt: (result: FinanceExternalCollection) => void;
};

export function useFinanceCollectionCommand({
  source,
  disabled,
  onChanged,
  canCollect,
  onReceipt,
}: FinanceCollectionProps) {
  const [collect, mutation] = useCollectFinanceExternalReceivableMutation();
  const [error, setError] = useState('');
  const [review, setReview] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const frozen = useRef<CollectFinanceExternalReceivable | null>(null);
  const inFlight = useRef(false);
  const prepare = (
    values: FinanceCollectionValues,
    data: FinanceExternalCollectionForm | undefined,
    reading: boolean
  ) => {
    if (!data || !data.canCollect || !canCollect || disabled || reading) return;
    if (
      financeInstrumentFields(values.paymentMethod).some(
        (field) => field.required && !values.details[field.name]
      )
    ) {
      setError('Complete the required payment instrument details.');
      return;
    }
    frozen.current = {
      source,
      revision: data.revision,
      idempotencyKey: crypto.randomUUID(),
      schoolReceiptDate: values.schoolReceiptDate,
      notes: values.notes || null,
      payments: [
        {
          paymentMethod: Number(values.paymentMethod),
          amount: values.amount,
          ...(values.paymentMethod === '0'
            ? {}
            : { bankAccountId: values.bankAccountId, details: { ...values.details } }),
        },
      ],
    };
    setError('');
    setReview(true);
  };
  const submit = async () => {
    if (!frozen.current || mutation.isLoading || inFlight.current || disabled || !canCollect)
      return;
    inFlight.current = true;
    try {
      const result = await collect(frozen.current).unwrap();
      frozen.current = null;
      setUncertain(false);
      setReview(false);
      setError('');
      onChanged(result.receivable);
      onReceipt(result);
    } catch (failure) {
      setError(parseApiProblemDetail(failure).detail);
      const unknown = isCollectionOutcomeUncertain(failure);
      setUncertain(unknown);
      setReview(unknown);
      if (!unknown) frozen.current = null;
    } finally {
      inFlight.current = false;
    }
  };
  const cancel = () => {
    if (!mutation.isLoading && !uncertain) {
      setReview(false);
      frozen.current = null;
    }
  };
  return { error, review, uncertain, frozen, mutation, prepare, submit, cancel };
}
