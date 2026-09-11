'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Stack,
  Button,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { STANDARD_ADMISSION_JOURNEY } from '../../workflow-template';

type Props = {
  open: boolean;
  forms: AdmissionForm[];
  onClose: () => void;
  onApply: (formDefinitionId: string) => void;
};

const schema = Yup.object({
  formDefinitionId: Yup.string().required('Select the detailed registration form'),
});

export function WorkflowStandardTemplateDialog({ open, forms, onClose, onApply }: Props) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { formDefinitionId: forms[0]?.id ?? '' },
    validationSchema: schema,
    onSubmit: (values) => {
      onApply(values.formDefinitionId);
      onClose();
    },
  });

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Apply standard admissions journey"
      maxWidth="sm"
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Start with a clear inquiry-to-approval process designed for school admissions staff.
          </Typography>
          <Alert severity="warning">
            Applying this journey replaces the stages and transitions currently on this draft.
          </Alert>
          <FormControl
            fullWidth
            size="small"
            error={Boolean(formik.touched.formDefinitionId && formik.errors.formDefinitionId)}
          >
            <InputLabel id="standard-admission-form-label">Detailed registration form *</InputLabel>
            <Select
              labelId="standard-admission-form-label"
              label="Detailed registration form *"
              name="formDefinitionId"
              value={formik.values.formDefinitionId}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            >
              {forms.map((form) => (
                <MenuItem key={form.id} value={form.id}>
                  {form.name} · v{form.version}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {(formik.touched.formDefinitionId && formik.errors.formDefinitionId) ||
                'This published form is used for the five-step detailed registration stage.'}
            </FormHelperText>
          </FormControl>
          {forms.length === 0 && (
            <Alert severity="info">
              Publish a registration form before applying the standard journey.
            </Alert>
          )}
          <Stack spacing={1} aria-label="Standard admissions journey stages">
            {STANDARD_ADMISSION_JOURNEY.map((stage, index) => (
              <Stack key={stage.code} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  aria-hidden
                  sx={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    display: 'grid',
                    borderRadius: '50%',
                    placeItems: 'center',
                    color: 'primary.contrastText',
                    bgcolor: 'primary.main',
                    typography: 'caption',
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Box>
                <Box>
                  <Typography variant="subtitle2">{stage.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stage.description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          disabled={forms.length === 0}
          startIcon={<Iconify icon="mdi:auto-fix" />}
          onClick={() => formik.handleSubmit()}
        >
          Apply five-stage journey
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
