'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Card,
  Alert,
  Stack,
  Avatar,
  Button,
  Divider,
  Collapse,
  MenuItem,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';
import {
  useGetAdmissionApplicationCounsellorsQuery,
  useAssignAdmissionApplicationCounsellorMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function ApplicationCounsellorCard({ application }: { application: AdmissionApplication }) {
  const [editing, setEditing] = useState(!application.assignedCounsellorId);
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
        setEditing(false);
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
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar sx={{ bgcolor: 'action.selected', color: 'text.primary' }}>
                <Iconify icon="mdi:account-outline" width={22} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Journey counsellor
                </Typography>
                <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                  {application.assignedCounsellorName ||
                    (application.assignedCounsellorId ? 'Assigned counsellor' : 'Not assigned')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The journey counsellor follows this application through onboarding.
                </Typography>
              </Box>
            </Stack>
            {canEdit && application.assignedCounsellorId && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:account-edit-outline" />}
                onClick={() => setEditing((current) => !current)}
              >
                {editing ? 'Cancel change' : 'Change counsellor'}
              </Button>
            )}
          </Stack>
          {canEdit && (
            <Collapse in={editing || !application.assignedCounsellorId} unmountOnExit>
              <Divider sx={{ mb: 2 }} />
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
              <Stack component="form" spacing={2} onSubmit={formik.handleSubmit}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
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
                        disabled={
                          counsellors.isLoading || counsellors.isError || assignment.isLoading
                        }
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
                              {application.assignedCounsellorName || 'Current counsellor'} (no
                              longer eligible)
                            </MenuItem>
                          )}
                        {(counsellors.data ?? []).map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name || item.userName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ShakingTextField
                      error={Boolean(formik.touched.reason && formik.errors.reason)}
                    >
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
                  </Box>
                </Stack>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                </Box>
              </Stack>
            </Collapse>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
