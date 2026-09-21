'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionCycle,
  CreateUpdateAdmissionCycle,
} from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { Grid, TextField, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { normalizeCycleCode } from './admission-cycle-model';
import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_DATE_FORMAT } from './admission-date-formats';

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
  name: Yup.string().trim().max(128, 'Maximum 128 characters').required('Cycle name is required'),
  code: Yup.string().trim().max(64, 'Maximum 64 characters').required('Cycle code is required'),
  description: Yup.string().trim().max(1000, 'Maximum 1000 characters').nullable(),
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
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
      description: editingCycle?.description ?? '',
      academicYearId: editingCycle?.academicYearId ?? academicYearId,
      startDate: editingCycle?.startDate?.slice(0, 10) ?? '',
      endDate: editingCycle?.endDate?.slice(0, 10) ?? '',
    }),
    [
      academicYearId,
      editingCycle?.code,
      editingCycle?.description,
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
        setConfirmDiscard(false);
        onClose();
      } catch (error) {
        const message = (error as { data?: { detail?: string } })?.data?.detail;
        shikshaMitraToast.error({ message: message || 'Failed to save admission cycle' });
      }
    },
  });

  const closeWithoutSaving = () => {
    setConfirmDiscard(false);
    formik.resetForm();
    onClose();
  };

  const handleClose = () => {
    if (formik.dirty && !saving) {
      setConfirmDiscard(true);
      return;
    }
    closeWithoutSaving();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={
        <AdmissionDialogTitle
          title={editingCycle ? 'Edit Admission Cycle' : 'Create Admission Cycle'}
          helpText="Define when applications open and close for this admission cycle."
          helpLabel="Admission cycle information"
        />
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Save the cycle as a draft first. Applicants can apply only after it is published and while
          this window is open.
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
                name="code"
                value={formik.values.code}
                onBlur={formik.handleBlur}
                onChange={(event) =>
                  formik.setFieldValue('code', normalizeCycleCode(event.target.value))
                }
                error={Boolean(formik.touched.code && formik.errors.code)}
                helperText={
                  formik.touched.code && formik.errors.code
                    ? formik.errors.code
                    : 'Uppercase letters, numbers, hyphen and underscore'
                }
                inputProps={{ maxLength: 64 }}
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
                    : 'No academic years available'
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              size="small"
              label="Description (optional)"
              {...formik.getFieldProps('description')}
              error={Boolean(formik.touched.description && formik.errors.description)}
              helperText={
                formik.touched.description && formik.errors.description
                  ? formik.errors.description
                  : 'Internal purpose or audience, for example “Nursery to Grade 9”.'
              }
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(formik.touched.startDate && formik.errors.startDate)}>
              <DatePicker
                label="Applications open"
                format={ADMISSION_DATE_FORMAT}
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
                format={ADMISSION_DATE_FORMAT}
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
          Save as draft
        </LoadingButton>
      </DialogActions>
      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        icon="warning"
        title="Discard unsaved changes?"
        content="The changes made to this admission cycle have not been saved."
        action={
          <LoadingButton
            color="error"
            variant="contained"
            size="small"
            onClick={closeWithoutSaving}
          >
            Discard
          </LoadingButton>
        }
      />
    </CustomDialog>
  );
}
