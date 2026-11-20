import type { CustodyCommand, CustodyPreview } from 'src/redux/library/custody-api';

import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { useCommandAttempt } from './useCommandAttempt';

export function useReviewedStockAction<TInput, TOutcome>({
  input,
  allowed,
  previewRequest,
  commitRequest,
  workflow = 'custody',
  staleCode = 'Library:Custody:010099',
  onConflict,
}: {
  input: TInput;
  allowed: boolean;
  previewRequest: (value: TInput) => Promise<CustodyPreview>;
  commitRequest: (command: CustodyCommand<TInput>) => Promise<TOutcome>;
  workflow?: string;
  staleCode?: string;
  onConflict?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<TOutcome | null>(null);
  const [review, setReview] = useState<{
    key: string;
    input: TInput;
    result: CustodyPreview;
  } | null>(null);
  const inFlight = useRef(false);
  const key = JSON.stringify(input);
  const latest = useRef(key);
  latest.current = key;
  const attempts = useCommandAttempt<Omit<CustodyCommand<TInput>, 'idempotencyKey'>>();
  const retry = attempts.retry(key);
  const reviewed = review?.key === key ? review : null;
  const canCommit =
    allowed &&
    !busy &&
    !saved &&
    Boolean(
      retry || (!attempts.conflict && reviewed?.result.revision && !reviewed.result.errors.length)
    );

  const preview = async () => {
    if (!allowed || inFlight.current || saved || retry) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    setReview(null);
    try {
      const result = await previewRequest(input);
      if (latest.current === key) {
        setReview({ key, input, result });
        attempts.reviewed();
      }
    } catch (cause) {
      if (latest.current === key)
        setError(
          parseApiProblemDetail(cause).detail || `Could not preview this ${workflow} action.`
        );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const commit = async () => {
    if (inFlight.current || !canCommit) return;
    const command =
      retry ||
      attempts.prepare(key, { details: reviewed!.input, revision: reviewed!.result.revision! });
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      setSaved(await commitRequest(command));
    } catch (cause) {
      const problem = parseApiProblemDetail(cause);
      const stale = problem.errorCode === staleCode;
      attempts.failed(key, stale ? { status: 409 } : cause);
      if (stale) {
        setReview(null);
        onConflict?.();
      }
      setError(
        stale
          ? 'The reviewed inventory changed. Preview the copies again.'
          : problem.detail ||
              `The ${workflow} outcome is unconfirmed. Your submission attempt is retained.`
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return {
    busy,
    error,
    saved,
    review: reviewed?.result,
    canCommit,
    uncertain: Boolean(retry) && !saved,
    preview,
    commit,
    reset: () => {
      setSaved(null);
      setReview(null);
      setError('');
      attempts.reviewed();
    },
  };
}
