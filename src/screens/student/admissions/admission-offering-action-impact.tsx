import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Typography } from '@mui/material';

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

  return (
    <Typography variant="body2">
      Are you sure you want to deactivate this offering? New inquiries and applications will stop,
      but existing applications will remain available.
    </Typography>
  );
}
