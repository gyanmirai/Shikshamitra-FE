import type { FormikProps } from 'formik';

import { MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { WORKFLOW_CONDITION_OPERATORS } from '../workflow-transition-form';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

export function WorkflowTransitionConditionFields({
  formik,
  readOnly,
}: {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
}) {
  const needsValue = !['IsEmpty', 'IsNotEmpty'].includes(formik.values.conditionOperator);
  return (
    <>
      <ShakingTextField
        error={Boolean(formik.touched.conditionField && formik.errors.conditionField)}
      >
        <TextField
          fullWidth
          size="small"
          label="Application field *"
          disabled={readOnly}
          {...formik.getFieldProps('conditionField')}
          error={Boolean(formik.touched.conditionField && formik.errors.conditionField)}
          helperText={formik.touched.conditionField && formik.errors.conditionField}
        />
      </ShakingTextField>
      <TextField
        select
        fullWidth
        size="small"
        label="Operator *"
        disabled={readOnly}
        {...formik.getFieldProps('conditionOperator')}
      >
        {WORKFLOW_CONDITION_OPERATORS.map((operator) => (
          <MenuItem key={operator} value={operator}>
            {operator}
          </MenuItem>
        ))}
      </TextField>
      {needsValue && (
        <ShakingTextField
          error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)}
        >
          <TextField
            fullWidth
            size="small"
            label="Value *"
            disabled={readOnly}
            {...formik.getFieldProps('conditionValue')}
            error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)}
            helperText={formik.touched.conditionValue && formik.errors.conditionValue}
          />
        </ShakingTextField>
      )}
    </>
  );
}
