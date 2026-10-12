import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Alert, Stack, AlertTitle, Typography } from '@mui/material';

type Props = {
  action: 'activate' | 'deactivate' | 'delete';
  offering: AdmissionOfferingListItem;
};

export function AdmissionOfferingActionImpact({ action, offering }: Props) {
  if (action === 'delete') {
    return (
      <Typography variant="body2">
        This will permanently delete “{offering.name || offering.code}”. This action cannot be
        undone.
      </Typography>
    );
  }

  if (action === 'activate') {
    return (
      <Typography variant="body2">
        “{offering.name || offering.code}” will become active.
      </Typography>
    );
  }

  const applications = `${offering.applicationCount} ${
    offering.applicationCount === 1 ? 'application' : 'applications'
  }`;

  const impact = {
    deactivate: {
      severity: 'warning' as const,
      title: 'New inquiries and applications will stop immediately',
      message: `${applications} already linked to this offering will remain available for processing.`,
    },
  }[action];

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">
          {offering.name || offering.code} · {offering.standardName}
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
