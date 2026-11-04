'use client';

import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';
import type {
  ParentRegistrationDocument,
  PublicParentRegistrationContext,
} from 'src/redux/student/admissions/admission-parent-registration-types';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import CustomStepper from 'src/components/custom-stepper';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
import { getAdmissionSubmissionValidationErrors } from 'src/screens/student/admissions/admission-form-validation';
import { ApplicationRuntimeFormCore } from 'src/screens/student/admissions/application-detail/application-runtime-form';
import { getCorrectionSections } from 'src/screens/student/admissions/application-detail/application-form-correction-visibility';

import { ParentRegistrationDocuments } from './parent-registration-documents';
import { ParentRegistrationInstructions } from './parent-registration-instructions';
import {
  readRegistrationToken,
  ParentRegistrationError,
  createParentRegistrationTransport,
} from './parent-registration-transport';
import {
  parentRegistrationForm,
  parentRegistrationValues,
  readableRegistrationValue,
  parentRegistrationDraftValues,
} from './parent-registration-model';

export default function PublicAdmissionRegistrationScreen({
  token: suppliedToken,
}: { token?: string } = {}) {
  const [token, setToken] = useState(suppliedToken ?? '');
  const [ready, setReady] = useState(suppliedToken !== undefined);
  useEffect(() => {
    if (suppliedToken !== undefined) return undefined;
    const read = () => {
      setToken(readRegistrationToken(window.location.hash));
      setReady(true);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [suppliedToken]);
  return (
    <Box
      component="main"
      sx={{ minHeight: '100dvh', bgcolor: 'background.neutral', p: { xs: 1, sm: 2, md: 3 } }}
    >
      <Box sx={{ maxWidth: 1120, mx: 'auto', minWidth: 0 }}>
        {!ready ? (
          <Skeleton aria-label="Loading registration" height={160} />
        ) : token ? (
          <ParentRegistration key={token} token={token} />
        ) : (
          <Unavailable />
        )}
      </Box>
    </Box>
  );
}

function Unavailable({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Registration Link Unavailable</Typography>
        <Typography variant="body2" role="alert">
          {error ||
            'Open the private registration link sent by your school. Ask the school for a new link if this one has expired.'}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            onClick={onRetry}
            sx={{ alignSelf: 'flex-start' }}
          >
            Try again
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function ParentRegistration({ token }: { token: string }) {
  const transport = useMemo(() => createParentRegistrationTransport(token), [token]);
  const [context, setContext] = useState<PublicParentRegistrationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<'form' | 'documents' | 'review'>('form');
  const [busy, setBusy] = useState<'save' | 'hand-in' | 'upload' | null>(null);
  const busyRef = useRef(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  const [documentDrafts, setDocumentDrafts] = useState<Record<string, boolean>>({});
  const onDocumentDirtyChange = useCallback(
    (key: string, dirty: boolean) =>
      setDocumentDrafts((previous) =>
        previous[key] === dirty ? previous : { ...previous, [key]: dirty }
      ),
    []
  );
  const hasDocumentDraft = Object.values(documentDrafts).some(Boolean);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  const handInRetry = useRef<{ snapshot: string; key: string } | null>(null);
  const formik = useFormik<Record<string, string>>({
    initialValues: {},
    validateOnChange: false,
    onSubmit: () => undefined,
  });
  const values = useRef(formik.values);
  values.current = formik.values;
  const form = useMemo(() => (context ? parentRegistrationForm(context) : null), [context]);
  const locked = Boolean(busy || readingPhoto || validatingStep);
  const guard = useUnsavedNavigation(formik.dirty || hasDocumentDraft, { blockNavigation: locked });
  const installContext = (next: PublicParentRegistrationContext) => {
    setContext(next);
    formik.resetForm({ values: parentRegistrationValues(next) });
    setFieldErrors({});
    setError('');
    setConflict(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    setUnavailable(false);
    transport
      .context(controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        installContext(next);
        setStage(next.canEdit ? 'form' : 'review');
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          failure instanceof Error ? failure.message : 'Unable to load registration. Try again.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // Explicit reload is the only way to replace an edited snapshot after a conflict.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transport, attempt]);

  const handleFailure = (failure: unknown) => {
    const detail = failure instanceof ParentRegistrationError ? failure : null;
    if (detail?.conflict) setConflict(true);
    if (detail && !detail.conflict && [401, 403, 404, 410].includes(detail.status))
      setUnavailable(true);
    setFieldErrors(detail?.fieldErrors ?? {});
    setError(
      failure instanceof Error
        ? failure.message
        : 'Unable to complete this request. Your answers are retained. Try again.'
    );
  };
  const validate = (sectionId?: string) => {
    if (!form) return false;
    const definition = {
      ...form.definition,
      sections: form.definition.sections
        .filter((section) => !sectionId || section.id === sectionId)
        .map((section) => ({
          ...section,
          fields: section.fields.filter((field) => !field.readOnly),
        })),
    };
    const next = getAdmissionSubmissionValidationErrors(definition, values.current);
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };
  const save = async (): Promise<PublicParentRegistrationContext | null> => {
    if (!context || !form || busyRef.current || conflict || !context.canEdit) return null;
    busyRef.current = true;
    setBusy('save');
    setError('');
    const input = {
      snapshotToken: context.snapshotToken,
      values: parentRegistrationDraftValues(
        form,
        parentRegistrationValues(context),
        values.current
      ),
    };
    const fingerprint = JSON.stringify(input);
    if (retry.current?.fingerprint !== fingerprint)
      retry.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const next = await transport.save({ ...input, idempotencyKey: retry.current.key });
      installContext(next);
      retry.current = null;
      return next;
    } catch (failure) {
      handleFailure(failure);
      return null;
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };
  const continueFromForm = async () => {
    if (locked || !validate()) return;
    const saved = await save();
    if (saved) setStage(saved.documents.length ? 'documents' : 'review');
  };
  const upload = async (document: ParentRegistrationDocument, file: File, key: string) => {
    if (!context || busyRef.current || conflict || !context.canEdit || formik.dirty) return false;
    busyRef.current = true;
    setBusy('upload');
    setError('');
    try {
      installContext(
        await transport.upload(
          document.stageInstanceId,
          document.code,
          file,
          context.snapshotToken,
          key
        )
      );
      return true;
    } catch (failure) {
      handleFailure(failure);
      return false;
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };
  const incompleteDocuments = (context?.documents ?? []).filter(
    (document) =>
      document.isRequired && !['accepted', 'waived', 'pendingReview'].includes(document.status)
  );
  const continueFromDocuments = () => {
    if (hasDocumentDraft) {
      setError('Upload or remove the selected document before continuing to review.');
      return;
    }
    if (incompleteDocuments.length) {
      setError(
        `Upload the required documents: ${incompleteDocuments.map((document) => document.name).join(', ')}.`
      );
      return;
    }
    setError('');
    setStage('review');
  };
  const handIn = async () => {
    if (!context || locked || conflict || !context.canHandIn || busyRef.current) return;
    if (incompleteDocuments.length) {
      setStage('documents');
      continueFromDocuments();
      return;
    }
    if (!validate()) {
      setStage('form');
      return;
    }
    busyRef.current = true;
    setBusy('hand-in');
    setError('');
    if (handInRetry.current?.snapshot !== context.snapshotToken)
      handInRetry.current = { snapshot: context.snapshotToken, key: crypto.randomUUID() };
    try {
      installContext(
        await transport.handIn({
          snapshotToken: context.snapshotToken,
          idempotencyKey: handInRetry.current.key,
        })
      );
    } catch (failure) {
      handleFailure(failure);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  if (loading)
    return (
      <Stack spacing={2} aria-label="Loading registration">
        <Skeleton height={72} />
        <Skeleton variant="rounded" height={400} />
      </Stack>
    );
  if (!context || unavailable)
    return (
      <Unavailable error={error || loadError} onRetry={() => setAttempt((value) => value + 1)} />
    );
  const steps = context.documents.length
    ? ['Application form', 'Documents', 'Review']
    : ['Application form', 'Review'];
  const activeStep = stage === 'form' ? 0 : stage === 'documents' ? 1 : steps.length - 1;
  const editable = context.canEdit && !conflict;
  return (
    <Stack spacing={2}>
      <Box component="header">
        <Typography variant="h6">{context.schoolName}</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
          Complete Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {context.applicantName} · {context.applicationNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Link expires {fDateTime(context.expiresAt)}
        </Typography>
      </Box>
      {context.canEdit && (
        <ParentRegistrationInstructions hasDocuments={context.documents.length > 0} />
      )}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
        <Stack spacing={2}>
          <CustomStepper
            steps={steps}
            activeStep={activeStep}
            ariaLabel="Registration steps"
            disabled={locked || conflict}
            onStepClick={(index) => {
              if (index === activeStep) return;
              if (!context.canEdit) {
                setStage(
                  index === 0
                    ? 'form'
                    : index === 1 && context.documents.length
                      ? 'documents'
                      : 'review'
                );
                return;
              }
              if (index === 0)
                guard.requestNavigation(() => {
                  setError('');
                  setStage('form');
                });
              else if (stage === 'form') continueFromForm();
              else if (index === 1 && context.documents.length) setStage('documents');
              else continueFromDocuments();
            }}
          />
          {context.notes && (
            <FormSectionCard
              title="School Correction Request"
              icon={GlobalIcons.info}
              descriptionTooltip="Only the requested answers and documents are available to change."
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {context.notes}
              </Typography>
            </FormSectionCard>
          )}
          {context.proposalOnly && context.canEdit && (
            <Typography variant="body2" color="text.secondary">
              The school will review these corrections before applying them to the submitted
              application.
            </Typography>
          )}
          {conflict && (
            <Stack spacing={1}>
              <Typography role="alert" color="error" variant="body2">
                The application changed while you were editing. Your answers are retained. Review or
                copy your answers before loading the latest form.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  guard.requestNavigation(() => {
                    formik.resetForm();
                    setAttempt((value) => value + 1);
                  })
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                Reload latest form
              </Button>
            </Stack>
          )}
          {error && (
            <Typography role="alert" variant="body2" color="error">
              {error}
            </Typography>
          )}
          <FormBusyRegion
            busy={Boolean(busy)}
            label={
              busy === 'upload'
                ? 'Uploading document…'
                : busy === 'hand-in'
                  ? 'Sending to school…'
                  : 'Saving draft…'
            }
          >
            {stage === 'form' && form && (
              <ApplicationRuntimeFormCore
                application={{ status: 0 } as AdmissionApplication}
                form={form}
                values={formik.values}
                errors={[]}
                fieldErrors={fieldErrors}
                saving={busy === 'save'}
                submitting={false}
                onChange={(code, value) => {
                  if (editable && !locked && context.editableFieldCodes.includes(code)) {
                    values.current = { ...values.current, [code]: value };
                    formik.setFieldValue(code, value, false);
                    setFieldErrors((previous) => ({ ...previous, [code]: '' }));
                  }
                }}
                onBlur={() => undefined}
                onSave={async () => Boolean(await save())}
                onValidateStep={validate}
                onSubmit={continueFromForm}
                showSaveDraft
                canSubmitForm={editable}
                managedFormStage={false}
                canReopen={false}
                reopening={false}
                onReopen={() => undefined}
                publicMode
                editableFieldCodes={context.editableFieldCodes}
                canEditOverride={context.canEdit}
                readOnly={!editable}
                compact
                saveLabel="Save draft"
                submitLabel={
                  context.documents.length ? 'Continue to documents' : 'Continue to review'
                }
                onPhotoReadingChange={setReadingPhoto}
                onValidationBusyChange={setValidatingStep}
              />
            )}
            {stage === 'documents' && (
              <ParentRegistrationDocuments
                documents={context.documents}
                transport={transport}
                disabled={!editable || formik.dirty}
                uploading={Boolean(busy)}
                onUpload={upload}
                onDirtyChange={onDocumentDirtyChange}
              />
            )}
            {stage === 'review' && (
              <Stack spacing={2}>
                {!context.canEdit && (
                  <Typography role="status" variant="h6">
                    {context.status === 'ReadyForReview'
                      ? 'Sent to school'
                      : 'Registration is read only'}
                  </Typography>
                )}
                {context.status === 'ReadyForReview' && (
                  <Typography variant="body2">
                    The school will review your answers and documents. Contact the school if another
                    correction is needed.
                  </Typography>
                )}
                {form &&
                  getCorrectionSections(form.definition, formik.values).map(
                    ({ section, count, rows }) => (
                      <FormSectionCard
                        key={section.id}
                        title={section.name}
                        icon={GlobalIcons.admissionDetails}
                        descriptionTooltip="Review the saved answers sent to your school."
                      >
                        <Stack spacing={1}>
                          {section.isRepeatable && count === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No entries added.
                            </Typography>
                          ) : (
                            rows.map((row) => (
                              <Stack key={row.index} spacing={1}>
                                {section.isRepeatable && (
                                  <Typography variant="subtitle2">
                                    {section.entryLabel || 'Entry'} {row.index + 1}
                                  </Typography>
                                )}
                                {row.fields
                                  .filter((field) => field.fieldType !== 12)
                                  .map((field) => (
                                    <Box key={field.id} sx={{ minWidth: 0 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        {field.label}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                                      >
                                        {readableRegistrationValue(
                                          row.values[field.code] ?? '',
                                          field.optionsJson
                                        )}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Stack>
                            ))
                          )}
                        </Stack>
                      </FormSectionCard>
                    )
                  )}
                {context.documents.length > 0 && (
                  <FormSectionCard
                    title="Documents"
                    icon={GlobalIcons.documentIcon}
                    descriptionTooltip="Uploaded copies are reviewed by school staff."
                  >
                    <Stack spacing={1}>
                      {context.documents.map((document) => (
                        <Typography
                          key={`${document.stageInstanceId}/${document.code}`}
                          variant="body2"
                        >
                          {document.name} ·{' '}
                          {document.status === 'accepted'
                            ? 'Accepted by school'
                            : document.status === 'waived'
                              ? 'Waived by school'
                              : ['missing', 'rejected'].includes(document.status)
                                ? document.isRequired
                                  ? 'Required upload missing'
                                  : 'Not uploaded'
                                : document.evidence.at(-1)?.fileName || 'Awaiting school review'}
                        </Typography>
                      ))}
                    </Stack>
                  </FormSectionCard>
                )}
              </Stack>
            )}
          </FormBusyRegion>
          {stage !== 'form' && (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              sx={{
                position: 'sticky',
                bottom: 0,
                py: 1,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                zIndex: 1,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                disabled={locked}
                onClick={() =>
                  guard.requestNavigation(() => {
                    setError('');
                    setStage(stage === 'review' && context.documents.length ? 'documents' : 'form');
                  })
                }
              >
                Back
              </Button>
              {editable && stage === 'documents' && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={locked}
                  onClick={continueFromDocuments}
                >
                  Continue to review
                </Button>
              )}
              {editable && stage === 'review' && (
                <LoadingButton
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.submit} />}
                  loading={busy === 'hand-in'}
                  disabled={locked || !context.canHandIn}
                  onClick={handIn}
                >
                  Send to school
                </LoadingButton>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
      {guard.confirmation}
    </Stack>
  );
}
