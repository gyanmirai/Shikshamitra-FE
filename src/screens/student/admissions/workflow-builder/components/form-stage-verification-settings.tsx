import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import {
  Alert,
  Stack,
  Switch,
  Checkbox,
  FormGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

export function FormStageVerificationSettings({
  policy,
  form,
  disabled,
  onChange,
}: {
  policy: AdmissionFormStagePolicy;
  form?: AdmissionForm;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
}) {
  const toggleSection = (code: string, checked: boolean) =>
    onChange({
      verificationSectionCodes: checked
        ? [...policy.verificationSectionCodes, code]
        : policy.verificationSectionCodes.filter((item) => item !== code),
    });

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="body2">
            Require staff verification before completing this stage
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Staff must verify selected sections before this stage is marked complete.
          </Typography>
        </Stack>
        <Switch
          size="small"
          slotProps={{
            input: { 'aria-label': 'Require staff verification before completing this stage' },
          }}
          checked={policy.requireSectionVerification}
          disabled={disabled}
          onChange={(_, checked) =>
            onChange({
              requireSectionVerification: checked,
              verificationSectionCodes: checked ? policy.verificationSectionCodes : [],
              autoAdvanceOnSubmit: checked ? false : policy.autoAdvanceOnSubmit,
            })
          }
        />
      </Stack>
      {policy.requireSectionVerification && (
        <Stack spacing={1} sx={{ pl: { sm: 2 } }}>
          <Typography variant="subtitle2">Sections staff must verify</Typography>
          {!form ? (
            <Alert severity="warning">Select a published form first.</Alert>
          ) : (
            <FormGroup>
              {form.sections.map((section) => (
                <FormControlLabel
                  key={section.id}
                  disabled={disabled}
                  control={
                    <Checkbox
                      size="small"
                      checked={policy.verificationSectionCodes.includes(section.code)}
                      onChange={(_, checked) => toggleSection(section.code, checked)}
                    />
                  }
                  label={section.name}
                />
              ))}
            </FormGroup>
          )}
        </Stack>
      )}
    </Stack>
  );
}
