'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Chip, Stack, Typography } from '@mui/material';

import { AdmissionCrmWaitlistStatus } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { useGetAdmissionCrmWaitlistHistoryQuery } from 'src/redux/student/admissions-crm/final-admission-api';

import { useApplicantFinalAdmissionWorkspace } from './applicant-final-admission-operations-context';
import { formatEnrollmentDate } from './enrollment-display';

const waitlistStatusLabels: Record<AdmissionCrmWaitlistStatus, string> = {
  [AdmissionCrmWaitlistStatus.Active]: 'Active',
  [AdmissionCrmWaitlistStatus.Promoted]: 'Promoted',
  [AdmissionCrmWaitlistStatus.Accepted]: 'Accepted',
  [AdmissionCrmWaitlistStatus.Withdrawn]: 'Withdrawn',
  [AdmissionCrmWaitlistStatus.Expired]: 'Expired',
};

function WaitlistHistory({ entryId }: { entryId: string }) {
  const history = useGetAdmissionCrmWaitlistHistoryQuery({ entryId });
  if (!history.data?.length) return null;
  const latest = history.data[history.data.length - 1];
  return (
    <Typography variant="caption" color="text.secondary">
      Last change: {latest.reason} · {formatEnrollmentDate(latest.occurredAt, true)}
    </Typography>
  );
}

export function ApplicantWaitlistEntryPanel() {
  const { state: controllerState, actions, meta } = useApplicantFinalAdmissionWorkspace();
  const {
    canManageWaitlist,
    finalAdmissionQueriesFailed,
    governanceState,
    leadWaitlistEntries,
    offerPayload,
    perform,
    preparePromotion,
    priorityOverride,
    priorityOverrideReason,
    promotionState,
    responseReason,
    updateWaitlistGovernance,
    waitlistQuery,
    withdrawState,
    withdrawWaitlist,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {leadWaitlistEntries.map((entry) => (
        <Stack
          key={entry.id}
          direction={{ xs: 'column', sm: 'row' }}
          gap={1}
          alignItems={{ sm: 'center' }}
        >
          <Chip
            size="small"
            label={`#${entry.currentPosition || '-'} ${waitlistStatusLabels[entry.status]}`}
          />
          <Typography variant="body2">Priority {entry.priorityScore}</Typography>
          {entry.isProtected ? <Chip size="small" color="info" label="Protected" /> : null}
          {entry.promotionPaused ? (
            <Chip size="small" color="warning" label="Promotion paused" />
          ) : null}
          {entry.status === AdmissionCrmWaitlistStatus.Active &&
          canManageWaitlist &&
          !finalAdmissionQueriesFailed &&
          !waitlistQuery.isError ? (
            <>
              <LoadingButton
                size="small"
                variant="outlined"
                loading={promotionState.isLoading}
                disabled={priorityOverride && !priorityOverrideReason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      preparePromotion({
                        entryId: entry.id,
                        body: {
                          ...offerPayload(),
                          overridePriority: priorityOverride,
                          overrideReason: priorityOverrideReason.trim() || undefined,
                        },
                      }).unwrap(),
                    'Waitlist promotion offer prepared.'
                  )
                }
              >
                Prepare Promotion
              </LoadingButton>
              <LoadingButton
                size="small"
                variant="text"
                color="error"
                loading={withdrawState.isLoading}
                disabled={!responseReason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      withdrawWaitlist({
                        entryId: entry.id,
                        reason: responseReason.trim(),
                      }).unwrap(),
                    'Waitlist entry withdrawn.'
                  )
                }
              >
                Withdraw
              </LoadingButton>
              <LoadingButton
                size="small"
                loading={governanceState.isLoading}
                disabled={!responseReason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      updateWaitlistGovernance({
                        entryId: entry.id,
                        priorityScore: entry.priorityScore,
                        isProtected: !entry.isProtected,
                        promotionPaused: entry.promotionPaused,
                        reason: responseReason.trim(),
                      }).unwrap(),
                    entry.isProtected
                      ? 'Waitlist protection removed.'
                      : 'Waitlist position protected.'
                  )
                }
              >
                {entry.isProtected ? 'Unprotect' : 'Protect'}
              </LoadingButton>
              <LoadingButton
                size="small"
                loading={governanceState.isLoading}
                disabled={!responseReason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      updateWaitlistGovernance({
                        entryId: entry.id,
                        priorityScore: entry.priorityScore,
                        isProtected: entry.isProtected,
                        promotionPaused: !entry.promotionPaused,
                        reason: responseReason.trim(),
                      }).unwrap(),
                    entry.promotionPaused
                      ? 'Waitlist promotion resumed.'
                      : 'Waitlist promotion paused.'
                  )
                }
              >
                {entry.promotionPaused ? 'Resume' : 'Pause'}
              </LoadingButton>
            </>
          ) : null}
          <WaitlistHistory entryId={entry.id} />
        </Stack>
      ))}
    </>
  );
}
