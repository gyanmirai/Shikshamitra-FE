'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetAdmissionApplicationCounsellorsQuery,
  useAssignAdmissionApplicationCounsellorMutation,
} from 'src/redux/student/admissions/admission-applications-api';
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
  DialogActions,
} from '@mui/material';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function ApplicationCounsellorCard({
  application,
  compact = false,
  presentation = 'card',
  disabled = false,
  onBusyChange,
  renderHeaderAction,
}: {
  application: AdmissionApplication;
  compact?: boolean;
  presentation?: 'card' | 'header';
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  renderHeaderAction?: (context: {
    canEdit: boolean;
    onEdit: () => void;
    busy: boolean;
  }) => ReactNode;
}) {
  const header = presentation === 'header';
  const [editing, setEditing] = useState(!header && !application.assignedCounsellorId);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit =
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage) &&
    ![2, 10, 11].includes(application.status);
  const counsellors = useGetAdmissionApplicationCounsellorsQuery(
    { offeringId: application.admissionOfferingId },
    { skip: !canEdit || (header && !editing) }
  );
  const eligibleCounsellors = counsellors.currentData;
  const optionsLoading = counsellors.isLoading || (header && counsellors.isFetching);
  const isEligibleCounsellor = (id: string | null | undefined) =>
    Boolean(eligibleCounsellors?.some((item) => item.id === id));
  const [assign, assignment] = useAssignAdmissionApplicationCounsellorMutation();
  useEffect(() => {
    onBusyChange?.(assignment.isLoading);
  }, [assignment.isLoading, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { counsellorId: application.assignedCounsellorId ?? '', reason: '' },
    validationSchema: Yup.object({
      counsellorId: Yup.string().required('Choose a counsellor.'),
      reason: Yup.string().trim().max(512, 'Use 512 characters or fewer.'),
    }),
    onSubmit: async (values, helpers) => {
      if (
        disabled ||
        assignment.isLoading ||
        !canEdit ||
        !application.concurrencyStamp ||
        (header && (optionsLoading || !isEligibleCounsellor(values.counsellorId)))
      )
        return;
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

  const assignmentFields = (
    <Stack spacing={compact || header ? 1 : 2}>
      {counsellors.isError && (
        <Alert
          severity="error"
          action={
            <LoadingButton
              size="small"
              disabled={disabled || assignment.isLoading}
              onClick={() => counsellors.refetch()}
            >
              Retry
            </LoadingButton>
          }
        >
          Eligible counsellors could not be loaded.
        </Alert>
      )}
      {!optionsLoading && !counsellors.isError && eligibleCounsellors?.length === 0 && (
        <Alert severity="info">No eligible counsellors are available for this offering.</Alert>
      )}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={compact ? 1 : 2}>
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
              disabled={disabled || optionsLoading || counsellors.isError || assignment.isLoading}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
              helperText={
                (formik.touched.counsellorId && formik.errors.counsellorId) ||
                (header && optionsLoading ? 'Loading eligible counsellors...' : undefined)
              }
            >
              <MenuItem value="" disabled>
                Select journey counsellor
              </MenuItem>
              {application.assignedCounsellorId &&
                !isEligibleCounsellor(application.assignedCounsellorId) && (
                  <MenuItem value={application.assignedCounsellorId} disabled>
                    {application.assignedCounsellorName || 'Current counsellor'} (no longer
                    eligible)
                  </MenuItem>
                )}
              {(eligibleCounsellors ?? []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name || item.userName}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              fullWidth
              size="small"
              label="Reason for change (optional)"
              disabled={disabled || assignment.isLoading}
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
    </Stack>
  );
  const assignmentAction = (
    <LoadingButton
      type="submit"
      size="small"
      variant="contained"
      startIcon={<Iconify icon="mdi:account-check-outline" />}
      loading={assignment.isLoading}
      disabled={
        disabled ||
        optionsLoading ||
        counsellors.isError ||
        !application.concurrencyStamp ||
        !formik.values.counsellorId ||
        (header && !isEligibleCounsellor(formik.values.counsellorId)) ||
        formik.values.counsellorId === application.assignedCounsellorId
      }
    >
      {application.assignedCounsellorId ? 'Change owner' : 'Assign owner'}
    </LoadingButton>
  );
  const closeHeaderEditor = () => {
    setEditing(false);
    formik.resetForm();
  };
  const requestCloseHeaderEditor = () => {
    if (disabled || assignment.isLoading) return;
    if (!formik.dirty || window.confirm('Are you sure you want to leave this page?'))
      closeHeaderEditor();
  };

  if (header)
    return (
      <>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Iconify icon="mdi:account-outline" width={20} sx={{ flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Counsellor
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {application.assignedCounsellorName ||
                (application.assignedCounsellorId ? 'Assigned counsellor' : 'Not assigned')}
            </Typography>
          </Box>
          {renderHeaderAction
            ? renderHeaderAction({
                canEdit,
                onEdit: () => setEditing(true),
                busy: disabled || assignment.isLoading,
              })
            : canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  aria-label={
                    application.assignedCounsellorId
                      ? 'Change journey counsellor'
                      : 'Assign journey counsellor'
                  }
                  disabled={disabled || assignment.isLoading}
                  onClick={() => setEditing(true)}
                  sx={{ flexShrink: 0 }}
                >
                  {application.assignedCounsellorId ? 'Change' : 'Assign'}
                </Button>
              )}
        </Stack>
        {canEdit && editing && (
          <CustomDialog
            open
            hasForm={false}
            title={
              application.assignedCounsellorId
                ? 'Change Journey Counsellor'
                : 'Assign Journey Counsellor'
            }
            titleInfo="The journey counsellor follows this application through onboarding."
            maxWidth="sm"
            hasUnsavedChanges={formik.dirty}
            disableClose={disabled || assignment.isLoading}
            handleClose={closeHeaderEditor}
          >
            <Stack component="form" onSubmit={formik.handleSubmit}>
              <DialogScrollContent>
                <FormBusyRegion busy={assignment.isLoading} label="Assigning journey counsellor...">
                  {assignmentFields}
                </FormBusyRegion>
              </DialogScrollContent>
              <DialogActions>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disabled || assignment.isLoading}
                  onClick={requestCloseHeaderEditor}
                  startIcon={<Iconify icon="mdi:close" />}
                >
                  Cancel
                </Button>
                {assignmentAction}
              </DialogActions>
            </Stack>
          </CustomDialog>
        )}
      </>
    );

  return (
    <Card variant="outlined" sx={compact ? { borderRadius: 1 } : undefined}>
      <CardContent
        sx={
          compact
            ? { p: 1.5, '&:last-child': { pb: 1.5 } }
            : { p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }
        }
      >
        <Stack spacing={compact ? 1 : 2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              {compact ? (
                <Iconify icon="mdi:account-outline" width={20} />
              ) : (
                <Avatar sx={{ bgcolor: 'action.selected', color: 'text.primary' }}>
                  <Iconify icon="mdi:account-outline" width={22} />
                </Avatar>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {compact ? 'Counsellor' : 'Journey counsellor'}
                </Typography>
                <Typography variant={compact ? 'body2' : 'h6'} sx={{ overflowWrap: 'anywhere' }}>
                  {application.assignedCounsellorName ||
                    (application.assignedCounsellorId ? 'Assigned counsellor' : 'Not assigned')}
                </Typography>
                {!compact && (
                  <Typography variant="body2" color="text.secondary">
                    The journey counsellor follows this application through onboarding.
                  </Typography>
                )}
              </Box>
            </Stack>
            {canEdit && application.assignedCounsellorId && (
              <Button
                size="small"
                variant="outlined"
                startIcon={compact ? undefined : <Iconify icon="mdi:account-edit-outline" />}
                disabled={disabled || assignment.isLoading}
                sx={compact ? { alignSelf: { xs: 'flex-start', sm: 'center' } } : undefined}
                onClick={() => setEditing((current) => !current)}
              >
                {compact
                  ? editing
                    ? 'Cancel'
                    : 'Change'
                  : editing
                    ? 'Cancel change'
                    : 'Change counsellor'}
              </Button>
            )}
          </Stack>
          {canEdit && (
            <Collapse in={editing || !application.assignedCounsellorId} unmountOnExit>
              <Divider sx={{ mb: compact ? 1 : 2 }} />
              <Stack component="form" spacing={compact ? 1 : 2} onSubmit={formik.handleSubmit}>
                {assignmentFields}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{assignmentAction}</Box>
              </Stack>
            </Collapse>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
