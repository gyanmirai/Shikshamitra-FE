import type {
  AssignmentDetails,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Stack, Alert, Button, Typography } from '@mui/material';
import {
  assignmentError,
  assignmentPolicyFamilies,
  useAssignmentUpdatePoliciesMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentPolicies from './AssignmentPolicies';

export default function AssignedPolicyEditor({
  data,
  onCancel,
  onSaved,
  onBusyChange,
  onDirtyChange,
}: {
  data: AssignmentDetails;
  onCancel: () => void;
  onSaved: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [save, state] = useAssignmentUpdatePoliciesMutation();
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pending = useRef(false);
  const formik = useFormik<{ policies: AssignmentPolicySelection[]; reason: string }>({
    initialValues: {
      policies: assignmentPolicyFamilies
        .filter((family) => family !== 'proration')
        .map((family) => ({
          family,
          versionId: data.assignment.policies.find((p) => p.family === family)?.versionId ?? null,
        })),
      reason: '',
    },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required('Enter a policy change reason.').max(500),
      policies: Yup.array().test(
        'collection',
        'Select a collection policy.',
        (policies) => !!policies?.find((p) => p.family === 'collection')?.versionId
      ),
    }),
    onSubmit: async (values) => {
      if (pending.current) return;
      pending.current = true;
      setError('');
      try {
        await save({
          studentId: data.assignment.studentId,
          academicYearId: data.assignment.academicYearId,
          concurrencyStamp: data.concurrencyStamp,
          ...values,
        }).unwrap();
        onDirtyChange(false);
        shikshaMitraToast.success({ message: 'Assigned policies updated.' });
        onSaved();
      } catch (e) {
        setError(assignmentError(e));
      } finally {
        pending.current = false;
      }
    },
  });
  const policiesChanged = formik.values.policies.some(
    (policy) =>
      policy.versionId !==
      (data.assignment.policies.find((assigned) => assigned.family === policy.family)?.versionId ??
        null)
  );
  useEffect(() => {
    onBusyChange?.(state.isLoading);
    return () => onBusyChange?.(false);
  }, [state.isLoading, onBusyChange]);
  useEffect(() => {
    onDirtyChange(formik.dirty);
    return () => onDirtyChange(false);
  }, [formik.dirty, onDirtyChange]);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Edit assigned policies</Typography>
      <AssignmentPolicies
        studentId={data.assignment.studentId}
        academicYearId={data.assignment.academicYearId}
        defaults={data.assignment.policies}
        selections={formik.values.policies}
        reason={formik.values.reason}
        editing
        canOverride
        disabled={state.isLoading}
        onChange={(policies, reason) => formik.setValues({ policies, reason })}
      />
      {formik.submitCount > 0 && formik.errors.reason && (
        <Alert severity="error">{formik.errors.reason}</Alert>
      )}
      {error && (
        <Alert severity="error">{error} Reopen the assignment if another user changed it.</Alert>
      )}
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon="mdi:close" />}
          disabled={state.isLoading}
          onClick={() => {
            if (formik.dirty) setConfirmCancel(true);
            else onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={state.isLoading}
          disabled={
            !policiesChanged ||
            !formik.values.reason.trim() ||
            !formik.values.policies.find((p) => p.family === 'collection')?.versionId
          }
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          Save policies
        </Button>
      </Stack>
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Discard policy changes?"
        icon="warning"
        content="Your unsaved policy selections and reason will be discarded."
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            onClick={onCancel}
          >
            Discard changes
          </Button>
        }
      />
    </Stack>
  );
}
