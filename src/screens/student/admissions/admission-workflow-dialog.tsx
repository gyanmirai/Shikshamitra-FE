'use client';

import type { CreateUpdateAdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

type WorkflowDetails = Pick<CreateUpdateAdmissionWorkflow, 'name' | 'code' | 'description'>;

type Props = {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  title?: string;
  initialValues?: WorkflowDetails;
  submitLabel?: string;
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

const EMPTY_VALUES: WorkflowDetails = { name: '', code: '', description: '' };

export function AdmissionWorkflowDialog({
  open,
  onClose,
  saving,
  title = 'Create Workflow',
  submitLabel = 'Create draft',
  initialValues = EMPTY_VALUES,
  onSave,
}: Props) {
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
        });
        helpers.resetForm();
        onClose();
      } catch {
        // The screen owns API problem-detail messaging so the form remains reusable.
      }
    },
  });

  return (
    <CustomDialog open={open} handleClose={onClose} title={title} maxWidth="sm">
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Create the draft first, then add stages and transitions in the workflow builder.
          </Typography>
          <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              label="Workflow name *"
              {...formik.getFieldProps('name')}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </ShakingTextField>
          <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
            <TextField
              fullWidth
              size="small"
              label="Workflow code *"
              {...formik.getFieldProps('code')}
              onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
              error={Boolean(formik.touched.code && formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </ShakingTextField>
          <ShakingTextField
            error={Boolean(formik.touched.description && formik.errors.description)}
          >
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label="Description"
              {...formik.getFieldProps('description')}
              error={Boolean(formik.touched.description && formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
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
  );
}
