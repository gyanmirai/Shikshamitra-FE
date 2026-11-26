import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, TextField } from '@mui/material';
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
    <Stack spacing={2}>
      <FormSectionCard
        title="School Identity"
        icon={GlobalIcons.admissionInterest}
        descriptionTooltip="Inherited logos and signatures follow each student’s board and medium."
        contentSx={{ containerType: 'inline-size' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 2,
            '@container (min-width: 340px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {(
            [
              ['schoolName', 'School name', 150],
              ['schoolAddress', 'School address', 300],
              ['headerText', 'Card heading', 300],
              ['footerText', 'Return instructions', 500],
            ] as const
          ).map(([key, label, maxLength]) => (
            <ShakingTextField key={key} sx={{ minWidth: 0 }}>
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
          ))}
        </Box>
      </FormSectionCard>
      <TemplateIdentityAsset
        kind="logo"
        value={template.logo}
        disabled={disabled}
        onBusy={onBusyChange}
        onChange={(logo) => onChange({ logo })}
        showInheritanceHelp={false}
      />
      {canConfigureSignature && (
        <TemplateIdentityAsset
          kind="signature"
          value={template.signature}
          disabled={disabled}
          onBusy={onBusyChange}
          onChange={(signature) => onChange({ signature })}
          showInheritanceHelp={false}
        />
      )}
    </Stack>
  );
}
