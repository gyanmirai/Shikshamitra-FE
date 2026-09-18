import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Alert, Stack, AlertTitle, Typography } from '@mui/material';

type Props = {
  action: 'activate' | 'deactivate' | 'delete';
  offering: AdmissionOfferingListItem;
};

export function AdmissionOfferingActionImpact({ action, offering }: Props) {
  const applications = `${offering.applicationCount} ${
    offering.applicationCount === 1 ? 'application' : 'applications'
  }`;

  const impact = {
    activate: {
      severity: 'success' as const,
      title: 'New intake can start when the effective window is open',
      message:
        'The server will recheck the cycle, dates, academic hierarchy, workflow, and published forms before activation.',
    },
    deactivate: {
      severity: 'warning' as const,
      title: 'New inquiries and applications will stop immediately',
      message: `${applications} already linked to this offering will remain available for processing.`,
    },
    delete: {
      severity: 'error' as const,
      title: 'The offering configuration will be permanently removed',
      message:
        offering.applicationCount > 0
          ? `${applications} are linked, so the server will reject deletion. Deactivate the offering instead.`
          : 'Deletion is allowed only while no inquiry or application depends on this offering.',
    },
  }[action];

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">
          {offering.code} · {offering.standardName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {offering.campusName || 'All campuses'} · {offering.boardName} · {offering.mediumName} ·{' '}
          {offering.stageName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current usage: {applications}
        </Typography>
      </Stack>
      <Alert severity={impact.severity} variant="outlined">
        <AlertTitle>{impact.title}</AlertTitle>
        {impact.message}
      </Alert>
    </Stack>
  );
}
