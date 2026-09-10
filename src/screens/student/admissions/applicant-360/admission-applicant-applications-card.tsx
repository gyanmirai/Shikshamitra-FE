import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { Box, Card, Chip, Stack, Typography, CardContent } from '@mui/material';

import { getAdmissionApplicationStatusLabel } from '../application-status';

type Application = AdmissionApplicant360['applications'][number];

export function AdmissionApplicantApplicationsCard({
  applications,
}: {
  applications: Application[];
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Applications
        </Typography>
        {applications.length ? (
          applications.map((application) => (
            <Box key={application.id} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1">{application.applicationNumber}</Typography>
                <Chip size="small" label={getAdmissionApplicationStatusLabel(application.status)} />
              </Stack>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {application.stages.map((stage) => (
                  <Stack key={stage.code} direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      color={
                        stage.status === 1 ? 'primary' : stage.status === 2 ? 'success' : 'default'
                      }
                      label={stage.status === 2 ? '✓' : stage.status === 1 ? '●' : '○'}
                    />
                    <Typography variant="body2">{stage.name}</Typography>
                    {stage.status === 1 && (
                      <Typography variant="caption" color="text.secondary">
                        NEXT
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No applications yet.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
