import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Switch, FormControlLabel } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  policy: AdmissionFormStagePolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionFormStagePolicy>) => void;
};

const label = 'Allow Corrections';
const description = 'Let applicants make corrections after review.';

export function FormStageBehaviorSettings({ policy, disabled, onChange }: Props) {
  return (
    <CustomTooltip title={disabled ? description : ''} arrow>
      <FormControlLabel
        label={label}
        control={
          <Switch
            size="small"
            slotProps={{ input: { 'aria-label': label, 'aria-description': description } }}
            checked={policy.allowCorrectionRequests}
            disabled={disabled}
            onChange={(_, checked) => onChange({ allowCorrectionRequests: checked })}
          />
        }
        sx={{
          m: 0,
          width: 1,
          justifyContent: 'space-between',
          flexDirection: 'row-reverse',
          gap: 1,
        }}
      />
    </CustomTooltip>
  );
}
