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
  const config = form.values.calculationSettings ?? { wageBasis: 'CLASSIFIED_EARNINGS' };
  const override = config.employeePercentage != null || config.employerPercentage != null;
  const errors: FormikErrors<EsiCalculationSettings> = form.errors.calculationSettings ?? {};
  const update = (change: Partial<EsiCalculationSettings>) =>
    form.setFieldValue('calculationSettings', { ...config, ...change });
  const errorFor = (key: keyof EsiCalculationSettings) => ({
    error: Boolean(errors?.[key]),
    helperText: errors?.[key],
  });
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <TextField
          label="ESIC eligibility basis"
          select
          size="small"
          fullWidth
          value={config.wageBasis}
          disabled={disabled || !form.values.enabled}
          onChange={(event) =>
            update({
              wageBasis: event.target.value as EsiCalculationSettings['wageBasis'],
              basicComponentId: null,
            })
          }
        >
          <MenuItem value="CLASSIFIED_EARNINGS">Included salary components</MenuItem>
          <MenuItem value="GROSS">Gross salary</MenuItem>
          <MenuItem value="BASIC_COMPONENT">Basic salary</MenuItem>
        </TextField>
        {form.values.enabled && config.wageBasis === 'BASIC_COMPONENT' && (
          <TextField
            label="Basic salary component"
            select
            size="small"
            fullWidth
            disabled={disabled}
            value={config.basicComponentId ?? ''}
            {...errorFor('basicComponentId')}
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
      </Stack>
      {form.values.enabled && (
        <Box sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              ESIC calculation basis
            </Typography>
            <CustomTooltip
              arrow
              title={
                <Box sx={{ p: 1.5 }}>
                  Eligibility uses full-month salary. Calculation uses payable salary after
                  attendance adjustments. Basic must use a component marked Basic in the salary
                  template. Other statutory inclusions and adjustments still apply.
                </Box>
              }
            >
              <IconButton size="small" aria-label="About ESIC salary bases">
                <InfoOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Typography
            component="output"
            aria-label="ESIC calculation basis"
            variant="body2"
            fontWeight={600}
          >
            {
              {
                CLASSIFIED_EARNINGS: 'Payable included salary components',
                GROSS: 'Payable gross salary',
                BASIC_COMPONENT: 'Payable basic salary',
              }[config.wageBasis]
            }
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            After attendance adjustments
          </Typography>
        </Box>
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
