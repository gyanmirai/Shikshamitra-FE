import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';
import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';
import {
  Box,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  Typography,
  IconButton,
} from '@mui/material';
import {
  useGetAssessmentScopesQuery,
  useGetAssessmentSessionsQuery,
} from 'src/redux/student/admissions/admission-assessment-sessions-api';
import {
  usePreviewAssessmentSessionMutation,
  useConfirmAssessmentSessionMutation,
  useGetAssessmentSessionResourcesQuery,
  useLazyGetAssessmentInterviewersQuery,
} from 'src/redux/student/admissions/admission-assessment-planning-api';

import { assessmentErrorMessage } from './assessment-utils';
import { useAssessmentActions } from './use-assessment-actions';
import { AdmissionDialogTitle } from '../admission-dialog-title';
import { AssessmentBookingField } from './assessment-booking-field';
import { validateAssessmentAction } from './assessment-action-model';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { AssessmentSessionSetupFields } from './assessment-session-setup-fields';
import { getAvailableAssessmentSessions } from './assessment-session-availability';
import { createAndBookPipelineAssessment } from './assessment-pipeline-booking-model';
import {
  sessionSetupSchema,
  serializeSessionSetup,
  sessionSetupInitialValues,
} from './assessment-session-setup-model';

import type { AssessmentActionValues } from './assessment-action-model';
import type { SessionSetupValues } from './assessment-session-setup-model';
import type { PipelineBookingRetry } from './assessment-pipeline-booking-model';

type Props = {
  assessment: ManagedApplicationAssessment;
  admissionOfferingId: string;
  stage: AdmissionApplicationStage;
  disabled: boolean;
  onClose: () => void;
};

export function AssessmentPipelineBookingDrawer({
  assessment,
  admissionOfferingId,
  stage,
  disabled,
  onClose,
}: Props) {
  const titleId = useId();
  const permissions = useAssessmentPermissions();
  const [snapshot] = useState(assessment);
  const [mode, setMode] = useState<'book' | 'create'>('book');
  const [discard, setDiscard] = useState<'book' | 'close' | null>(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const retry = useRef<PipelineBookingRetry>({});
  const application = useGetAdmissionApplicationQuery(assessment.applicationId);
  const scopeKey = { admissionOfferingId, workflowStageDefinitionId: stage.definitionStageId };
  const sessions = useGetAssessmentSessionsQuery(scopeKey);
  const scopes = useGetAssessmentScopesQuery(undefined, {
    skip: mode !== 'create' || !permissions.manageSessions,
  });
  const resources = useGetAssessmentSessionResourcesQuery(undefined, {
    skip: mode !== 'create' || !permissions.manageSessions,
  });
  const scope = scopes.currentData?.find(
    (item) =>
      item.admissionOfferingId === admissionOfferingId &&
      item.workflowStageDefinitionId === stage.definitionStageId
  );
  const selectedScopes = scope ? [scope] : [];
  const rooms = resources.currentData?.rooms ?? [];
  const [preview] = usePreviewAssessmentSessionMutation();
  const [confirm] = useConfirmAssessmentSessionMutation();
  const [searchInterviewers] = useLazyGetAssessmentInterviewersQuery();
  const run = useAssessmentActions(snapshot);
  const canBook = permissions.view && permissions.book && assessment.canBook && !disabled;
  const canReplayConfirmation =
    permissions.view &&
    permissions.book &&
    permissions.manageSessions &&
    !disabled &&
    !!retry.current.command;
  const resourcesLoading = mode === 'create' && (scopes.isLoading || resources.isLoading);
  const resourcesError =
    mode === 'create' && (scopes.isError || resources.isError || (!resourcesLoading && !scope));
  const bookForm = useFormik<AssessmentActionValues>({
    initialValues: {
      sessionId: '',
      slotStartsAt: '',
      requiresSlot: false,
      attendance: 'present',
      outcome: '',
      approved: true,
      marks: '',
      notes: '',
    },
    validate: (values) => validateAssessmentAction('book', values, snapshot),
    onSubmit: async (values) => {
      if (!canBook || submitting.current) return;
      submitting.current = true;
      setError('');
      try {
        await run('book', values);
        shikshaMitraToast.success({ message: 'Assessment slot booked' });
        onClose();
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  const createForm = useFormik<SessionSetupValues>({
    initialValues: {
      ...sessionSetupInitialValues(),
      name: [application.currentData?.standardName, stage.name].filter(Boolean).join(' · '),
      offeringIds: [admissionOfferingId],
      stageIds: { [admissionOfferingId]: stage.definitionStageId },
    },
    validationSchema: sessionSetupSchema(selectedScopes, rooms),
    onSubmit: async (values) => {
      if (
        (!canBook && !canReplayConfirmation) ||
        !permissions.manageSessions ||
        resourcesError ||
        resourcesLoading ||
        submitting.current
      )
        return;
      if (!application.currentData?.applicationNumber) {
        setError('Refresh the student details before booking.');
        return;
      }
      submitting.current = true;
      setError('');
      try {
        const session = serializeSessionSetup(values, rooms);
        if (!canBook && JSON.stringify(session) !== JSON.stringify(retry.current.command?.session))
          throw new Error(
            'This assessment changed. Close and refresh before creating another slot.'
          );
        await createAndBookPipelineAssessment(
          session,
          {
            applicationId: assessment.applicationId,
            stageInstanceId: assessment.stageInstanceId,
            applicationNumber: application.currentData.applicationNumber,
          },
          {
            preview: (proposedSession, search) =>
              preview({
                session: proposedSession,
                search,
                skipCount: 0,
                maxResultCount: 25,
              }).unwrap(),
            confirm: (command) => confirm(command).unwrap(),
          },
          retry.current
        );
        shikshaMitraToast.success({ message: 'Slot created and booked' });
        onClose();
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = bookForm.isSubmitting || createForm.isSubmitting;
  const locked = busy || resourcesLoading;
  const requestNavigation = (next: 'book' | 'close') => {
    if (locked || submitting.current) return;
    const dirty = next === 'book' ? createForm.dirty : createForm.dirty || bookForm.dirty;
    if (dirty) setDiscard(next);
    else if (next === 'book') {
      setMode('book');
      setError('');
    } else onClose();
  };
  const selectedSession = getAvailableAssessmentSessions(sessions.currentData ?? []).find(
    (item) => item.id === bookForm.values.sessionId
  );
  const bookingReady =
    !!selectedSession &&
    !sessions.isFetching &&
    !sessions.isError &&
    (!bookForm.values.requiresSlot || !!bookForm.values.slotStartsAt);
  const title = mode === 'book' ? 'Book Assessment Slot' : 'Add Assessment Slot';
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={() => requestNavigation('close')}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: { width: { xs: 1, sm: 560 }, maxWidth: 1 },
        }}
      >
        <Box
          component="form"
          onSubmit={mode === 'book' ? bookForm.handleSubmit : createForm.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
            {mode === 'create' && (
              <IconButton
                size="small"
                disabled={locked}
                aria-label="Back to booking"
                onClick={() => requestNavigation('book')}
              >
                <Iconify icon="mdi:arrow-left" />
              </IconButton>
            )}
            <Typography id={titleId} variant="h6" sx={{ flex: 1 }}>
              <AdmissionDialogTitle
                title={title}
                helpText="Book an available session or create a slot for this student. Room availability and assessment eligibility are checked before booking."
              />
            </Typography>
            <IconButton
              size="small"
              disabled={locked}
              aria-label="Close assessment booking"
              onClick={() => requestNavigation('close')}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <FormBusyRegion
              busy={busy}
              label={
                mode === 'book'
                  ? 'Booking assessment slot…'
                  : 'Creating and booking assessment slot…'
              }
            >
              <Stack spacing={2} sx={{ p: 2 }}>
                <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {application.isLoading ? (
                    <Skeleton />
                  ) : (
                    <Typography variant="subtitle2">
                      {application.currentData?.applicantName || 'Student'}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {[application.currentData?.standardName || scope?.className, stage.name]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
                {error && (
                  <StudentFeedback
                    notificationKey="STU-0263"
                    presentation="persistent"
                    severity="error"
                  >
                    {error}
                  </StudentFeedback>
                )}
                {mode === 'book' ? (
                  <AssessmentBookingField
                    {...scopeKey}
                    value={bookForm.values.sessionId}
                    slotStartsAt={bookForm.values.slotStartsAt}
                    onChange={(value) => bookForm.setFieldValue('sessionId', value)}
                    onSlotChange={(value) => bookForm.setFieldValue('slotStartsAt', value)}
                    onSlotRequirementChange={(value) =>
                      bookForm.setFieldValue('requiresSlot', value, false)
                    }
                    error={bookForm.touched.sessionId ? bookForm.errors.sessionId : undefined}
                    slotError={
                      bookForm.touched.slotStartsAt ? bookForm.errors.slotStartsAt : undefined
                    }
                    disabled={busy || !canBook}
                    inlineBooking
                    onAddSlot={
                      permissions.manageSessions && canBook
                        ? () => {
                            setMode('create');
                            setError('');
                          }
                        : undefined
                    }
                  />
                ) : resourcesLoading ? (
                  <Skeleton variant="rounded" height={320} />
                ) : resourcesError ? (
                  <StudentFeedback
                    notificationKey="STU-0264"
                    presentation="toast"
                    severity="error"
                    action={
                      <Button
                        size="small"
                        onClick={() => {
                          scopes.refetch();
                          resources.refetch();
                        }}
                      >
                        Retry
                      </Button>
                    }
                  >
                    Unable to load slot setup.
                  </StudentFeedback>
                ) : (
                  <AssessmentSessionSetupFields
                    pipeline
                    formik={createForm}
                    scopes={selectedScopes}
                    rooms={rooms}
                    interviewers={resources.currentData?.interviewers ?? []}
                    onSearchInterviewers={(search) => searchInterviewers(search).unwrap()}
                    disabled={busy || !canBook || !permissions.manageSessions}
                    bookedCount={0}
                  />
                )}
                {mode === 'create' && application.isError && (
                  <StudentFeedback
                    notificationKey="STU-0265"
                    presentation="toast"
                    severity="error"
                    action={
                      <Button size="small" onClick={application.refetch}>
                        Retry
                      </Button>
                    }
                  >
                    Unable to load student details.
                  </StudentFeedback>
                )}
              </Stack>
            </FormBusyRegion>
          </Scrollbar>
          <Divider />
          <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={locked}
              onClick={() => requestNavigation('close')}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              type="submit"
              loading={busy}
              disabled={
                !(canBook || (mode === 'create' && canReplayConfirmation)) ||
                locked ||
                (mode === 'book'
                  ? !bookingReady
                  : !permissions.manageSessions ||
                    resourcesError ||
                    !application.currentData ||
                    application.isError)
              }
            >
              {mode === 'book' ? 'Book Slot' : 'Create & Book'}
            </LoadingButton>
          </Stack>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={!!discard}
        title="Discard Changes?"
        content="Your unsaved entries will be lost."
        onClose={() => setDiscard(null)}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => {
              const next = discard;
              setDiscard(null);
              if (next === 'book') {
                createForm.resetForm();
                setMode('book');
                setError('');
              } else onClose();
            }}
          >
            Discard
          </Button>
        }
      />
    </>
  );
}
