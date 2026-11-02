'use client';

import type {
  AdmissionApplication,
  AdmissionApplicationForm,
  CorrectAdmissionApplicationFormInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { useFormik } from 'formik';
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useCorrectAdmissionApplicationFormMutation } from 'src/redux/student/admissions/admission-applications-api';

import { ApplicationRuntimeForm } from './application-runtime-form';
import { readAdmissionFormValue } from '../admission-visibility-rules';
import { ApplicationFormCorrectionFrame } from './application-form-correction-frame';
import { getEffectiveCorrectionValues } from './application-form-correction-visibility';
import { ApplicationFormCorrectionReasonDialog } from './application-form-correction-reason-dialog';
import {
  buildCorrectionYupSchema,
  getCorrectionValidationErrors,
} from './application-form-correction-validation';
import {
  buildFormCorrection,
  correctionFieldErrors,
  isUnconfirmedCorrection,
} from './application-form-correction-model';

export function ApplicationFormCorrectionEditor({
  application,
  form,
  allowed,
  canRetry = true,
  blockedReason,
  onClose,
  onSaved,
  onRefresh,
}: {
  application: AdmissionApplication;
  form: AdmissionApplicationForm;
  allowed: boolean;
  canRetry?: boolean;
  blockedReason?: string | null;
  onClose: () => void;
  onSaved: () => void;
  onRefresh: () => void;
}) {
  const [initialValues] = useState(() =>
    Object.fromEntries(
      form.values.map((item) => [item.fieldCode, readAdmissionFormValue(item.valueJson)])
    )
  );
  const [save] = useCorrectAdmissionApplicationFormMutation();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState<CorrectAdmissionApplicationFormInput | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldsRef = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  useEffect(() => {
    if (!focusRequested.current || !Object.values(fieldErrors).some(Boolean)) return undefined;
    const frame = requestAnimationFrame(() => {
      const invalid = fieldsRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!invalid) return;
      invalid.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      if (reasonOpen || invalid.closest('[aria-hidden="true"], [inert]')) return;
      const target = invalid.matches('input, textarea, button, [tabindex="0"]')
        ? invalid
        : invalid.querySelector<HTMLElement>('input, textarea, button, [tabindex="0"]');
      target?.focus({ preventScroll: true });
      focusRequested.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [fieldErrors, reasonOpen]);
  const formik = useFormik({
    initialValues,
    validationSchema: buildCorrectionYupSchema(form.definition),
    onSubmit: () => undefined,
  });
  const latestValues = useRef(formik.values);
  latestValues.current = formik.values;
  const acceptsChanges = useRef(false);
  acceptsChanges.current = allowed && !conflict && !unconfirmed;
  const locked = saving || readingPhoto;
  const cannotSave = locked || conflict || (unconfirmed ? !canRetry : !allowed);
  const dirty = formik.dirty || Boolean(unconfirmed);
  const router = useRouter();
  const guard = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: locked,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Form Corrections?"
        icon="warning"
        content={
          unconfirmed
            ? 'The save result is unconfirmed. Closing will refresh the application so you can check its latest details.'
            : 'Your unsaved form corrections will be discarded.'
        }
        cancelText="Keep editing"
        onClose={keepEditing}
        action={
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              if (unconfirmed) onRefresh();
              discard();
            }}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  const close = () => {
    if (locked || savingRef.current) return;
    guard.requestNavigation(onClose);
  };
  const validate = (sectionId?: string) => {
    const next = getCorrectionValidationErrors(form.definition, latestValues.current, sectionId);
    focusRequested.current = Object.values(next).some(Boolean);
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };
  const requestSave = () => {
    if (cannotSave || !validate()) return;
    if (
      !buildFormCorrection(application, form, initialValues, latestValues.current, '', '').values
        .length
    ) {
      setError('No application details have changed.');
      return;
    }
    setError('');
    setReasonOpen(true);
  };
  const persist = async (reason: string) => {
    if (cannotSave || savingRef.current) return;
    const command =
      unconfirmed ??
      buildFormCorrection(
        application,
        form,
        initialValues,
        latestValues.current,
        reason,
        crypto.randomUUID()
      );
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await save(command).unwrap();
    } catch (failure) {
      const uncertain = isUnconfirmedCorrection(failure);
      setUnconfirmed(uncertain || unconfirmed ? command : null);
      setConflict((failure as { status?: number }).status === 409);
      const nextErrors = correctionFieldErrors(failure);
      focusRequested.current = Object.values(nextErrors).some(Boolean);
      setFieldErrors(nextErrors);
      setError(
        uncertain
          ? 'Save confirmation was not received. Retry the same correction to confirm the result, or close and refresh the application.'
          : parseApiProblemDetail(failure).detail || 'Unable to save corrections.'
      );
      return;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
    shikshaMitraToast.success({
      message: 'Application corrected. Review finalization checks again.',
    });
    onSaved();
  };
  const formError = conflict
    ? `${error} Close this editor and reopen the latest application before making another correction.`
    : error;
  return (
    <>
      <ApplicationFormCorrectionFrame busy={locked} onClose={close}>
        <Box ref={fieldsRef} sx={{ display: 'contents' }}>
          <FormBusyRegion busy={saving} fillContent showOverlay={false}>
            <ApplicationRuntimeForm
              application={application}
              form={form}
              values={formik.values}
              errors={[
                formError,
                !allowed && !unconfirmed
                  ? blockedReason ||
                    'This form can no longer be corrected. Close and refresh the application.'
                  : '',
              ].filter(Boolean)}
              fieldErrors={fieldErrors}
              correctionMode
              compact
              readOnly={!allowed || conflict || Boolean(unconfirmed)}
              saving={saving}
              submitting={false}
              canSubmitForm={!cannotSave}
              showSaveDraft={false}
              managedFormStage={false}
              canReopen={false}
              reopening={false}
              onReopen={() => undefined}
              onSave={async () => false}
              onPhotoReadingChange={setReadingPhoto}
              onValidateStep={validate}
              onSubmit={requestSave}
              onChange={(code, value) => {
                // Async field callbacks may hold props from before the save began.
                // A completed photo read can supply its answer while the reader locks other controls.
                if (savingRef.current || !acceptsChanges.current) return;
                const nextValues = getEffectiveCorrectionValues(form.definition, initialValues, {
                  ...latestValues.current,
                  [code]: value,
                });
                latestValues.current = nextValues;
                formik.setValues(nextValues, false);
                setFieldErrors((previous) => ({ ...previous, [code]: '' }));
              }}
              onBlur={(code) => {
                const errors = getCorrectionValidationErrors(form.definition, latestValues.current);
                setFieldErrors((previous) => ({
                  ...Object.fromEntries(
                    Object.entries(previous).filter(
                      ([key]) => key !== code && !key.startsWith(`${code}[`)
                    )
                  ),
                  ...Object.fromEntries(
                    Object.entries(errors).filter(
                      ([key]) => key === code || key.startsWith(`${code}[`)
                    )
                  ),
                }));
              }}
              footerActions={
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={locked}
                    onClick={close}
                    startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  >
                    Cancel
                  </Button>
                  {unconfirmed && (
                    <Button
                      size="small"
                      variant="contained"
                      color="inherit"
                      disabled={cannotSave}
                      onClick={() => setReasonOpen(true)}
                      startIcon={<Iconify icon={GlobalIcons.submit} />}
                    >
                      Retry save
                    </Button>
                  )}
                </>
              }
            />
          </FormBusyRegion>
        </Box>
      </ApplicationFormCorrectionFrame>
      <ApplicationFormCorrectionReasonDialog
        open={reasonOpen}
        busy={saving}
        retryOnly={Boolean(unconfirmed)}
        saveDisabled={cannotSave}
        error={formError}
        onSave={persist}
        onClose={() => {
          if (!saving) setReasonOpen(false);
        }}
      />
      {guard.confirmation}
    </>
  );
}
