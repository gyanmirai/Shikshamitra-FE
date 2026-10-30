import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Grid, Stack, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';

import { WorkflowStageForm } from './workflow-stage-form';
import { WorkflowStageTypeSelect } from './workflow-stage-type-select';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
  isNewStage?: boolean;
};

export function WorkflowFormStageBasics({
  formik,
  metadata,
  stageTypes,
  forms,
  formDefinitionId,
  readOnly,
  isNewStage,
}: Props) {
  const nameError = Boolean(formik.touched.name && formik.errors.name);

  return (
    <Stack spacing={2}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <WorkflowStageTypeSelect
            formik={formik}
            metadata={metadata}
            stageTypes={stageTypes}
            readOnly={readOnly}
            isNewStage={isNewStage}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={nameError}>
            <TextField
              fullWidth
              size="small"
              label="Stage name *"
              disabled={readOnly}
              {...formik.getFieldProps('name')}
              error={nameError}
              helperText={formik.touched.name && formik.errors.name}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={12}>
          <WorkflowStageForm
            formik={formik}
            forms={forms}
            formDefinitionId={formDefinitionId}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {metadata && (!metadata.isRuntimeReady || metadata.isDeprecated) && (
        <StudentFeedback notificationKey="STU-0556" presentation="persistent" severity="error">
          {metadata.replacementGuidance ||
            'This existing stage is not available for new workflows. Replace it before publishing a new version.'}
        </StudentFeedback>
      )}
    </Stack>
  );
}
