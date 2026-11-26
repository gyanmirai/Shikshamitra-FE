import type { RecordSnapshot } from 'src/redux/student/records/student-record-changes-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Skeleton, TextField, DialogActions } from '@mui/material';
import { useGetStudentRecordPhotoQuery } from 'src/redux/student/records/student-record-photo-api';
import {
  useGetStudentRecordSnapshotQuery,
  useCreateStudentRecordChangeMutation,
  useUploadStudentRecordPhotoDraftMutation,
} from 'src/redux/student/records/student-record-changes-api';

import StudentPhotoInput, { RECORD_PHOTO_MAX_BYTES } from '../components/student-photo-input';

type Props = { studentId: string; title: string; onClose: () => void };

export function StudentRecordPhotoDialog({ studentId, title, onClose }: Props) {
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section: 'photo' },
    { refetchOnMountOrArgChange: true }
  );
  const photo = useGetStudentRecordPhotoQuery(studentId);
  // Wait for a fresh snapshot before mounting the editor. Once mounted, keep its
  // draft during refetches and require an explicit reload if the snapshot changes.
  const [baseline, setBaseline] = useState<RecordSnapshot>();
  useEffect(() => {
    if (!snapshot.isFetching && !snapshot.isError && snapshot.currentData?.section === 'photo')
      setBaseline((current) => current ?? snapshot.currentData);
  }, [snapshot.currentData, snapshot.isError, snapshot.isFetching]);
  const reload = async () => {
    const next = await snapshot.refetch().unwrap();
    if (next.section !== 'photo') throw new Error('Invalid photo snapshot.');
    setBaseline(next);
    await photo.refetch();
  };
  if (baseline)
    return (
      <StudentRecordPhotoEditor
        studentId={studentId}
        title={title}
        baseline={baseline}
        available={snapshot.currentData}
        readError={snapshot.isError}
        currentPhoto={photo.isError ? undefined : photo.currentData}
        onReload={reload}
        onClose={onClose}
      />
    );

  return (
    <CustomDialog
      open
      title={title}
      maxWidth="xs"
      hasForm={false}
      handleClose={onClose}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        {snapshot.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => snapshot.refetch()}>
                Retry
              </Button>
            }
          >
            Photo editing is unavailable for this student. Check your access and try again.
          </Alert>
        ) : (
          <Skeleton variant="rounded" height={160} aria-label="Loading student photo settings" />
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}

const reasonSchema = Yup.object({
  reason: Yup.string().trim().min(3, 'Explain the change.').max(2000).required('Enter a reason.'),
});

function StudentRecordPhotoEditor({
  studentId,
  title,
  baseline,
  available,
  readError,
  currentPhoto,
  onReload,
  onClose,
}: Props & {
  baseline: RecordSnapshot;
  available?: RecordSnapshot;
  readError: boolean;
  currentPhoto?: Blob;
  onReload: () => Promise<void>;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ blob: Blob; url: string }>();
  const [preparing, setPreparing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [requiresReload, setRequiresReload] = useState(false);
  const [failure, setFailure] = useState('');
  const saving = useRef(false);
  const staged = useRef<{ file: File; id: string } | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const [upload, uploadState] = useUploadStudentRecordPhotoDraftMutation();
  const [submit, submitState] = useCreateStudentRecordChangeMutation();
  const changed = available?.snapshot !== baseline.snapshot;
  const previewBlob = file ?? currentPhoto;
  useEffect(() => {
    if (!previewBlob) return undefined;
    const url = URL.createObjectURL(previewBlob);
    setPreview({ blob: previewBlob, url });
    return () => URL.revokeObjectURL(url);
  }, [previewBlob]);
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: reasonSchema,
    onSubmit: async ({ reason }) => {
      if (
        !file ||
        preparing ||
        saving.current ||
        reloading ||
        requiresReload ||
        changed ||
        readError
      )
        return;
      saving.current = true;
      setFailure('');
      try {
        if (staged.current?.file !== file) {
          const body = new FormData();
          body.append('file', file);
          const result = await upload({ studentId, body }).unwrap();
          staged.current = { file, id: result.id };
        }
        const payload = { photoDraftId: staged.current.id };
        const request = {
          studentId,
          section: 'photo' as const,
          reason: reason.trim(),
          expectedSnapshot: baseline.snapshot,
          payload,
        };
        const fingerprint = JSON.stringify(request);
        if (attempt.current?.fingerprint !== fingerprint)
          attempt.current = { fingerprint, key: crypto.randomUUID() };
        const result = await submit({ ...request, clientKey: attempt.current.key }).unwrap();
        if (result.status === 'Conflict') {
          shikshaMitraToast.warning({
            message: 'The photo change could not be applied. View the conflict in History.',
          });
        } else {
          shikshaMitraToast.success({
            message:
              result.status === 'Applied'
                ? 'Student photo updated and added to History.'
                : 'Photo change submitted. View its status in History.',
          });
        }
        onClose();
      } catch (error) {
        const { errorCode } = parseApiProblemDetail(error);
        if (
          errorCode === 'Students:Records:StaleSnapshot' ||
          errorCode === 'Students:Records:ConcurrencyConflict'
        ) {
          setRequiresReload(true);
          setFailure('The student record changed. Reload the current photo before saving.');
        } else if (errorCode === 'Students:Records:PhotoChangePending') {
          setFailure('Another photo change is pending. Check History before trying again.');
        } else {
          if (errorCode === 'Students:Records:InvalidPhotoDraft') staged.current = null;
          setFailure(
            'The photo could not be saved. Your selected photo and reason are still here.'
          );
        }
      } finally {
        saving.current = false;
      }
    },
  });
  const busy =
    preparing || reloading || form.isSubmitting || uploadState.isLoading || submitState.isLoading;
  const guard = useUnsavedNavigation(Boolean(file) || form.dirty, {
    push: router.push,
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
  });
  const close = () => guard.requestNavigation(onClose);
  const reload = async () => {
    setReloading(true);
    try {
      await onReload();
      setRequiresReload(false);
      setFailure('');
    } catch {
      setFailure('The current photo could not be reloaded. Try again.');
    } finally {
      setReloading(false);
    }
  };
  const reasonError = form.touched.reason ? form.errors.reason : undefined;
  return (
    <>
      <CustomDialog
        open
        title={title}
        maxWidth="xs"
        handleClose={close}
        guardUnsavedChanges={false}
        disableClose={busy}
        titleInfo="Provide a reason for History. School policy determines when the new photo applies."
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            form.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {(failure || changed || readError) && (
              <Alert
                severity="error"
                action={
                  (requiresReload || changed || readError) && (
                    <Button size="small" color="inherit" disabled={busy} onClick={reload}>
                      Reload
                    </Button>
                  )
                }
              >
                {failure ||
                  'The current photo details changed or are unavailable. Reload before saving.'}
              </Alert>
            )}
            <FormSectionCard title="Photo Details" icon="mdi:camera-outline">
              <Stack spacing={2}>
                <StudentPhotoInput
                  label="Student photo"
                  value={preview?.blob === previewBlob ? (preview?.url ?? null) : null}
                  maxBytes={RECORD_PHOTO_MAX_BYTES}
                  disabled={busy || readError}
                  onBusyChange={setPreparing}
                  onAccept={(next) => {
                    setFile(next);
                    setFailure('');
                  }}
                />
                <ShakingTextField error={Boolean(reasonError)}>
                  <TextField
                    name="reason"
                    label="Reason for change"
                    fullWidth
                    required
                    size="small"
                    multiline
                    minRows={2}
                    value={form.values.reason}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    disabled={busy}
                    error={Boolean(reasonError)}
                    helperText={reasonError}
                  />
                </ShakingTextField>
              </Stack>
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            disabled={!file || busy || requiresReload || changed || readError}
            loading={form.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Save photo
          </Button>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
