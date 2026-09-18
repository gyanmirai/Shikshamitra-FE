import type { AdmissionOfferingValidation } from 'src/redux/student/admissions/admission-offerings-api';

import { Alert, AlertTitle, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Iconify } from 'src/components/iconify';

type Props = { result?: AdmissionOfferingValidation | null };

export function AdmissionOfferingReadiness({ result }: Props) {
  if (!result) {
    return (
      <Alert severity="info">
        <AlertTitle>Readiness is checked before saving</AlertTitle>
        <List dense disablePadding>
          {[
            'Academic hierarchy and your access',
            'Duplicate Offering scope',
            'Dates inside the selected cycle',
            'Published workflow and both forms',
            'Workflow, form, counsellor and reviewer compatibility',
          ].map((message) => (
            <ListItem key={message} disableGutters>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Iconify icon="mdi:shield-check-outline" width={18} />
              </ListItemIcon>
              <ListItemText primary={message} />
            </ListItem>
          ))}
        </List>
      </Alert>
    );
  }

  if (result.isValid) {
    return (
      <Alert severity="success">
        <AlertTitle>Ready</AlertTitle>
        This configuration is ready to receive inquiries and applications during its effective
        window.
      </Alert>
    );
  }

  return (
    <Alert severity="warning">
      <AlertTitle>Configuration incomplete</AlertTitle>
      <List dense disablePadding>
        {result.errors.map((error) => (
          <ListItem key={`${error.code}-${error.message}`} disableGutters alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
              <Iconify icon="mdi:alert-circle-outline" width={18} />
            </ListItemIcon>
            <ListItemText primary={error.message} />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}
