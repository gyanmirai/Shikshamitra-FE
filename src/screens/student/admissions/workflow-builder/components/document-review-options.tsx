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
      title="Review and Exceptions"
      descriptionTooltip="Staff Permissions Control Who Can Collect, Review or Waive Evidence. Waivers Require an Authorized Staff Member and a Recorded Reason."
    >
      <Stack spacing={1}>
        <FormControlLabel
          label="Require a Different Staff Member to Review"
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
          label="Allow Authorized Waivers with a Reason"
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
