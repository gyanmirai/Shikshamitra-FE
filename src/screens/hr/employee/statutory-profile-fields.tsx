'use client';

import type { FormikProps } from 'formik';
import type { StaffStatutoryProfile } from 'src/redux/hr/statutory-profile-api';

import * as Yup from 'yup';
import { useId } from 'react';
import { hasStatutoryNumber } from 'src/redux/hr/statutory-profile-api';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Paper,
  Stack,
  Radio,
  Switch,
  TextField,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

export const statutoryProfileSchema = Yup.object({
  applyPf: Yup.boolean().required(),
  pfNumber: Yup.string()
    .trim()
    .nullable()
    .max(50)
    .matches(/^[a-zA-Z0-9/ -]*$/, {
      excludeEmptyString: true,
      message: 'Use letters, numbers, spaces, slash or hyphen.',
    }),
  uanNumber: Yup.string()
    .transform((value) => (value?.trim() === '0' ? '' : value?.trim()))
    .nullable()
    .matches(/^(\d{12})?$/, 'UAN must contain 12 digits.'),
  pfDisabledReason: Yup.string()
    .nullable()
    .max(500)
    .when('applyPf', {
      is: false,
      then: (schema) => schema.trim().required('Enter a reason for turning PF off.'),
    }),
  applyEsic: Yup.boolean().required(),
  esicInsuranceNumber: Yup.string()
    .trim()
    .nullable()
    .max(100)
    .matches(/^[a-zA-Z0-9/-]*$/, {
      excludeEmptyString: true,
      message: 'Enter a valid insurance number.',
    }),
  esicDisabledReason: Yup.string()
    .nullable()
    .max(500)
    .when('applyEsic', {
      is: false,
      then: (schema) => schema.trim().required('Enter a reason for turning ESIC off.'),
    }),
});

export function StatutoryProfileFields({
  form,
  canManagePf = true,
  canManageEsic = true,
  canViewPf = true,
  canViewEsic = true,
  disabled = false,
  grossSalary,
  pfChoiceRequired = false,
  pfChoice = null,
  onPfChoice,
}: {
  form: FormikProps<StaffStatutoryProfile>;
  canManagePf?: boolean;
  canManageEsic?: boolean;
  canViewPf?: boolean;
  canViewEsic?: boolean;
  disabled?: boolean;
  grossSalary?: number;
  pfChoiceRequired?: boolean;
  pfChoice?: boolean | null;
  onPfChoice?: (apply: boolean) => void;
}) {
  const descriptionId = useId();
  const schemes = [
    {
      code: 'PF',
      title: 'Apply PF',
      apply: 'applyPf',
      number: 'pfNumber',
      numberLabel: 'PF number',
      reason: 'pfDisabledReason',
      manage: canManagePf,
      view: canViewPf,
      description:
        grossSalary != null
          ? grossSalary <= 25000
            ? 'Required by default up to ₹25,000 gross salary.'
            : 'Optional above ₹25,000 gross salary.'
          : 'Eligibility is confirmed during salary setup.',
    },
    {
      code: 'ESIC',
      title: 'Apply ESIC',
      apply: 'applyEsic',
      number: 'esicInsuranceNumber',
      numberLabel: 'ESIC insurance number',
      reason: 'esicDisabledReason',
      manage: canManageEsic,
      view: canViewEsic,
      description: 'Calculated independently using the school’s ESIC settings.',
    },
  ] as const;
  const field = (
    name: keyof StaffStatutoryProfile,
    label: string,
    readOnly: boolean,
    helperText?: string
  ) => {
    const meta = form.getFieldMeta(name);
    return (
      <TextField
        {...form.getFieldProps(name)}
        value={form.values[name] ?? ''}
        label={label}
        size="small"
        fullWidth
        disabled={readOnly}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error ? meta.error : helperText}
      />
    );
  };
  return (
    <Grid container spacing={1.5}>
      {schemes
        .filter((scheme) => scheme.view)
        .map((scheme) => {
          const apply = form.values[scheme.apply];
          const registered = hasStatutoryNumber(form.values[scheme.number]);
          const readOnly = disabled || !scheme.manage;
          return (
            <Grid size={{ xs: 12, md: 6 }} key={scheme.code}>
              <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', height: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ p: 1.5, bgcolor: 'background.neutral' }}
                >
                  <Box>
                    <Typography variant="subtitle2">{scheme.title}</Typography>
                    <Typography
                      id={`${descriptionId}-${scheme.code}`}
                      variant="caption"
                      color="text.secondary"
                    >
                      {scheme.code === 'PF' && pfChoiceRequired
                        ? 'Above ₹25,000 gross salary, choose whether to enroll in PF.'
                        : scheme.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {!(scheme.code === 'PF' && pfChoiceRequired) && (
                      <Switch
                        checked={apply}
                        onChange={(_, checked) => form.setFieldValue(scheme.apply, checked)}
                        disabled={readOnly}
                        slotProps={{ input: { 'aria-label': scheme.title } }}
                      />
                    )}
                    <Chip
                      size="small"
                      variant="soft"
                      color={!apply || !registered ? 'warning' : 'success'}
                      label={!apply ? 'Off' : registered ? 'Ready' : 'Pending'}
                    />
                  </Stack>
                </Stack>
                <Stack spacing={1.5} sx={{ p: 1.5 }}>
                  {scheme.code === 'PF' && pfChoiceRequired && (
                    <RadioGroup
                      row
                      aria-label="PF enrollment"
                      aria-describedby={`${descriptionId}-PF`}
                      value={pfChoice == null ? '' : pfChoice ? 'ON' : 'OFF'}
                      onChange={(_, value) => onPfChoice?.(value === 'ON')}
                    >
                      <FormControlLabel
                        value="ON"
                        control={<Radio size="small" />}
                        label="Opt in to PF"
                        disabled={readOnly}
                      />
                      <FormControlLabel
                        value="OFF"
                        control={<Radio size="small" />}
                        label="Opt out of PF"
                        disabled={readOnly}
                      />
                    </RadioGroup>
                  )}
                  {field(
                    scheme.number,
                    scheme.numberLabel,
                    readOnly,
                    'Required for deductions. Blank or 0 means registration pending.'
                  )}
                  {scheme.code === 'PF' && field('uanNumber', 'UAN (optional)', readOnly)}
                  {!apply &&
                    field(scheme.reason, `Reason for turning ${scheme.code} off`, readOnly)}
                  {(!apply || !registered) && (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      {!apply
                        ? `${scheme.code} is turned off for this employee. No contribution will be applied.`
                        : `No ${scheme.numberLabel} is recorded. Eligible contributions will be ₹0 until it is provided.`}
                    </Alert>
                  )}
                </Stack>
              </Paper>
            </Grid>
          );
        })}
    </Grid>
  );
}
