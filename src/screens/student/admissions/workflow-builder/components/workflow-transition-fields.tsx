import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import ShakingTextField from 'src/components/shaking-text-field';
import { Stack, Switch, MenuItem, TextField, FormControlLabel } from '@mui/material';

import { WORKFLOW_CONDITION_OPERATORS } from '../workflow-transition-form';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
};

export function WorkflowTransitionFields({ formik, stages, readOnly }: Props) {
  const needsValue = !['IsEmpty', 'IsNotEmpty'].includes(formik.values.conditionOperator);
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      <StageSelect formik={formik} field="fromStageId" label="From stage *" stages={stages} readOnly={readOnly} />
      <StageSelect formik={formik} field="toStageId" label="To stage *" stages={stages} readOnly={readOnly} />
      <TextField fullWidth size="small" type="number" label="Priority *" disabled={readOnly} {...formik.getFieldProps('priority')} />
      <FormControlLabel
        control={<Switch size="small" checked={formik.values.hasCondition} disabled={readOnly} onChange={(_, value) => { formik.setFieldValue('hasCondition', value); if (value) formik.setFieldValue('isDefault', false); }} />}
        label="Use a condition"
      />
      {formik.values.hasCondition ? (
        <>
          <ShakingTextField error={Boolean(formik.touched.conditionField && formik.errors.conditionField)}>
            <TextField fullWidth size="small" label="Application field *" disabled={readOnly} {...formik.getFieldProps('conditionField')} error={Boolean(formik.touched.conditionField && formik.errors.conditionField)} helperText={formik.touched.conditionField && formik.errors.conditionField} />
          </ShakingTextField>
          <TextField select fullWidth size="small" label="Operator *" disabled={readOnly} {...formik.getFieldProps('conditionOperator')}>
            {WORKFLOW_CONDITION_OPERATORS.map((operator) => <MenuItem key={operator} value={operator}>{operator}</MenuItem>)}
          </TextField>
          {needsValue && (
            <ShakingTextField error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)}>
              <TextField fullWidth size="small" label="Value *" disabled={readOnly} {...formik.getFieldProps('conditionValue')} error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)} helperText={formik.touched.conditionValue && formik.errors.conditionValue} />
            </ShakingTextField>
          )}
        </>
      ) : (
        <FormControlLabel control={<Switch size="small" checked={formik.values.isDefault} disabled={readOnly} onChange={(_, value) => formik.setFieldValue('isDefault', value)} />} label="Default route" />
      )}
    </Stack>
  );
}

function StageSelect({ formik, field, label, stages, readOnly }: Props & { field: 'fromStageId' | 'toStageId'; label: string }) {
  const touched = formik.touched[field];
  const error = formik.errors[field];
  return (
    <ShakingTextField error={Boolean(touched && error)}>
      <TextField select fullWidth size="small" label={label} disabled={readOnly} {...formik.getFieldProps(field)} error={Boolean(touched && error)} helperText={touched && error}>
        {stages.map((stage) => <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>)}
      </TextField>
    </ShakingTextField>
  );
}
