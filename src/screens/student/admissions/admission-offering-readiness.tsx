import type { AdmissionOfferingValidation } from 'src/redux/student/admissions/admission-offerings-api';

import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { List, ListItem, AlertTitle, Typography, ListItemIcon, ListItemText } from '@mui/material';

import { AdmissionOfferingConfigurationIssues } from './admission-offering-configuration-issues';

import type { AdmissionOfferingRecoveryAccess } from './admission-offering-configuration-issues';

type Props = AdmissionOfferingRecoveryAccess & {
  result?: AdmissionOfferingValidation | null;
  onClose?: () => void;
  cycleName?: string;
};

export function AdmissionOfferingReadiness({ result, onClose, cycleName, ...access }: Props) {
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
      presentation="inline"
      severity="warning"
      onClose={onClose}
    >
      <AlertTitle>Configuration incomplete</AlertTitle>
      {result.errors.length > 0 && (
        <Typography variant="body2" role="status" sx={{ mb: 1 }}>
          {result.errors.length} {result.errors.length === 1 ? 'issue' : 'issues'} to fix
        </Typography>
      )}
      <AdmissionOfferingConfigurationIssues
        errors={result.errors}
        cycleName={cycleName}
        {...access}
      />
    </StudentFeedback>
  );
}
