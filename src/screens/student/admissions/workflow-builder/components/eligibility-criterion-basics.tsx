import type { FormikProps } from 'formik';
import type {
  AdmissionEligibilityKind,
  AdmissionEligibilityCriterion,
} from 'src/redux/student/admissions/admission-eligibility-policy';

import { Stack, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

export const ELIGIBILITY_KIND_OPTIONS = [
  { value: 'age', label: 'Age on a cutoff date' },
  { value: 'application', label: 'Application answers or previous marks' },
  { value: 'inquiry', label: 'Inquiry answers' },
  { value: 'assessment', label: 'Entrance assessment result' },
  { value: 'documents', label: 'Verified documents' },
];

function changeKind(
  value: AdmissionEligibilityCriterion,
  kind: AdmissionEligibilityKind
): AdmissionEligibilityCriterion {
  return {
    ...value,
    kind,
    minAgeMonths: null,
    maxAgeMonths: null,
    cutoffDate: null,
    formDefinitionId: null,
    conditionJson: null,
    sourceStageCode: null,
    minimumPercentage: null,
    requiredOutcome: kind === 'assessment' ? 'passed' : kind === 'documents' ? 'verified' : null,
  };
}

export function EligibilityCriterionBasics({
  formik,
  readOnly,
}: {
  formik: FormikProps<AdmissionEligibilityCriterion>;
  readOnly: boolean;
}) {
  return (
    <Stack spacing={1}>
      <TextField
        fullWidth
        size="small"
        label="Criterion name *"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        disabled={readOnly}
      />
      <TextField
        fullWidth
        size="small"
        label="Criterion code *"
        name="code"
        value={formik.values.code}
        onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
        onBlur={formik.handleBlur}
        disabled={readOnly}
        helperText="A unique reference for this check. Published applications keep their original criteria."
      />
      <CustomSelect
        fullWidth
        size="small"
        label="What should be checked?"
        value={formik.values.kind}
        options={ELIGIBILITY_KIND_OPTIONS}
        disabled={readOnly}
        onChange={(kind) =>
          formik.setValues(changeKind(formik.values, kind as AdmissionEligibilityKind))
        }
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Explanation when this check fails (optional)"
        name="failureMessage"
        value={formik.values.failureMessage ?? ''}
        onChange={formik.handleChange}
        disabled={readOnly}
        helperText="Tell staff what must be corrected or reviewed."
      />
    </Stack>
  );
}
