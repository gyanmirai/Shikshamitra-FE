import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionInquiryTimelineQuery } from 'src/redux/student/admissions/admission-inquiries-api';

import { AdmissionActivityTimeline } from '../admission-activity-timeline';

export function InquiryTimeline({ inquiryId }: { inquiryId: string }) {
  const query = useGetAdmissionInquiryTimelineQuery(inquiryId);
  const activities = query.data ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">Timeline and communications</Typography>
            <Typography variant="body2" color="text.secondary">
              Contact, follow-up, assignment, and communication history in one place.
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
            Timeline and communications could not be loaded.
          </Alert>
        )}
        {!query.isLoading && !query.isError && (
          <AdmissionActivityTimeline
            activities={activities}
            initiallyVisible={5}
            emptyDescription="Contact notes, follow-ups, and communications will appear here."
          />
        )}
      </Stack>
    </Paper>
  );
}
