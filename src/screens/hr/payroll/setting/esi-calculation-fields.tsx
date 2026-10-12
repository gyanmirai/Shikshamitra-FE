'use client';

import type { FormikProps, FormikErrors } from 'formik';
import type { EsiRule, EsiComponentTreatment } from 'src/redux/hr/statutory-scheme-api';
import type {
  EsiConfigurationDraft,
  EsiCalculationSettings,
  EsiConfigurationSettings,
} from 'src/redux/hr/esi-configuration-api';

import { Alert, Stack, Switch, MenuItem, TextField, FormControlLabel } from '@mui/material';

type Props = {
  form: FormikProps<EsiConfigurationDraft>;
  disabled: boolean;
  settings: EsiConfigurationSettings;
  components: EsiComponentTreatment[];
  rule?: EsiRule;
};

export function EsiCalculationFields({ form, disabled, settings, components, rule }: Props) {
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
    <Stack spacing={1}>
      <TextField
        label="Effective payroll month"
        type="month"
        size="small"
        fullWidth
        value={form.values.effectiveMonth ?? ''}
        disabled={disabled}
        slotProps={{ inputLabel: { shrink: true } }}
        error={Boolean(form.errors.effectiveMonth)}
        helperText={form.errors.effectiveMonth}
        onChange={(event) => {
          const month = event.target.value;
          const version =
            settings.history.find((item) => !item.isCancelled && item.effectiveMonth <= month) ??
            settings.current;
          form.setFieldValue('effectiveMonth', month);
          if (version) form.setFieldValue('concurrencyStamp', version.concurrencyStamp);
        }}
      />
      <TextField
        label="ESIC wage basis"
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
        <MenuItem value="CLASSIFIED_EARNINGS">Classified earnings</MenuItem>
        <MenuItem value="GROSS">Gross salary</MenuItem>
        <MenuItem value="BASIC_COMPONENT">Basic component</MenuItem>
      </TextField>
      {form.values.enabled && config.wageBasis === 'BASIC_COMPONENT' && (
        <TextField
          label="Basic component"
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
      {form.values.enabled && (
        <Alert severity="info">
          Eligibility uses full-month statutory wages. Contributions use payable wages after
          attendance. Basic must be marked as Basic in the salary template. Other required wages and
          statutory add-back still apply.
        </Alert>
      )}
      {form.values.enabled && (
        <>
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
          />
          {override ? (
            <>
              <Alert severity="warning">
                Administrator override. Statutory rates: employee {rule?.employeePercentage ?? 0.75}
                %, employer {rule?.employerPercentage ?? 3.25}%. The reason and evidence are saved
                with payroll history.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {(['employeePercentage', 'employerPercentage'] as const).map((key) => (
                  <TextField
                    key={key}
                    label={
                      key === 'employeePercentage'
                        ? 'Employee ESIC percentage'
                        : 'Employer ESIC percentage'
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
          ) : (
            <Alert severity="info">
              Employee ESIC: {rule?.employeePercentage ?? 0.75}%. Employer ESIC:{' '}
              {rule?.employerPercentage ?? 3.25}%.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
