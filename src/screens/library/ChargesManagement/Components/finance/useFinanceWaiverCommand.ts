import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';
import {
  useRejectFinanceExternalWaiverMutation,
  useRequestFinanceExternalWaiverMutation,
  useApproveFinanceExternalWaiverMutation,
  useReverseFinanceExternalWaiverMutation,
} from 'src/redux/library/charges-management/finance-external-api';

import type { FinanceWaiverCommand } from './finance-waiver-command';

export function useFinanceWaiverCommand(disabled: boolean, refresh: () => unknown) {
  const [apply] = useRequestFinanceExternalWaiverMutation();
  const [approve] = useApproveFinanceExternalWaiverMutation();
  const [reject] = useRejectFinanceExternalWaiverMutation();
  const [reverse] = useReverseFinanceExternalWaiverMutation();
  const frozen = useRef<FinanceWaiverCommand | null>(null);
  const inFlight = useRef(false);
  const unresolved = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clear = () => {
    if (inFlight.current || uncertain) return;
    frozen.current = null;
    setError(null);
  };
  const execute = async (draft?: FinanceWaiverCommand) => {
    if (disabled || inFlight.current) return undefined;
    if (!frozen.current && draft) frozen.current = draft;
    const command = frozen.current;
    if (!command) return undefined;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const result = await (
        command.action === FinanceWaiverAction.Apply
          ? apply(command.input)
          : command.action === FinanceWaiverAction.Reverse
            ? reverse(command.input)
            : command.action === FinanceWaiverAction.Approve
              ? approve(command.input)
              : reject(command.input)
      ).unwrap();
      frozen.current = null;
      unresolved.current = false;
      setUncertain(false);
      return result;
    } catch (failure) {
      const unknown = isCollectionOutcomeUncertain(failure);
      unresolved.current = unknown;
      setUncertain(unknown);
      if (!unknown) {
        frozen.current = null;
        refresh();
      }
      setError(
        parseApiProblemDetail(failure).detail || 'The waiver action could not be completed.'
      );
      return undefined;
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };
  return { execute, clear, error, uncertain, submitting, isUncertain: () => unresolved.current };
}
