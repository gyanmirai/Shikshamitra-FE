import type { StudentOnboardingRollPreview } from 'src/redux/student/onboarding/student-onboarding-api';

import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';

import { getOnboardingErrorMessage } from './student-onboarding-messages';

import type { StudentSetupAssignmentServices } from './student-setup-assignment-model';

type PreviewState = {
  key: string;
  status: 'loading' | 'ready' | 'failed';
  number?: number;
};

/** Display only. Saving always recalculates the proposal through the existing assignment flow. */
export function useStudentRollAutoPreview({
  caseId,
  divisionId,
  concurrencyStamp,
  reason,
  enabled,
  preview,
}: {
  caseId: string;
  divisionId: string;
  concurrencyStamp?: string | null;
  reason: string;
  enabled: boolean;
  preview: StudentSetupAssignmentServices['previewRoll'];
}) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<PreviewState>();
  const request = useRef<{ key: string; promise: Promise<StudentOnboardingRollPreview> }>(null);
  const trimmedReason = reason.trim();
  const key =
    enabled && caseId && divisionId && concurrencyStamp
      ? JSON.stringify([caseId, divisionId, concurrencyStamp, trimmedReason, revision])
      : '';

  useEffect(() => {
    if (!key) {
      request.current = null;
      return undefined;
    }
    let current = true;
    setState({ key, status: 'loading' });
    // Reuse the in-flight read during StrictMode effect replay and unchanged rerenders.
    if (request.current?.key !== key) {
      request.current = {
        key,
        promise: Promise.resolve().then(() =>
          preview({
            id: caseId,
            divisionId,
            rollAssignmentMode: 'automatic',
            ...(trimmedReason ? { reason: trimmedReason } : {}),
          })
        ),
      };
    }
    request.current.promise
      .then((result) => {
        if (!current) return;
        if (
          result.divisionId !== divisionId ||
          result.concurrencyStamp !== concurrencyStamp ||
          result.rollAssignmentMode !== 'automatic' ||
          !Number.isInteger(result.proposedRollNumber) ||
          result.proposedRollNumber < 1 ||
          result.proposedRollNumber > 2147483647
        ) {
          throw new Error('Student details changed. Refresh this student and try again.');
        }
        setState({ key, status: 'ready', number: result.proposedRollNumber });
      })
      .catch((error: unknown) => {
        if (!current) return;
        setState({ key, status: 'failed' });
        shikshaMitraToast.error({
          message: getOnboardingErrorMessage(
            error,
            'Roll number preview could not be loaded. Select Auto to try again.'
          ),
        });
      });
    return () => {
      current = false;
    };
  }, [key, caseId, divisionId, concurrencyStamp, trimmedReason, preview]);

  const status = key ? (state?.key === key ? state.status : 'loading') : 'idle';
  const refresh = useCallback(() => {
    if (key && status !== 'loading') setRevision((value) => value + 1);
  }, [key, status]);
  return {
    status,
    number: key && state?.key === key && state.status === 'ready' ? state.number : undefined,
    refresh,
  };
}
