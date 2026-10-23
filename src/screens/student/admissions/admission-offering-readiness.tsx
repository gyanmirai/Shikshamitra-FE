import type { AdmissionOfferingValidation } from 'src/redux/student/admissions/admission-offerings-api';

import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { List, ListItem, AlertTitle, ListItemIcon, ListItemText } from '@mui/material';

type Props = { result?: AdmissionOfferingValidation | null; onClose?: () => void };

export function AdmissionOfferingReadiness({ result, onClose }: Props) {
  if (!result) {
    return (
      <StudentFeedback
        notificationKey="STU-0129"
        presentation="inline"
        severity="info"
        onClose={onClose}
      >
        <AlertTitle>Readiness is checked before saving</AlertTitle>
        <List dense disablePadding>
          {[
            'Academic hierarchy and your access',
            'Duplicate Offering scope',
            'Dates inside the selected cycle',
            'Published workflow and forms needed by the entry mode',
            'Workflow, forms, and reviewer compatibility',
          ].map((message) => (
            <ListItem key={message} disableGutters>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Iconify icon="mdi:shield-check-outline" width={18} />
              </ListItemIcon>
              <ListItemText primary={message} />
            </ListItem>
          ))}
        </List>
      </StudentFeedback>
    );
  }

  if (result.isValid) {
    return (
      <StudentFeedback notificationKey="STU-0130" presentation="inline" severity="success">
        <AlertTitle>Ready</AlertTitle>
        This configuration is ready to receive inquiries and applications during its effective
        window.
      </StudentFeedback>
    );
  }

  return (
    <StudentFeedback
      notificationKey="STU-0131"
      presentation="persistent"
      severity="warning"
      onClose={onClose}
    >
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
    </StudentFeedback>
  );
}
