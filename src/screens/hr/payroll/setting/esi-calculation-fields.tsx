'use client';

import type { FormikProps, FormikErrors } from 'formik';
import type { EsiRule, EsiComponentTreatment } from 'src/redux/hr/statutory-scheme-api';
import type {
  EsiConfigurationDraft,
  EsiCalculationSettings,
} from 'src/redux/hr/esi-configuration-api';

import { InfoOutlined } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Alert,
  Stack,
  Switch,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

type Props = {
  form: FormikProps<EsiConfigurationDraft>;
  disabled: boolean;
  components: EsiComponentTreatment[];
  rule?: EsiRule;
};

export function EsiCalculationFields({ form, disabled, components, rule }: Props) {
  const config = form.values.calculationSettings;
  const override = config.employeePercentage != null || config.employerPercentage != null;
  const errors: FormikErrors<EsiCalculationSettings> = form.errors.calculationSettings ?? {};
  const update = (change: Partial<EsiCalculationSettings>) => {
    const next = { ...config, ...change };
    if (next.eligibilityBasis !== 'BASIC_COMPONENT' && next.calculationBasis !== 'BASIC_COMPONENT')
      next.basicComponentId = null;
    return form.setFieldValue('calculationSettings', next);
  };
  const errorFor = (key: keyof EsiCalculationSettings) => ({
    error: Boolean(errors?.[key]),
    helperText: errors?.[key],
  });
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="subtitle2">Salary bases</Typography>
        <CustomTooltip
          arrow
          title={
            <Box sx={{ p: 1.5 }}>
              Choose eligibility and calculation bases independently. Eligibility uses full-month
              salary. Calculation uses payable salary after attendance adjustments. Basic must use a
              component marked Basic in the salary template. Other statutory inclusions and
              adjustments still apply.
            </Box>
          }
        >
          <IconButton size="small" aria-label="About ESIC salary bases">
            <InfoOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </CustomTooltip>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        {(['eligibilityBasis', 'calculationBasis'] as const).map((key) => (
          <TextField
            key={key}
            label={key === 'eligibilityBasis' ? 'ESIC eligibility basis' : 'ESIC calculation basis'}
            select
            size="small"
            fullWidth
            value={config[key]}
            disabled={disabled || !form.values.enabled}
            helperText={
              key === 'eligibilityBasis'
                ? 'Full-month salary for eligibility'
                : 'Payable salary after attendance adjustments'
            }
            onChange={(event) => update({ [key]: event.target.value })}
          >
            <MenuItem value="CLASSIFIED_EARNINGS">Included salary components</MenuItem>
            <MenuItem value="GROSS">Gross salary</MenuItem>
            <MenuItem value="BASIC_COMPONENT">Basic salary</MenuItem>
          </TextField>
        ))}
      </Stack>
      {form.values.enabled &&
        (config.eligibilityBasis === 'BASIC_COMPONENT' ||
          config.calculationBasis === 'BASIC_COMPONENT') && (
          <TextField
            label="Basic salary component"
            select
            size="small"
            fullWidth
            disabled={disabled}
            value={config.basicComponentId ?? ''}
            {...errorFor('basicComponentId')}
            helperText={errors.basicComponentId || 'Used wherever Basic salary is selected.'}
            onChange={(event) => update({ basicComponentId: event.target.value })}
          >
            <MenuItem value="">Choose a component</MenuItem>
            {components.map((component) => (
              <MenuItem key={component.componentId} value={component.componentId}>
                {component.componentName}
              </MenuItem>
            ))}
          </TextField>
        )}
      {form.values.enabled && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Contribution rates</Typography>
              {!override && (
                <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">
                    Employee{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {rule?.employeePercentage ?? 0.75}%
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employer{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {rule?.employerPercentage ?? 3.25}%
                    </Box>
                  </Typography>
                </Stack>
              )}
            </Stack>
            <FormControlLabel
              label="Use administrator rate override"
              control={
                <Switch
                  checked={override}
                  disabled={disabled}
                  onChange={(_, checked) =>
                    update({
                      employeePercentage: checked ? (rule?.employeePercentage ?? 0.75) : null,
                      employerPercentage: checked ? (rule?.employerPercentage ?? 3.25) : null,
                      overrideReason: null,
                      evidenceReference: null,
                    })
                  }
                />
              }
              sx={{ mr: 0 }}
            />
          </Stack>
          {override && (
            <>
              <Alert severity="warning">
                Administrator override. Statutory rates: employee {rule?.employeePercentage ?? 0.75}
                %, employer {rule?.employerPercentage ?? 3.25}%. The reason and evidence are saved
                with payroll history.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {(['employeePercentage', 'employerPercentage'] as const).map((key) => (
                  <TextField
                    key={key}
                    label={
                      key === 'employeePercentage'
                        ? 'Employee ESIC rate (%)'
                        : 'Employer ESIC rate (%)'
                    }
                    type="number"
                    size="small"
                    fullWidth
                    disabled={disabled}
                    value={config[key] ?? ''}
                    {...errorFor(key)}
                    slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
                    onChange={(event) =>
                      update({
                        [key]: event.target.value === '' ? null : Number(event.target.value),
                      })
                    }
                  />
                ))}
              </Stack>
              <TextField
                label="Rate override reason"
                size="small"
                fullWidth
                disabled={disabled}
                value={config.overrideReason ?? ''}
                {...errorFor('overrideReason')}
                onChange={(event) => update({ overrideReason: event.target.value })}
              />
              <TextField
                label="Supporting evidence reference"
                size="small"
                fullWidth
                disabled={disabled}
                value={config.evidenceReference ?? ''}
                {...errorFor('evidenceReference')}
                onChange={(event) => update({ evidenceReference: event.target.value })}
              />
            </>
          )}
        </>
      )}
    </Stack>
  );
}
