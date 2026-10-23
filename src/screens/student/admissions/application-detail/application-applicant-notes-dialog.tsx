'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, DialogActions } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';

import AdmissionApplicantNotes from '../admission-applicant-notes';

export function ApplicationApplicantNotesDialog({
  open,
  applicantId,
  onClose,
  onBusyChange,
}: {
  open: boolean;
  applicantId: string;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View');
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add');
  const query = useGetAdmissionApplicant360Query(applicantId, { skip: !open || !canView });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const router = useRouter();
  const busy = open && (query.isFetching || saving);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const closeGuard = useUnsavedNavigation(open && dirty, {
    push: router.push,
    blockNavigation: busy,
    title: 'Discard Unsaved Note?',
    description: 'Your unsaved applicant note will be discarded.',
  });
  const close = () => closeGuard.requestNavigation(onClose);
  const data = query.currentData;
  if (!open) return null;
  return (
    <>
      <CustomDialog
        open
        title="Applicant Notes"
        titleInfo="Keep internal context for the next admissions staff member."
        maxWidth="sm"
        handleClose={close}
        disableClose={busy}
        hasUnsavedChanges={dirty}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          {!canView ? (
            <StudentFeedback
              notificationKey="STU-0178"
              presentation="persistent"
              severity="warning"
            >
              You do not have permission to view applicant notes.
            </StudentFeedback>
          ) : query.isLoading || (!data && query.isFetching) ? (
            <Stack role="status" aria-label="Loading applicant notes" spacing={1}>
              <Skeleton height={48} />
              <Skeleton height={96} />
            </Stack>
          ) : query.isError || !data ? (
            <StudentFeedback
              notificationKey="STU-0180"
              presentation="toast"
              severity="error"
              action={
                <Button size="small" disabled={busy} onClick={query.refetch}>
                  Retry
                </Button>
              }
            >
              Applicant notes could not be loaded. Try again.
            </StudentFeedback>
          ) : (
            <FormBusyRegion busy={query.isFetching}>
              <AdmissionApplicantNotes
                key={applicantId}
                applicantId={applicantId}
                notes={data.notes}
                embedded
                compact
                readOnly={!canEdit}
                disabled={query.isFetching}
                onBusyChange={setSaving}
                onDirtyChange={setDirty}
              />
            </FormBusyRegion>
          )}
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
      {closeGuard.confirmation}
    </>
  );
}
