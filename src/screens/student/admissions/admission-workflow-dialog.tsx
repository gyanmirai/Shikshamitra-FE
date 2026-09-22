'use client';

import type { CreateUpdateAdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { WorkflowTemplateSelector } from './workflow-builder/components/workflow-template-selector';

import type { WorkflowStarterId } from './workflow-template';

export type WorkflowDetails = Pick<
  CreateUpdateAdmissionWorkflow,
  'name' | 'code' | 'description'
> & { starterJourney?: WorkflowStarterId };

type Props = {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  title?: string;
  initialValues?: WorkflowDetails;
  submitLabel?: string;
  showStarterJourney?: boolean;
  autoGenerateCode?: boolean;
  onSave: (value: WorkflowDetails) => Promise<void>;
};

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .max(128, 'Use 128 characters or fewer')
    .required('Workflow name is required'),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .max(64, 'Use 64 characters or fewer')
    .required('Workflow code is required'),
  description: Yup.string().trim().max(1024, 'Use 1,024 characters or fewer'),
});

const EMPTY_VALUES: WorkflowDetails = {
  name: '',
  code: '',
  description: '',
  starterJourney: 'standard',
};

const CREATE_WORKFLOW_GUIDANCE =
  'Create the draft, choose a starting point, then review every stage before publishing.';

const toWorkflowCode = (name: string) => {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return (code && !/^[A-Z]/.test(code) ? `WF_${code}` : code).slice(0, 64);
};

export function AdmissionWorkflowDialog({
  open,
  onClose,
  saving,
  title = 'Create Workflow',
  submitLabel = 'Create draft',
  initialValues = EMPTY_VALUES,
  showStarterJourney = false,
  autoGenerateCode = false,
  onSave,
}: Props) {
  const discard = useBoolean();
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(Boolean(initialValues.code));
  const formik = useFormik<WorkflowDetails>({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({
          name: values.name.trim(),
          code: values.code.trim().toUpperCase(),
          description: values.description?.trim() || undefined,
          starterJourney: values.starterJourney,
        });
        helpers.resetForm();
        onClose();
      } catch {
        // The screen owns API problem-detail messaging so the form remains reusable.
      }
    },
  });

  useEffect(() => {
    if (open) setCodeManuallyEdited(Boolean(initialValues.code));
  }, [initialValues.code, open]);

  const close = () => {
    discard.onFalse();
    formik.resetForm();
    onClose();
  };
  const requestClose = () => {
    if (formik.dirty && !saving) discard.onTrue();
    else close();
  };

  const dialogTitle = showStarterJourney ? (
    <AdmissionDialogTitle
      title={title}
      helpText={CREATE_WORKFLOW_GUIDANCE}
      helpLabel="About creating a workflow"
    />
  ) : (
    title
  );

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={requestClose}
        title={dialogTitle}
        maxWidth={showStarterJourney ? 'md' : 'sm'}
      >
        <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
          <Stack spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Workflow details</Typography>
              <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
                <TextField
                  fullWidth
                  autoFocus
                  size="small"
                  label="Workflow name *"
                  placeholder="For example, Fresh Admission"
                  {...formik.getFieldProps('name')}
                  onChange={(event) => {
                    const { value } = event.target;
                    formik.setFieldValue('name', value);
                    if (autoGenerateCode && !codeManuallyEdited) {
                      formik.setFieldValue('code', toWorkflowCode(value));
                    }
                  }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={
                    (formik.touched.name && formik.errors.name) ||
                    'Use a name staff will recognize in offerings and reports.'
                  }
                />
              </ShakingTextField>
              <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Workflow code *"
                  placeholder="FRESH_ADMISSION"
                  {...formik.getFieldProps('code')}
                  onChange={(event) => {
                    setCodeManuallyEdited(true);
                    formik.setFieldValue('code', event.target.value.toUpperCase());
                  }}
                  error={Boolean(formik.touched.code && formik.errors.code)}
                  helperText={
                    (formik.touched.code && formik.errors.code) ||
                    (autoGenerateCode
                      ? 'Generated from the workflow name. You can edit it.'
                      : 'Use a stable code for this workflow.')
                  }
                />
              </ShakingTextField>
            </Stack>
            {showStarterJourney && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Choose a starting point</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select the closest school process. You can edit every generated stage and route
                  after the draft is created.
                </Typography>
                <WorkflowTemplateSelector
                  includeBlank
                  value={formik.values.starterJourney ?? 'standard'}
                  onChange={(value) => formik.setFieldValue('starterJourney', value)}
                />
              </Stack>
            )}
            <ShakingTextField
              error={Boolean(formik.touched.description && formik.errors.description)}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Description"
                placeholder="Explain when the school should use this journey."
                {...formik.getFieldProps('description')}
                error={Boolean(formik.touched.description && formik.errors.description)}
                helperText={
                  (formik.touched.description && formik.errors.description) ||
                  'Optional · Visible to staff when choosing and reviewing workflows.'
                }
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={requestClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            loading={saving}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => formik.handleSubmit()}
          >
            {submitLabel}
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard workflow details?"
        content="The workflow information you entered will be lost."
        action={
          <Button color="error" variant="contained" size="small" onClick={close}>
            Discard details
          </Button>
        }
      />
    </>
  );
}
