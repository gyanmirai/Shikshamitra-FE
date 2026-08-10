'use client';

import { Chip, Alert, Stack, Paper, Button, Typography } from '@mui/material';
import { AdmissionCrmIntegrationCapabilityState } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useGetAdmissionCrmIntegrationCapabilitiesQuery } from 'src/redux/student/admissions-crm/core-leads-api';

const labels: Record<AdmissionCrmIntegrationCapabilityState, string> = {
  [AdmissionCrmIntegrationCapabilityState.NotConfigured]: 'Not Configured',
  [AdmissionCrmIntegrationCapabilityState.Manual]: 'Manual',
  [AdmissionCrmIntegrationCapabilityState.Configured]: 'Configured',
};

export function IntegrationCapabilitiesPanel({ academicYearId }: { academicYearId: string }) {
  const capabilitiesQuery = useGetAdmissionCrmIntegrationCapabilitiesQuery({ academicYearId });

  if (capabilitiesQuery.isError) {
    return (
      <Alert
        severity="warning"
        action={
          <Button size="small" color="inherit" onClick={() => capabilitiesQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Integration capability status is unavailable. No external synchronization is assumed.
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Typography variant="subtitle2">Integration Boundaries</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {(capabilitiesQuery.data || []).map((capability) => (
            <Chip
              key={capability.code}
              label={`${capability.displayName}: ${labels[capability.state]}`}
              variant="outlined"
              title={capability.detail}
              sx={{
                color: 'text.primary',
                borderColor:
                  capability.state === AdmissionCrmIntegrationCapabilityState.Configured
                    ? 'success.darker'
                    : capability.state === AdmissionCrmIntegrationCapabilityState.Manual
                      ? 'warning.darker'
                      : 'text.primary',
              }}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Manual and not-configured capabilities require an operator handoff and never report
          external success.
        </Typography>
      </Stack>
    </Paper>
  );
}
