'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useSetStudentOnboardingIdentifierLockMutation } from 'src/redux/student/onboarding/student-onboarding-api';

export default function StudentIdentifierLockControls({
  academicYearId,
  divisionId,
  identifierType,
  canLock,
  canUnlock,
  disabled = false,
  onInteractionChange,
}: {
  academicYearId?: string;
  divisionId?: string;
  identifierType: 'gr' | 'roll';
  canLock: boolean;
  canUnlock: boolean;
  disabled?: boolean;
  onInteractionChange?: (active: boolean) => void;
}) {
  const [action, setAction] = useState<'lock' | 'unlock' | null>(null);
  const [save, saving] = useSetStudentOnboardingIdentifierLockMutation();
  const savingRef = useRef(false);
  useEffect(() => {
    onInteractionChange?.(Boolean(action));
    return () => onInteractionChange?.(false);
  }, [action, onInteractionChange]);
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
        savingRef.current ||
        (action === 'lock' ? !canLock : !canUnlock)
      )
        return;
      savingRef.current = true;
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
      } finally {
        savingRef.current = false;
      }
    },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty, {
    blockNavigation: saving.isLoading,
  });
  const close = () => {
    if (!savingRef.current)
      requestNavigation(() => {
        setAction(null);
        form.resetForm();
      });
  };
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:lock-outline" width={18} />}
          disabled={disabled || saving.isLoading || !canLock || !academicYearId || !divisionId}
          onClick={() => setAction('lock')}
        >
          Lock
        </Button>
        {canUnlock && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:lock-open-outline" width={18} />}
            disabled={disabled || saving.isLoading || !academicYearId || !divisionId}
            onClick={() => setAction('unlock')}
          >
            Unlock
          </Button>
        )}
      </Stack>
      <CustomDialog
        open={Boolean(action)}
        handleClose={close}
        guardUnsavedChanges={false}
        title={`${action === 'unlock' ? 'Unlock' : 'Lock'} ${identifierType === 'gr' ? 'GR Numbers' : 'Roll Numbers'}`}
        maxWidth="xs"
        hasUnsavedChanges={form.dirty}
        disableClose={saving.isLoading}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <StudentFeedback notificationKey="STU-0968" presentation="inline" severity="info">
              This applies to {label} for students in the selected Division. New students receive
              the next available number while locked; after unlocking, published numbering rules
              apply.
            </StudentFeedback>
            {action === 'unlock' && (
              <ShakingTextField error={Boolean(form.touched.reason && form.errors.reason)}>
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
              </ShakingTextField>
            )}
            {form.status && (
              <StudentFeedback
                notificationKey="STU-0969"
                presentation="persistent"
                severity="error"
              >
                {form.status}
              </StudentFeedback>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={close}
            disabled={saving.isLoading}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            loading={saving.isLoading}
            onClick={() => form.submitForm()}
            startIcon={
              <Iconify icon={action === 'unlock' ? 'mdi:lock-open-outline' : 'mdi:lock-outline'} />
            }
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
