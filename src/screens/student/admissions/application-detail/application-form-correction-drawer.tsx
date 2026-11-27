'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useState, Suspense, useEffect } from 'react';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import {
  useGetAdmissionApplicationQuery,
  useGetAdmissionApplicationFormQuery,
} from 'src/redux/student/admissions/admission-applications-api';

import { canCorrectApplicationForm } from './application-form-correction-model';
import { ApplicationWorkspaceSkeleton } from './application-workspace-skeleton';
import { ApplicationFormCorrectionEditor } from './application-workspace-panels';
import { ApplicationFormCorrectionFrame } from './application-form-correction-frame';
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
  const { closing, closeAfterExit, onExited } = useStudentDrawerExit();
  const frameCloseRef = useRef<(() => void) | null>(null);
  const [frameBusy, setFrameBusy] = useState(false);
  const close = () => closeAfterExit(onClose);
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
      !closing &&
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
    closing,
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
  const loading = permitted && (application.isFetching || form.isFetching);
  const failed = application.isError || form.isError;
  return (
    <ApplicationFormCorrectionFrame
      busy={frameBusy}
      closing={closing}
      onClose={() => (frameCloseRef.current ?? close)()}
      onExited={onExited}
    >
      {snapshot ? (
        <Suspense
          fallback={
            <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
              <ApplicationWorkspaceSkeleton layout="form" label="Loading application editor" />
            </Scrollbar>
          }
        >
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
            onClose={close}
            onSaved={() =>
              closeAfterExit(() => {
                onSaved();
                onClose();
              })
            }
            onRefresh={() => onRefresh?.()}
            frameCloseRef={frameCloseRef}
            onFrameBusyChange={setFrameBusy}
          />
        </Suspense>
      ) : (
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
                  color="inherit"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
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
        </Stack>
      )}
    </ApplicationFormCorrectionFrame>
  );
}
