import type { AdmissionPaymentTransaction } from 'src/redux/student/admissions/admission-payment-types';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useWaiveAdmissionPaymentMutation,
  useRecordAdmissionPaymentMutation,
  useReviewAdmissionPaymentMutation,
  useReverseAdmissionPaymentMutation,
} from 'src/redux/student/admissions/admission-payment-api';

import type { PaymentAction, PaymentActionValue } from './payment-action-dialog';

export function useApplicationPayment(applicationId: string, stageId: string, concurrencyStamp: string,
  autoAdvance: boolean, onComplete: (concurrencyStamp?: string) => void) {
  const [action, setAction] = useState<PaymentAction>(null);
	const idempotencyKey = useRef('');
  const [transaction, setTransaction] = useState<AdmissionPaymentTransaction | null>(null);
  const [record, recordState] = useRecordAdmissionPaymentMutation();
  const [review, reviewState] = useReviewAdmissionPaymentMutation();
  const [waive, waiveState] = useWaiveAdmissionPaymentMutation();
  const [reverse, reverseState] = useReverseAdmissionPaymentMutation();
  const busy = [recordState, reviewState, waiveState, reverseState].some((item) => item.isLoading);
	const open = (next: PaymentAction, item?: AdmissionPaymentTransaction) => {
		idempotencyKey.current = crypto.randomUUID(); setTransaction(item ?? null); setAction(next);
	};
	const close = () => { if (!busy) { setAction(null); setTransaction(null); idempotencyKey.current = ''; } };
  const submit = async (value: PaymentActionValue) => {
    try {
      let result;
      if (action === 'record') result = await record({ applicationId, stageId, concurrencyStamp,
				amount: value.amount, method: value.method, externalReference: value.reference || undefined,
				notes: value.reason || undefined, idempotencyKey: idempotencyKey.current }).unwrap();
      else if (action === 'waive') result = await waive({ applicationId, stageId, concurrencyStamp,
				reason: value.reason, idempotencyKey: idempotencyKey.current }).unwrap();
      else if ((action === 'verify' || action === 'reject') && transaction) result = await review({
        transactionId: transaction.id, approved: action === 'verify', reason: value.reason || undefined,
        concurrencyStamp, transactionConcurrencyStamp: transaction.concurrencyStamp,
				idempotencyKey: idempotencyKey.current }).unwrap();
      else if (action === 'reverse' && transaction) result = await reverse({ transactionId: transaction.id,
				reason: value.reason, idempotencyKey: idempotencyKey.current, concurrencyStamp,
        transactionConcurrencyStamp: transaction.concurrencyStamp }).unwrap();
      else return;
      shikshaMitraToast.success({ message: action === 'record' ? 'Payment recorded' : 'Payment status updated' });
      close();
			if (result.canComplete && result.policy?.autoAdvanceOnSettlement && autoAdvance)
				onComplete(result.concurrencyStamp);
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Unable to update payment' });
    }
  };
  return { action, transaction, busy, open, close, submit };
}
