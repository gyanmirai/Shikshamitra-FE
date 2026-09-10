import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { Box, Card, Chip, Stack, Divider, Typography, CardContent } from '@mui/material';

type Activity = AdmissionApplicant360['activities'][number];

export function AdmissionApplicantActivityCard({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Activity timeline
        </Typography>
        <Stack spacing={1}>
          {activities.map((activity) => (
            <Box key={activity.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={activity.activityType} />
                <Typography>{activity.description}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {new Date(activity.occurredAt).toLocaleString()}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
