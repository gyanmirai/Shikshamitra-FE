'use client';

import type { StudentCredentialsRecipient } from 'src/redux/student/onboarding/student-onboarding-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { useId, useRef, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useUpdateStudentCredentialsEmailMutation } from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { getOnboardingErrorMessage } from './student-onboarding-messages';

type Props = {
  caseId: string;
  caseLabel: string;
  concurrencyStamp: string;
  recipient: StudentCredentialsRecipient;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function StudentCredentialProfileEmailDialog({
  caseId,
  caseLabel,
  concurrencyStamp,
  recipient,
  onClose,
  onBusyChange,
}: Props) {
  const router = useRouter();
  const [save, mutation] = useUpdateStudentCredentialsEmailMutation();
  const submitting = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const sharedRef = useRef<HTMLInputElement>(null);
  const sharedErrorId = useId();
  const [cancelling, setCancelling] = useState(false);
  const shared = (recipient.linkedStudentCount ?? 0) > 1;
  const formik = useFormik({
    initialValues: {
      email: recipient.pendingEmail || recipient.email || '',
      confirmSharedParent: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email('Enter a valid email, such as name@example.com.')
        .max(256)
        .required('Add an email before sending login details.'),
      confirmSharedParent: shared
        ? Yup.boolean().oneOf([true], 'Confirm the shared parent email change.')
        : Yup.boolean(),
    }),
    onSubmit: async (values, helpers) => {
      if (submitting.current || !recipient.canEditEmail) return;
      submitting.current = true;
      try {
        const result = await save({
          id: caseId,
          accountType: recipient.accountType,
          relationship: recipient.relationship,
          expectedEmail: recipient.email,
          email: values.email.trim(),
          concurrencyStamp,
          confirmSharedParent: values.confirmSharedParent,
          emailEditToken: recipient.emailEditToken || '',
        }).unwrap();
        const updated = result.recipients.find(
          (x) =>
            x.accountType === recipient.accountType && x.relationship === recipient.relationship
        );
        shikshaMitraToast.success({
          message: updated?.pendingEmail
            ? 'Verify the new email before the login changes.'
            : 'Email saved.',
        });
        helpers.resetForm({ values });
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message: getOnboardingErrorMessage(
            error,
            'Email could not be saved. Refresh App Login and try again.'
          ),
        });
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = mutation.isLoading || formik.isSubmitting || cancelling;
  const cancelPendingChange = async () => {
    if (submitting.current || !recipient.canEditEmail || !recipient.pendingEmail) return;
    submitting.current = true;
    setCancelling(true);
    try {
      await save({
        id: caseId,
        accountType: recipient.accountType,
        relationship: recipient.relationship,
        expectedEmail: recipient.email,
        email: '',
        concurrencyStamp,
        confirmSharedParent: false,
        cancelPendingChange: true,
        emailEditToken: recipient.emailEditToken || '',
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Pending email change cancelled. Current login is unchanged.',
      });
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(
          error,
          'The pending change could not be cancelled. Refresh App Login and try again.'
        ),
      });
    } finally {
      submitting.current = false;
      setCancelling(false);
    }
  };
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    push: router.push,
  });
  const close = () => requestNavigation(onClose);
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    if (formik.submitCount && !busy && formik.errors.email) emailRef.current?.focus();
    else if (formik.submitCount && !busy && formik.errors.confirmSharedParent)
      sharedRef.current?.focus();
  }, [formik.submitCount, formik.errors.email, formik.errors.confirmSharedParent, busy]);
  const emailError = Boolean(formik.touched.email && formik.errors.email);
  return (
    <>
      <CustomDialog
        open
        title={recipient.email ? 'Update Email' : 'Add Email'}
        maxWidth="sm"
        handleClose={close}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            if (!busy) formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy} label="Saving email…">
            <FormSectionCard
              title="App Login Email"
              icon={GlobalIcons.email}
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            >
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {caseLabel} ·{' '}
                  {recipient.relationship === 'self'
                    ? 'Student'
                    : recipient.relationship === 'father'
                      ? 'Father'
                      : 'Mother'}
                  {recipient.accountType === 'guardian' && recipient.name
                    ? ` · ${recipient.name}`
                    : ''}
                </Typography>
                {recipient.hasLinkedAccount && (
                  <Typography variant="body2" color="text.secondary">
                    Verify the new email before the login changes. The password and linked children
                    stay unchanged.
                  </Typography>
                )}
                <ShakingTextField error={emailError}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Email"
                    type="email"
                    name="email"
                    inputRef={emailRef}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={busy || !recipient.canEditEmail}
                    error={emailError}
                    helperText={emailError ? formik.errors.email : undefined}
                  />
                </ShakingTextField>
                {shared && (
                  <ShakingTextField
                    error={Boolean(
                      formik.touched.confirmSharedParent && formik.errors.confirmSharedParent
                    )}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          inputRef={sharedRef}
                          slotProps={{ input: { 'aria-describedby': sharedErrorId } }}
                          name="confirmSharedParent"
                          checked={formik.values.confirmSharedParent}
                          disabled={busy}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          required
                        />
                      }
                      label={`Apply this parent login email to all ${recipient.linkedStudentCount} linked children.`}
                    />
                    {formik.touched.confirmSharedParent && formik.errors.confirmSharedParent && (
                      <FormHelperText id={sharedErrorId} error>
                        {formik.errors.confirmSharedParent}
                      </FormHelperText>
                    )}
                  </ShakingTextField>
                )}
              </Stack>
            </FormSectionCard>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          {recipient.pendingEmail && recipient.canEditEmail && (
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={cancelPendingChange}
              disabled={busy}
              sx={{ mr: 'auto' }}
            >
              Cancel change
            </Button>
          )}
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={close}
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            loading={busy}
            disabled={busy || !recipient.canEditEmail}
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
