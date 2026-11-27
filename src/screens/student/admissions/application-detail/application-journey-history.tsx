'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { admissionApplicantsApi } from 'src/redux/student/admissions/admission-applicants-api';
import { ActivityHistorySkeleton } from 'src/screens/student/components/activity-history-timeline';

import { AdmissionActivityTimeline } from '../admission-activity-timeline';
import { applicationHistoryCardProps } from './application-history-card-props';

export function ApplicationJourneyHistory({ applicantId }: { applicantId: string }) {
  const query = admissionApplicantsApi.useGetAdmissionJourneyActivitiesQuery(applicantId);
  const activities = query.currentData;
  const loading = query.isLoading || (query.isFetching && !activities);
  if (!loading && query.isError) {
    return (
      <StudentFeedback
        notificationKey="STU-0200"
        presentation="toast"
        severity="error"
        toastAction={
          <Button size="small" onClick={query.refetch}>
            Retry
          </Button>
        }
      >
        Journey activity could not be loaded.
      </StudentFeedback>
    );
  }
  return (
    <FormSectionCard
      {...applicationHistoryCardProps}
      title="Inquiry and Admission Activity"
      titleTypographyProps={{ component: 'h4' }}
      icon={GlobalIcons.history}
      descriptionTooltip="Recorded activity for this applicant across inquiry and admission."
      action={
        <Typography variant="caption" color="text.secondary">
          Newest first
        </Typography>
      }
    >
      {loading ? (
        <ActivityHistorySkeleton ariaLabel="Loading Journey Activity" />
      ) : (
        <AdmissionActivityTimeline
          activities={activities ?? []}
          emptyDescription="Recorded staff actions will appear here."
        />
      )}
    </FormSectionCard>
  );
}
