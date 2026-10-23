import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { StudentFeedback } from 'src/components/student-feedback';
import {
  Stack,
  Button,
  Switch,
  Checkbox,
  FormGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

export function FormStageVerificationSettings({
  policy,
  form,
  sectionsLoading = false,
  sectionsError = false,
  onRetrySections,
  disabled,
  onChange,
}: {
  policy: AdmissionFormStagePolicy;
  form?: AdmissionForm;
  sectionsLoading?: boolean;
  sectionsError?: boolean;
  onRetrySections?: () => void;
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
        <Typography variant="body2" sx={{ minWidth: 0 }}>
          Require staff verification
        </Typography>
        <Switch
          size="small"
          slotProps={{
            input: {
              'aria-label': 'Require staff verification before completing this stage',
              'aria-description':
                'Staff must verify selected sections before completing this stage.',
            },
          }}
          checked={policy.requireSectionVerification}
          disabled={disabled}
          onChange={(_, checked) =>
            onChange({
              requireSectionVerification: checked,
              verificationSectionCodes: checked ? policy.verificationSectionCodes : [],
              autoAdvanceOnSubmit: true,
            })
          }
        />
      </Stack>
      {policy.requireSectionVerification && (
        <Stack spacing={1} sx={{ pl: { sm: 2 } }}>
          <Typography variant="subtitle2">Sections staff must verify</Typography>
          {sectionsLoading ? (
            <StudentFeedback notificationKey="STU-0521" presentation="inline" severity="info">
              Loading form sections…
            </StudentFeedback>
          ) : sectionsError ? (
            <StudentFeedback
              notificationKey="STU-0522"
              presentation="toast"
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetrySections}>
                  Retry
                </Button>
              }
            >
              Unable to load this form&apos;s sections. Retry before choosing sections to verify.
            </StudentFeedback>
          ) : !form ? (
            <StudentFeedback notificationKey="STU-0523" presentation="inline" severity="warning">
              Select a published form first.
            </StudentFeedback>
          ) : form.sections.length === 0 ? (
            <StudentFeedback
              notificationKey="STU-0524"
              presentation="persistent"
              severity="warning"
            >
              This published form has no sections available to verify.
            </StudentFeedback>
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
