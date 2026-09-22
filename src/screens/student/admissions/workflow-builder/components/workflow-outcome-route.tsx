import type { FormikProps } from 'formik';

import { Alert, Stack, MenuItem, TextField } from '@mui/material';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

export type WorkflowOutcomeOption = { value: string; label: string };

export function isWorkflowOutcomeCondition(
  values: WorkflowTransitionFormValues,
  field: string,
  outcomes: readonly WorkflowOutcomeOption[]
) {
  return (
    values.hasCondition &&
    values.conditionField === field &&
    values.conditionOperator === 'Equals' &&
    outcomes.some((outcome) => outcome.value === values.conditionValue)
  );
}

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
  field: string;
  label: string;
  defaultLabel: string;
  outcomes: readonly WorkflowOutcomeOption[];
  guidance: string;
};

export function WorkflowOutcomeRoute({
  formik,
  readOnly,
  field,
  label,
  defaultLabel,
  outcomes,
  guidance,
}: Props) {
  const { values } = formik;
  const route = isWorkflowOutcomeCondition(values, field, outcomes)
    ? values.conditionValue
    : !values.hasCondition && values.isDefault
      ? 'default'
      : 'custom';
  const selectRoute = (value: string) => {
    formik.setValues({
      ...values,
      hasCondition: value !== 'default',
      isDefault: value === 'default',
      conditionField: value === 'custom' ? '' : field,
      conditionOperator: 'Equals',
      conditionValue: value === 'custom' || value === 'default' ? '' : value,
    });
  };

  return (
    <Stack spacing={1}>
      <TextField
        select
        fullWidth
        size="small"
        label={label}
        value={route}
        disabled={readOnly}
        onChange={(event) => selectRoute(event.target.value)}
      >
        <MenuItem value="default">{defaultLabel}</MenuItem>
        {outcomes.map((outcome) => (
          <MenuItem key={outcome.value} value={outcome.value}>
            {outcome.label}
          </MenuItem>
        ))}
        <MenuItem value="custom">Another condition</MenuItem>
      </TextField>
      <Alert severity="info">{guidance}</Alert>
    </Stack>
  );
}
