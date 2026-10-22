'use client';

import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { admissionApplicantsApi } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionActivityTimeline } from '../admission-activity-timeline';

export function ApplicationJourneyHistory({ applicantId }: { applicantId: string }) {
  const query = admissionApplicantsApi.useGetAdmissionJourneyActivitiesQuery(applicantId);
  const activities = query.currentData;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Inquiry and admission activity</Typography>
      {query.isLoading || (query.isFetching && !activities) ? (
        <Skeleton variant="rounded" height={160} aria-label="Loading journey activity" />
      ) : query.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Journey activity could not be loaded.
        </Alert>
      ) : (
        <AdmissionActivityTimeline
          activities={activities ?? []}
          emptyDescription="Staff actions and their handling history will appear here."
        />
      )}
    </Stack>
  );
}
