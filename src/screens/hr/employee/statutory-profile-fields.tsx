'use client';

import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { StaffStatutoryProfile } from 'src/redux/hr/statutory-profile-api';

import * as Yup from 'yup';
import { useId } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { hasStatutoryNumber } from 'src/redux/hr/statutory-profile-api';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Radio,
  Switch,
  TextField,
  Accordion,
  RadioGroup,
  Typography,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
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
    .max(500, 'PF off-reason cannot exceed 500 characters.')
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
    .max(500, 'ESIC off-reason cannot exceed 500 characters.')
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
  pfSettings,
  compact = false,
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
  pfSettings?: ReactNode;
  compact?: boolean;
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
      description: 'Uses the school’s ESIC eligibility and calculation rules.',
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
        autoComplete="off"
        spellCheck={name !== 'pfNumber' && name !== 'uanNumber' && name !== 'esicInsuranceNumber'}
        multiline={name === 'pfDisabledReason' || name === 'esicDisabledReason'}
        maxRows={3}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { ...(name === 'uanNumber' ? { inputMode: 'numeric' as const } : {}) },
        }}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error ? meta.error : helperText}
      />
    );
  };
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 1.5,
        alignItems: 'start',
      }}
    >
      {schemes
        .filter((scheme) => scheme.view)
        .map((scheme) => {
          const apply = form.values[scheme.apply];
          const registered = hasStatutoryNumber(form.values[scheme.number]);
          const readOnly = disabled || !scheme.manage;
          return (
            <Paper
              key={scheme.code}
              variant="outlined"
              sx={{ borderRadius: 1.5, overflow: 'hidden', minWidth: 0 }}
            >
              <Stack
                spacing={0.5}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.neutral',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ minWidth: 0 }}
                  >
                    <Typography component="h3" variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {scheme.title}
                    </Typography>
                    <Chip
                      size="small"
                      variant="soft"
                      color={
                        !apply || (scheme.code === 'PF' && pfChoiceRequired && pfChoice == null)
                          ? 'default'
                          : !registered
                            ? 'warning'
                            : 'success'
                      }
                      label={
                        scheme.code === 'PF' && pfChoiceRequired && pfChoice == null
                          ? 'Choose'
                          : !apply
                            ? 'Off'
                            : registered
                              ? 'Number recorded'
                              : 'Registration pending'
                      }
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                    {!(scheme.code === 'PF' && pfChoiceRequired) && (
                      <Switch
                        checked={apply}
                        onChange={(_, checked) => form.setFieldValue(scheme.apply, checked)}
                        disabled={readOnly}
                        slotProps={{
                          input: {
                            'aria-label': scheme.title,
                            'aria-describedby': `${descriptionId}-${scheme.code}`,
                          },
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
                <Typography
                  id={`${descriptionId}-${scheme.code}`}
                  variant="caption"
                  color="text.secondary"
                >
                  {scheme.code === 'PF' && pfChoiceRequired
                    ? 'Above ₹25,000 gross salary, choose whether to enroll in PF.'
                    : scheme.description}
                </Typography>
              </Stack>
              <Stack spacing={2} sx={{ p: 1.5 }}>
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
                {scheme.code === 'PF' && pfSettings}
                {compact ? (
                  <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, minHeight: 36 }}>
                      <Typography variant="body2">{scheme.code} registration details</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {apply && !registered && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={1.5}
                        >
                          Contributions still apply when eligible. Add the number when available.
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            scheme.code === 'PF'
                              ? 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))'
                              : '1fr',
                          gap: 1.5,
                        }}
                      >
                        {field(scheme.number, scheme.numberLabel, readOnly)}
                        {scheme.code === 'PF' && field('uanNumber', 'UAN', readOnly)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        scheme.code === 'PF'
                          ? 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))'
                          : '1fr',
                      gap: 1.5,
                    }}
                  >
                    {field(scheme.number, scheme.numberLabel, readOnly)}
                    {scheme.code === 'PF' && field('uanNumber', 'UAN', readOnly)}
                  </Box>
                )}
                {(!apply ||
                  Boolean(form.values[scheme.reason]) ||
                  Boolean(form.errors[scheme.reason])) && (
                  <Stack spacing={0.5}>
                    {field(
                      scheme.reason,
                      apply
                        ? `Retained ${scheme.code} off-reason`
                        : `Reason for turning ${scheme.code} off`,
                      readOnly
                    )}
                    {apply && (
                      <Typography variant="caption" color="text.secondary">
                        {scheme.code} is on. This retained off-reason is not used while{' '}
                        {scheme.code} is on. Correct any error or clear the reason.
                      </Typography>
                    )}
                  </Stack>
                )}
                {(!apply || (!compact && !registered)) && (
                  <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{
                      py: 0.5,
                      px: 1.25,
                      borderColor: 'warning.light',
                      bgcolor: 'background.paper',
                      '& .MuiAlert-message': { typography: 'caption' },
                      '& .MuiAlert-icon': { fontSize: 18 },
                    }}
                  >
                    {!apply
                      ? `${scheme.code} is turned off for this employee. No contribution will be applied.`
                      : `No ${scheme.numberLabel} is recorded. Contributions still apply when eligible. Add the number when available.`}
                  </Alert>
                )}
              </Stack>
            </Paper>
          );
        })}
    </Box>
  );
}
