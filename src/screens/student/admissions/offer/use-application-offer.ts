import type { RootState } from 'src/redux/store';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useExtendAdmissionOfferMutation,
  useRespondAdmissionOfferMutation,
  useReissueAdmissionOfferMutation,
  useWithdrawAdmissionOfferMutation,
  useIssueAdmissionStageOfferMutation,
} from 'src/redux/student/admissions/admission-offer-api';

import type { OfferAction, OfferActionValue } from './offer-action-dialog';

export function useApplicationOffer(
  applicationId: string,
  stageId: string,
  concurrencyStamp: string,
  canAdvance: boolean,
  onComplete: (concurrencyStamp?: string) => void
) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Admissions.Offers.Add');
  const [action, setAction] = useState<OfferAction>(null);
  const idempotencyKey = useRef('');
  const [issue, issueState] = useIssueAdmissionStageOfferMutation();
  const [respond, respondState] = useRespondAdmissionOfferMutation();
  const [extend, extendState] = useExtendAdmissionOfferMutation();
  const [withdraw, withdrawState] = useWithdrawAdmissionOfferMutation();
  const [reissue, reissueState] = useReissueAdmissionOfferMutation();
  const busy = [issueState, respondState, extendState, withdrawState, reissueState].some(
    (item) => item.isLoading
  );
  const open = (next: Exclude<OfferAction, null>) => {
    idempotencyKey.current = crypto.randomUUID();
    setAction(next);
  };
  const close = () => {
    if (!busy) {
      setAction(null);
      idempotencyKey.current = '';
    }
  };
  const submit = async (value: OfferActionValue) => {
    if (!action || !canWrite) return;
    try {
      const base = {
        applicationId,
        stageId,
        concurrencyStamp,
        idempotencyKey: idempotencyKey.current,
      };
      const expiresAt = value.expiresAt ? new Date(value.expiresAt).toISOString() : undefined;
      let result;
      if (action === 'issue')
        result = await issue({ ...base, expiresAt, reason: value.reason || undefined }).unwrap();
      else if (action === 'reissue')
        result = await reissue({ ...base, expiresAt, reason: value.reason || undefined }).unwrap();
      else if (action === 'extend' && expiresAt)
        result = await extend({ ...base, expiresAt, reason: value.reason || undefined }).unwrap();
      else if (action === 'withdraw')
        result = await withdraw({ ...base, reason: value.reason }).unwrap();
      else if (action === 'accept' || action === 'decline')
        result = await respond({
          ...base,
          accepted: action === 'accept',
          reason: value.reason || undefined,
          confirmTermsAccepted: value.confirmTerms,
          confirmConditionsSatisfied: value.confirmConditions,
        }).unwrap();
      else return;
      shikshaMitraToast.success({
        message: `Offer ${action === 'issue' ? 'issued' : `${action} recorded`}`,
      });
      close();
      if (
        result.canComplete &&
        result.status === 'accepted' &&
        result.policy?.autoAdvanceOnAcceptance &&
        canAdvance
      )
        onComplete(result.concurrencyStamp);
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update the offer',
      });
    }
  };
  return { action, busy, open, close, submit };
}
