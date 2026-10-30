'use client';

import type {
  ResumeAdmissionJourneyInput,
  AdmissionJourneyResumePreview,
} from 'src/redux/student/admissions/admission-applications-api';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionJourneyResumePreviewQuery,
  useResumeAdmissionApplicationJourneyMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { ApplicationResumeJourneyDialog } from './application-resume-journey-dialog';

type Props = {
  id: string;
  applicationNumber: string;
  applicantName: string;
  onClose: () => void;
  onResumed: () => void;
  onBusyChange: (busy: boolean) => void;
};

export function ApplicationResumeJourney({
  id,
  applicationNumber,
  applicantName,
  onClose,
  onResumed,
  onBusyChange,
}: Props) {
  const preview = useGetAdmissionJourneyResumePreviewQuery(id, { refetchOnMountOrArgChange: true });
  const [resume, state] = useResumeAdmissionApplicationJourneyMutation();
  // Retain the same command identity after a network failure or duplicate click.
  const command = useRef<{
    input: ResumeAdmissionJourneyInput;
    preview: AdmissionJourneyResumePreview;
  } | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const confirmed = useRef(false);
  useEffect(() => {
    onBusyChange(state.isLoading);
    return () => onBusyChange(false);
  }, [state.isLoading, onBusyChange]);
  return (
    <ApplicationResumeJourneyDialog
      applicationNumber={applicationNumber}
      applicantName={applicantName}
      preview={unconfirmed ? command.current?.preview : preview.data}
      loading={!unconfirmed && preview.isFetching}
      reasonLocked={unconfirmed}
      saving={state.isLoading}
      error={
        !unconfirmed && preview.isError
          ? parseApiProblemDetail(preview.error).detail || 'Unable to load the resume stage.'
          : ''
      }
      onRetry={() => {
        preview.refetch();
      }}
      onClose={() => {
        // Closing an uncertain operation also refreshes the authoritative case without claiming success.
        if (unconfirmed && !confirmed.current) onResumed();
        onClose();
      }}
      onSubmit={async (reason) => {
        const saved = unconfirmed ? command.current?.preview : preview.data;
        if (!saved?.canResume || !saved.closureHistoryId)
          return 'Refresh the resume preview before continuing.';
        if (!unconfirmed) {
          const key =
            command.current?.input.closureHistoryId === saved.closureHistoryId &&
            command.current.input.reason === reason
              ? command.current.input.idempotencyKey
              : crypto.randomUUID();
          command.current = {
            preview: saved,
            input: {
              closureHistoryId: saved.closureHistoryId,
              reason,
              concurrencyStamp: saved.concurrencyStamp,
              idempotencyKey: key,
            },
          };
        }
        try {
          await resume({
            id,
            input: command.current!.input,
          }).unwrap();
          confirmed.current = true;
          onResumed();
          shikshaMitraToast.success({ message: 'Admission resumed' });
          return null;
        } catch (error) {
          const status = (error as { status?: string | number })?.status;
          if (typeof status !== 'number' || status >= 500) {
            // Eligibility can already be false after a committed response was lost. Replay exactly that command.
            setUnconfirmed(true);
            return 'The resume result could not be confirmed. Retry to check the same request safely.';
          }
          setUnconfirmed(false);
          // Refresh stale eligibility while preserving the entered reason and the command key.
          preview.refetch();
          return (
            parseApiProblemDetail(error).detail ||
            'Unable to resume admission. Refresh the case and try again.'
          );
        }
      }}
    />
  );
}
