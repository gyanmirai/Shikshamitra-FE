import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import CustomTooltip from 'src/components/custom-tooltip';
import { Stack, Switch, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

type Props = {
  policy: AdmissionFormStagePolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
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

export function FormStageBehaviorSettings({ policy, disabled, onChange }: Props) {
  return (
    <Stack spacing={2}>
      <FormSectionCard title="Advanced submission settings" icon="mdi:tune">
        <Stack spacing={1.5}>
          <SwitchRow
            label="Allow late submission"
            description={
              policy.dueInDays == null
                ? 'Late submission requires an existing workflow deadline.'
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
      </FormSectionCard>
    </Stack>
  );
}
