import type { FormikProps } from 'formik';

import { Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

const routes = [
  { value: 'eligible', label: 'Meets All Configured Criteria' },
  { value: 'exceptionApproved', label: 'Exception Approved' },
  { value: 'ineligible', label: 'Does Not Meet the Criteria — Send for Review' },
  { value: 'needsInformation', label: 'More Information Needed — Send for Correction' },
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
        label="Continue After Eligibility Check"
        disabled={readOnly}
        value={getEligibilityRoute(formik.values)}
        options={[
          { value: 'default', label: 'Eligible or Approved Exception (Default Route)' },
          ...routes,
          { value: 'custom', label: 'Another Condition' },
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
      <StudentFeedback notificationKey="STU-0549" presentation="inline" severity="info">
        The evaluation must be current. Failed or incomplete checks need an explicit review or
        correction route; they do not automatically reject or finalize admission.
      </StudentFeedback>
    </Stack>
  );
}
