import { useRef } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type { IdentitySelection } from '../types';

type Props = {
  value: IdentitySelection;
  initialValue?: IdentitySelection;
  enableFormatting?: boolean;
  disabled: boolean;
  errors?: { principalName?: string; designation?: string };
  onChange: (selection: IdentitySelection) => void;
};

export function IdentitySignatureFields({
  value,
  initialValue,
  enableFormatting = true,
  disabled,
  errors,
  onChange,
}: Props) {
  const initial = useRef(initialValue ?? value);
  const namePreview = useInstituteFieldPreview(
    'schoolIdentity',
    'principalName',
    value.principalName ?? '',
    !enableFormatting || value.principalName === initial.current.principalName
  );
  const designationPreview = useInstituteFieldPreview(
    'schoolIdentity',
    'designation',
    value.designation ?? '',
    !enableFormatting || value.designation === initial.current.designation
  );
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      <ShakingTextField error={Boolean(errors?.principalName)}>
        <TextField
          size="small"
          fullWidth
          required
          label="Principal’s name"
          value={value.principalName ?? ''}
          disabled={disabled}
          error={Boolean(errors?.principalName)}
          helperText={errors?.principalName || namePreview}
          onChange={(event) => onChange({ ...value, principalName: event.target.value })}
        />
      </ShakingTextField>
      <ShakingTextField error={Boolean(errors?.designation)}>
        <TextField
          size="small"
          fullWidth
          required
          label="Designation"
          value={value.designation ?? ''}
          disabled={disabled}
          error={Boolean(errors?.designation)}
          helperText={errors?.designation || designationPreview}
          onChange={(event) => onChange({ ...value, designation: event.target.value })}
        />
      </ShakingTextField>
    </Stack>
  );
}
