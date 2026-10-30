import type { ReactNode } from 'react';
import type {
  AssignmentDetails,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { Stack, Alert, Button } from '@mui/material';
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
  children,
}: {
  data: AssignmentDetails;
  onCancel: () => void;
  onSaved: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  children?: ReactNode;
}) {
  const [save, state] = useAssignmentUpdatePoliciesMutation();
  const [error, setError] = useState('');
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
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Stack
        role="region"
        aria-label="Assigned policy fields"
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: { xs: 2, sm: 3 },
          '& > *': { flexShrink: 0 },
        }}
      >
        {children}
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
      </Stack>
      <Stack
        role="group"
        aria-label="Fee assignment actions"
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          disabled={state.isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="small"
          color="inherit"
          variant="contained"
          loading={state.isLoading}
          disabled={
            state.isLoading ||
            !policiesChanged ||
            !formik.values.reason.trim() ||
            !formik.values.policies.find((p) => p.family === 'collection')?.versionId
          }
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          onClick={() => formik.handleSubmit()}
        >
          Save policies
        </Button>
      </Stack>
    </Stack>
  );
}
