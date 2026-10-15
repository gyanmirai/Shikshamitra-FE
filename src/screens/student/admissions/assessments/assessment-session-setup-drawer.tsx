'use client';

import type { FormikProps } from 'formik';
import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { Box, Stack, Alert, Drawer, Button, Divider, Typography, IconButton } from '@mui/material';

import { assessmentErrorMessage } from './assessment-utils';
import { AdmissionDialogTitle } from '../admission-dialog-title';
import { AssessmentSessionSetupFields } from './assessment-session-setup-fields';
import { AssessmentSessionBookingPreview } from './assessment-session-booking-preview';
import {
  sessionSetupSchema,
  assignPreviewSlots,
  serializeSessionSetup,
  sessionSetupInitialValues,
} from './assessment-session-setup-model';

import type {
  SharedSessionView,
  SessionRoomChoice,
  SharedSessionInput,
  SessionSetupValues,
  SessionStaffChoice,
  SessionBookingPreview,
  SessionBookingCandidate,
} from './assessment-session-setup-model';

export type AssessmentSessionSetupDrawerProps = {
  open: boolean;
  scopes: AssessmentScope[];
  rooms: SessionRoomChoice[];
  interviewers: SessionStaffChoice[];
  onSearchInterviewers?: (query: string) => Promise<SessionStaffChoice[]>;
  interviewersLoading?: boolean;
  session?: SharedSessionView | null;
  mode?: 'create' | 'edit' | 'book';
  readOnly?: boolean;
  resourcesLoading?: boolean;
  resourcesError?: string;
  onRetryResources?: () => void;
  onClose: () => void;
  onPreview: (
    input: SharedSessionInput,
    query: { skipCount: number; maxResultCount: number; search?: string }
  ) => Promise<SessionBookingPreview>;
  onSubmit: (
    input: SharedSessionInput,
    previewFingerprint: string,
    bookings: SessionBookingCandidate[]
  ) => Promise<void>;
  onSave?: (input: SharedSessionInput) => Promise<void>;
};

export function AssessmentSessionSetupDrawer(props: AssessmentSessionSetupDrawerProps) {
  const { open, ...contentProps } = props;
  const { session, mode } = contentProps;
  if (!open) return null;
  return (
    <SessionSetupContent key={`${session?.id ?? 'create'}:${mode ?? 'create'}`} {...contentProps} />
  );
}

function SessionSetupContent({
  scopes,
  rooms,
  interviewers,
  onSearchInterviewers,
  interviewersLoading,
  session,
  mode = session ? 'edit' : 'create',
  readOnly: permissionReadOnly = false,
  resourcesLoading = false,
  resourcesError,
  onRetryResources,
  onClose,
  onPreview,
  onSubmit,
  onSave,
}: Omit<AssessmentSessionSetupDrawerProps, 'open'>) {
  const [step, setStep] = useState(0);
  const readOnly = permissionReadOnly || session?.canManage === false;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [preview, setPreview] = useState<SessionBookingPreview | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const formRef = useRef<FormikProps<SessionSetupValues> | null>(null);
  const discard = useBoolean();
  const requestRef = useRef(0);
  const attemptedQuery = useRef({ page: 0, size: 25, search: '' });
  const locked = busy || resourcesLoading;
  const resolvedScopes = [
    ...scopes,
    ...(session?.scopeDetails ?? []).filter(
      (s) =>
        !scopes.some(
          (x) =>
            x.admissionOfferingId === s.admissionOfferingId &&
            x.workflowStageDefinitionId === s.workflowStageDefinitionId
        )
    ),
  ];
  const close = () => {
    if (locked) return;
    if (formRef.current?.dirty) discard.onTrue();
    else onClose();
  };
  const refresh = async (
    input: SharedSessionInput,
    formik: FormikProps<SessionSetupValues>,
    nextPage: number,
    size: number,
    query: string,
    initial = false
  ) => {
    requestRef.current += 1;
    const request = requestRef.current;
    attemptedQuery.current = { page: nextPage, size, search: query };
    setPage(nextPage);
    setPageSize(size);
    setSearch(query);
    setBusy(true);
    setError('');
    setPreviewError('');
    try {
      const result = await onPreview(input, {
        skipCount: nextPage * size,
        maxResultCount: size,
        search: query || undefined,
      });
      if (request !== requestRef.current) return;
      setPreview(result);
      if (initial) {
        const proposed = assignPreviewSlots(result.proposedBookings, result);
        setSelectedCount(proposed.length);
        await formik.setFieldValue('bookings', proposed, false);
      } else if (preview && result.previewFingerprint !== preview.previewFingerprint) {
        setSelectedCount(0);
        await formik.setFieldValue('bookings', [], false);
        setError('Availability changed. Review and select applicants again before submitting.');
      }
      setStep(1);
    } catch (failure) {
      if (request !== requestRef.current) return;
      const message = assessmentErrorMessage(
        failure,
        'Unable to load booking preview. Please retry.'
      );
      if (initial) setError(message);
      else setPreviewError(message);
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  };
  const next = async (
    last: boolean,
    values: SessionSetupValues,
    formik: FormikProps<SessionSetupValues>,
    setLoading: (value: boolean) => void
  ) => {
    if (locked || readOnly || resourcesError) return;
    const input = serializeSessionSetup(values, rooms, session?.concurrencyStamp);
    setLoading(true);
    setError('');
    try {
      if (session && mode === 'edit') {
        if (!onSave) throw new Error('Session editing is unavailable');
        setBusy(true);
        await onSave(input);
        onClose();
      } else if (!last) await refresh(input, formik, 0, 25, '', true);
      else {
        if (!preview || previewError) return;
        if (mode === 'book' && values.bookings.length === 0) {
          setError('Select at least one applicant to book into this session.');
          return;
        }
        setBusy(true);
        await onSubmit(input, preview.previewFingerprint, values.bookings);
        onClose();
      }
    } catch (failure) {
      setError(assessmentErrorMessage(failure));
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        PaperProps={{ sx: { width: { xs: 1, sm: 800 }, maxWidth: 1 } }}
      >
        <Box
          sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          aria-busy={locked}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: 2, py: 1.5 }}
          >
            <Typography variant="h6">
              <AdmissionDialogTitle
                title={
                  mode === 'book'
                    ? 'Book Assessment Applicants'
                    : session
                      ? 'Edit Assessment Session'
                      : 'Create Assessment Session'
                }
                helpText="Configure the session, review eligible applicants, then submit. Remaining applicants stay pending."
              />
            </Typography>
            <IconButton
              aria-label="Close session setup"
              size="small"
              sx={{ width: 44, height: 44 }}
              onClick={close}
              disabled={locked}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              '& .MuiStepButton-root': { mx: 0, width: 1, boxSizing: 'border-box' },
            }}
          >
            <CustomStepperWithFormik
              initialValues={sessionSetupInitialValues(session)}
              steps={
                session && mode === 'edit'
                  ? ['Session details']
                  : ['Session details', 'Booking preview']
              }
              activeStep={step}
              validationSchema={sessionSetupSchema(
                resolvedScopes,
                rooms,
                session?.bookedCount ?? 0,
                step === 1,
                mode === 'book' && Boolean(session)
              )}
              handleNext={next}
              handleBack={() => {
                setStep(0);
                setPreview(null);
                setError('');
                setPreviewError('');
              }}
              onCancel={close}
              onStepClick={(index) => {
                if (index === 0 && !locked) {
                  setStep(0);
                  setPreview(null);
                  setError('');
                  setPreviewError('');
                }
              }}
              isStepClickable={(index) => index === 0 && !locked}
              showSaveButton={false}
              nextButtonLabel="Preview booking"
              finalButtonLabel="Submit"
              saveAndNextButtonProps={{
                sx: { minHeight: 44 },
                disabled:
                  locked ||
                  readOnly ||
                  Boolean(resourcesError) ||
                  (Boolean(session) && mode === 'edit' && !onSave) ||
                  (step === 1 &&
                    (!preview ||
                      Boolean(previewError) ||
                      (mode === 'book' && selectedCount === 0))),
                loading: locked,
              }}
              backButtonProps={{ disabled: locked, sx: { minHeight: 44 } }}
              renderItem={({ formik: raw }) => {
                const formik = raw as FormikProps<SessionSetupValues>;
                formRef.current = formik;
                return (
                  <Stack
                    spacing={2}
                    sx={{ p: 2, ...(step === 1 ? { height: 1, minHeight: 0 } : {}) }}
                  >
                    {resourcesError && (
                      <Alert
                        severity="error"
                        action={
                          onRetryResources ? (
                            <Button size="small" disabled={locked} onClick={onRetryResources}>
                              Retry
                            </Button>
                          ) : undefined
                        }
                      >
                        {resourcesError}
                      </Alert>
                    )}
                    {readOnly && (
                      <Alert severity="info">
                        You can review this session. Changes require the action permission and
                        access to every linked Offering.
                      </Alert>
                    )}
                    {mode === 'book' && !session?.roomId && (
                      <Alert severity="warning">
                        This session has no Institute room. Edit it and select a room before booking
                        applicants.
                      </Alert>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                    {session && (
                      <Alert severity="info">
                        Assessment type, classes and assessment choices stay unchanged for an
                        existing session.
                        {session.bookedCount > 0 &&
                          ` ${session.bookedCount} applicants are booked. Booked individual-interview timing is preserved.`}
                      </Alert>
                    )}
                    {step === 0 ? (
                      <AssessmentSessionSetupFields
                        formik={formik}
                        scopes={resolvedScopes}
                        rooms={rooms}
                        interviewers={interviewers}
                        onSearchInterviewers={onSearchInterviewers}
                        interviewersLoading={interviewersLoading}
                        disabled={locked || readOnly || mode === 'book'}
                        identityLocked={Boolean(session)}
                        bookedCount={session?.bookedCount ?? 0}
                      />
                    ) : (
                      preview && (
                        <AssessmentSessionBookingPreview
                          preview={previewError ? { ...preview, items: [] } : preview}
                          existingSession={mode === 'book'}
                          scopes={resolvedScopes}
                          selected={formik.values.bookings}
                          onChange={(items) => {
                            const selected = assignPreviewSlots(items, preview);
                            setSelectedCount(selected.length);
                            formik.setFieldValue('bookings', selected);
                          }}
                          disabled={locked || readOnly}
                          page={page}
                          pageSize={pageSize}
                          isLoading={busy}
                          error={previewError || undefined}
                          onPage={(p, size) =>
                            refresh(
                              serializeSessionSetup(formik.values, rooms),
                              formik,
                              p,
                              size,
                              search
                            )
                          }
                          onSearch={(query) =>
                            refresh(
                              serializeSessionSetup(formik.values, rooms),
                              formik,
                              0,
                              pageSize,
                              query
                            )
                          }
                          onRetry={() =>
                            refresh(
                              serializeSessionSetup(formik.values, rooms),
                              formik,
                              attemptedQuery.current.page,
                              attemptedQuery.current.size,
                              attemptedQuery.current.search
                            )
                          }
                        />
                      )
                    )}
                  </Stack>
                );
              }}
            />
          </Box>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Session Changes?"
        icon="warning"
        content="Your session details and applicant selection have not been submitted."
        action={
          <Button size="small" variant="contained" color="error" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
