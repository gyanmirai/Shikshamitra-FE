import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';

import CustomSelect from 'src/components/custom-select';
import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';

const sources = [
  'Website',
  'Walk-in',
  'Phone',
  'Referral',
  'Campaign',
  'Import',
  'WhatsApp',
  'Existing parent',
  'Manual',
  'Other',
].map((label, value) => ({ label, value }));

export function InquiryCaptureSettings({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionInquiryPolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionInquiryPolicy>) => void;
}) {
  const allowed = policy.allowedSources;
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Capture and progression</Typography>
      <CustomSelect
        fullWidth
        size="small"
        label="Application can start when"
        value={policy.applicationStartRequirement}
        options={[
          { value: 0, label: 'Inquiry is captured' },
          { value: 1, label: 'First contact is recorded' },
          { value: 2, label: 'Inquiry is qualified' },
        ]}
        disabled={disabled}
        onChange={(value) => onChange({ applicationStartRequirement: Number(value) as 0 | 1 | 2 })}
      />
      <CustomSelect
        fullWidth
        size="small"
        label="Possible duplicate"
        value={policy.duplicateRule}
        options={[
          { value: 0, label: 'Warn and allow' },
          { value: 1, label: 'Require a reason to continue' },
          { value: 2, label: 'Block creation' },
        ]}
        disabled={disabled}
        onChange={(value) => onChange({ duplicateRule: Number(value) as 0 | 1 | 2 })}
      />
      <FormControlLabel
        label="Applications must be linked to an inquiry"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.requireLinkedInquiry}
            onChange={(_, requireLinkedInquiry) => onChange({ requireLinkedInquiry })}
          />
        }
      />
      <FormControlLabel
        label="Require guardian email"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.requireGuardianEmail}
            onChange={(_, requireGuardianEmail) => onChange({ requireGuardianEmail })}
          />
        }
      />
      <FormControlLabel
        label="Require applicant date of birth"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.requireApplicantDateOfBirth}
            onChange={(_, requireApplicantDateOfBirth) => onChange({ requireApplicantDateOfBirth })}
          />
        }
      />
      <CustomSelect
        multiple
        fullWidth
        size="small"
        label="Allowed inquiry sources"
        value={allowed}
        options={sources}
        disabled={disabled}
        onChange={(values) => {
          const next = values.map(Number);
          onChange({
            allowedSources: next,
            requireSourceDetailFor: policy.requireSourceDetailFor.filter((source) =>
              next.includes(source)
            ),
          });
        }}
        helperText="Leave empty to allow every source."
      />
      <CustomSelect
        multiple
        fullWidth
        size="small"
        label="Sources that require details"
        value={policy.requireSourceDetailFor}
        options={
          allowed.length ? sources.filter((source) => allowed.includes(source.value)) : sources
        }
        disabled={disabled}
        onChange={(values) => onChange({ requireSourceDetailFor: values.map(Number) })}
      />
    </Stack>
  );
}
