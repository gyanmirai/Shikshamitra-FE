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
  const registrationForms = forms.filter(
    (form) =>
      form.purpose !== 0 && (form.status === 1 || (readOnly && form.id === formDefinitionId))
  );
  const inquirySelected = forms.some((form) => form.id === formDefinitionId && form.purpose === 0);
  const showError = Boolean(formik.touched.configurationJson || formik.submitCount > 0);
  const hasError =
    inquirySelected || Boolean(showError && formik.errors.configurationJson && !formDefinitionId);

  return (
    <ShakingTextField error={hasError}>
      <TextField
        select
        fullWidth
        size="small"
        label="Published form version *"
        disabled={readOnly}
        value={
          registrationForms.some((form) => form.id === formDefinitionId) ? formDefinitionId : ''
        }
        onBlur={() => formik.setFieldTouched('configurationJson', true)}
        onChange={(event) =>
          formik.setFieldValue(
            'configurationJson',
            writeAdmissionFormDefinitionId(formik.values.configurationJson, event.target.value)
          )
        }
        error={hasError}
        helperText={
          (inquirySelected
            ? 'Select a published registration form. Inquiry forms cannot be used in this stage.'
            : undefined) ||
          (hasError && formik.errors.configurationJson) ||
          (registrationForms.length === 0
            ? 'Publish a registration form before attaching it to this stage.'
            : undefined)
        }
      >
        {registrationForms.map((form) => (
          <MenuItem key={form.id} value={form.id}>
            {form.name} · v{form.version}
          </MenuItem>
        ))}
      </TextField>
    </ShakingTextField>
  );
}
