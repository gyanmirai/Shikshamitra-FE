'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import {
  useGetAdmissionApplicationQuery,
  useGetAdmissionApplicationFormQuery,
} from 'src/redux/student/admissions/admission-applications-api';

import { canCorrectApplicationForm } from './application-form-correction-model';
import { ApplicationFormCorrectionFrame } from './application-form-correction-frame';
import { ApplicationFormCorrectionEditor } from './application-form-correction-editor';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function ApplicationFormCorrectionDrawer({
  open,
  ...props
}: {
  open: boolean;
  applicationId: string;
  onClose: () => void;
  onSaved: () => void;
  onRefresh?: () => void;
}) {
  return open ? <OpenFormCorrection key={props.applicationId} {...props} /> : null;
}

function OpenFormCorrection({
  applicationId,
  onClose,
  onSaved,
  onRefresh,
}: {
  applicationId: string;
  onClose: () => void;
  onSaved: () => void;
  onRefresh?: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const permitted =
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view) &&
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const application = useGetAdmissionApplicationQuery(applicationId, {
    skip: !permitted,
    refetchOnMountOrArgChange: true,
  });
  const form = useGetAdmissionApplicationFormQuery(applicationId, {
    skip: !permitted,
    refetchOnMountOrArgChange: true,
  });
  // Freeze both the answers and their concurrency stamp for this editing session.
  // Cache invalidation must never silently replace an unsaved correction.
  const [snapshot, setSnapshot] = useState<{
    application: AdmissionApplication;
    form: AdmissionApplicationForm;
  } | null>(null);
  useEffect(() => {
    if (
      !snapshot &&
      application.currentData &&
      form.currentData &&
      !application.isFetching &&
      !form.isFetching &&
      !application.isError &&
      !form.isError
    ) {
      setSnapshot({ application: application.currentData, form: form.currentData });
    }
  }, [
    snapshot,
    application.currentData,
    application.isFetching,
    application.isError,
    form.currentData,
    form.isFetching,
    form.isError,
  ]);
  const currentAllowed =
    permitted &&
    !application.isError &&
    !form.isError &&
    Boolean(
      application.currentData &&
      form.currentData &&
      canCorrectApplicationForm(application.currentData, form.currentData)
    );
  if (snapshot)
    return (
      <ApplicationFormCorrectionEditor
        application={snapshot.application}
        form={snapshot.form}
        allowed={currentAllowed}
        canRetry={permitted}
        blockedReason={
          !permitted
            ? 'You do not have permission to correct this application.'
            : form.currentData?.correctionBlockedReason
        }
        onClose={onClose}
        onSaved={() => {
          onSaved();
          onClose();
        }}
        onRefresh={() => onRefresh?.()}
      />
    );
  const loading = permitted && (application.isFetching || form.isFetching);
  const failed = application.isError || form.isError;
  return (
    <ApplicationFormCorrectionFrame onClose={onClose}>
      <Stack spacing={2} useFlexGap sx={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <Stack role="status" aria-label="Loading application form">
            <Skeleton height={48} />
            <Skeleton height={96} />
            <Skeleton height={48} />
          </Stack>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {!permitted
                ? 'You do not have permission to correct this application.'
                : failed
                  ? 'The application form could not be loaded.'
                  : 'The application form is unavailable.'}
            </Typography>
            {permitted && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  application.refetch();
                  form.refetch();
                }}
              >
                Retry
              </Button>
            )}
          </>
        )}
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          sx={{ alignSelf: 'flex-end', mt: 'auto' }}
        >
          Close
        </Button>
      </Stack>
    </ApplicationFormCorrectionFrame>
  );
}
