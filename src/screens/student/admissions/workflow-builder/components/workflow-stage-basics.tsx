import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Alert, Stack, TextField } from '@mui/material';

import { WorkflowStageTypeSelect } from './workflow-stage-type-select';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  readOnly: boolean;
};

export function WorkflowStageBasics({ formik, metadata, stageTypes, readOnly }: Props) {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        size="small"
        label="Stage name *"
        disabled={readOnly}
        {...formik.getFieldProps('name')}
        error={Boolean(formik.touched.name && formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        fullWidth
        size="small"
        label="Stage code *"
        disabled={readOnly}
        {...formik.getFieldProps('code')}
        onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
        error={Boolean(formik.touched.code && formik.errors.code)}
        helperText={formik.touched.code && formik.errors.code}
      />
      <WorkflowStageTypeSelect
        formik={formik}
        metadata={metadata}
        stageTypes={stageTypes}
        readOnly={readOnly}
      />
      {metadata && (!metadata.isRuntimeReady || metadata.isDeprecated) && (
        <Alert severity="error">
          {metadata.replacementGuidance ||
            'This existing stage is not available for new workflows. Replace it before publishing a new version.'}
        </Alert>
      )}
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Staff instructions"
        disabled={readOnly}
        {...formik.getFieldProps('description')}
        error={Boolean(formik.touched.description && formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
      />
    </Stack>
  );
}
