import type { FormikProps } from 'formik';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, Typography } from '@mui/material';

import { policyPresets, applyPolicyPreset } from './policy-presets';

import type { PolicyValues } from './policy-form';

export function PolicyPresetFields({ formik }: { formik: FormikProps<PolicyValues> }) {
  const [id, setId] = useState('');
  const preset = policyPresets.find((row) => row.id === id);
  return (
    <Stack spacing={1} sx={{ px: 0.5 }}>
      <CustomSelect
        label="Start with example terms"
        name="policyPreset"
        value={id}
        size="small"
        options={policyPresets.map(({ id: value, name }) => ({ id: value, name }))}
        onChange={(value) => setId(String(value))}
        disabled={formik.isSubmitting}
      />
      {preset && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            {preset.description}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={formik.isSubmitting}
            onClick={() => formik.setValues((values) => applyPolicyPreset(values, preset))}
          >
            Apply example terms
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
