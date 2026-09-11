import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';

import { Grid, Stack, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

export function InquirySlaSettings({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionInquiryPolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionInquiryPolicy>) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Response targets and follow-ups</Typography>
      <FormControlLabel
        label="Track first-contact deadline"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.firstContactDueInHours != null}
            onChange={(_, checked) => onChange({ firstContactDueInHours: checked ? 24 : null })}
          />
        }
      />
      {policy.firstContactDueInHours != null && (
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Contact within hours *"
          value={policy.firstContactDueInHours}
          disabled={disabled}
          onChange={(event) => onChange({ firstContactDueInHours: Number(event.target.value) })}
          slotProps={{ htmlInput: { min: 1, max: 720, step: 1 } }}
        />
      )}
      <FormControlLabel
        label="Track qualification deadline"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.qualificationDueInDays != null}
            onChange={(_, checked) => onChange({ qualificationDueInDays: checked ? 7 : null })}
          />
        }
      />
      {policy.qualificationDueInDays != null && (
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Qualify within days *"
          value={policy.qualificationDueInDays}
          disabled={disabled}
          onChange={(event) => onChange({ qualificationDueInDays: Number(event.target.value) })}
          slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
        />
      )}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Default follow-up days *"
            value={policy.followUpDueInDays}
            disabled={disabled}
            onChange={(event) => onChange({ followUpDueInDays: Number(event.target.value) })}
            slotProps={{ htmlInput: { min: 1, max: 90, step: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Maximum open follow-ups *"
            value={policy.maxOpenFollowUps}
            disabled={disabled}
            onChange={(event) => onChange({ maxOpenFollowUps: Number(event.target.value) })}
            slotProps={{ htmlInput: { min: 1, max: 20, step: 1 } }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
