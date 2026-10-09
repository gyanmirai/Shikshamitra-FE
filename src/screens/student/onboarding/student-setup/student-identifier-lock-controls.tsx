'use client';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Stack, Alert, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useSetStudentOnboardingIdentifierLockMutation } from 'src/redux/student/onboarding/student-onboarding-api';

export default function StudentIdentifierLockControls({
  academicYearId,
  divisionId,
  identifierType,
  canLock,
  canUnlock,
}: {
  academicYearId?: string;
  divisionId?: string;
  identifierType: 'gr' | 'roll';
  canLock: boolean;
  canUnlock: boolean;
}) {
  const [action, setAction] = useState<'lock' | 'unlock' | null>(null);
  const [save, saving] = useSetStudentOnboardingIdentifierLockMutation();
  const label = identifierType === 'gr' ? 'GR numbers' : 'Roll numbers';
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason:
        action === 'unlock'
          ? Yup.string().trim().required('Enter the reason for unlocking.').max(1000)
          : Yup.string().max(1000),
    }),
    onSubmit: async (values) => {
      if (
        !academicYearId ||
        !divisionId ||
        !action ||
        saving.isLoading ||
        (action === 'lock' ? !canLock : !canUnlock)
      )
        return;
      try {
        await save({
          academicYearId,
          divisionId,
          identifierType,
          isLocked: action === 'lock',
          reason: values.reason.trim() || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: `${label} ${action === 'lock' ? 'locked' : 'unlocked'} for this Division's students.`,
        });
        setAction(null);
        form.resetForm();
      } catch (error) {
        form.setStatus(
          parseApiProblemDetail(error).detail ||
            'The number lock could not be changed. Refresh and retry.'
        );
      }
    },
  });
  const close = () => {
    if (!saving.isLoading) {
      setAction(null);
      form.resetForm();
    }
  };
  return (
    <>
      <Stack direction="row" spacing={1} sx={{ px: 1 }}>
        <Button
          size="small"
          variant="outlined"
          disabled={!canLock || !academicYearId || !divisionId}
          onClick={() => setAction('lock')}
        >
          Lock {label}
        </Button>
        {canUnlock && (
          <Button
            size="small"
            variant="outlined"
            disabled={!academicYearId || !divisionId}
            onClick={() => setAction('unlock')}
          >
            Unlock {label}
          </Button>
        )}
      </Stack>
      <CustomDialog
        open={Boolean(action)}
        handleClose={close}
        title={`${action === 'unlock' ? 'Unlock' : 'Lock'} ${label}`}
        maxWidth="xs"
        hasUnsavedChanges={form.dirty}
        disableClose={saving.isLoading}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Alert severity="info">
              This applies to {label} for students in the selected Division. New students receive
              the next available number.
            </Alert>
            {action === 'unlock' && (
              <TextField
                fullWidth
                required
                size="small"
                label="Unlock reason"
                name="reason"
                value={form.values.reason}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={Boolean(form.touched.reason && form.errors.reason)}
                helperText={form.touched.reason ? form.errors.reason : undefined}
                disabled={saving.isLoading}
              />
            )}
            {form.status && <Alert severity="error">{form.status}</Alert>}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" variant="outlined" onClick={close} disabled={saving.isLoading}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            loading={saving.isLoading}
            onClick={() => form.submitForm()}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}
