'use client';

import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Paper,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { FormBuilderSections } from './form-dialog/form-builder-sections';
import { getRegistrationFormTemplate } from './form-dialog/registration-form-template';
import { useAdmissionFormDialog } from './form-dialog/use-admission-form-dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: AdmissionForm | null;
  saving: boolean;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};

export function AdmissionFormDialog({ open, onClose, editing, saving, onSave }: Props) {
  const formik = useAdmissionFormDialog({ onClose, editing, onSave });
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={editing ? 'Edit admission form' : 'Create admission form'}
      maxWidth={false}
      fullScreen
      paperProps={{
        sx: {
          width: 1,
          height: '100dvh',
          maxWidth: 'none',
          maxHeight: 'none',
          m: 0,
          borderRadius: 0,
        },
      }}
    >
      <DialogScrollContent
        sx={{ p: 0, height: 1, minHeight: 0, overflow: 'hidden' }}
        scrollBarProps={{
          fillContent: true,
          sx: { flex: '1 1 auto', minHeight: 0 },
        }}
      >
        <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Paper
            square
            variant="outlined"
            sx={{ flexShrink: 0, p: 2, borderTop: 0, borderRight: 0, borderLeft: 0 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Define the form details, arrange sections and fields, then configure the selected
              field. The form stays in draft until you publish it.
            </Typography>
            {!editing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:clipboard-text-outline" />}
                  onClick={() => {
                    formik.setValues(getRegistrationFormTemplate());
                    formik.setTouched({});
                  }}
                >
                  Use registration template
                </Button>
              </Box>
            )}
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Form name *"
                    {...formik.getFieldProps('name')}
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code *"
                    {...formik.getFieldProps('code')}
                    onChange={(event) =>
                      formik.setFieldValue('code', event.target.value.toUpperCase())
                    }
                    error={Boolean(formik.touched.code && formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Form layout *"
                  value={formik.values.layoutType}
                  onChange={(event) =>
                    formik.setFieldValue('layoutType', Number(event.target.value))
                  }
                >
                  <MenuItem value={0}>Single page</MenuItem>
                  <MenuItem value={1}>Step by step</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Fields per row *"
                  value={formik.values.fieldsPerRow}
                  onChange={(event) =>
                    formik.setFieldValue('fieldsPerRow', Number(event.target.value))
                  }
                  helperText="Controls the applicant form grid on larger screens."
                >
                  {[1, 2, 3, 4].map((columns) => (
                    <MenuItem key={columns} value={columns}>
                      {columns} {columns === 1 ? 'field' : 'fields'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  {...formik.getFieldProps('description')}
                  helperText="Explain when administrators should use this form."
                />
              </Grid>
            </Grid>
          </Paper>
          <Box
            sx={{
              flex: 1,
              height: 1,
              minHeight: 0,
              display: { lg: 'flex' },
              p: { xs: 1, sm: 1.5 },
              overflow: { xs: 'auto', lg: 'hidden' },
              bgcolor: 'background.neutral',
            }}
          >
            <FormBuilderSections formik={formik} />
          </Box>
        </Box>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save draft
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
