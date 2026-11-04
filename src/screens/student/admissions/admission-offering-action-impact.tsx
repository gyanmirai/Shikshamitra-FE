import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Stack, AlertTitle, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

type Props = {
  action: 'activate' | 'deactivate' | 'delete';
  offering: AdmissionOfferingListItem;
};

export function AdmissionOfferingActionImpact({ action, offering }: Props) {
  if (action === 'delete') {
    return (
      <Typography variant="body2">
        This Will Permanently Delete “{offering.name || offering.code}”. This action cannot be
        undone.
      </Typography>
    );
  }

  if (action === 'activate') {
    return (
      <Typography variant="body2">
        Are You Sure You Want to Activate “<strong>{offering.name || offering.code}</strong>”? This
        offering will become active for student applications.
      </Typography>
    );
  }

  const applications = `${offering.applicationCount} ${
    offering.applicationCount === 1 ? 'application' : 'applications'
  }`;

  const impact = {
    deactivate: {
      severity: 'warning' as const,
      title: 'New Inquiries and Applications Will Stop Immediately',
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
          {offering.campusName || 'All Campuses'} · {offering.boardName} · {offering.mediumName} ·{' '}
          {offering.stageName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current Usage: {applications}
        </Typography>
      </Stack>
      <StudentFeedback
        notificationKey="STU-0109"
        presentation="persistent"
        severity={impact.severity}
        variant="outlined"
      >
        <AlertTitle>{impact.title}</AlertTitle>
        {impact.message}
      </StudentFeedback>
    </Stack>
  );
}
