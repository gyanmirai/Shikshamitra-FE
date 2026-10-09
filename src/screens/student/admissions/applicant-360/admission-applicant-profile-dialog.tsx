'use client';

import type { AdmissionApplicantProfile } from 'src/redux/student/admissions/admission-applicants-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

type Props = {
  open: boolean;
  busy: boolean;
  applicant: AdmissionApplicantProfile;
  guardian?: { mobile: string; email?: string | null };
  onClose: () => void;
  onSubmit: (values: {
    firstName: string;
    middleName?: string | null;
    lastName?: string | null;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    guardianMobile: string;
    guardianEmail?: string | null;
  }) => Promise<boolean>;
};

export function AdmissionApplicantProfileDialog({
  open,
  busy,
  applicant,
  guardian,
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
      guardianMobile: guardian?.mobile ?? '',
      guardianEmail: guardian?.email ?? '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required('First name is required').max(100),
      middleName: Yup.string().trim().max(100),
      lastName: Yup.string().trim().max(100),
      dateOfBirth: Yup.string().required('Date of birth is required'),
      gender: Yup.string().oneOf(['Male', 'Female']).required('Gender is required'),
      guardianMobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
        .required('Guardian mobile is required'),
      guardianEmail: Yup.string().email('Enter a valid guardian email'),
    }),
    onSubmit: async (values) => {
      const success = await onSubmit({
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim() || null,
        lastName: values.lastName.trim() || null,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender as 'Male' | 'Female',
        guardianMobile: values.guardianMobile,
        guardianEmail: values.guardianEmail.trim() || null,
      });
      if (success) onClose();
    },
  });
  const router = useRouter();
  const closeGuard = useUnsavedNavigation(open && formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    title: 'Discard Unsaved Identity Changes?',
    description: 'Your unsaved identity and guardian contact changes will be discarded.',
  });
  const requestClose = () => closeGuard.requestNavigation(onClose);
  return (
    <>
      <CustomDialog
        open={open}
        handleClose={requestClose}
        title="Edit Applicant Identity"
        titleInfo="Update applicant identity and guardian contact before finalizing admission."
        maxWidth="sm"
        disableClose={busy}
        hasUnsavedChanges={formik.dirty}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
          <FormBusyRegion busy={busy} label="Saving applicant identity…">
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
                format={ADMISSION_DATE_FORMAT}
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
              <Divider />
              <Typography variant="subtitle2">Primary guardian contact</Typography>
              <TextField
                fullWidth
                required
                size="small"
                type="tel"
                name="guardianMobile"
                label="Guardian mobile number"
                value={formik.values.guardianMobile}
                onBlur={formik.handleBlur}
                onChange={(event) =>
                  formik.setFieldValue(
                    'guardianMobile',
                    event.target.value.replace(/\D/g, '').slice(0, 10)
                  )
                }
                error={Boolean(formik.touched.guardianMobile && formik.errors.guardianMobile)}
                helperText={formik.touched.guardianMobile && formik.errors.guardianMobile}
                slotProps={{
                  htmlInput: { inputMode: 'numeric', maxLength: 10 },
                  input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> },
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="email"
                label="Guardian email"
                {...formik.getFieldProps('guardianEmail')}
                error={Boolean(formik.touched.guardianEmail && formik.errors.guardianEmail)}
                helperText={formik.touched.guardianEmail && formik.errors.guardianEmail}
              />
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={requestClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={busy}
            disabled={busy}
            onClick={() => formik.handleSubmit()}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
          >
            Save identity
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {closeGuard.confirmation}
    </>
  );
}
