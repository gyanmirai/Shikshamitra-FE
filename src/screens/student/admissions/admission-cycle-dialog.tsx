'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionCycle,
  CreateUpdateAdmissionCycle,
} from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, TextField, IconButton, Typography, DialogActions } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  academicYearId: string;
  academicYears: AcademicYear[];
  academicYearsLoading: boolean;
  academicYearsError: boolean;
  editingCycle?: AdmissionCycle | null;
  saving: boolean;
  onSave: (values: CreateUpdateAdmissionCycle) => Promise<void>;
};

const schema = Yup.object({
  name: Yup.string().trim().required('Cycle name is required'),
  code: Yup.string().trim().required('Cycle code is required'),
  academicYearId: Yup.string().required('Academic year is required'),
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

const toDateTimeOffset = (value: string): string => {
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? dateConvertor(parsedDate.format(dateFormat)) : '';
};

export function AdmissionCycleDialog({
  open,
  onClose,
  academicYearId,
  academicYears,
  academicYearsLoading,
  academicYearsError,
  editingCycle,
  saving,
  onSave,
}: Props) {
  /**
   * Memoization Justification:
   * - Formik uses enableReinitialize and compares initialValues on each render.
   * - Stable values prevent resetForm from dispatching on every render.
   * - The values are rebuilt only when the cycle or academic year changes.
   */
  const initialValues = useMemo(
    () => ({
      name: editingCycle?.name ?? '',
      code: editingCycle?.code ?? '',
      academicYearId: editingCycle?.academicYearId ?? academicYearId,
      startDate: editingCycle?.startDate?.slice(0, 10) ?? '',
      endDate: editingCycle?.endDate?.slice(0, 10) ?? '',
    }),
    [
      academicYearId,
      editingCycle?.code,
      editingCycle?.academicYearId,
      editingCycle?.endDate,
      editingCycle?.name,
      editingCycle?.startDate,
    ]
  );
  const formik = useFormik<CreateUpdateAdmissionCycle>({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({
          ...values,
          startDate: toDateTimeOffset(values.startDate),
          endDate: toDateTimeOffset(values.endDate),
        });
        helpers.resetForm();
        handleClose();
      } catch (error) {
        const message = (error as { data?: { detail?: string } })?.data?.detail;
        shikshaMitraToast.error({ message: message || 'Failed to save admission cycle' });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {editingCycle ? 'Edit Admission Cycle' : 'Create Admission Cycle'}
          <CustomTooltip
            arrow
            placement="right"
            title="Define when applications open and close for this admission cycle."
          >
            <IconButton aria-label="Admission cycle information" size="small" sx={{ p: 0.25 }}>
              <Iconify icon={GlobalIcons.info} width={18} color="info.main" />
            </IconButton>
          </CustomTooltip>
        </Box>
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set the application window for this admission cycle. Applicants can apply only between
          these dates.
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
              <TextField
                fullWidth
                size="small"
                required
                label="Cycle name"
                {...formik.getFieldProps('name')}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name ? formik.errors.name : undefined}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
              <TextField
                fullWidth
                size="small"
                required
                label="Cycle code"
                {...formik.getFieldProps('code')}
                error={Boolean(formik.touched.code && formik.errors.code)}
                helperText={formik.touched.code ? formik.errors.code : undefined}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={
                Boolean(formik.touched.academicYearId && formik.errors.academicYearId) ||
                academicYearsError
              }
            >
              <CustomSelect
                label="Academic year"
                name="academicYearId"
                value={formik.values.academicYearId}
                options={academicYears.map((year) => ({ value: year.id, label: year.name }))}
                onChange={(value) => formik.setFieldValue('academicYearId', String(value))}
                onBlur={formik.handleBlur}
                formControlProps={{ required: true }}
                error={
                  Boolean(formik.touched.academicYearId && formik.errors.academicYearId) ||
                  academicYearsError
                }
                helperText={
                  (formik.touched.academicYearId && formik.errors.academicYearId) ||
                  (academicYearsError
                    ? 'Unable to load academic years. Please close and try again.'
                    : undefined)
                }
                isLoading={academicYearsLoading}
                disabled={saving}
                noOptionsMessage={
                  academicYearsError
                    ? 'Unable to load academic years. Please close and try again.'
                    : 'No recent academic years available'
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(formik.touched.startDate && formik.errors.startDate)}>
              <DatePicker
                label="Applications open"
                format="DD-MM-YYYY"
                value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                onChange={async (value) => {
                  await formik.setFieldTouched('startDate', true, false);
                  await formik.setFieldValue(
                    'startDate',
                    value?.isValid() ? value.format('YYYY-MM-DD') : '',
                    true
                  );
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    name: 'startDate',
                    error: Boolean(formik.touched.startDate && formik.errors.startDate),
                    helperText: formik.touched.startDate ? formik.errors.startDate : undefined,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(formik.touched.endDate && formik.errors.endDate)}>
              <DatePicker
                label="Applications close"
                format="DD-MM-YYYY"
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                onChange={async (value) => {
                  await formik.setFieldTouched('endDate', true, false);
                  await formik.setFieldValue(
                    'endDate',
                    value?.isValid() ? value.format('YYYY-MM-DD') : '',
                    true
                  );
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    name: 'endDate',
                    error: Boolean(formik.touched.endDate && formik.errors.endDate),
                    helperText: formik.touched.endDate ? formik.errors.endDate : undefined,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
