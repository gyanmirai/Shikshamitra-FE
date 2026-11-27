import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetAdmissionInquiryTimelineQuery } from 'src/redux/student/admissions/admission-inquiries-api';

import { isInquiryFormActivity } from './inquiry-form-history';
import { AdmissionActivityTimeline } from '../admission-activity-timeline';
import { ActivityHistorySkeleton } from '../../components/activity-history-timeline';

export function InquiryTimeline({
  inquiryId,
  scope = 'all',
}: {
  inquiryId: string;
  scope?: 'all' | 'form';
}) {
  const query = useGetAdmissionInquiryTimelineQuery(inquiryId);
  const loading = query.isLoading || (query.isFetching && !query.currentData);
  const activities = (query.currentData ?? []).filter(
    (item) => scope !== 'form' || isInquiryFormActivity(item)
  );
  const title = scope === 'form' ? 'Form History' : 'Timeline and Communications';

  return (
    <FormSectionCard
      title={title}
      icon={GlobalIcons.history}
      descriptionTooltip={
        scope === 'form'
          ? 'Inquiry form creation and saved changes, newest first.'
          : 'Staff handling, follow-ups and communications in one place, newest first.'
      }
      action={
        !loading &&
        !query.isError && (
          <Stack direction="row" spacing={1} alignItems="center">
            {activities.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Newest first
              </Typography>
            )}
            <Label color="default">{activities.length}</Label>
          </Stack>
        )
      }
    >
      {loading ? (
        <ActivityHistorySkeleton ariaLabel="Loading inquiry timeline" />
      ) : query.isError ? (
        <StudentFeedback
          notificationKey="STU-0430"
          presentation="toast"
          severity="error"
          toastAction={
            <Button
              color="inherit"
              size="small"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={query.refetch}
            >
              Retry
            </Button>
          }
        >
          {title} could not be loaded.
        </StudentFeedback>
      ) : (
        <AdmissionActivityTimeline
          activities={activities}
          initiallyVisible={5}
          emptyDescription={
            scope === 'form'
              ? 'Saved inquiry form changes will appear here.'
              : 'Contact notes, follow-ups and communications will appear here.'
          }
        />
      )}
    </FormSectionCard>
  );
}
