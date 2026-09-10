'use client';

import type { AdmissionApplicantProfile } from 'src/redux/student/admissions/admission-applicants-api';

import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, DialogActions } from '@mui/material';

type Props = {
  open: boolean;
  busy: boolean;
  applicant: AdmissionApplicantProfile;
  onClose: () => void;
  onSubmit: (values: {
    firstName: string;
    middleName?: string | null;
    lastName?: string | null;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
  }) => Promise<boolean>;
};

export function AdmissionApplicantProfileDialog({
  open,
  busy,
  applicant,
  onClose,
  onSubmit,
}: Props) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: applicant.firstName,
      middleName: applicant.middleName ?? '',
      lastName: applicant.lastName ?? '',
      dateOfBirth: applicant.dateOfBirth ?? '',
      gender: applicant.gender ?? '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required('First name is required').max(100),
      middleName: Yup.string().trim().max(100),
      lastName: Yup.string().trim().max(100),
      dateOfBirth: Yup.string().required('Date of birth is required'),
      gender: Yup.string().oneOf(['Male', 'Female']).required('Gender is required'),
    }),
    onSubmit: async (values) => {
      const success = await onSubmit({
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim() || null,
        lastName: values.lastName.trim() || null,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender as 'Male' | 'Female',
      });
      if (success) onClose();
    },
  });
  return (
    <CustomDialog open={open} handleClose={onClose} title="Edit applicant identity" maxWidth="sm">
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="First name"
            required
            {...formik.getFieldProps('firstName')}
            error={Boolean(formik.touched.firstName && formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            fullWidth
            size="small"
            label="Middle name"
            {...formik.getFieldProps('middleName')}
            error={Boolean(formik.touched.middleName && formik.errors.middleName)}
            helperText={formik.touched.middleName && formik.errors.middleName}
          />
          <TextField
            fullWidth
            size="small"
            label="Last name"
            {...formik.getFieldProps('lastName')}
            error={Boolean(formik.touched.lastName && formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <DatePicker
            label="Date of birth"
            value={formik.values.dateOfBirth ? dayjs(formik.values.dateOfBirth) : null}
            maxDate={dayjs()}
            onChange={(value) =>
              formik.setFieldValue('dateOfBirth', datePickerToDateTimeOffset(value) ?? '')
            }
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                onBlur: () => formik.setFieldTouched('dateOfBirth', true),
                error: Boolean(formik.touched.dateOfBirth && formik.errors.dateOfBirth),
                helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth,
              },
            }}
          />
          <CustomSelect
            label="Gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
            value={formik.values.gender}
            error={Boolean(formik.touched.gender && formik.errors.gender)}
            helperText={formik.touched.gender ? formik.errors.gender : undefined}
            onBlur={() => formik.setFieldTouched('gender', true)}
            onChange={(value) => formik.setFieldValue('gender', String(value ?? ''))}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={busy}
          disabled={busy}
          onClick={() => formik.handleSubmit()}
        >
          Save identity
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
