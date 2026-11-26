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
import { useResponsive } from 'src/hooks/use-responsive';
import CustomStepper from 'src/components/custom-stepper';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { parseFieldConfiguration } from 'src/screens/student/admissions/form-dialog/form-field-presets';
import { Box, Stack, Paper, Button, Divider, Skeleton, Typography, LinearProgress } from '@mui/material';
import { getVisibleAdmissionFormSteps } from 'src/screens/student/admissions/form-dialog/form-step-groups';
import { getAdmissionSubmissionValidationErrors } from 'src/screens/student/admissions/admission-form-validation';
import { ApplicationRuntimeFormCore } from 'src/screens/student/admissions/application-detail/application-runtime-form';
import { getCorrectionSections } from 'src/screens/student/admissions/application-detail/application-form-correction-visibility';

import { ParentRegistrationReview } from './parent-registration-review';
import { ParentRegistrationDocuments } from './parent-registration-documents';
import { ParentRegistrationInstructions } from './parent-registration-instructions';
import { ParentRegistrationLogo, ParentRegistrationExpiry } from './parent-registration-start-details';
import {
  parentRegistrationForm,
  parentRegistrationValues,
  parentRegistrationDraftValues,
} from './parent-registration-model';
import {
  readRegistrationToken,
  ParentRegistrationError,
  createParentRegistrationTransport,
} from './parent-registration-transport';

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

function Unavailable({
  error,
  unavailableLink = false,
  onRetry,
}: {
  error?: string;
  unavailableLink?: boolean;
  onRetry?: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            aria-hidden
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'error.lighter',
              color: 'error.main',
            }}
          >
            <Iconify icon={GlobalIcons.warning} width={22} />
          </Box>
          <Typography variant="h5">
            {unavailableLink
              ? 'Registration link unavailable or expired'
              : 'Registration link unavailable'}
          </Typography>
        </Stack>
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
  const mobile = useResponsive('down', 'sm');
  const [context, setContext] = useState<PublicParentRegistrationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [unavailableLink, setUnavailableLink] = useState(false);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<'form' | 'documents' | 'review'>('form');
  const [formStepId, setFormStepId] = useState<string | null>(null);
  const [reviewSectionId, setReviewSectionId] = useState<string | null>(null);
  const pageStart = useRef<HTMLElement>(null);
  const fieldErrorsPresent = useRef(false);
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
  fieldErrorsPresent.current = Object.values(fieldErrors).some(Boolean);
  useEffect(() => {
    if (mobile && !fieldErrorsPresent.current)
      pageStart.current?.scrollIntoView?.({ block: 'start' });
  }, [mobile, stage, formStepId, instructionsAccepted]);
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
    setUnavailableLink(false);
    transport
      .context(controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        installContext(next);
        setStage(next.canEdit ? 'form' : 'review');
        setFormStepId(null);
        setReviewSectionId(null);
        setInstructionsAccepted(!next.canEdit);
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return;
        setUnavailableLink(failure instanceof ParentRegistrationError && failure.unavailableLink);
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
    if (detail?.unavailableLink) setUnavailableLink(true);
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
    if (saved) {
      setStage(!reviewSectionId && saved.documents.length ? 'documents' : 'review');
      setReviewSectionId(null);
    }
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
      <Unavailable
        error={error || loadError}
        unavailableLink={unavailableLink}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );
  const steps = context.documents.length
    ? ['Application form', 'Documents', 'Review']
    : ['Application form', 'Review'];
  const activeStep = stage === 'form' ? 0 : stage === 'documents' ? 1 : steps.length - 1;
  const editable = context.canEdit && !conflict;
  const showInstructionsGate = editable && !instructionsAccepted;
  const mobileDocuments = mobile && stage === 'documents';
  const formSteps =
    mobile && form
      ? getVisibleAdmissionFormSteps(
          form.definition.sections,
          formik.values,
          form.definition.layoutType === 1
        )
      : [];
  const formStepCount = Math.max(1, formSteps.length);
  const totalSteps = formStepCount + steps.length - 1;
  const currentStep =
    stage === 'form'
      ? Math.max(
          0,
          formSteps.findIndex(({ id }) => id === formStepId)
        ) + 1
      : stage === 'documents'
        ? formStepCount + 1
        : totalSteps;
  const reviewSections =
    stage === 'review' && form ? getCorrectionSections(form.definition, formik.values) : [];
  const openReviewSection = (sectionId: string) => {
    const step = formSteps.find(({ sections }) =>
      sections.some(({ section }) => section.id === sectionId)
    );
    if (!step) return;
    setError('');
    setFormStepId(step.id);
    setReviewSectionId(sectionId);
    setStage('form');
  };
  return (
    <Stack
      spacing={2}
      sx={
        mobile
          ? {
              minHeight: (theme) => `calc(100dvh - ${theme.spacing(2)})`,
              p: showInstructionsGate || mobileDocuments ? 2 : 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
            }
          : undefined
      }
    >
      {mobile ? (
        <Stack ref={pageStart} component="header" spacing={showInstructionsGate ? 1.5 : 1} sx={{ minWidth: 0 }}>
          {showInstructionsGate || mobileDocuments ? (
            <ParentRegistrationLogo schoolName={context.schoolName} loadLogo={transport.logo} />
          ) : (
            <Typography variant="subtitle1" component="p" fontWeight={700}>
              {context.schoolName}
            </Typography>
          )}
          {showInstructionsGate && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="h4" component="h1">
                Registration form
              </Typography>
              <InfoTooltipIcon
                title="Register your child in a few simple steps."
                label="Registration form information"
              />
            </Stack>
          )}
          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0, bgcolor: 'background.neutral' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  aria-hidden
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                  }}
                >
                  <Iconify icon={GlobalIcons.studentProfile} width={22} />
                </Box>
                <Stack spacing={0.25} minWidth={0}>
                  <Typography
                    component="h2"
                    variant={showInstructionsGate || mobileDocuments ? 'h5' : 'subtitle1'}
                    fontWeight={700}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {context.applicantName || 'Student'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                    {context.applicationNumber}
                  </Typography>
                </Stack>
              </Stack>
              {showInstructionsGate && (
                <>
                  <Divider />
                  <ParentRegistrationExpiry expiresAt={context.expiresAt} />
                </>
              )}
            </Stack>
          </Paper>
        </Stack>
      ) : (
        <Paper
          component="header"
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'minmax(0, 1fr) minmax(320px, 0.9fr)',
            },
            alignItems: 'center',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={1.5} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700}>
              {context.schoolName}
            </Typography>
            <Box>
              <Typography variant="h4">Complete Registration</Typography>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1 }}>
                <Box
                  aria-hidden
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                  }}
                >
                  <Iconify icon={GlobalIcons.studentProfile} width={22} />
                </Box>
                <Box minWidth={0}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {context.applicantName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {context.applicationNumber}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
          <Paper
            variant="outlined"
            sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              <Iconify icon={GlobalIcons.clock} width={22} />
            </Box>
            <Stack spacing={0.25} minWidth={0}>
              <Typography variant="caption" color="text.secondary">
                Registration link
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                Expires {fDateTime(context.expiresAt)}
              </Typography>
            </Stack>
          </Paper>
        </Paper>
      )}
      {mobile && !showInstructionsGate && context.canEdit && (
        <Stack spacing={0.75}>
          <Typography variant="subtitle2" component="p" aria-live="polite">
            Step {currentStep} of {totalSteps}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(currentStep / totalSteps) * 100}
            aria-label="Registration progress"
            aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
            sx={{ borderRadius: 1 }}
          />
        </Stack>
      )}
      {!mobile && (
        <CustomStepper
          steps={steps}
          activeStep={activeStep}
          ariaLabel="Registration steps"
          disabled={showInstructionsGate || locked || conflict}
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
      )}
      {showInstructionsGate ? (
        <ParentRegistrationInstructions
          mobile={mobile}
          hasDocuments={context.documents.length > 0}
          onContinue={() => setInstructionsAccepted(true)}
        />
      ) : (
        <Paper
          variant="outlined"
          sx={
            mobile
              ? {
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  border: 0,
                  boxShadow: 'none',
                }
              : { p: { xs: 1.5, sm: 2 }, minWidth: 0 }
          }
        >
          <Stack
            spacing={2}
            sx={
              mobile
                ? { flex: 1, minWidth: 0, borderTop: 1, borderColor: 'divider', pt: 2 }
                : undefined
            }
          >
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
                  The application changed while you were editing. Your answers are retained. Review
                  or copy your answers before loading the latest form.
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
              fillContent={mobile}
              flattenFieldset={mobile}
              busy={Boolean(busy)}
              showOverlay={!(mobileDocuments && busy === 'upload')}
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
                    // The framed photo completes while its field still holds the interaction lock.
                    const photoReady =
                      readingPhoto &&
                      form.definition.sections.some((section) =>
                        section.fields.some(
                          (field) =>
                            field.code === code &&
                            parseFieldConfiguration(field.validationJson).format === 'photo'
                        )
                      );
                    if (
                      editable &&
                      !busy &&
                      !validatingStep &&
                      (!readingPhoto || photoReady) &&
                      context.editableFieldCodes.includes(code)
                    ) {
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
                  guidedNavigation={
                    mobile
                      ? {
                          stepId: formStepId,
                          onStepChange: setFormStepId,
                          reviewSectionId,
                        }
                      : undefined
                  }
                  footerActions={
                    mobile &&
                    !context.canEdit && (
                      <Button size="small" variant="outlined" onClick={() => setStage('review')}>
                        Return to Review
                      </Button>
                    )
                  }
                  saveLabel="Draft"
                  submitLabel={reviewSectionId ? 'Save & Return to Review' : 'Continue'}
                  onPhotoReadingChange={setReadingPhoto}
                  onValidationBusyChange={setValidatingStep}
                />
              )}
              {stage === 'documents' && (
                <Stack spacing={2}>
                  {mobile && (
                    <Typography variant="h5" component="h1">
                      Documents
                    </Typography>
                  )}
                  <ParentRegistrationDocuments
                    mobile={mobile}
                    documents={context.documents}
                    transport={transport}
                    disabled={!editable || formik.dirty}
                    uploading={Boolean(busy)}
                    onUpload={upload}
                    onDirtyChange={onDocumentDirtyChange}
                  />
                  {mobile && editable && incompleteDocuments.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Upload the required documents to continue to review.
                    </Typography>
                  )}
                </Stack>
              )}
              {stage === 'review' && (
                <ParentRegistrationReview
                  context={context}
                  sections={reviewSections}
                  mobile={mobile}
                  onEditSection={mobile && editable && !locked ? openReviewSection : undefined}
                  canEditSection={(sectionId) =>
                    formSteps.some(({ sections }) =>
                      sections.some(({ section }) => section.id === sectionId)
                    )
                  }
                  onOpenDocuments={
                    mobile && !locked && !conflict && context.documents.length > 0
                      ? () => {
                          setError('');
                          setStage('documents');
                        }
                      : undefined
                  }
                />
              )}
            </FormBusyRegion>
            {stage !== 'form' && (!mobile || context.canEdit || stage === 'documents') && (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
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
                      setStage(
                        stage === 'review' && context.documents.length ? 'documents' : 'form'
                      );
                    })
                  }
                >
                  Back
                </Button>
                {editable && stage === 'documents' && (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={locked || (mobile && incompleteDocuments.length > 0)}
                    onClick={continueFromDocuments}
                  >
                    Continue
                  </Button>
                )}
                {mobile && !context.canEdit && stage === 'documents' && (
                  <Button size="small" variant="outlined" onClick={() => setStage('review')}>
                    Return to Review
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
      )}
      {guard.confirmation}
    </Stack>
  );
}
