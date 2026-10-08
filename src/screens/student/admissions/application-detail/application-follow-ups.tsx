'use client';

import type { InquiryFollowUp } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Paper, Stack, Button, Skeleton, Typography } from '@mui/material';
import {
  useGetAdmissionApplicationFollowUpsQuery,
  useCancelAdmissionApplicationFollowUpMutation,
  useScheduleAdmissionApplicationFollowUpMutation,
  useCompleteAdmissionApplicationFollowUpMutation,
} from 'src/redux/student/admissions/admission-application-follow-ups-api';

import { InquiryFollowUpsPanel } from '../inquiry-management/inquiry-follow-ups';

export function ApplicationFollowUps({ applicationId }: { applicationId: string }) {
  const query = useGetAdmissionApplicationFollowUpsQuery(applicationId, {
    skip: !applicationId,
    refetchOnMountOrArgChange: true,
  });
  const [schedule, scheduling] = useScheduleAdmissionApplicationFollowUpMutation();
  const [complete, completing] = useCompleteAdmissionApplicationFollowUpMutation();
  const [cancel, cancelling] = useCancelAdmissionApplicationFollowUpMutation();
  const value = query.currentData;
  const problem = query.isError ? parseApiProblemDetail(query.error) : undefined;
  const sourceUnavailable = Boolean(
    (query.error && 'status' in query.error && query.error.status === 404) ||
    problem?.detail.startsWith('The source inquiry is unavailable.')
  );
  const finishInput = (item: InquiryFollowUp, note: string, concurrencyStamp: string) => ({
    applicationId,
    followUpId: item.id,
    concurrencyStamp,
    followUpConcurrencyStamp: item.concurrencyStamp,
    note,
  });

  return (
    <Paper component="section" variant="outlined" sx={{ p: 2, minWidth: 0 }}>
      {query.isLoading && (
        <Stack spacing={1} role="status" aria-label="Loading application follow-ups">
          <Skeleton width="40%" />
          <Skeleton variant="rounded" height={80} />
        </Stack>
      )}
      {query.isError && (
        <Alert
          severity="error"
          action={
            !sourceUnavailable && (
              <Button size="small" color="inherit" onClick={() => query.refetch()}>
                Retry
              </Button>
            )
          }
        >
          {problem && problem.detail !== 'Something went wrong'
            ? problem.detail
            : sourceUnavailable
              ? 'The source inquiry is unavailable. Follow-ups cannot be loaded for this application.'
              : 'Unable to load application follow-ups. Retry to view the latest information.'}
        </Alert>
      )}
      {!query.isLoading && !query.isError && value && (
        <Stack spacing={1.5}>
          {!value.canManageFollowUps && (
            <Typography variant="body2" color="text.secondary">
              Follow-up changes require an active application, managed inquiry settings, and your
              current access.
            </Typography>
          )}
          <InquiryFollowUpsPanel
            value={value}
            readOnly={!value.canManageFollowUps}
            busy={
              query.isFetching ||
              scheduling.isLoading ||
              completing.isLoading ||
              cancelling.isLoading
            }
            actions={{
              schedule: (body) =>
                schedule({
                  applicationId,
                  concurrencyStamp: value.concurrencyStamp,
                  ...body,
                }).unwrap(),
              complete: (item, note) =>
                complete(finishInput(item, note, value.concurrencyStamp)).unwrap(),
              cancel: (item, note) =>
                cancel(finishInput(item, note, value.concurrencyStamp)).unwrap(),
            }}
          />
        </Stack>
      )}
    </Paper>
  );
}
