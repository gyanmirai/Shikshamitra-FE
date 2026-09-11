import type { FormikProps } from 'formik';

import { Alert, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

const routes = [
  { value: 'approve', label: 'Admission approved' },
  { value: 'waitlist', label: 'Applicant waitlisted (explicit route)' },
  { value: 'reject', label: 'Application rejected (explicit route)' },
];
export function getReviewRoute(values: WorkflowTransitionFormValues) {
  if (!values.hasCondition && values.isDefault) return 'default';
  return values.hasCondition &&
    values.conditionField === 'review.decision' &&
    values.conditionOperator === 'Equals'
    ? (routes.find((route) => route.value === values.conditionValue)?.value ?? 'custom')
    : 'custom';
}
export function isReviewOutcomeCondition(values: WorkflowTransitionFormValues) {
  return routes.some((route) => route.value === getReviewRoute(values));
}
export function WorkflowReviewRoute({
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
        label="Continue after review decision"
        disabled={readOnly}
        value={getReviewRoute(formik.values)}
        options={[
          { value: 'default', label: 'Admission approved (default route)' },
          ...routes,
          { value: 'custom', label: 'Another condition' },
        ]}
        onChange={(value) => {
          const known = routes.some((route) => route.value === value);
          formik.setValues({
            ...formik.values,
            hasCondition: value !== 'default',
            isDefault: value === 'default',
            conditionField: known ? 'review.decision' : '',
            conditionOperator: 'Equals',
            conditionValue: known ? String(value) : '',
          });
        }}
      />
      <Alert severity="info">
        Routes use the authorized admission decision, not the reviewer’s recommendation. Waitlist
        and rejection need an explicit route. Correction returns the application for another review.
      </Alert>
    </Stack>
  );
}
