'use client';

import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useId, useRef, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Drawer, Button, Divider, Typography, IconButton } from '@mui/material';

import { assessmentErrorMessage } from './assessment-utils';
import { AdmissionDialogTitle } from '../admission-dialog-title';
import { AssessmentSessionSetupFields } from './assessment-session-setup-fields';
import {
  sessionSetupSchema,
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
  mode?: 'create' | 'edit';
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

type SessionConfirmation = { input: SharedSessionInput; fingerprint: string };

export function AssessmentSessionSetupDrawer(props: AssessmentSessionSetupDrawerProps) {
  const { open, session, mode, ...contentProps } = props;
  if (!open) return null;
  return (
    <SessionSetupContent
      key={`${session?.id ?? 'create'}:${mode ?? 'create'}`}
      session={session}
      mode={mode}
      {...contentProps}
    />
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
  const titleId = useId();
  const readOnly = permissionReadOnly || session?.canManage === false;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<SessionBookingPreview | null>(null);
  const [retryPending, setRetryPending] = useState(false);
  const pending = useRef<SessionConfirmation | null>(null);
  const submitting = useRef(false);
  const mayWrite = useRef(false);
  useEffect(() => {
    mayWrite.current = !readOnly && !resourcesError && !resourcesLoading;
    return () => {
      mayWrite.current = false;
    };
  }, [readOnly, resourcesError, resourcesLoading]);
  const discard = useBoolean();
  const locked = busy || resourcesLoading;
  const editing = Boolean(session) && mode === 'edit';
  const resolvedScopes = [
    ...scopes,
    ...(session?.scopeDetails ?? []).filter(
      (scope) =>
        !scopes.some(
          (item) =>
            item.admissionOfferingId === scope.admissionOfferingId &&
            item.workflowStageDefinitionId === scope.workflowStageDefinitionId
        )
    ),
  ];

  const submit = async (values: SessionSetupValues) => {
    if (submitting.current || locked || readOnly || resourcesError || (editing && !onSave)) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    let confirming = false;
    try {
      if (editing) {
        await onSave!(serializeSessionSetup(values, rooms, session?.concurrencyStamp));
      } else {
        let command = pending.current;
        if (!command) {
          const input = serializeSessionSetup(values, rooms);
          const checked = await onPreview(input, { skipCount: 0, maxResultCount: 1 });
          setPreview(checked);
          if (!mayWrite.current) return;
          command = { input, fingerprint: checked.previewFingerprint };
          pending.current = command;
          setRetryPending(true);
        }
        confirming = true;
        await onSubmit(command.input, command.fingerprint, []);
        pending.current = null;
        setRetryPending(false);
      }
      onClose();
    } catch (failure) {
      const status =
        failure && typeof failure === 'object' && 'status' in failure ? failure.status : undefined;
      if (
        confirming &&
        typeof status === 'number' &&
        status >= 400 &&
        status < 500 &&
        status !== 408
      ) {
        pending.current = null;
        setRetryPending(false);
        setPreview(null);
      }
      setError(
        assessmentErrorMessage(failure, 'Unable to save this assessment session. Please retry.')
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const form = useFormik<SessionSetupValues>({
    initialValues: sessionSetupInitialValues(session),
    validationSchema: sessionSetupSchema(resolvedScopes, rooms, session?.bookedCount ?? 0),
    onSubmit: submit,
  });
  const close = () => {
    if (locked || form.isSubmitting) return;
    if (form.dirty || pending.current) discard.onTrue();
    else onClose();
  };
  const disabled =
    locked || form.isSubmitting || readOnly || Boolean(resourcesError) || (editing && !onSave);
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: { width: { xs: 1, sm: 800 }, maxWidth: 1 },
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            if (pending.current) {
              event.preventDefault();
              submit(form.values);
            } else form.handleSubmit(event);
          }}
          sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          aria-busy={locked}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}
          >
            <Typography id={titleId} variant="h6">
              <AdmissionDialogTitle
                title={editing ? 'Edit Session' : 'Create Session'}
                helpText="Choose the assessment, classes, schedule and Institute room. Book students from the Student tab after creating the session."
              />
            </Typography>
            <IconButton
              aria-label="Close session setup"
              size="small"
              sx={{ width: 44, height: 44 }}
              onClick={close}
              disabled={locked}
            >
              <Iconify icon={GlobalIcons.cancel} />
            </IconButton>
          </Stack>
          <Divider />
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <FormBusyRegion
              busy={locked}
              label={
                resourcesLoading
                  ? 'Loading session options…'
                  : editing
                    ? 'Saving session…'
                    : 'Creating session…'
              }
            >
              <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
                {resourcesError && (
                  <StudentFeedback
                    notificationKey="STU-0278"
                    presentation="persistent"
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
                  </StudentFeedback>
                )}
                {readOnly && (
                  <StudentFeedback notificationKey="STU-0279" presentation="inline" severity="info">
                    You can review this session. Changes require the action permission and access to
                    every linked Offering.
                  </StudentFeedback>
                )}
                {error && (
                  <StudentFeedback
                    notificationKey="STU-0281"
                    presentation="persistent"
                    severity="error"
                  >
                    {error}
                  </StudentFeedback>
                )}
                {retryPending && !busy && (
                  <StudentFeedback
                    notificationKey="STU-0281"
                    presentation="persistent"
                    severity="warning"
                  >
                    The last confirmation response was not received. Submit retries the same request
                    safely before you change the session.
                  </StudentFeedback>
                )}
                {session && (
                  <StudentFeedback notificationKey="STU-0282" presentation="inline" severity="info">
                    Assessment type, classes and assessment choices stay unchanged for an existing
                    session.
                    {session.bookedCount > 0 &&
                      ` ${session.bookedCount} applicants are booked. Booked individual-interview timing is preserved.`}
                  </StudentFeedback>
                )}
                <AssessmentSessionSetupFields
                  formik={form}
                  scopes={resolvedScopes}
                  rooms={rooms}
                  interviewers={interviewers}
                  onSearchInterviewers={onSearchInterviewers}
                  interviewersLoading={interviewersLoading}
                  disabled={locked || readOnly || retryPending}
                  identityLocked={Boolean(session)}
                  bookedCount={session?.bookedCount ?? 0}
                  separateDate
                />
                {preview?.requiresRoomApproval && (
                  <StudentFeedback
                    notificationKey="STU-0288"
                    presentation="persistent"
                    severity="warning"
                  >
                    Room approval is pending. Student bookings will be held until approval.
                  </StudentFeedback>
                )}
                {preview?.warnings.map((warning) => (
                  <StudentFeedback
                    key={warning}
                    notificationKey="STU-0288"
                    presentation="persistent"
                    severity="warning"
                  >
                    {warning}
                  </StudentFeedback>
                ))}
              </Stack>
            </FormBusyRegion>
          </Scrollbar>
          <Divider />
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0 }}
          >
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={close}
              disabled={locked}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="inherit"
              type="submit"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              loading={locked || form.isSubmitting}
              disabled={disabled}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Session Changes?"
        icon="warning"
        content={
          pending.current
            ? 'The last confirmation response was not received. Retry Submit to check the same request safely before closing.'
            : 'Your session details have not been submitted.'
        }
        action={
          <Button size="small" variant="contained" color="error" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
