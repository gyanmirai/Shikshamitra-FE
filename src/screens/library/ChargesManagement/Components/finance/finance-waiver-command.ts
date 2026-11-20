import type {
  FinanceWaiverContext,
  FinanceWaiverContextItem,
} from 'src/redux/library/charges-management/finance-corrections.types';
import type {
  DecideFinanceExternalWaiver,
  RequestFinanceExternalWaiver,
  ReverseFinanceExternalWaiver,
} from 'src/redux/library/charges-management/finance-external.commands';

import * as Yup from 'yup';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import { financeAmountInputSchema } from './finance-money-input';

export type FinanceWaiverValues = { amount: string; reason: string };
export type FinanceWaiverCommand =
  | { action: FinanceWaiverAction.Apply; input: RequestFinanceExternalWaiver }
  | {
      action: FinanceWaiverAction.Approve | FinanceWaiverAction.Reject;
      input: DecideFinanceExternalWaiver;
    }
  | { action: FinanceWaiverAction.Reverse; input: ReverseFinanceExternalWaiver };

export function financeWaiverSchema(action: FinanceWaiverAction, limit: number | undefined) {
  const decision = action === FinanceWaiverAction.Approve || action === FinanceWaiverAction.Reject;
  return Yup.object({
    amount: decision
      ? Yup.string()
      : financeAmountInputSchema(
          limit,
          action === FinanceWaiverAction.Reverse ? 'Reversal amount' : 'Waiver amount'
        ),
    reason: Yup.string()
      .trim()
      .required('A reason is required')
      .max(1000, 'Use at most 1000 characters'),
  });
}

export const waiverActionTitle = (action: FinanceWaiverAction) =>
  ({
    [FinanceWaiverAction.Apply]: 'Request Waiver',
    [FinanceWaiverAction.Approve]: 'Approve Waivers',
    [FinanceWaiverAction.Reject]: 'Reject Waivers',
    [FinanceWaiverAction.Reverse]: 'Waiver Reversals',
  })[action];

export function makeFinanceWaiverCommand(
  action: FinanceWaiverAction,
  context: FinanceWaiverContext,
  row: FinanceWaiverContextItem | undefined,
  values: FinanceWaiverValues
): FinanceWaiverCommand | null {
  if (
    !context.canExecute ||
    !context.revision ||
    (action !== FinanceWaiverAction.Apply && row?.canAct !== true)
  )
    return null;
  const common = {
    source: { ...context.source },
    revision: context.revision,
    reason: values.reason.trim(),
    idempotencyKey: crypto.randomUUID(),
  };
  if (action === FinanceWaiverAction.Apply)
    return { action, input: { ...common, amount: values.amount } };
  if (action === FinanceWaiverAction.Reverse)
    return row?.applicationId
      ? {
          action,
          input: { ...common, waiverApplicationId: row.applicationId, amount: values.amount },
        }
      : null;
  return row ? { action, input: { ...common, waiverRequestId: row.requestId } } : null;
}
