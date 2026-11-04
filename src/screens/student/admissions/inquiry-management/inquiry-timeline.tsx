import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionInquiryTimelineQuery } from 'src/redux/student/admissions/admission-inquiries-api';

import { isInquiryFormActivity } from './inquiry-form-history';
import { AdmissionActivityTimeline } from '../admission-activity-timeline';

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
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scope === 'form'
                ? 'Inquiry Form Creation and Saved Changes, Newest First.'
                : 'Staff Handling, Follow-ups, and Communications in One Place.'}
            </Typography>
          </Stack>
          {!loading && <Label color="default">{activities.length}</Label>}
        </Stack>

        {loading && (
          <Stack spacing={1} aria-label="Loading Inquiry Timeline">
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
          </Stack>
        )}
        {query.isError && (
          <StudentFeedback
            notificationKey="STU-0430"
            presentation="toast"
            severity="error"
            action={
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
        )}
        {!loading && !query.isError && (
          <AdmissionActivityTimeline
            activities={activities}
            initiallyVisible={5}
            emptyDescription={
              scope === 'form'
                ? 'Saved Inquiry Form Changes Will Appear Here.'
                : 'Contact Notes, Follow-ups, and Communications Will Appear Here.'
            }
          />
        )}
      </Stack>
    </Paper>
  );
}
