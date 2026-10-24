'use client';

import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Stack, Avatar, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import {
  useActivateStudentOnboardingMutation,
  useLazyGetStudentOnboardingCaseQuery,
  useLazyPreviewStudentOnboardingActivationQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentOnboardingFees from './student-onboarding-fees';
import { mapOnboardingCaseToItem } from './student-onboarding-model';
import { runStudentQuickSetupSave } from './student-quick-setup-save';
import StudentQuickSetupAcademic from './student-quick-setup-academic';
import { useStudentQuickSetupAcademic } from './use-student-quick-setup-academic';
import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';
import StudentOnboardingWorkflowDocuments from './student-onboarding-workflow-documents';

import type { StudentSetupView } from './student-setup-view';
import type { StudentOnboardingItem } from './student-onboarding-model';
import type { StudentParentSiblingActivationState } from './student-parent-sibling-state';
import type {
  StudentOnboardingFeesState,
  StudentOnboardingFeesHandle,
} from './student-onboarding-fees';

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
  const [saving, setSaving] = useState<'later' | 'activate' | null>(null);
  const savingRef = useRef(false);
  const activationKey = useRef<string | null>(null);
  const feesRef = useRef<StudentOnboardingFeesHandle>(null);
  const [feesState, setFeesState] = useState<StudentOnboardingFeesState>({
    dirty: false,
    busy: false,
    loading: true,
    canSave: false,
  });
  const [credentialsBusy, setCredentialsBusy] = useState(false);
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
  const editor = useStudentQuickSetupAcademic({
    caseId: student.id,
    canManage,
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

  const save = async (shouldActivate: boolean) => {
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
      (parentState.caseId !== student.id || !parentState.loaded || parentState.blockedReason)
    ) {
      setParentValidationAttempt((attempt) => attempt + 1);
      shikshaMitraToast.error({
        message:
          parentState.caseId === student.id && parentState.loaded
            ? parentState.blockedReason || 'Review App Login before activating.'
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
              siblingParentSelection: parentState.selection,
            }).unwrap(),
        },
      });
      // Enrollment is durable even if its background refresh or access preparation fails.
      if (result.studentEnrollmentId) setActivatedCase(result);
      shikshaMitraToast.success({
        message: result.studentEnrollmentId ? 'Student activated.' : 'Student setup saved.',
      });
    } catch (error) {
      const { detail } = parseApiProblemDetail(error);
      setFailure(
        detail ||
          (error instanceof Error
            ? error.message
            : 'Setup could not be completed. Review the highlighted fields and retry.')
      );
      // Reconcile persisted progress after a lost response; never reallocate a saved number.
      const recovered = await getCase(student.id, false)
        .unwrap()
        .catch(() => undefined);
      if (recovered?.studentEnrollmentId) {
        setActivatedCase(recovered);
        setFailureSeverity('info');
        setFailure('The student is active. Review any remaining App Login work below.');
      }
      bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
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
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Avatar sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>
          {editor.permissionDenied ? '—' : activeStudent.studentName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            ref={titleRef}
            tabIndex={-1}
            id="student-quick-setup-title"
            component="h2"
            variant="subtitle1"
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
            sx={{ minWidth: 0, flexShrink: 0, maxWidth: { xs: '50%', sm: 'none' } }}
          >
            <Label color={status.color}>{status.label}</Label>
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
              presentation="persistent"
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
                  presentation="persistent"
                  severity="warning"
                >
                  The academic year changed. Close this student and reopen it in the correct year.
                </StudentFeedback>
              )}
              {failure && (
                <StudentFeedback
                  notificationKey="STU-1036"
                  presentation="persistent"
                  severity={failureSeverity}
                  role="alert"
                >
                  {failure}
                </StudentFeedback>
              )}
              {saving && (
                <LinearProgress
                  aria-label={
                    saving === 'activate' ? 'Saving and activating student' : 'Saving student setup'
                  }
                />
              )}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    md: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                  },
                  gap: 1.5,
                  alignItems: 'stretch',
                }}
              >
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
                  <StudentQuickSetupAcademic editor={editor} />
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
                  <FormSectionCard
                    title="App Login"
                    icon="mdi:account-key-outline"
                    contentSpacing={1}
                    sx={{ flex: 1 }}
                  >
                    <StudentOnboardingPortalAccounts
                      student={activeStudent}
                      canManage={canManage && !scopeChanged}
                      onBusyChange={setCredentialsBusy}
                      onParentStateChange={setParentState}
                      parentValidationAttempt={parentValidationAttempt}
                    />
                  </FormSectionCard>
                </Box>
              </Box>
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
                <FormSectionCard title="Fees" icon="mdi:receipt-text-outline" contentSpacing={1}>
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
                </FormSectionCard>
              </Box>
              <FormSectionCard
                title="Admission & Documents"
                icon="mdi:file-document-check-outline"
                contentSpacing={1}
              >
                <Box
                  component="fieldset"
                  disabled={busy || editor.readError}
                  inert={busy || editor.readError}
                  sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
                >
                  {!current ? (
                    <Skeleton
                      width={240}
                      height={24}
                      sx={{ mb: 1.5 }}
                      aria-label="Loading admission details"
                    />
                  ) : (
                    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Admission:{' '}
                        <Box component="span" sx={{ color: 'text.primary' }}>
                          {current?.admissionConfirmed === true
                            ? 'Approved'
                            : current?.admissionConfirmed === false
                              ? 'Pending'
                              : 'Not available'}
                        </Box>
                      </Typography>
                    </Stack>
                  )}
                  <StudentOnboardingWorkflowDocuments
                    caseId={student.id}
                    canManage={canManage && !scopeChanged}
                    hasDocumentRequirementsSnapshot={current?.hasDocumentRequirementsSnapshot}
                    presentation="workspace"
                  />
                </Box>
              </FormSectionCard>
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
                  feesState.loading ||
                  parentState.caseId !== student.id ||
                  !parentState.loaded ||
                  scopeChanged ||
                  !current
                }
                startIcon={<Iconify icon="mdi:content-save-check-outline" width={18} />}
                onClick={() => save(true)}
              >
                Save & Activate
              </LoadingButton>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
