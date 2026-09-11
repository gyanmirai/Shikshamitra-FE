import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Alert, Switch, Checkbox, FormGroup, Typography, FormControlLabel } from '@mui/material';

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
    <>
      <FormControlLabel
        control={
          <Switch
            checked={policy.requireSectionVerification}
            onChange={(_, checked) =>
              onChange({
                requireSectionVerification: checked,
                verificationSectionCodes: checked ? policy.verificationSectionCodes : [],
                autoAdvanceOnSubmit: checked ? false : policy.autoAdvanceOnSubmit,
              })
            }
          />
        }
        label="Require staff verification before completing this stage"
        disabled={disabled}
      />
      {policy.requireSectionVerification && (
        <>
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
        </>
      )}
    </>
  );
}
