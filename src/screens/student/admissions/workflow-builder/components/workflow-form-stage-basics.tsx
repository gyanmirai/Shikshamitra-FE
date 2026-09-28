import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Alert, Stack, TextField, Typography } from '@mui/material';

import { WorkflowStageForm } from './workflow-stage-form';
import { WorkflowStageTypeSelect } from './workflow-stage-type-select';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
};

export function WorkflowFormStageBasics({
  formik,
  metadata,
  stageTypes,
  forms,
  formDefinitionId,
  readOnly,
}: Props) {
  const instructions = useBoolean();
  const nameError = Boolean(formik.touched.name && formik.errors.name);
  const codeError = Boolean(formik.touched.code && formik.errors.code);

  return (
    <Stack spacing={2}>
      <Grid container spacing={1}>
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={codeError}>
            <TextField
              fullWidth
              size="small"
              label="Stage code *"
              disabled={readOnly}
              {...formik.getFieldProps('code')}
              onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
              error={codeError}
              helperText={formik.touched.code && formik.errors.code}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <WorkflowStageTypeSelect
            formik={formik}
            metadata={metadata}
            stageTypes={stageTypes}
            readOnly={readOnly}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <WorkflowStageForm
            formik={formik}
            forms={forms}
            formDefinitionId={formDefinitionId}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {metadata && (!metadata.isRuntimeReady || metadata.isDeprecated) && (
        <Alert severity="error">
          {metadata.replacementGuidance ||
            'This existing stage is not available for new workflows. Replace it before publishing a new version.'}
        </Alert>
      )}

      <CustomAccordion
        title="Staff instructions · Optional"
        expanded={instructions.value}
        onChange={instructions.onToggle}
        content={
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Instructions for admission staff"
            disabled={readOnly}
            {...formik.getFieldProps('description')}
            error={Boolean(formik.touched.description && formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        }
      />

      <Typography variant="body2" color="text.secondary">
        Process and stage settings are configured in the next tabs.
      </Typography>
    </Stack>
  );
}
