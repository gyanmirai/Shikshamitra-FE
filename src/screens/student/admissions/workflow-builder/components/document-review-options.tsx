import type { AdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';

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
    <Stack>
      <Typography variant="subtitle2">Review and exceptions</Typography>
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
      <Typography variant="caption" color="text.secondary">
        Staff permissions control who can collect, review, or waive evidence.
      </Typography>
    </Stack>
  );
}
