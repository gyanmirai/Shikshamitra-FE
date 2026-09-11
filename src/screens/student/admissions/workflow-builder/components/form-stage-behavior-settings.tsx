import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Grid, Switch, MenuItem, TextField, FormControlLabel } from '@mui/material';

export function FormStageBehaviorSettings({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionFormStagePolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
}) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 7 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Who completes the form?"
          value={policy.responsibility}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              responsibility: event.target.value as AdmissionFormStagePolicy['responsibility'],
            })
          }
        >
          <MenuItem value="applicant">Applicant</MenuItem>
          <MenuItem value="guardian">Parent or guardian</MenuItem>
          <MenuItem value="staff">Admission staff</MenuItem>
          <MenuItem value="shared">Applicant and staff together</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Due after (days)"
          value={policy.dueInDays ?? ''}
          disabled={disabled}
          slotProps={{ htmlInput: { min: 1, max: 365 } }}
          onChange={(event) =>
            onChange({ dueInDays: event.target.value ? Number(event.target.value) : null })
          }
          helperText="Optional"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Maximum submissions"
          value={policy.maxSubmissionAttempts}
          disabled={disabled}
          slotProps={{ htmlInput: { min: 1, max: 20 } }}
          onChange={(event) => onChange({ maxSubmissionAttempts: Number(event.target.value) })}
          helperText="Includes the first submission"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={policy.allowSaveAndResume}
              onChange={(_, checked) => onChange({ allowSaveAndResume: checked })}
            />
          }
          label="Show Save draft"
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={policy.allowLateSubmission}
              onChange={(_, checked) => onChange({ allowLateSubmission: checked })}
            />
          }
          label="Allow late submission"
          disabled={disabled || policy.dueInDays == null}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={policy.allowCorrectionRequests}
              onChange={(_, checked) => onChange({ allowCorrectionRequests: checked })}
            />
          }
          label="Allow corrections"
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Switch
              checked={policy.autoAdvanceOnSubmit}
              onChange={(_, checked) => onChange({ autoAdvanceOnSubmit: checked })}
            />
          }
          label="Move to the next stage automatically after completion"
          disabled={disabled || policy.requireSectionVerification}
        />
      </Grid>
    </Grid>
  );
}
