import type { FormikProps } from 'formik';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { PolicyValues } from './policy-form';

export function PolicyDateMode({ formik }: { formik: FormikProps<PolicyValues> }) {
  const error = Boolean(formik.touched.dueDateMode && formik.errors.dueDateMode);
  return (
    <ShakingTextField error={error}>
      <CustomSelect
        label="Due date mode"
        required
        fullWidth
        size="small"
        value={formik.values.dueDateMode}
        disabled={formik.isSubmitting}
        options={[
          { id: 0, name: 'Manual school dates' },
          { id: 1, name: 'Automatic school dates' },
        ]}
        labelKey="name"
        valueKey="id"
        onChange={(value) => formik.setFieldValue('dueDateMode', Number(value))}
        helperText={
          error
            ? formik.errors.dueDateMode
            : formik.values.dueDateMode === 0
              ? 'Enter due dates explicitly for issues and renewals, and request expiry when reserving.'
              : 'Calculate dates from saved durations, Library opening days and closures.'
        }
      />
    </ShakingTextField>
  );
}
