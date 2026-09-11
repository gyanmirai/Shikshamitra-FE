import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';

import CustomSelect from 'src/components/custom-select';
import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';

import { InquiryCounsellorSelect } from './inquiry-counsellor-select';

export function InquiryOwnershipSettings({
  policy,
  disabled,
  available,
  onChange,
}: {
  policy: AdmissionInquiryPolicy;
  disabled: boolean;
  available: boolean;
  onChange: (change: Partial<AdmissionInquiryPolicy>) => void;
}) {
  const roundRobin = policy.assignmentMode === 1;
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Ownership</Typography>
      <CustomSelect
        fullWidth
        size="small"
        label="Assignment method"
        value={policy.assignmentMode}
        options={[
          { value: 0, label: 'Assign manually or use a default' },
          { value: 1, label: 'Round robin across a team' },
        ]}
        disabled={disabled}
        onChange={(value) => onChange({ assignmentMode: Number(value) as 0 | 1 })}
        helperText="Round robin balances new inquiries across the selected counsellors."
      />
      <InquiryCounsellorSelect
        value={
          roundRobin
            ? policy.counsellorPoolUserIds
            : policy.defaultCounsellorId
              ? [policy.defaultCounsellorId]
              : []
        }
        multiple={roundRobin}
        disabled={disabled}
        available={available}
        label={roundRobin ? 'Counsellor team *' : 'Default counsellor (optional)'}
        onChange={(ids) =>
          onChange(
            roundRobin ? { counsellorPoolUserIds: ids } : { defaultCounsellorId: ids[0] ?? null }
          )
        }
      />
      <FormControlLabel
        label="Only the assigned counsellor can update the inquiry"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.restrictActionsToAssignedCounsellor}
            onChange={(_, restrictActionsToAssignedCounsellor) =>
              onChange({ restrictActionsToAssignedCounsellor })
            }
          />
        }
      />
    </Stack>
  );
}
