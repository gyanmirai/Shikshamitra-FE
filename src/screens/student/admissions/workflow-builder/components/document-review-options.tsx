import type { AdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Stack, Switch, FormControlLabel } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function DocumentReviewOptions({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionDocumentPolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionDocumentPolicy>) => void;
}) {
  return (
    <FormSectionCard
      icon="mdi:shield-check-outline"
      title="Review and exceptions"
      descriptionTooltip="Staff permissions control who can collect, review or waive evidence. Waivers require an authorized staff member and a recorded reason."
    >
      <Stack spacing={1}>
        <FormControlLabel
          label="Require a different staff member to review"
          control={
            <Switch
              size="small"
              checked={policy.requireIndependentReview}
              disabled={disabled}
              onChange={(_, checked) => onChange({ requireIndependentReview: checked })}
            />
          }
        />
        <FormControlLabel
          label="Allow authorized waivers with a reason"
          control={
            <Switch
              size="small"
              checked={policy.allowWaivers}
              disabled={disabled}
              onChange={(_, checked) => onChange({ allowWaivers: checked })}
            />
          }
        />
      </Stack>
    </FormSectionCard>
  );
}
