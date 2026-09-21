import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

import { AdmissionActivityTimeline } from '../admission-activity-timeline';

type Activity = AdmissionApplicant360['activities'][number];

export function AdmissionApplicantActivityCard({ activities }: { activities: Activity[] }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">Activity timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              A single history of Inquiry, communication, profile, and application activity.
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {activities.length} {activities.length === 1 ? 'event' : 'events'}
          </Typography>
        </Stack>

        <AdmissionActivityTimeline
          activities={activities}
          emptyDescription="Inquiry and application events will appear here as the family progresses."
        />
      </CardContent>
    </Card>
  );
}
