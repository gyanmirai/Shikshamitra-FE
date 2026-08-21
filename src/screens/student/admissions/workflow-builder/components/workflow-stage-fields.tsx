import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Alert, Stack, Switch, MenuItem, TextField, FormControlLabel } from '@mui/material';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
};

export function WorkflowStageFields({
  formik,
  metadata,
  stageTypes,
  forms,
  formDefinitionId,
  readOnly,
}: Props) {
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
        <TextField
          fullWidth
          size="small"
          label="Stage name *"
          disabled={readOnly}
          {...formik.getFieldProps('name')}
          error={Boolean(formik.touched.name && formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </ShakingTextField>
      <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
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
      </ShakingTextField>
      <TextField
        select
        fullWidth
        size="small"
        label="Stage type *"
        disabled={readOnly}
        value={String(formik.values.stageType)}
        onChange={(event) => {
          const nextStageType = stageTypes.find(
            (item) => String(item.type) === String(event.target.value)
          )?.type;

          if (nextStageType === undefined) return;

          formik.setFieldValue('stageType', nextStageType);
          formik.setFieldValue('configurationJson', undefined);
        }}
        helperText={metadata?.description}
      >
        {stageTypes.map((item) => (
          <MenuItem key={item.type} value={String(item.type)}>
            <Iconify icon={item.icon} sx={{ mr: 1 }} /> {item.displayName}
            {!item.isRuntimeReady ? ' (configuration only)' : ''}
          </MenuItem>
        ))}
      </TextField>
      {metadata && !metadata.isRuntimeReady && (
        <Alert severity="warning">
          This stage can be configured and published, but its runtime handler is not available yet.
          Applications will not be able to complete it automatically.
        </Alert>
      )}
      <TextField
        fullWidth
        multiline
        minRows={3}
        size="small"
        label="Description"
        disabled={readOnly}
        {...formik.getFieldProps('description')}
        error={Boolean(formik.touched.description && formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
      />
      {metadata?.supportsFormAttachment && (
        <ShakingTextField
          error={Boolean(formik.touched.configurationJson && formik.errors.configurationJson)}
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Published form version *"
            disabled={readOnly}
            value={formDefinitionId}
            onChange={(event) =>
              formik.setFieldValue(
                'configurationJson',
                JSON.stringify({ formDefinitionId: event.target.value.trim() })
              )
            }
            error={Boolean(formik.touched.configurationJson && formik.errors.configurationJson)}
            helperText={
              (formik.touched.configurationJson && formik.errors.configurationJson) ||
              (forms.length === 0
                ? 'Publish a form before attaching it to this stage.'
                : 'The selected immutable form version is frozen with the workflow.')
            }
          >
            {forms.map((form) => (
              <MenuItem key={form.id} value={form.id}>
                {form.name} · v{form.version}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
      )}
      <StageSwitch
        label="Required stage"
        checked={formik.values.isRequired}
        disabled={readOnly}
        onChange={(value) => formik.setFieldValue('isRequired', value)}
      />
      <StageSwitch
        label="Allow authorized manual skip"
        checked={formik.values.allowManualSkip}
        disabled={readOnly}
        onChange={(value) => formik.setFieldValue('allowManualSkip', value)}
      />
      <StageSwitch
        label="Entry stage"
        checked={formik.values.isEntryStage}
        disabled={readOnly || !metadata?.canBeEntryStage}
        onChange={(value) => formik.setFieldValue('isEntryStage', value)}
      />
      <StageSwitch
        label="Terminal stage"
        checked={formik.values.isTerminalStage}
        disabled={readOnly || !metadata?.canBeTerminalStage}
        onChange={(value) => formik.setFieldValue('isTerminalStage', value)}
      />
    </Stack>
  );
}

function StageSwitch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(_, value) => onChange(value)}
        />
      }
      label={label}
    />
  );
}
