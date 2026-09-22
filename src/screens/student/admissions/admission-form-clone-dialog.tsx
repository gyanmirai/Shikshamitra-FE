import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

export type AdmissionFormCloneValues = {
  name: string;
  code: string;
  description?: string | null;
};

type Props = {
  source: AdmissionForm | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: AdmissionFormCloneValues) => Promise<boolean>;
};

const schema = Yup.object({
  name: Yup.string().trim().max(128, 'Use 128 characters or fewer').required('Name is required'),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .max(64, 'Use 64 characters or fewer')
    .required('Code is required'),
  description: Yup.string().trim().max(1024, 'Use 1,024 characters or fewer'),
});

export function getAdmissionFormCloneInitialValues(
  source: AdmissionForm
): AdmissionFormCloneValues {
  return {
    name: `${source.name} copy`,
    code: `${source.code.slice(0, 59)}_COPY`,
    description: source.description ?? '',
  };
}

export function AdmissionFormCloneDialog({ source, saving, onClose, onSave }: Props) {
  return source ? (
    <AdmissionFormCloneEditor
      key={source.id}
      source={source}
      saving={saving}
      onClose={onClose}
      onSave={onSave}
    />
  ) : null;
}

function AdmissionFormCloneEditor({
  source,
  saving,
  onClose,
  onSave,
}: Props & { source: AdmissionForm }) {
  const formik = useFormik<AdmissionFormCloneValues>({
    initialValues: getAdmissionFormCloneInitialValues(source),
    validationSchema: schema,
    onSubmit: async (values) => {
      const saved = await onSave({
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
      });
      if (saved) onClose();
    },
  });

  return (
    <CustomDialog
      open
      handleClose={onClose}
      disableClose={saving}
      title="Clone form as draft"
      maxWidth="sm"
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Copy version {source.version} into a new independent draft. Choose a unique code so the
            original form and its applications remain unchanged.
          </Typography>
          <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
            <TextField
              fullWidth
              autoFocus
              required
              size="small"
              label="Form name"
              {...formik.getFieldProps('name')}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={
                formik.touched.name ? formik.errors.name : 'A name your team will recognize.'
              }
            />
          </ShakingTextField>
          <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
            <TextField
              fullWidth
              required
              size="small"
              label="Form code"
              {...formik.getFieldProps('code')}
              onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
              error={Boolean(formik.touched.code && formik.errors.code)}
              helperText={
                formik.touched.code ? formik.errors.code : 'Unique code for this cloned draft.'
              }
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
              label="Description (optional)"
              {...formik.getFieldProps('description')}
              error={Boolean(formik.touched.description && formik.errors.description)}
              helperText={
                formik.touched.description && formik.errors.description
                  ? formik.errors.description
                  : 'Leave blank to keep the original description.'
              }
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={saving}
          startIcon={<Iconify icon="mdi:content-copy" />}
          onClick={() => formik.handleSubmit()}
        >
          Clone draft
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
