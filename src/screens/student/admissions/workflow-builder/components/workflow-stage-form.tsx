import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { writeAdmissionFormDefinitionId } from 'src/redux/student/admissions/admission-form-stage-policy';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
};

export function WorkflowStageForm({ formik, forms, formDefinitionId, readOnly }: Props) {
  const showError = Boolean(formik.touched.configurationJson || formik.submitCount > 0);
  const hasError = Boolean(showError && formik.errors.configurationJson);

  return (
    <ShakingTextField error={hasError}>
      <TextField
        select
        fullWidth
        size="small"
        label="Published form version *"
        disabled={readOnly}
        value={formDefinitionId}
        onBlur={() => formik.setFieldTouched('configurationJson', true)}
        onChange={(event) =>
          formik.setFieldValue(
            'configurationJson',
            writeAdmissionFormDefinitionId(formik.values.configurationJson, event.target.value)
          )
        }
        error={hasError}
        helperText={
          (showError && formik.errors.configurationJson) ||
          (forms.length === 0
            ? 'Publish a form before attaching it to this stage.'
            : formDefinitionId
              ? 'The selected version is frozen with the workflow.'
              : undefined)
        }
      >
        {forms.map((form) => (
          <MenuItem key={form.id} value={form.id}>
            {form.name} · v{form.version}
          </MenuItem>
        ))}
      </TextField>
    </ShakingTextField>
  );
}
