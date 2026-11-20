import type { FinanceExternalWaiver } from 'src/redux/library/charges-management/finance-external.types';
import type {
  FinanceWaiverContext,
  FinanceWaiverContextItem,
} from 'src/redux/library/charges-management/finance-corrections.types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import { useFinanceWaiverCommand } from './useFinanceWaiverCommand';
import { useFinanceActionBusy, useFinanceActionDirty } from './FinanceOperatorSelect';
import { financeWaiverSchema, makeFinanceWaiverCommand } from './finance-waiver-command';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceWaiverValues, FinanceWaiverCommand } from './finance-waiver-command';

export type FinanceWaiverFormProps = FinanceActionProps & {
  action: FinanceWaiverAction;
  context?: FinanceWaiverContext;
  selected?: FinanceWaiverContextItem;
  reading: boolean;
  refresh: () => unknown;
  onCompleted: () => void;
};

export function useFinanceWaiverForm(props: FinanceWaiverFormProps) {
  const { action, context, selected, reading, disabled, refresh, onCompleted } = props;
  const command = useFinanceWaiverCommand(disabled, refresh);
  const [review, setReview] = useState<FinanceWaiverCommand | null>(null);
  const [result, setResult] = useState<FinanceExternalWaiver | null>(null);
  const decision = action === FinanceWaiverAction.Approve || action === FinanceWaiverAction.Reject;
  const available =
    !reading &&
    context?.canExecute === true &&
    (action === FinanceWaiverAction.Apply || selected?.canAct === true);
  const limit =
    action === FinanceWaiverAction.Reverse
      ? selected?.reversibleAmount
      : context?.receivable.outstandingAmount;
  const commit = async (draft?: FinanceWaiverCommand): Promise<void> => {
    const response = await command.execute(draft);
    if (!response) {
      if (!command.isUncertain()) setReview(null);
      return;
    }
    setReview(null);
    setResult(response);
    formik.resetForm();
    onCompleted();
    props.onChanged(response.receivable);
  };
  const formik = useFormik<FinanceWaiverValues>({
    initialValues: { amount: '', reason: '' },
    validationSchema: financeWaiverSchema(action, limit),
    onSubmit: async (values) => {
      if (!available || disabled || command.submitting || !context) return;
      const draft = makeFinanceWaiverCommand(action, context, selected, values);
      if (!draft) return;
      if (decision) await commit(draft);
      else setReview(draft);
    },
  });
  const busy = formik.isSubmitting || command.submitting;
  const locked = disabled || busy || command.uncertain || Boolean(review) || !available;
  useFinanceActionBusy(busy || command.uncertain, props.onBusyChange);
  useFinanceActionDirty(formik.dirty, props.onDirtyChange);
  const change = (field: keyof FinanceWaiverValues, value: string) => {
    if (locked) return;
    command.clear();
    formik.setFieldValue(field, value);
  };
  const cancel = () => {
    if (busy || command.uncertain) return;
    setReview(null);
    formik.resetForm();
    command.clear();
    onCompleted();
  };
  return {
    formik,
    command,
    review,
    result,
    context,
    selected,
    decision,
    available,
    busy,
    locked,
    limit,
    change,
    cancel,
    confirm: () => commit(review || undefined),
    retry: () => commit(),
  };
}
