'use client';

import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { ValidationError } from 'yup';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Avatar, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import {
  useActivateStudentOnboardingMutation,
  useGetStudentOnboardingCredentialsQuery,
  useGetStudentOnboardingWorkflowDocumentsQuery,
  useRefreshStudentOnboardingReadinessMutation,
  useLazyGetStudentOnboardingCaseQuery,
  useLazyPreviewStudentOnboardingActivationQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentOnboardingFees from './student-onboarding-fees';
import { mapOnboardingCaseToItem } from './student-onboarding-model';
import { getStudentSetupStatusDisplayLabel, studentSetupStatusMeta } from './student-setup-summary';
import { runStudentQuickSetupSave } from './student-quick-setup-save';
import StudentQuickSetupAcademic from './student-quick-setup-academic';
import StudentQuickSetupSection from './student-quick-setup-section';
import StudentQuickSetupFeesSection from './student-quick-setup-fees-section';
import { useStudentQuickSetupAcademic } from './use-student-quick-setup-academic';
import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';
import StudentOnboardingWorkflowDocuments from './student-onboarding-workflow-documents';
import { getOnboardingMessage, getOnboardingErrorMessage } from './student-onboarding-messages';

import type { StudentSetupView } from './student-setup-view';
import type { StudentOnboardingItem } from './student-onboarding-model';
import type { StudentParentSiblingActivationState } from './student-parent-sibling-state';
import type {
  StudentOnboardingFeesState,
  StudentOnboardingFeesHandle,
} from './student-onboarding-fees';
import type {
  StudentCredentialSendSummary,
  StudentOnboardingPortalAccountsHandle,
  StudentOnboardingPortalAccountsSelection,
} from './student-onboarding-portal-accounts';

export type StudentQuickSetupPageState = { dirty: boolean; busy: boolean };

type Props = {
  student: StudentOnboardingItem;
  canManage: boolean;
  academicYearId?: string;
  initialSection?: StudentSetupView | null;
  onClose: () => void;
  onShowDetails: () => void;
  onNext?: () => void;
  onStateChange: (state: StudentQuickSetupPageState) => void;
};

const sectionId = (view?: StudentSetupView | null) =>
  view === 'fees'
    ? 'quick-setup-fees'
    : view === 'credentials'
      ? 'quick-setup-login'
      : 'quick-setup-academic';

export default function StudentQuickSetupPage({
  student,
  canManage,
  academicYearId,
  initialSection,
  onClose,
  onShowDetails,
  onNext,
  onStateChange,
}: Props) {
  const [saving, setSaving] = useState<'later' | 'activate' | 'send' | 'refresh' | null>(null);
  const savingRef = useRef(false);
  const activationKey = useRef<string | null>(null);
  const portalAccountsRef = useRef<StudentOnboardingPortalAccountsHandle>(null);
  const feesRef = useRef<StudentOnboardingFeesHandle>(null);
  const [feesState, setFeesState] = useState<StudentOnboardingFeesState>({
    dirty: false,
    busy: false,
    loading: true,
    canSave: false,
  });
  const [credentialsBusy, setCredentialsBusy] = useState(false);
  const [credentialSelection, setCredentialSelection] =
    useState<StudentOnboardingPortalAccountsSelection>({
      selectedCount: 0,
      canSend: false,
    });
  const [parentValidationAttempt, setParentValidationAttempt] = useState(0);
  const [parentState, setParentState] = useState<StudentParentSiblingActivationState>({
    caseId: student.id,
    loaded: false,
  });
  const [failure, setFailure] = useState<string>();
  const [failureSeverity, setFailureSeverity] = useState<'error' | 'info'>('error');
  const [activatedCase, setActivatedCase] = useState<StudentOnboardingCase>();
  const [getCase] = useLazyGetStudentOnboardingCaseQuery();
  const [previewActivation] = useLazyPreviewStudentOnboardingActivationQuery();
  const [activate] = useActivateStudentOnboardingMutation();
  const [refreshReadiness] = useRefreshStudentOnboardingReadinessMutation();
  const editor = useStudentQuickSetupAcademic({
    caseId: student.id,
    canManage,
    reportSaveErrors: false,
    disabled: Boolean(saving) || credentialsBusy || feesState.busy,
  });
  const current = editor.caseData?.studentEnrollmentId
    ? editor.caseData
    : (activatedCase ?? editor.caseData);
  const activeStudent = current ? mapOnboardingCaseToItem(current) : student;
  const enrolled = Boolean(current ? current.studentEnrollmentId : student.studentEnrollmentId);
  const cancelled = (current?.status ?? student.backendStatus) === 5;
  const scopeChanged = Boolean(
    current && academicYearId && current.academicYearId !== academicYearId
  );
  const busy = Boolean(saving) || editor.busy || credentialsBusy || feesState.busy;
  const dirty = editor.dirty || feesState.dirty;
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const [returnFocusTarget] = useState(() =>
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
  const status = enrolled
    ? { label: 'Student active', color: 'success' as const }
    : cancelled
      ? { label: 'Cancelled', color: 'default' as const }
      : { label: 'Setup pending', color: 'warning' as const };
  const onboardingStatus = studentSetupStatusMeta[activeStudent.status];
  const [loginOpen, setLoginOpen] = useState(initialSection === 'credentials');
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const summaryOptions = { skip: !current || editor.permissionDenied || editor.readError };
  // These subscriptions share the existing child queries and RTK Query cache keys.
  const loginSummary = useGetStudentOnboardingCredentialsQuery(student.id, summaryOptions);
  const documentSummary = useGetStudentOnboardingWorkflowDocumentsQuery(student.id, summaryOptions);
  const emailCount = new Set(
    loginSummary.currentData?.recipients
      .map((recipient) => recipient.email?.trim().toLowerCase())
      .filter(Boolean)
  ).size;
  const acceptedDocuments = documentSummary.currentData
    ?.flatMap((stage) => stage.requirements)
    .filter((requirement) => requirement.status === 'accepted').length;
  const pendingDocuments =
    documentSummary.currentData
      ?.flatMap((stage) => stage.requirements)
      .filter(
        (requirement) =>
          requirement.isRequired &&
          !['accepted', 'waived', 'notRequired'].includes(requirement.status)
      ).length ?? 0;
  const documentsNeedAttention =
    pendingDocuments > 0 ||
    Boolean(
      documentSummary.currentData?.some(
        (stage) =>
          stage.blockers?.length ||
          stage.requirements.some((requirement) => requirement.blockers?.length)
      )
    );

  useEffect(() => {
    setLoginOpen(initialSection === 'credentials');
    setDocumentsOpen(false);
  }, [student.id, initialSection]);
  useEffect(() => {
    if (loginSummary.isError) setLoginOpen(true);
    if (documentSummary.isError || documentsNeedAttention) setDocumentsOpen(true);
  }, [
    student.id,
    initialSection,
    loginSummary.isError,
    documentSummary.isError,
    documentsNeedAttention,
  ]);

  useEffect(() => {
    onStateChange({ dirty, busy });
  }, [dirty, busy, onStateChange]);
  useEffect(() => () => onStateChange({ dirty: false, busy: false }), [onStateChange]);
  useEffect(() => {
    mounted.current = true;
    if (window.matchMedia('(min-width: 900px)').matches) {
      titleRef.current?.focus({ preventScroll: true });
    }
    return () => {
      mounted.current = false;
      // Match the assignment drawer: wait until the worklist has released its action lock.
      window.requestAnimationFrame(() => {
        if (
          mounted.current ||
          document.querySelector(
            '[aria-labelledby="student-quick-setup-title"], [aria-labelledby="student-setup-drawer-title"]'
          )
        )
          return;
        const target =
          returnFocusTarget?.isConnected &&
          returnFocusTarget !== document.body &&
          !returnFocusTarget.matches(':disabled')
            ? returnFocusTarget
            : document.querySelector<HTMLElement>('input[aria-label="Search table"]');
        target?.focus();
      });
    };
  }, [returnFocusTarget]);
  useEffect(() => {
    if (editor.permissionDenied)
      setFeesState({ dirty: false, busy: false, loading: false, canSave: false });
  }, [editor.permissionDenied]);
  useEffect(() => {
    if (editor.loading || !initialSection || initialSection === 'readiness') return;
    bodyRef.current
      ?.querySelector<HTMLElement>(`#${sectionId(initialSection)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [initialSection, editor.loading]);

  const save = async (shouldActivate: boolean, sendCredentialsAfterActivation = false) => {
    if (
      savingRef.current ||
      busy ||
      !canManage ||
      editor.readError ||
      scopeChanged ||
      !current ||
      cancelled ||
      enrolled
    )
      return;
    if (
      shouldActivate &&
      credentialSelection.parentSelected &&
      (parentState.caseId !== student.id || !parentState.loaded || parentState.blockedReason)
    ) {
      setParentValidationAttempt((attempt) => attempt + 1);
      setLoginOpen(true);
      shikshaMitraToast.error({
        message:
          parentState.caseId === student.id && parentState.loaded
            ? getOnboardingMessage(parentState.blockedReason, 'Review App Login before activating.')
            : 'Wait for App Login settings to load before activating.',
      });
      bodyRef.current
        ?.querySelector<HTMLElement>('#quick-setup-login')
        ?.scrollIntoView({ block: 'nearest' });
      window.requestAnimationFrame(() =>
        bodyRef.current
          ?.querySelector<HTMLElement>(
            '[data-parent-sibling-selection] [role="combobox"], [data-parent-sibling-selection] select'
          )
          ?.focus()
      );
      return;
    }
    savingRef.current = true;
    const sendPrepared =
      shouldActivate && sendCredentialsAfterActivation
        ? portalAccountsRef.current?.prepareSend?.()
        : undefined;
    setSaving(shouldActivate ? 'activate' : 'later');
    setFailure(undefined);
    setFailureSeverity('error');
    try {
      const result = await runStudentQuickSetupSave({
        activate: shouldActivate,
        idempotencyKey: activationKey.current ?? (activationKey.current = crypto.randomUUID()),
        services: {
          saveAcademic: editor.save,
          saveFees: async (options) => {
            if (!feesRef.current) throw new Error('Wait for fee structures to load, then retry.');
            await feesRef.current.save(options);
          },
          getCase: () => getCase(student.id, false).unwrap(),
          previewActivation: () => previewActivation(student.id, false).unwrap(),
          activateStudent: (preview, idempotencyKey) =>
            activate({
              id: student.id,
              concurrencyStamp: preview.concurrencyStamp,
              idempotencyKey,
              siblingParentSelection: credentialSelection.parentSelected
                ? parentState.selection
                : undefined,
              guardianAccessSelection: credentialSelection.parentSelected
                ? parentState.guardianAccessSelection
                : undefined,
            }).unwrap(),
        },
      });
      // Enrollment is durable even if its background refresh or access preparation fails.
      if (result.studentEnrollmentId) setActivatedCase(result);
      if (shouldActivate && sendCredentialsAfterActivation && result.studentEnrollmentId) {
        let summary: StudentCredentialSendSummary | undefined;
        try {
          summary = sendPrepared
            ? await sendPrepared()
            : await portalAccountsRef.current?.sendSelected(true);
        } catch {
          // Enrollment is committed; credential delivery remains separately retryable.
        }
        shikshaMitraToast[summary && summary.failed === 0 ? 'success' : 'warning']({
          message: summarizeCredentialSend(summary, true),
        });
        if (!summary || summary.failed > 0) setLoginOpen(true);
      } else {
        shikshaMitraToast.success({
          message: result.studentEnrollmentId ? 'Student is now active.' : 'Student setup saved.',
        });
      }
    } catch (error) {
      if (!(error instanceof ValidationError) && documentsNeedAttention) {
        setDocumentsOpen(true);
        window.requestAnimationFrame(() => {
          const section = bodyRef.current?.querySelector<HTMLElement>('#quick-setup-documents');
          section?.scrollIntoView({ block: 'nearest' });
          section?.querySelector<HTMLElement>('button[aria-expanded]')?.focus();
        });
      }
      setFailure(
        error instanceof ValidationError
          ? undefined
          : getOnboardingErrorMessage(error, 'Changes could not be saved. Try again.')
      );
      if (error instanceof ValidationError) {
        bodyRef.current
          ?.querySelector<HTMLElement>(
            error.path === 'divisionId' ? '#quick-setup-division' : '#quick-setup-fees'
          )
          ?.scrollIntoView({ block: 'nearest' });
      }
      // Reconcile persisted progress after a lost response; never reallocate a saved number.
      const recovered = await getCase(student.id, false)
        .unwrap()
        .catch(() => undefined);
      if (recovered?.studentEnrollmentId) {
        setActivatedCase(recovered);
        setFailureSeverity('info');
        setFailure('The student is active. Review any remaining App Login work below.');
      }
      bodyRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-fee-structure-empty]')
        ?.focus();
    } finally {
      savingRef.current = false;
      setSaving(null);
    }
  };

  const summarizeCredentialSend = (
    summary: StudentCredentialSendSummary | undefined,
    activated: boolean
  ) => {
    if (!summary || summary.requested === 0)
      return activated
        ? 'Student is now active.'
        : 'Login details were not sent. Review App Login and try again.';
    const completed = summary.submitted + summary.queued + (summary.linked ?? 0);
    if (summary.linked && summary.failed === 0) {
      const emailStatus =
        summary.submitted + summary.queued > 0 ? ' Selected login emails were requested.' : '';
      return `${activated ? 'Student is now active. ' : ''}Existing parent login linked.${emailStatus}`;
    }
    const recipientLabel = summary.requested === 1 ? 'recipient' : 'recipients';
    if (summary.failed === 0 && summary.queued === 0)
      return `${activated ? 'Student is now active. ' : ''}Login details submitted for ${summary.submitted} ${recipientLabel}.`;
    if (summary.failed === 0 && summary.submitted === 0)
      return `${activated ? 'Student is now active. ' : ''}Login details queued for ${summary.queued} ${recipientLabel}.`;
    if (summary.failed > 0 && completed === 0)
      return `${activated ? 'Student is active, but ' : ''}login details could not be sent. Review App Login and retry.`;
    return `${activated ? 'Student is active. ' : ''}Login details were submitted or queued for ${completed} ${recipientLabel}; ${summary.failed} need attention in App Login.`;
  };

  const sendSelectedNow = async () => {
    if (
      savingRef.current ||
      busy ||
      !canManage ||
      !enrolled ||
      !credentialSelection.selectedCount ||
      !credentialSelection.canSend
    )
      return;
    savingRef.current = true;
    setSaving('send');
    setFailure(undefined);
    try {
      const result = await portalAccountsRef.current?.sendSelected();
      shikshaMitraToast[result && result.failed === 0 ? 'success' : 'warning']({
        message: summarizeCredentialSend(result, false),
      });
      if (!result || result.failed > 0) setLoginOpen(true);
    } finally {
      savingRef.current = false;
      setSaving(null);
    }
  };

  const checkCompletion = async () => {
    if (
      savingRef.current ||
      busy ||
      !canManage ||
      !enrolled ||
      !current ||
      scopeChanged ||
      editor.readError
    )
      return;
    savingRef.current = true;
    setSaving('refresh');
    setFailure(undefined);
    try {
      const result = await refreshReadiness({
        id: student.id,
        concurrencyStamp: current.concurrencyStamp,
      }).unwrap();
      setActivatedCase(result);
    } catch (error) {
      setFailure(
        getOnboardingErrorMessage(error, 'Setup could not be checked. Refresh and try again.')
      );
    } finally {
      savingRef.current = false;
      setSaving(null);
    }
  };

  return (
    <Box
      component="section"
      aria-busy={busy}
      aria-labelledby="student-quick-setup-title"
      sx={{
        width: 1,
        minWidth: 0,
        minHeight: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        spacing={1}
        useFlexGap
        sx={{
          p: 1.5,
          display: 'grid',
          gridTemplateColumns: { xs: '40px minmax(0, 1fr)', sm: '40px minmax(0, 1fr) auto' },
          gap: 1,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Avatar variant="rounded" sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>
          {editor.permissionDenied
            ? '—'
            : activeStudent.studentName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((name) => name.charAt(0))
                .join('')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            ref={titleRef}
            tabIndex={-1}
            id="student-quick-setup-title"
            component="h2"
            variant="h6"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {editor.permissionDenied ? 'Student Setup' : activeStudent.studentName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', overflowWrap: 'anywhere' }}
          >
            {!editor.permissionDenied &&
              [
                activeStudent.applicationNumber,
                current?.academicYearName,
                activeStudent.boardName,
                activeStudent.mediumName,
              ]
                .filter(Boolean)
                .join(' · ')}
          </Typography>
        </Box>
        {!editor.permissionDenied && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{
              minWidth: 0,
              gridColumn: { xs: '1 / -1', sm: 'auto' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Label color={status.color}>{status.label}</Label>
            {enrolled && (
              <Label color={onboardingStatus.color}>
                {getStudentSetupStatusDisplayLabel(activeStudent.status)}
              </Label>
            )}
            {enrolled && !cancelled && current?.status !== 4 && canManage && (
              <LoadingButton
                size="small"
                variant="outlined"
                loading={saving === 'refresh'}
                disabled={busy || editor.loading || editor.readError || scopeChanged}
                onClick={checkCompletion}
              >
                Check completion
              </LoadingButton>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={onShowDetails}
              disabled={busy || editor.loading || editor.readError}
            >
              Details & History
            </Button>
          </Stack>
        )}
      </Stack>
      <Scrollbar ref={bodyRef} sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5}>
          {editor.permissionDenied ? (
            <StudentFeedback
              notificationKey="STU-1034"
              presentation="inline"
              severity="error"
              action={
                <Button size="small" onClick={editor.retry}>
                  Retry
                </Button>
              }
            >
              This student is no longer available with your current access.
            </StudentFeedback>
          ) : (
            <>
              {scopeChanged && (
                <StudentFeedback
                  notificationKey="STU-1035"
                  presentation="inline"
                  severity="warning"
                >
                  The academic year changed. Close this student and reopen it in the correct year.
                </StudentFeedback>
              )}
              {failure && (
                <StudentFeedback
                  notificationKey="STU-1036"
                  presentation="toast"
                  severity={failureSeverity}
                  role="alert"
                >
                  {failure}
                </StudentFeedback>
              )}
              {saving && (
                <LinearProgress
                  aria-label={
                    saving === 'activate'
                      ? 'Saving and activating student'
                      : saving === 'send'
                        ? 'Sending login details'
                        : 'Saving student setup'
                  }
                />
              )}
              <>
                <Box
                  id="quick-setup-academic"
                  component="fieldset"
                  disabled={Boolean(saving) || credentialsBusy || feesState.busy || scopeChanged}
                  inert={Boolean(saving) || credentialsBusy || feesState.busy || scopeChanged}
                  sx={{
                    border: 0,
                    p: 0,
                    m: 0,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <StudentQuickSetupAcademic editor={editor} compact overview />
                </Box>
                <Box
                  id="quick-setup-login"
                  component="fieldset"
                  disabled={
                    Boolean(saving) ||
                    editor.busy ||
                    feesState.busy ||
                    scopeChanged ||
                    editor.readError
                  }
                  inert={
                    Boolean(saving) ||
                    editor.busy ||
                    feesState.busy ||
                    scopeChanged ||
                    editor.readError
                  }
                  sx={{
                    border: 0,
                    p: 0,
                    m: 0,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <StudentQuickSetupSection
                    title="App Login"
                    icon="mdi:account-key-outline"
                    help="Select who should receive login details when the student is activated."
                    expanded={loginOpen}
                    onExpandedChange={setLoginOpen}
                    disabled={busy || editor.readError || scopeChanged}
                    summary={
                      !loginSummary.currentData && !loginSummary.isError ? (
                        <Skeleton width={160} />
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="flex-end"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Typography
                            variant="body2"
                            color={
                              loginSummary.isError
                                ? 'error.main'
                                : emailCount
                                  ? 'success.main'
                                  : 'text.secondary'
                            }
                          >
                            {loginSummary.isError
                              ? 'Login details unavailable'
                              : emailCount
                                ? `${emailCount} email ${emailCount === 1 ? 'address' : 'addresses'} saved`
                                : 'No email saved'}
                          </Typography>
                          {credentialSelection.selectedCount > 0 && (
                            <Label>{credentialSelection.selectedCount} selected</Label>
                          )}
                        </Stack>
                      )
                    }
                  >
                    <StudentOnboardingPortalAccounts
                      ref={portalAccountsRef}
                      student={activeStudent}
                      canManage={canManage && !scopeChanged}
                      combinedActivation
                      onBusyChange={setCredentialsBusy}
                      onParentStateChange={setParentState}
                      onSelectionStateChange={setCredentialSelection}
                      parentValidationAttempt={parentValidationAttempt}
                      compact
                    />
                  </StudentQuickSetupSection>
                </Box>
              </>
              <Box
                id="quick-setup-fees"
                component="fieldset"
                disabled={
                  Boolean(saving) ||
                  editor.busy ||
                  credentialsBusy ||
                  scopeChanged ||
                  editor.readError
                }
                inert={
                  Boolean(saving) ||
                  editor.busy ||
                  credentialsBusy ||
                  scopeChanged ||
                  editor.readError
                }
                sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
              >
                <StudentQuickSetupFeesSection
                  caseId={student.id}
                  state={feesState}
                  initiallyExpanded={initialSection === 'fees'}
                  disabled={busy || editor.readError || scopeChanged}
                >
                  <StudentOnboardingFees
                    caseId={student.id}
                    canManage={canManage}
                    editorRef={feesRef}
                    onStateChange={setFeesState}
                    compact
                    disabled={
                      Boolean(saving) ||
                      editor.busy ||
                      credentialsBusy ||
                      scopeChanged ||
                      editor.readError
                    }
                  />
                </StudentQuickSetupFeesSection>
              </Box>
              <StudentQuickSetupSection
                sectionId="quick-setup-documents"
                title="Admission & Documents"
                icon="mdi:file-document-check-outline"
                help="View admission approval and the required documents."
                expanded={documentsOpen}
                onExpandedChange={setDocumentsOpen}
                disabled={busy || editor.readError || scopeChanged}
                summary={
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {current ? (
                      <Label color={current.admissionConfirmed === true ? 'success' : 'warning'}>
                        {current.admissionConfirmed === true
                          ? 'Admission approved'
                          : current.admissionConfirmed === false
                            ? 'Admission pending'
                            : 'Admission unavailable'}
                      </Label>
                    ) : (
                      <Skeleton width={120} height={24} aria-label="Loading admission details" />
                    )}
                    <Typography
                      variant="body2"
                      color={documentsNeedAttention ? 'warning.main' : 'text.secondary'}
                    >
                      {documentSummary.isError
                        ? 'Documents unavailable'
                        : documentsNeedAttention
                          ? pendingDocuments
                            ? `${pendingDocuments} ${pendingDocuments === 1 ? 'document' : 'documents'} to review`
                            : 'Review documents'
                          : acceptedDocuments !== undefined
                            ? `${acceptedDocuments} accepted ${acceptedDocuments === 1 ? 'document' : 'documents'}`
                            : 'Loading documents…'}
                    </Typography>
                  </Stack>
                }
              >
                <Box
                  component="fieldset"
                  disabled={busy || editor.readError}
                  inert={busy || editor.readError}
                  sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
                >
                  <StudentOnboardingWorkflowDocuments
                    caseId={student.id}
                    canManage={canManage && !scopeChanged}
                    hasDocumentRequirementsSnapshot={current?.hasDocumentRequirementsSnapshot}
                    presentation="workspace"
                  />
                </Box>
              </StudentQuickSetupSection>
            </>
          )}
        </Stack>
      </Scrollbar>
      <Stack
        component="footer"
        direction="row"
        spacing={1}
        useFlexGap
        justifyContent="space-between"
        sx={{
          p: 1.5,
          flexWrap: 'wrap',
          rowGap: 1,
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          disabled={busy}
          startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
        >
          Back to Students
        </Button>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ ml: 'auto' }}
        >
          {enrolled || cancelled || !canManage || editor.permissionDenied ? (
            <>
              {enrolled && credentialSelection.selectedCount > 0 && (
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={saving === 'send'}
                  disabled={
                    busy ||
                    editor.loading ||
                    editor.readError ||
                    scopeChanged ||
                    !credentialSelection.canSend
                  }
                  startIcon={<Iconify icon="mdi:email-send-outline" width={18} />}
                  onClick={sendSelectedNow}
                >
                  Send Login Details
                </LoadingButton>
              )}
              {onNext && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={busy}
                  onClick={onNext}
                  endIcon={<Iconify icon="mdi:chevron-right" />}
                >
                  Next Student
                </Button>
              )}
            </>
          ) : (
            <>
              <LoadingButton
                size="small"
                variant="outlined"
                loading={saving === 'later'}
                disabled={busy || editor.loading || editor.readError || scopeChanged || !current}
                onClick={() => save(false)}
              >
                Save for Later
              </LoadingButton>
              <LoadingButton
                size="small"
                variant="contained"
                loading={saving === 'activate'}
                disabled={
                  busy ||
                  editor.loading ||
                  editor.readError ||
                  (credentialSelection.parentSelected &&
                    (parentState.caseId !== student.id || !parentState.loaded)) ||
                  (credentialSelection.selectedCount > 0 && !credentialSelection.canSend) ||
                  scopeChanged ||
                  !current
                }
                startIcon={<Iconify icon="mdi:content-save-check-outline" width={18} />}
                onClick={() => save(true, credentialSelection.selectedCount > 0)}
              >
                {credentialSelection.selectedCount > 0
                  ? 'Save, Activate & Send Login Details'
                  : 'Save & Activate'}
              </LoadingButton>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
