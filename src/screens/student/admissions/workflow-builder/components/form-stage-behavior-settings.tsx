import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Grid, Stack, Switch, TextField, Typography } from '@mui/material';

type Props = {
  policy: AdmissionFormStagePolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
};

type SwitchRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchRow({ label, description, checked, disabled, onChange }: SwitchRowProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2">{label}</Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      <Switch
        size="small"
        slotProps={{ input: { 'aria-label': label } }}
        checked={checked}
        disabled={disabled}
        onChange={(_, value) => onChange(value)}
      />
    </Stack>
  );
}

export function FormStageBehaviorSettings({ policy, disabled, onChange }: Props) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1">Submission</Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Completed by"
              value={policy.responsibility}
              disabled={disabled}
              SelectProps={{ native: true }}
              onChange={(event) =>
                onChange({
                  responsibility: event.target.value as AdmissionFormStagePolicy['responsibility'],
                })
              }
            >
              <option value="applicant">Applicant</option>
              <option value="guardian">Parent or guardian</option>
              <option value="staff">Admission staff</option>
              <option value="shared">Applicant and staff</option>
            </TextField>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Due after"
              placeholder="No deadline"
              value={policy.dueInDays ?? ''}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 1, max: 365, 'aria-label': 'Due after in days' } }}
              onChange={(event) => {
                const dueInDays = event.target.value ? Number(event.target.value) : null;
                onChange({
                  dueInDays,
                  ...(policy.dueInDays == null || dueInDays == null
                    ? { allowLateSubmission: false }
                    : {}),
                });
              }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Submission limit"
              value={policy.maxSubmissionAttempts}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 1, max: 20 } }}
              onChange={(event) => onChange({ maxSubmissionAttempts: Number(event.target.value) })}
              helperText="Includes the first submission"
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.25} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1">Applicant options</Typography>
        <SwitchRow
          label="Show Save draft"
          description="Allow applicants to save a draft and continue later."
          checked={policy.allowSaveAndResume}
          disabled={disabled}
          onChange={(checked) => onChange({ allowSaveAndResume: checked })}
        />
        <SwitchRow
          label="Allow late submission"
          description="Let applicants submit after the deadline."
          checked={policy.dueInDays != null && policy.allowLateSubmission}
          disabled={disabled || policy.dueInDays == null}
          onChange={(checked) => onChange({ allowLateSubmission: checked })}
        />
        <SwitchRow
          label="Allow corrections"
          description="Let applicants make corrections after review."
          checked={policy.allowCorrectionRequests}
          disabled={disabled}
          onChange={(checked) => onChange({ allowCorrectionRequests: checked })}
        />
      </Stack>

      <Stack spacing={1.25} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1">Completion</Typography>
        <SwitchRow
          label="Move to the next stage automatically"
          description="Send applicants to the next stage after completion."
          checked={policy.autoAdvanceOnSubmit}
          disabled={disabled || policy.requireSectionVerification}
          onChange={(checked) => onChange({ autoAdvanceOnSubmit: checked })}
        />
      </Stack>
    </Stack>
  );
}
