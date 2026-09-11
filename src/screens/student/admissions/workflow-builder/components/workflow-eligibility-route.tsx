import type { FormikProps } from 'formik';

import { Alert, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

const routes = [
  { value: 'eligible', label: 'Meets all configured criteria' },
  { value: 'exceptionApproved', label: 'Exception approved' },
  { value: 'ineligible', label: 'Does not meet the criteria — send for review' },
  { value: 'needsInformation', label: 'More information needed — send for correction' },
];
export function getEligibilityRoute(values: WorkflowTransitionFormValues) {
  if (!values.hasCondition && values.isDefault) return 'default';
  return values.hasCondition &&
    values.conditionField === 'eligibility.status' &&
    values.conditionOperator === 'Equals'
    ? (routes.find((route) => route.value === values.conditionValue)?.value ?? 'custom')
    : 'custom';
}
export function isEligibilityOutcomeCondition(values: WorkflowTransitionFormValues) {
  return routes.some((route) => route.value === getEligibilityRoute(values));
}
export function WorkflowEligibilityRoute({
  formik,
  readOnly,
}: {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
}) {
  return (
    <Stack spacing={1}>
      <CustomSelect
        fullWidth
        size="small"
        label="Continue after eligibility check"
        disabled={readOnly}
        value={getEligibilityRoute(formik.values)}
        options={[
          { value: 'default', label: 'Eligible or approved exception (default route)' },
          ...routes,
          { value: 'custom', label: 'Another condition' },
        ]}
        onChange={(value) => {
          const known = routes.some((route) => route.value === value);
          formik.setValues({
            ...formik.values,
            hasCondition: value !== 'default',
            isDefault: value === 'default',
            conditionField: known ? 'eligibility.status' : '',
            conditionOperator: 'Equals',
            conditionValue: known ? String(value) : '',
          });
        }}
      />
      <Alert severity="info">
        The evaluation must be current. Failed or incomplete checks need an explicit review or
        correction route; they do not automatically reject or finalize admission.
      </Alert>
    </Stack>
  );
}
