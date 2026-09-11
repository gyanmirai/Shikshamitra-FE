import type { AdmissionFormSectionVerification } from 'src/redux/student/admissions/admission-form-stage-api';

import { Iconify } from 'src/components/iconify';
import { Chip, List, Button, ListItem, Typography, ListItemText } from '@mui/material';

export function FormStageSectionList({
  sections,
  disabled,
  onVerify,
  onRevoke,
}: {
  sections: AdmissionFormSectionVerification[];
  disabled: boolean;
  onVerify: (section: AdmissionFormSectionVerification) => void;
  onRevoke: (section: AdmissionFormSectionVerification) => void;
}) {
  const required = sections.filter((section) => section.required);
  if (!required.length) return null;
  return (
    <>
      <Typography variant="subtitle2">Section verification</Typography>
      <List disablePadding>
        {required.map((section) => (
          <ListItem
            key={section.sectionId}
            disableGutters
            divider
            secondaryAction={
              section.verified ? (
                <Button size="small" disabled={disabled} onClick={() => onRevoke(section)}>
                  Reopen
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() => onVerify(section)}
                >
                  Verify
                </Button>
              )
            }
          >
            <ListItemText
              primary={section.sectionName}
              secondary={
                section.verifiedAt
                  ? `Verified ${new Date(section.verifiedAt).toLocaleString()}`
                  : 'Waiting for staff verification'
              }
            />
            <Chip
              size="small"
              color={section.verified ? 'success' : 'default'}
              icon={
                <Iconify
                  icon={section.verified ? 'mdi:check-circle-outline' : 'mdi:clock-outline'}
                />
              }
              label={section.verified ? 'Verified' : 'Pending'}
              sx={{ mr: 10 }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}
