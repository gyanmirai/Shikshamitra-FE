import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Grid, Alert, Stack, TextField } from '@mui/material';

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
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <WorkflowStageTypeSelect
            formik={formik}
            metadata={metadata}
            stageTypes={stageTypes}
            readOnly={readOnly}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Stage name *"
            disabled={readOnly}
            {...formik.getFieldProps('name')}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
      </Grid>
      {metadata && (!metadata.isRuntimeReady || metadata.isDeprecated) && (
        <Alert severity="error">
          {metadata.replacementGuidance ||
            'This existing stage is not available for new workflows. Replace it before publishing a new version.'}
        </Alert>
      )}
    </Stack>
  );
}
