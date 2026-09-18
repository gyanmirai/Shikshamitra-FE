import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Alert, Stack, MenuItem, TextField } from '@mui/material';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  readOnly: boolean;
};

export function WorkflowStageBasics({ formik, metadata, stageTypes, readOnly }: Props) {
  const availableStageTypes = stageTypes.filter(
    (item) =>
      (item.isRuntimeReady && item.isSelectable !== false) || item.type === formik.values.stageType
  );
  const changeType = (value: string) => {
    const next = stageTypes.find((item) => String(item.type) === value);
    if (!next || next.type === formik.values.stageType) return;
    formik.setValues({
      ...formik.values,
      stageType: next.type,
      configurationJson: undefined,
      isEntryStage: next.canBeEntryStage && formik.values.isEntryStage,
      isTerminalStage: next.canBeTerminalStage && formik.values.isTerminalStage,
    });
  };

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
      <TextField
        select
        fullWidth
        size="small"
        label="Stage type *"
        disabled={readOnly}
        value={String(formik.values.stageType)}
        onChange={(event) => changeType(event.target.value)}
        helperText={metadata?.description}
      >
        {availableStageTypes.map((item) => (
          <MenuItem key={item.type} value={String(item.type)}>
            <Iconify icon={item.icon} sx={{ mr: 1 }} />
            {item.displayName}
            {item.isSelectable === false || !item.isRuntimeReady
              ? ' (not available for new stages)'
              : ''}
          </MenuItem>
        ))}
      </TextField>
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
