import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationOperation } from 'src/redux/academic-notifications/delivery-types';
import type { AcademicNotificationReview, PreviewAcademicNotification } from 'src/redux/academic-notifications/manual-types';

import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useSendAcademicNotificationMutation, usePreviewAcademicNotificationMutation } from 'src/redux/academic-notifications/manual-api';

const staleReviewCodes = new Set(['ReviewChanged', 'ReviewExpired', 'ReviewInvalid', 'ReviewConsumed']);

function interruptedConfirmation(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error)) return true;
  return typeof error.status === 'number'
    ? error.status === 408 || error.status >= 500
    : ['TIMEOUT_ERROR', 'FETCH_ERROR', 'PARSING_ERROR'].includes(String(error.status));
}

export function useReviewedNotificationSend(identity: AcademicNotificationCacheIdentity) {
  const lock = useRef(false);
  const [preview] = usePreviewAcademicNotificationMutation();
  const [send] = useSendAcademicNotificationMutation();
  const [review, setReview] = useState<AcademicNotificationReview>();
  const [operation, setOperation] = useState<AcademicNotificationOperation>();
  const [phase, setPhase] = useState<'idle' | 'previewing' | 'sending'>('idle');
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [problem, setProblem] = useState('');

  function resetReview() {
    setReview(undefined);
    setStale(false);
    setProblem('');
  }

  async function loadPreview(input: PreviewAcademicNotification) {
    if (lock.current || uncertain || operation) return;
    lock.current = true;
    setPhase('previewing');
    setProblem('');
    setStale(Boolean(review));
    try {
      setReview(await preview({ ...identity, input }).unwrap());
      setStale(false);
    } catch (error) {
      setProblem(parseApiProblemDetail(error).detail);
    } finally {
      lock.current = false;
      setPhase('idle');
    }
  }

  async function confirm() {
    const reviewToken = review?.reviewToken;
    if (lock.current || operation || stale || !reviewToken || !review?.expiresAt) return;
    const deadline = Date.parse(review.expiresAt);
    if (!uncertain && (!Number.isFinite(deadline) || deadline <= Date.now())) {
      setStale(true);
      setProblem('The review expired. Refresh the preview before confirming.');
      return;
    }
    lock.current = true;
    setPhase('sending');
    setProblem('');
    try {
      // One confirmation identity per server-issued review, including request retries.
      setOperation(await send({ ...identity, input: { reviewToken, idempotencyKey: reviewToken } }).unwrap());
      setUncertain(false);
    } catch (error) {
      const { errorCode, detail } = parseApiProblemDetail(error);
      const reason = typeof errorCode === 'string' ? errorCode.split(':').at(-1) ?? '' : '';
      if (staleReviewCodes.has(reason) && (!uncertain || reason === 'ReviewExpired')) {
        setStale(true);
        setUncertain(false);
        setProblem('The review is no longer current. Refresh the preview before confirming.');
      } else if (uncertain || interruptedConfirmation(error)) {
        setUncertain(true);
        setProblem('The confirmation could not be verified. Retry this confirmation to check the same send.');
      } else {
        setUncertain(false);
        setProblem(detail);
      }
    } finally {
      lock.current = false;
      setPhase('idle');
    }
  }

  return { review, operation, phase, stale, uncertain, problem, loadPreview, confirm, resetReview };
}
