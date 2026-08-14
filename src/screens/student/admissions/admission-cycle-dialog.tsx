'use client';

import type {
  AdmissionCycle,
  CreateUpdateAdmissionCycle,
} from 'src/redux/student/admissions/admission-cycles-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { Grid, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  academicYearId: string;
  editingCycle?: AdmissionCycle | null;
  saving: boolean;
  onSave: (values: CreateUpdateAdmissionCycle) => Promise<void>;
};

const schema = Yup.object({
  name: Yup.string().trim().required('Cycle name is required'),
  code: Yup.string().trim().required('Cycle code is required'),
  startDate: Yup.string().required('Applications open date is required'),
  endDate: Yup.string()
    .required('Applications close date is required')
    .test(
      'after-start',
      'Applications close date must be after open date',
      function validate(value) {
        return !this.parent.startDate || value > this.parent.startDate;
      }
    ),
});

export function AdmissionCycleDialog({
  open,
  onClose,
  academicYearId,
  editingCycle,
  saving,
  onSave,
}: Props) {
  const formik = useFormik<CreateUpdateAdmissionCycle>({
    enableReinitialize: true,
    initialValues: {
      name: editingCycle?.name ?? '',
      code: editingCycle?.code ?? '',
      academicYearId,
      startDate: editingCycle?.startDate?.slice(0, 10) ?? '',
      endDate: editingCycle?.endDate?.slice(0, 10) ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({ ...values, academicYearId });
        helpers.resetForm();
        onClose();
      } catch (error) {
        const message = (error as { data?: { detail?: string } })?.data?.detail;
        shikshaMitraToast.error({ message: message || 'Failed to save admission cycle' });
      }
    },
  });

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={editingCycle ? 'Edit Admission Cycle' : 'Create Admission Cycle'}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Cycle name *"
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Cycle code *"
              {...formik.getFieldProps('code')}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Academic year"
              value={academicYearId || 'Select an academic year'}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Applications open *"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps('startDate')}
              error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              helperText={formik.touched.startDate && formik.errors.startDate}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Applications close *"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps('endDate')}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton variant="outlined" size="small" onClick={onClose} disabled={saving}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
