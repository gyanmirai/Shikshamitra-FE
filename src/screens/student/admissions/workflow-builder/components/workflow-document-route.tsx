import type { FormikProps } from 'formik';

import { Alert, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

const routes = [
  {
    value: 'verified',
    label: 'Required documents resolved',
    field: 'documents.status',
    operator: 'Equals',
    expected: 'verified',
  },
] as const;
export function getDocumentRoute(values: WorkflowTransitionFormValues) {
  if (!values.hasCondition && values.isDefault) return 'default';
  return (
    routes.find(
      (route) =>
        values.hasCondition &&
        values.conditionField === route.field &&
        values.conditionOperator === route.operator &&
        values.conditionValue === route.expected
    )?.value ?? 'custom'
  );
}
export function isDocumentOutcomeCondition(values: WorkflowTransitionFormValues) {
  return routes.some((route) => route.value === getDocumentRoute(values));
}
export function WorkflowDocumentRoute({
  formik,
  readOnly,
}: {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
}) {
  const { values } = formik;
  const selectRoute = (value: string) => {
    const route = routes.find((item) => item.value === value);
    formik.setValues({
      ...values,
      hasCondition: value !== 'default',
      isDefault: value === 'default',
      conditionField: route?.field ?? '',
      conditionOperator: route?.operator ?? 'Equals',
      conditionValue: route?.expected ?? '',
    });
  };
  return (
    <Stack spacing={1}>
      <CustomSelect
        size="small"
        fullWidth
        label="Continue after document review"
        value={getDocumentRoute(values)}
        disabled={readOnly}
        options={[
          { value: 'default', label: 'Required documents resolved (default route)' },
          ...routes.map(({ value, label }) => ({ value, label })),
          { value: 'custom', label: 'Another condition' },
        ]}
        onChange={(value) => selectRoute(String(value))}
      />
      <Alert severity="info">
        Every required document must be accepted before any route can continue. Rejected documents
        need replacement and fresh verification.
      </Alert>
    </Stack>
  );
}
