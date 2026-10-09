'use client';

import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Skeleton, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetAdmissionApplicant360Query,
  useUpdateAdmissionApplicantProfileMutation,
} from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionApplicantProfileDialog } from '../applicant-360/admission-applicant-profile-dialog';

export function ApplicationApplicantIdentityDialog({
  open,
  applicantId,
  onClose,
  onUpdated,
  onBusyChange,
}: {
  open: boolean;
  applicantId: string;
  onClose: () => void;
  onUpdated?: () => void | Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View');
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add');
  const query = useGetAdmissionApplicant360Query(applicantId, {
    skip: !open || !canView || !canEdit,
  });
  const [updateProfile, updateState] = useUpdateAdmissionApplicantProfileMutation();
  const busy = open && (query.isFetching || updateState.isLoading);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  if (!open) return null;
  const data = query.currentData;
  const locked = data?.applications.some((application) => [10, 11].includes(application.status));
  const allowed = canView && canEdit;
  if (!allowed || query.isLoading || query.isError || !data || locked) {
    return (
      <CustomDialog
        open
        title="Edit Applicant Identity"
        titleInfo="Update applicant identity and guardian contact before finalizing admission."
        handleClose={onClose}
        disableClose={busy}
        hasUnsavedChanges={false}
        maxWidth="sm"
      >
        <DialogScrollContent>
          {!allowed ? (
            <Alert severity="warning">You do not have permission to edit applicant identity.</Alert>
          ) : query.isLoading || (!data && query.isFetching) ? (
            <Stack spacing={1} role="status" aria-label="Loading applicant identity">
              <Skeleton height={48} />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          ) : locked ? (
            <Alert severity="info">
              This applicant is linked to a finalized or enrolled admission. Update identity details
              from the Student record.
            </Alert>
          ) : (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" disabled={busy} onClick={query.refetch}>
                  Retry
                </Button>
              }
            >
              Applicant identity could not be loaded. Try again.
            </Alert>
          )}
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    );
  }
  return (
    <AdmissionApplicantProfileDialog
      open
      busy={busy}
      applicant={data.applicant}
      guardian={data.primaryGuardian}
      onClose={onClose}
      onSubmit={async (body) => {
        if (!allowed || busy || locked) return false;
        try {
          await updateProfile({ applicantId, body }).unwrap();
          shikshaMitraToast.success({ message: 'Applicant identity and guardian contact updated' });
          await onUpdated?.();
          return true;
        } catch (error) {
          shikshaMitraToast.error({
            message: parseApiProblemDetail(error).detail || 'Unable to update applicant identity',
          });
          return false;
        }
      }}
    />
  );
}
