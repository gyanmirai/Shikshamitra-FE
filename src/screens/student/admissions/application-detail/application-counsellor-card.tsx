'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Card, Alert, Stack, MenuItem, TextField, Typography, CardContent } from '@mui/material';
import {
  useGetAdmissionApplicationCounsellorsQuery,
  useAssignAdmissionApplicationCounsellorMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function ApplicationCounsellorCard({ application }: { application: AdmissionApplication }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit =
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage) &&
    ![2, 10, 11].includes(application.status);
  const counsellors = useGetAdmissionApplicationCounsellorsQuery(
    { offeringId: application.admissionOfferingId },
    { skip: !canEdit }
  );
  const [assign, assignment] = useAssignAdmissionApplicationCounsellorMutation();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { counsellorId: application.assignedCounsellorId ?? '', reason: '' },
    validationSchema: Yup.object({
      counsellorId: Yup.string().required('Choose a counsellor.'),
      reason: Yup.string().trim().max(512, 'Use 512 characters or fewer.'),
    }),
    onSubmit: async (values, helpers) => {
      if (!application.concurrencyStamp) return;
      try {
        await assign({
          id: application.id,
          input: {
            counsellorId: values.counsellorId,
            concurrencyStamp: application.concurrencyStamp,
            reason: values.reason.trim() || undefined,
          },
        }).unwrap();
        helpers.resetForm({ values: { counsellorId: values.counsellorId, reason: '' } });
        shikshaMitraToast.success({ message: 'Journey counsellor assigned.' });
      } catch (error) {
        shikshaMitraToast.error({
          message:
            parseApiProblemDetail(error).detail ||
            'Could not assign the counsellor. Refresh and retry.',
        });
      }
    },
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Journey counsellor</Typography>
          <Typography variant="body2" color="text.secondary">
            The journey counsellor follows this application across stages and becomes the onboarding
            owner at finalization. Stage specialists can complete their work without changing this
            owner.
          </Typography>
          <Typography variant="subtitle1">
            {application.assignedCounsellorName ||
              (application.assignedCounsellorId
                ? 'Assigned counsellor'
                : 'No journey counsellor assigned yet.')}
          </Typography>
          {canEdit && (
            <>
              {counsellors.isError && (
                <Alert
                  severity="error"
                  action={
                    <LoadingButton size="small" onClick={() => counsellors.refetch()}>
                      Retry
                    </LoadingButton>
                  }
                >
                  Eligible counsellors could not be loaded.
                </Alert>
              )}
              <Stack
                component="form"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                onSubmit={formik.handleSubmit}
                alignItems={{ sm: 'flex-start' }}
              >
                <ShakingTextField
                  error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
                >
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={
                      application.assignedCounsellorId
                        ? 'Change journey counsellor'
                        : 'Assign journey counsellor'
                    }
                    name="counsellorId"
                    value={formik.values.counsellorId}
                    disabled={counsellors.isLoading || counsellors.isError || assignment.isLoading}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
                    helperText={formik.touched.counsellorId && formik.errors.counsellorId}
                  >
                    <MenuItem value="" disabled>
                      Select journey counsellor
                    </MenuItem>
                    {application.assignedCounsellorId &&
                      !(counsellors.data ?? []).some(
                        (item) => item.id === application.assignedCounsellorId
                      ) && (
                        <MenuItem value={application.assignedCounsellorId} disabled>
                          {application.assignedCounsellorName || 'Current counsellor'} (no longer
                          eligible)
                        </MenuItem>
                      )}
                    {(counsellors.data ?? []).map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name || item.userName}
                      </MenuItem>
                    ))}
                  </TextField>
                </ShakingTextField>
                <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reason for change (optional)"
                    name="reason"
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.reason && formik.errors.reason)}
                    helperText={formik.touched.reason && formik.errors.reason}
                  />
                </ShakingTextField>
                <LoadingButton
                  type="submit"
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mdi:account-check-outline" />}
                  loading={assignment.isLoading}
                  disabled={
                    !application.concurrencyStamp ||
                    !formik.values.counsellorId ||
                    formik.values.counsellorId === application.assignedCounsellorId
                  }
                >
                  {application.assignedCounsellorId ? 'Change owner' : 'Assign owner'}
                </LoadingButton>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
