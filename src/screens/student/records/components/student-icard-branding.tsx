import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { GlobalIcons } from 'src/utils/icons';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { TemplateIdentityAsset } from 'src/screens/setting/school-identity/components/template-identity-asset';

export function StudentICardBranding({
  template,
  onChange,
  disabled,
  canConfigureSignature,
  onBusyChange,
}: {
  template: IdCardTemplate;
  onChange: (patch: Partial<IdCardTemplate>) => void;
  disabled?: boolean;
  canConfigureSignature: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  return (
    <FormSectionCard
      title="School Identity"
      icon={GlobalIcons.admissionInterest}
      descriptionTooltip="Inherited logos and signatures follow each student’s board and medium."
    >
      <Grid container spacing={2}>
        {(
          [
            ['schoolName', 'School name', 150],
            ['schoolAddress', 'School address', 300],
            ['headerText', 'Card heading', 300],
            ['footerText', 'Return instructions', 500],
          ] as const
        ).map(([key, label, maxLength]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={key}>
            <ShakingTextField>
              <TextField
                fullWidth
                size="small"
                required={key === 'schoolName'}
                label={label}
                disabled={disabled}
                value={template[key]}
                slotProps={{ htmlInput: { maxLength } }}
                onChange={(event) => onChange({ [key]: event.target.value })}
              />
            </ShakingTextField>
          </Grid>
        ))}
        <Grid size={{ xs: 12 }}>
          <TemplateIdentityAsset
            kind="logo"
            value={template.logo}
            disabled={disabled}
            onBusy={onBusyChange}
            onChange={(logo) => onChange({ logo })}
          />
        </Grid>
        {canConfigureSignature && (
          <Grid size={{ xs: 12 }}>
            <TemplateIdentityAsset
              kind="signature"
              value={template.signature}
              showInheritanceHelp={false}
              disabled={disabled}
              onBusy={onBusyChange}
              onChange={(signature) => onChange({ signature })}
            />
          </Grid>
        )}
      </Grid>
    </FormSectionCard>
  );
}
