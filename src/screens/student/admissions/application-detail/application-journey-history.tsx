'use client';

import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { admissionApplicantsApi } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionActivityTimeline } from '../admission-activity-timeline';

export function ApplicationJourneyHistory({ applicantId }: { applicantId: string }) {
  const query = admissionApplicantsApi.useGetAdmissionJourneyActivitiesQuery(applicantId);
  const activities = query.currentData;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Inquiry and Admission Activity</Typography>
      {query.isLoading || (query.isFetching && !activities) ? (
        <Skeleton variant="rounded" height={160} aria-label="Loading Journey Activity" />
      ) : query.isError ? (
        <StudentFeedback
          notificationKey="STU-0200"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Journey activity could not be loaded.
        </StudentFeedback>
      ) : (
        <AdmissionActivityTimeline
          activities={activities ?? []}
          emptyDescription="Staff Actions and Their Handling History Will Appear Here."
        />
      )}
    </Stack>
  );
}
