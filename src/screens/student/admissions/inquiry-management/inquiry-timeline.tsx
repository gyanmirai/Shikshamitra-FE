import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
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
  const activities = (query.data ?? []).filter(
    (item) => scope !== 'form' || isInquiryFormActivity(item)
  );
  const title = scope === 'form' ? 'Form history' : 'Timeline and communications';

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
                ? 'Inquiry form creation and saved changes, newest first.'
                : 'Contact, follow-up, assignment, and communication history in one place.'}
            </Typography>
          </Stack>
          {!query.isLoading && <Label color="default">{activities.length}</Label>}
        </Stack>

        {query.isLoading && (
          <Stack spacing={1} aria-label="Loading inquiry timeline">
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
          </Stack>
        )}
        {query.isError && (
          <Alert
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
          </Alert>
        )}
        {!query.isLoading && !query.isError && (
          <AdmissionActivityTimeline
            activities={activities}
            initiallyVisible={5}
            emptyDescription={
              scope === 'form'
                ? 'Saved inquiry form changes will appear here.'
                : 'Contact notes, follow-ups, and communications will appear here.'
            }
          />
        )}
      </Stack>
    </Paper>
  );
}
