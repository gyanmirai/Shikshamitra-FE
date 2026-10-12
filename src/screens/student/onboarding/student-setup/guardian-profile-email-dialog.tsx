'use client';

import type {
  RecordChange,
  RecordSnapshot,
} from 'src/redux/student/records/student-record-changes-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetStudentRecordSnapshotQuery,
  useCreateStudentRecordChangeMutation,
} from 'src/redux/student/records/student-record-changes-api';

import { StudentSetupLoadingRows } from './student-setup-loading';

type Props = {
  studentId: string;
  relationship: 'father' | 'mother' | 'guardian';
  caseLabel: string;
  onClose: () => void;
  onSaved: (change: Pick<RecordChange, 'id' | 'status'>) => void;
};

export default function GuardianProfileEmailDialog(props: Props) {
  const { studentId, onClose } = props;
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section: 'family' },
    { refetchOnMountOrArgChange: true }
  );
  if (snapshot.currentData && !snapshot.isError && !snapshot.isFetching) {
    return <EmailForm {...props} snapshot={snapshot.currentData} />;
  }
  return (
    <CustomDialog
      open
      title="Correct Guardian Profile Email"
      maxWidth="sm"
      handleClose={onClose}
      hasForm={false}
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
            The current family profile could not be loaded.
          </Alert>
        ) : (
          <StudentSetupLoadingRows label="Loading saved family profile" count={2} />
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}

function EmailForm({ snapshot: loadedSnapshot, ...props }: Props & { snapshot: RecordSnapshot }) {
  // Freeze the reviewed baseline; the Records command rejects stale snapshots.
  const [snapshot] = useState(loadedSnapshot);
  const [clientKey] = useState(() => crypto.randomUUID());
  const [save, mutation] = useCreateStudentRecordChangeMutation();
  const ownerKey = `${props.relationship}Details`;
  const owner = snapshot.data[ownerKey];
  const validOwner = Boolean(owner?.fullName?.trim());
  const formik = useFormik<{ email: string; reason: string }>({
    initialValues: { email: typeof owner?.email === 'string' ? owner.email : '', reason: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email('Enter a valid email.')
        .max(256)
        .required('Enter the profile email.'),
      reason: Yup.string()
        .trim()
        .min(3, 'Explain the correction.')
        .max(400)
        .required('Enter a correction reason.'),
    }),
    onSubmit: async ({ email, reason }) => {
      if (!validOwner) return;
      try {
        const result = await save({
          studentId: props.studentId,
          section: 'family',
          clientKey,
          reason: reason.trim(),
          expectedSnapshot: snapshot.snapshot,
          // Update only the selected person's email; retain all family/sibling fields.
          payload: { ...snapshot.data, [ownerKey]: { ...owner, email: email.trim() } },
        }).unwrap();
        if (result.status === 'Conflict') {
          formik.setStatus(
            'The correction was recorded but could not be applied. Review its conflict in Student Records Changes & Approvals.'
          );
          props.onSaved(result);
          return;
        }
        shikshaMitraToast.success({
          message:
            result.status === 'Applied'
              ? 'Guardian profile email saved and added to Records history.'
              : 'Email correction submitted to Changes & Approvals. The saved profile updates after approval.',
        });
        props.onSaved(result);
        props.onClose();
      } catch (error) {
        formik.setStatus(
          parseApiProblemDetail(error).detail ||
            'Unable to save the correction. Reload the current profile and retry.'
        );
      }
    },
  });
  const busy = mutation.isLoading || formik.isSubmitting;
  return (
    <CustomDialog
      open
      title="Correct Guardian Profile Email"
      maxWidth="sm"
      handleClose={props.onClose}
      disableClose={busy}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent dividers>
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight={600}>
            {props.caseLabel}
          </Typography>
          <Typography variant="body2">
            {props.relationship === 'guardian'
              ? 'Other guardian'
              : props.relationship === 'father'
                ? 'Father'
                : 'Mother'}
            : {owner?.fullName || 'Profile unavailable'}
          </Typography>
          <Typography variant="body2">
            This correction follows Student Records approval rules and is added to history.
          </Typography>
          {!validOwner && (
            <Alert severity="warning">
              Complete this person’s saved family profile in Student Records first.
            </Alert>
          )}
          <ShakingTextField error={Boolean(formik.touched.email && formik.errors.email)}>
            <TextField
              required
              fullWidth
              size="small"
              label="Profile email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy || !validOwner}
              error={Boolean(formik.touched.email && formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </ShakingTextField>
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              required
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Correction reason"
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy || !validOwner}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
              slotProps={{ htmlInput: { maxLength: 400 } }}
            />
          </ShakingTextField>
          {formik.status && <Alert severity="error">{formik.status}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={() => {
            if (!formik.dirty || window.confirm('Are you sure you want to leave this page?')) props.onClose();
          }}
          disabled={busy}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          loading={busy}
          disabled={busy || !validOwner}
          onClick={() => {
            if (!busy) formik.handleSubmit();
          }}
        >
          Save correction
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
