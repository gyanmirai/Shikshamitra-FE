import type { FormikProps } from 'formik';

import { Alert, Stack, MenuItem, TextField } from '@mui/material';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

const outcomes = ['passed', 'failed', 'absent', 'retake', 'waived'] as const;

export function isAssessmentOutcomeCondition(values: WorkflowTransitionFormValues) {
  return (
    values.hasCondition &&
    values.conditionField === 'assessment.outcome' &&
    values.conditionOperator === 'Equals' &&
    outcomes.some((value) => value === values.conditionValue)
  );
}

export function WorkflowAssessmentRoute({
  formik,
  readOnly,
}: {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
}) {
  const { values } = formik;
  const route = isAssessmentOutcomeCondition(values)
    ? values.conditionValue
    : !values.hasCondition && values.isDefault
      ? 'default'
      : 'custom';
  const selectRoute = (value: string) => {
    formik.setValues({
      ...values,
      hasCondition: value !== 'default',
      isDefault: value === 'default',
      conditionField: value === 'custom' ? '' : 'assessment.outcome',
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
        label="Continue after"
        value={route}
        disabled={readOnly}
        onChange={(event) => selectRoute(event.target.value)}
      >
        <MenuItem value="default">Passed or waived (default route)</MenuItem>
        {outcomes.map((outcome) => (
          <MenuItem key={outcome} value={outcome}>
            {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
          </MenuItem>
        ))}
        <MenuItem value="custom">Another condition</MenuItem>
      </TextField>
      <Alert severity="info">
        Failed, absent, and retake outcomes only follow a matching outcome route. Staff can also
        start an allowed retake from the applicant’s assessment.
      </Alert>
    </Stack>
  );
}
