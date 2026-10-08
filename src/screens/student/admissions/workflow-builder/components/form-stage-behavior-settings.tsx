import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import { Grid, Stack, Switch, TextField, Typography } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';

type Props = {
  policy: AdmissionFormStagePolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
  expandAdvanced?: boolean;
};

type SwitchRowProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchRow({ label, description, checked, disabled, onChange }: SwitchRowProps) {
  return (
    <CustomTooltip title={disabled ? description : ''} arrow>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="body2" sx={{ minWidth: 0 }}>
          {label}
        </Typography>
        <Switch
          size="small"
          slotProps={{ input: { 'aria-label': label, 'aria-description': description } }}
          checked={checked}
          disabled={disabled}
          onChange={(_, value) => onChange(value)}
        />
      </Stack>
    </CustomTooltip>
  );
}

export function FormStageBehaviorSettings({
  policy,
  disabled,
  onChange,
  expandAdvanced = false,
}: Props) {
  const advanced = useBoolean();

  return (
    <Stack spacing={2}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Due after (days)"
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
      </Grid>
      <CustomAccordion
        title="Advanced submission settings"
        expanded={advanced.value || expandAdvanced}
        onChange={advanced.onToggle}
        content={
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={
                <WorkflowSettingLabel
                  label="Submission limit"
                  help="The limit includes the first submission."
                />
              }
              value={policy.maxSubmissionAttempts}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 1, max: 20, 'aria-label': 'Submission limit' } }}
              onChange={(event) => onChange({ maxSubmissionAttempts: Number(event.target.value) })}
            />
            <SwitchRow
              label="Show Save draft"
              description="Allow applicants to save a draft and continue later."
              checked={policy.allowSaveAndResume}
              disabled={disabled}
              onChange={(checked) => onChange({ allowSaveAndResume: checked })}
            />
            <SwitchRow
              label="Allow late submission"
              description={
                policy.dueInDays == null
                  ? 'Set a deadline before allowing late submission.'
                  : 'Let applicants submit after the deadline.'
              }
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
        }
      />
    </Stack>
  );
}
