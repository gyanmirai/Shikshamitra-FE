'use client';

import Link from 'next/link';
import { LoadingButton } from '@mui/lab';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { FormSectionCard } from 'src/components/form-section-card';
import { useRef, useState, useEffect, type ReactNode } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetStudentOnboardingCaseQuery,
  usePreviewStudentOnboardingActivationQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Box,
  Tab,
  Stack,
  Alert,
  Avatar,
  Button,
  Drawer,
  Divider,
  Accordion,
  IconButton,
  Typography,
  DialogActions,
  LinearProgress,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import StudentOnboardingFees from './student-onboarding-fees';
import { StudentSetupLoadingFields } from './student-setup-loading';
import { hasAssignedDivision, type StudentSetupView } from './student-setup-view';
import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';
import StudentOnboardingCaseOperations from './student-onboarding-case-operations';
import StudentOnboardingStepWaiverDialog from './student-onboarding-step-waiver-dialog';
import StudentOnboardingWorkflowDocuments from './student-onboarding-workflow-documents';
import {
  onboardingCheckMeta,
  onboardingStageMeta,
  getReadinessSummary,
} from './student-onboarding-model';

import type { StudentOnboardingItem, OnboardingChecklistItem } from './student-onboarding-model';

type StudentSetupDrawerProps = {
  open: boolean;
  student: StudentOnboardingItem | null;
  onClose: () => void;
  onAssignDivision?: () => void;
  onAssignGrNumber?: () => void;
  onAssignRollNumber?: () => void;
  onPrimaryAction?: (
    student: StudentOnboardingItem,
    concurrencyStamp?: string,
    action?: 'refresh' | 'activate'
  ) => void | Promise<void>;
  primaryActionLoading?: boolean;
  canManage?: boolean;
  canCancel?: boolean;
  taskView?: StudentSetupView;
};

const displayValue = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '—' : value;

const primaryActions = {
  'to-prepare': { label: 'Refresh Readiness', icon: 'mdi:clipboard-check-outline' },
  'awaiting-approval': { label: 'Refresh Readiness', icon: 'mdi:refresh' },
  'ready-to-activate': { label: 'Activate Student', icon: 'mdi:account-arrow-right-outline' },
  'action-required': { label: 'Refresh Readiness', icon: 'mdi:refresh' },
  provisioning: { label: 'Check completion', icon: 'mdi:clipboard-check-outline' },
  completed: { label: 'Completed', icon: 'mdi:check-decagram-outline' },
  cancelled: { label: 'Cancelled', icon: 'mdi:cancel' },
} as const;

const DRAWER_TABS = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'details', label: 'Details & Checks' },
  { value: 'history', label: 'History' },
] as const;

type DrawerView = (typeof DRAWER_TABS)[number]['value'];

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <FormSectionCard
      icon={icon}
      title={title}
      titleTypographyProps={{ component: 'h3' }}
      descriptionTooltip={description}
    >
      {children}
    </FormSectionCard>
  );
}

function KeyValueGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <Box
      component="dl"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        columnGap: 2,
        rowGap: 0.5,
        m: 0,
      }}
    >
      {items.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            minWidth: 0,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" component="dt">
            {label}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            component="dd"
            sx={{ m: 0, mt: 0.25, overflowWrap: 'anywhere' }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function StudentSetupDrawer({
  open,
  student,
  onClose,
  onAssignDivision,
  onAssignGrNumber,
  onAssignRollNumber,
  onPrimaryAction,
  primaryActionLoading = false,
  canManage = false,
  canCancel = false,
  taskView = 'readiness',
}: StudentSetupDrawerProps) {
  const lastStudentRef = useRef(student);
  const scrollRef = useRef<HTMLDivElement>(null);
  if (student) {
    lastStudentRef.current = student;
  }
  const activeStudent = student || lastStudentRef.current;
  const [confirmActivation, setConfirmActivation] = useState(false);
  const [waiverCheck, setWaiverCheck] = useState<OnboardingChecklistItem | null>(null);
  const [showPassedChecks, setShowPassedChecks] = useState(false);
  const [credentialsBusy, setCredentialsBusy] = useState(false);
  const drawerBusy = primaryActionLoading || credentialsBusy;
  const defaultView: DrawerView =
    student?.source === 'onboarding-case' &&
    student.backendStatus !== 4 &&
    student.backendStatus !== 5
      ? 'tasks'
      : 'details';
  const { value: view, setValue: setView, onChange: onViewChange } = useTabs(defaultView);
  const capturedFieldsQuery = useGetStudentOnboardingCaseQuery(activeStudent?.id ?? '', {
    skip: !open || taskView === 'credentials' || activeStudent?.source !== 'onboarding-case',
  });
  const activationPreviewQuery = usePreviewStudentOnboardingActivationQuery(
    activeStudent?.id ?? '',
    {
      skip:
        !confirmActivation ||
        !activeStudent ||
        activeStudent.source !== 'onboarding-case' ||
        activeStudent.backendStatus === 4 ||
        activeStudent.backendStatus === 5,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (student) {
      setConfirmActivation(false);
      setWaiverCheck(null);
      setShowPassedChecks(false);
    }
  }, [student]);

  useEffect(() => {
    setView(defaultView);
  }, [student?.id, defaultView, open, setView]);

  useEffect(() => {
    if (view === 'history' && !activeStudent?.activity.length) setView('details');
  }, [view, activeStudent?.activity.length, setView]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [view]);

  if (!activeStudent) return null;

  const status = onboardingStageMeta[activeStudent.status];
  const readiness = getReadinessSummary(activeStudent);
  const canOpenActivation =
    activeStudent.source === 'onboarding-case' &&
    !activeStudent.studentEnrollmentId &&
    (activeStudent.backendStatus === 2 || readiness.blockingCount === 0);
  const primaryAction =
    activeStudent.studentEnrollmentId && activeStudent.backendStatus !== 4
      ? primaryActions.provisioning
      : canOpenActivation
        ? { label: 'Activate Student', icon: 'mdi:account-arrow-right-outline' }
        : primaryActions[activeStudent.status];
  const activationPreview = activationPreviewQuery.data;
  const activationPreviewReady = activationPreview?.status === 2;
  const canRunPrimaryAction =
    activeStudent.source === 'onboarding-case' &&
    activeStudent.backendStatus !== 4 &&
    activeStudent.backendStatus !== 5 &&
    canManage &&
    Boolean(onPrimaryAction);
  const firstBlocker = activeStudent.readinessItems.find(
    (check) => check.blocking && check.status !== 'passed'
  );
  const readinessChecks = activeStudent.readinessItems.filter(
    (check) => check.status !== 'not-required'
  );
  const passedChecks = readinessChecks.filter((check) => check.status === 'passed');
  const checksNeedingAttention = readinessChecks.filter((check) => check.status !== 'passed');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={drawerBusy ? undefined : onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      PaperProps={{
        'aria-labelledby': 'student-setup-drawer-title',
        sx: {
          width: { xs: '100%', sm: 'min(800px, 96vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 0.5, sm: 2 }}
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Avatar
            sx={{ bgcolor: 'action.selected', color: 'text.secondary', width: 44, height: 44 }}
          >
            {activeStudent.studentName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="student-setup-drawer-title"
              component="h2"
              variant="subtitle1"
              fontWeight={700}
              noWrap
            >
              {activeStudent.studentName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {activeStudent.applicationNumber} · {activeStudent.standardName} /{' '}
              {activeStudent.divisionName}
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}
        >
          <Label color={status.color} variant="outlined">
            {status.label}
          </Label>
          <CustomTooltip
            title={
              activeStudent.source === 'onboarding-case'
                ? 'This live case saves readiness and activation changes to the onboarding service. Actions require the appropriate permission.'
                : 'This Student Records view cannot change admission readiness, approvals, or account state.'
            }
            arrow
          >
            <IconButton size="small" aria-label="Student onboarding case information">
              <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} />
            </IconButton>
          </CustomTooltip>
          <IconButton
            aria-label="Close Student Setup"
            onClick={onClose}
            disabled={drawerBusy}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </Stack>

      {taskView === 'readiness' && (
        <CustomTabs
          value={view}
          onChange={onViewChange}
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Student onboarding case sections"
          sx={{ px: { xs: 0.5, sm: 1 }, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {DRAWER_TABS.filter(
            (tab) =>
              (tab.value !== 'tasks' || activeStudent.source === 'onboarding-case') &&
              (tab.value !== 'history' || activeStudent.activity.length > 0)
          ).map((tab) => (
            <Tab
              key={tab.value}
              id={`student-case-${tab.value}-tab`}
              aria-controls={`student-case-${tab.value}-panel`}
              value={tab.value}
              label={tab.label}
              disabled={drawerBusy}
            />
          ))}
        </CustomTabs>
      )}

      <Scrollbar
        ref={scrollRef}
        sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, minHeight: 0, bgcolor: 'background.neutral' }}
      >
        {taskView !== 'readiness' ? (
          <Stack spacing={1.5}>
            {taskView === 'fees' ? (
              <SectionCard
                icon="mdi:receipt-text-outline"
                title="Fee structure"
                description="Confirm the existing published structure required for activation."
              >
                <StudentOnboardingFees caseId={activeStudent.id} canManage={canManage} />
              </SectionCard>
            ) : taskView === 'credentials' ? (
              <SectionCard
                icon="mdi:account-key-outline"
                title="Credentials"
                description="Create or link app access and send login details after activation."
              >
                <StudentOnboardingPortalAccounts
                  key={activeStudent.id}
                  student={activeStudent}
                  canManage={canManage}
                  onBusyChange={setCredentialsBusy}
                />
              </SectionCard>
            ) : (
              <SectionCard
                icon={
                  taskView === 'gr-number'
                    ? 'mdi:identifier'
                    : taskView === 'roll-number'
                      ? 'mdi:format-list-numbered'
                      : 'mdi:google-classroom'
                }
                title={
                  taskView === 'gr-number'
                    ? 'GR number'
                    : taskView === 'roll-number'
                      ? 'Roll number'
                      : 'Division'
                }
                description="Review and complete this student's selected assignment task."
              >
                {activeStudent.studentEnrollmentId && (
                  <Alert
                    severity="info"
                    action={
                      <Button size="small" component={Link} href={studentPaths.records.directory}>
                        Open Student Records
                      </Button>
                    }
                  >
                    This student is active. Review identifier corrections in Student Records.
                  </Alert>
                )}
                <KeyValueGrid
                  items={[
                    [
                      taskView === 'gr-number'
                        ? 'GR number'
                        : taskView === 'roll-number'
                          ? 'Roll number'
                          : 'Division',
                      displayValue(
                        taskView === 'gr-number'
                          ? activeStudent.grNo
                          : taskView === 'roll-number'
                            ? activeStudent.rollNo
                            : activeStudent.divisionName
                      ),
                    ],
                  ]}
                />
                <Button
                  size="small"
                  variant="contained"
                  disabled={
                    !canManage ||
                    Boolean(activeStudent.studentEnrollmentId) ||
                    activeStudent.backendStatus === 5 ||
                    (taskView === 'gr-number'
                      ? Boolean(activeStudent.grNumberLocked && activeStudent.grNo)
                      : taskView === 'roll-number'
                        ? Boolean(activeStudent.rollNumberLocked && activeStudent.rollNo)
                        : false)
                  }
                  onClick={
                    taskView === 'gr-number'
                      ? onAssignGrNumber
                      : taskView === 'roll-number'
                        ? onAssignRollNumber
                        : onAssignDivision
                  }
                  sx={{ alignSelf: 'flex-end' }}
                >
                  {taskView === 'gr-number'
                    ? 'Assign / Change GR'
                    : taskView === 'roll-number'
                      ? 'Assign / Change Roll'
                      : 'Assign / Change Division'}
                </Button>
              </SectionCard>
            )}
          </Stack>
        ) : (
          <>
            <Box
              id="student-case-tasks-panel"
              role="tabpanel"
              aria-labelledby="student-case-tasks-tab"
              hidden={view !== 'tasks'}
              sx={{ display: view === 'tasks' ? 'block' : 'none' }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                  gap={1}
                  sx={{ px: 0.5 }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {firstBlocker
                        ? `Next: ${firstBlocker.label}`
                        : activeStudent.status === 'action-required'
                          ? 'Complete service handoffs'
                          : canOpenActivation
                            ? 'Ready to activate'
                            : activeStudent.studentEnrollmentId
                              ? 'Complete enrollment handoffs'
                              : 'No open tasks'}
                    </Typography>
                    {firstBlocker && (
                      <Typography variant="caption" color="text.secondary">
                        {firstBlocker.detail}
                      </Typography>
                    )}
                  </Box>
                  {readiness.requiredCount > 0 && (
                    <Button
                      size="small"
                      variant="text"
                      disabled={primaryActionLoading}
                      onClick={() => setView('details')}
                    >
                      {readiness.passedCount} of {readiness.requiredCount} checks passed
                    </Button>
                  )}
                </Stack>

                {activeStudent.source === 'onboarding-case' &&
                activeStudent.backendStatus !== 4 &&
                activeStudent.backendStatus !== 5 ? (
                  <SectionCard
                    icon="mdi:account-cog-outline"
                    title="Case Actions"
                    description="Review service handoffs and, while the case is open, update its route or owner."
                  >
                    <StudentOnboardingCaseOperations
                      student={activeStudent}
                      canManage={canManage}
                      canCancel={canCancel}
                      onCancelled={onClose}
                    />
                  </SectionCard>
                ) : null}

                {view === 'tasks' && activeStudent.source === 'onboarding-case' && (
                  <SectionCard
                    icon="mdi:file-document-check-outline"
                    title="Required documents"
                    description="Complete the Offering's required evidence before activation."
                  >
                    <StudentOnboardingWorkflowDocuments
                      caseId={activeStudent.id}
                      canManage={canManage}
                      hasDocumentRequirementsSnapshot={
                        capturedFieldsQuery.data?.hasDocumentRequirementsSnapshot ??
                        activeStudent.hasDocumentRequirementsSnapshot
                      }
                    />
                  </SectionCard>
                )}
                {activeStudent.source === 'onboarding-case' && (
                  <SectionCard
                    icon="mdi:receipt-text-outline"
                    title="Fee structure"
                    description="Confirm the existing published fee structure required for activation."
                  >
                    <StudentOnboardingFees caseId={activeStudent.id} canManage={canManage} />
                  </SectionCard>
                )}

                {activeStudent.source === 'onboarding-case' &&
                  activeStudent.studentEnrollmentId && (
                    <Accordion
                      variant="outlined"
                      disableGutters
                      sx={{ borderRadius: 2, boxShadow: 'none', '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon="mdi:account-key-outline"
                            width={20}
                            sx={{ color: 'text.secondary' }}
                          />
                          <Typography variant="subtitle2">Portal & Emails</Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <StudentOnboardingPortalAccounts
                          key={activeStudent.id}
                          student={activeStudent}
                          canManage={canManage}
                          onBusyChange={setCredentialsBusy}
                        />
                      </AccordionDetails>
                    </Accordion>
                  )}
              </Stack>
            </Box>

            <Box
              id="student-case-details-panel"
              role="tabpanel"
              aria-labelledby="student-case-details-tab"
              hidden={view !== 'details'}
              sx={{ display: view === 'details' ? 'block' : 'none' }}
            >
              <Stack spacing={1.5}>
                <SectionCard
                  icon="mdi:file-check-outline"
                  title="Admission"
                  description="Admission details supplied by Enrollment and captured from the application."
                >
                  <KeyValueGrid
                    items={[
                      ['Admission reference', displayValue(activeStudent.admissionReference)],
                      ['Admission route', activeStudent.admissionRoute],
                      [
                        'Admission date',
                        activeStudent.admissionDate ? fDateTime(activeStudent.admissionDate) : '—',
                      ],
                      ['Owner', activeStudent.ownerName],
                      ...(activeStudent.source === 'onboarding-case'
                        ? (capturedFieldsQuery.data?.capturedStudentFields ?? []).map(
                            (field): [string, ReactNode] => [field.label, field.value]
                          )
                        : []),
                    ]}
                  />
                  {activeStudent.source === 'onboarding-case' &&
                    capturedFieldsQuery.isFetching &&
                    !capturedFieldsQuery.isError &&
                    !capturedFieldsQuery.data && (
                      <StudentSetupLoadingFields label="Loading additional admission details" />
                    )}
                  {activeStudent.source === 'onboarding-case' &&
                    capturedFieldsQuery.isError &&
                    !capturedFieldsQuery.data && (
                      <Alert
                        severity="error"
                        action={
                          <Button size="small" onClick={() => capturedFieldsQuery.refetch()}>
                            Retry
                          </Button>
                        }
                      >
                        Additional admission details could not be loaded.
                      </Alert>
                    )}
                </SectionCard>

                <SectionCard
                  icon="mdi:account-school-outline"
                  title="Placement & Identifiers"
                  description="Academic placement and assigned GR and roll numbers."
                >
                  <KeyValueGrid
                    items={[
                      ['Board', activeStudent.boardName],
                      ['Medium', activeStudent.mediumName],
                      ['Class', activeStudent.standardName],
                      ['Division', activeStudent.divisionName],
                      ['GR number', displayValue(activeStudent.grNo)],
                      ['Roll number', displayValue(activeStudent.rollNo)],
                    ]}
                  />
                  {canManage && !activeStudent.studentEnrollmentId && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="flex-end"
                      spacing={1}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Iconify icon="mdi:google-classroom" width={18} />}
                        onClick={onAssignDivision}
                        disabled={primaryActionLoading}
                      >
                        {hasAssignedDivision(activeStudent) ? 'Change Division' : 'Assign Division'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Iconify icon="mdi:identifier" width={18} />}
                        onClick={onAssignGrNumber}
                        disabled={primaryActionLoading}
                      >
                        {activeStudent.grNo ? 'Change GR No.' : 'Assign GR No.'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Iconify icon="mdi:format-list-numbered" width={18} />}
                        onClick={onAssignRollNumber}
                        disabled={primaryActionLoading}
                      >
                        {activeStudent.rollNo !== undefined && activeStudent.rollNo !== null
                          ? 'Change Roll No.'
                          : 'Assign Roll No.'}
                      </Button>
                    </Stack>
                  )}
                </SectionCard>

                <Accordion
                  key={`documents-${activeStudent.id}`}
                  variant="outlined"
                  disableGutters
                  defaultExpanded={Boolean(activeStudent.documentsRequired)}
                  sx={{ borderRadius: 2, boxShadow: 'none', '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1, pr: 1 }}>
                      <Iconify
                        icon="mdi:file-document-check-outline"
                        width={20}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography component="span" variant="subtitle2" sx={{ flex: 1 }}>
                        Documents
                      </Typography>
                      {!activeStudent.documentsRequired && (
                        <Label color="default">None required</Label>
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {activeStudent.source === 'onboarding-case' ? (
                      view === 'details' ? (
                        <StudentOnboardingWorkflowDocuments
                          caseId={activeStudent.id}
                          canManage={canManage}
                          hasDocumentRequirementsSnapshot={
                            capturedFieldsQuery.data?.hasDocumentRequirementsSnapshot ??
                            activeStudent.hasDocumentRequirementsSnapshot
                          }
                        />
                      ) : null
                    ) : (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {activeStudent.documentsRequired
                              ? `${activeStudent.documentsPassed} of ${activeStudent.documentsRequired} verified`
                              : 'Document summary unavailable'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Corrections and uploads require a live onboarding case.
                          </Typography>
                        </Box>
                        <Label
                          color={
                            activeStudent.documentsRequired &&
                            activeStudent.documentsPassed === activeStudent.documentsRequired
                              ? 'success'
                              : activeStudent.documentsRequired
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {activeStudent.documentsRequired &&
                          activeStudent.documentsPassed === activeStudent.documentsRequired
                            ? 'Verified'
                            : activeStudent.documentsRequired
                              ? 'Pending'
                              : 'Not connected'}
                        </Label>
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
                <SectionCard
                  icon="mdi:clipboard-check-outline"
                  title="Readiness & Activation"
                  description="Blocking checks must pass before the activation action becomes available."
                >
                  <Stack spacing={1}>
                    {checksNeedingAttention.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No readiness checks need attention.
                      </Typography>
                    )}
                    {[...checksNeedingAttention, ...(showPassedChecks ? passedChecks : [])].map(
                      (check) => {
                        const meta = onboardingCheckMeta[check.status];
                        return (
                          <Stack
                            key={check.key}
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ sm: 'center' }}
                            gap={1}
                            sx={{
                              py: 1.25,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 0 },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                              sx={{ minWidth: 0 }}
                            >
                              <Iconify
                                icon={meta.icon}
                                width={18}
                                sx={{ mt: 0.25, color: 'text.secondary' }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {check.label}
                                </Typography>
                                {(check.detail || (check.status !== 'passed' && check.owner)) && (
                                  <Typography variant="caption" color="text.secondary">
                                    {check.detail}
                                    {check.status !== 'passed' && check.owner
                                      ? `${check.detail ? ' · ' : ''}Owner: ${check.owner}`
                                      : ''}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            <Stack
                              direction={{ xs: 'row', sm: 'column' }}
                              alignItems={{ xs: 'center', sm: 'flex-end' }}
                              spacing={0.5}
                              sx={{ flexShrink: 0 }}
                            >
                              <Label color={meta.color}>{meta.label}</Label>
                              {activeStudent.source === 'onboarding-case' &&
                              activeStudent.studentId &&
                              canManage &&
                              check.key === 'communication' &&
                              check.status === 'failed' ? (
                                <Button
                                  component={Link}
                                  href={`/student/profile?student=${encodeURIComponent(activeStudent.studentId)}&tab=general`}
                                  variant="text"
                                  size="small"
                                  disabled={primaryActionLoading}
                                >
                                  Open student record
                                </Button>
                              ) : activeStudent.source === 'onboarding-case' &&
                                canManage &&
                                check.key === 'approval_review' &&
                                check.status === 'pending' ? (
                                <Button
                                  variant="text"
                                  color="primary"
                                  size="small"
                                  aria-label={`Record approval for ${check.label}`}
                                  disabled={primaryActionLoading}
                                  onClick={() => setWaiverCheck(check)}
                                >
                                  Record approval
                                </Button>
                              ) : activeStudent.source === 'onboarding-case' &&
                                canManage &&
                                check.blocking &&
                                check.status === 'failed' &&
                                check.key !== 'final_readiness' ? (
                                <Button
                                  variant="text"
                                  color="warning"
                                  size="small"
                                  aria-label={`Review exception for ${check.label}`}
                                  disabled={primaryActionLoading}
                                  onClick={() => setWaiverCheck(check)}
                                >
                                  Review exception
                                </Button>
                              ) : null}
                            </Stack>
                          </Stack>
                        );
                      }
                    )}
                    {passedChecks.length > 0 && (
                      <Button
                        variant="text"
                        size="small"
                        disabled={primaryActionLoading}
                        onClick={() => setShowPassedChecks((current) => !current)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {showPassedChecks ? 'Hide' : 'Show'} {passedChecks.length} passed check
                        {passedChecks.length === 1 ? '' : 's'}
                      </Button>
                    )}
                  </Stack>
                </SectionCard>
              </Stack>
            </Box>

            <Box
              id="student-case-history-panel"
              role="tabpanel"
              aria-labelledby="student-case-history-tab"
              hidden={view !== 'history'}
              sx={{ display: view === 'history' ? 'block' : 'none' }}
            >
              <Stack spacing={1.5}>
                {activeStudent.activity.length > 0 && (
                  <SectionCard
                    icon="mdi:history"
                    title="Activity & Audit"
                    description="A chronological record of preparation, approval and activation events."
                  >
                    <Stack spacing={1}>
                      {activeStudent.activity.map((event) => (
                        <Stack key={event.id} direction="row" spacing={1} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              mt: 0.75,
                              borderRadius: '50%',
                              bgcolor: 'text.disabled',
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {event.detail}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ flexShrink: 0 }}
                          >
                            {event.occurredAt}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </SectionCard>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Scrollbar>

      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        {activeStudent.source !== 'onboarding-case' && (
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            This record has no onboarding case, so activation is unavailable.
          </Typography>
        )}
        <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ flexShrink: 0, ml: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="basil:cross-solid" width={18} />}
            onClick={onClose}
            disabled={drawerBusy}
          >
            Close
          </Button>
          {taskView === 'readiness' &&
            activeStudent.backendStatus !== 4 &&
            activeStudent.backendStatus !== 5 && (
              <LoadingButton
                variant="contained"
                size="small"
                startIcon={<Iconify icon={primaryAction.icon} width={18} />}
                loading={primaryActionLoading}
                disabled={credentialsBusy || !canRunPrimaryAction}
                onClick={() => {
                  if (canOpenActivation) {
                    setConfirmActivation(true);
                    return;
                  }
                  onPrimaryAction?.(activeStudent, undefined, 'refresh');
                }}
              >
                {primaryAction.label}
              </LoadingButton>
            )}
        </Stack>
      </Stack>

      <CustomDialog
        open={confirmActivation}
        handleClose={() => setConfirmActivation(false)}
        title="Activate Student"
        maxWidth="sm"
      >
        <DialogScrollContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Activation commits placement and identifiers and creates enrollment for{' '}
              {activeStudent.studentName}.
            </Typography>
            {activationPreviewQuery.isFetching ? (
              <LinearProgress aria-label="Checking activation readiness" />
            ) : null}
            {activationPreviewQuery.isError ? (
              <Alert severity="error" variant="outlined">
                The latest activation preview could not be loaded. Close this dialog, refresh the
                case, and retry.
              </Alert>
            ) : null}
            {activationPreview && !activationPreviewReady ? (
              <Alert severity="error" variant="outlined">
                {activationPreview.primaryBlocker ||
                  'This case is no longer ready to activate. Refresh the case before continuing.'}
              </Alert>
            ) : null}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" width={16} />}
            onClick={() => setConfirmActivation(false)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:check" width={16} />}
            disabled={
              primaryActionLoading ||
              activationPreviewQuery.isFetching ||
              activationPreviewQuery.isError ||
              !activationPreviewReady
            }
            onClick={async () => {
              await onPrimaryAction?.(
                activeStudent,
                activationPreview?.concurrencyStamp,
                'activate'
              );
              setConfirmActivation(false);
            }}
          >
            {primaryActionLoading ? 'Activating...' : 'Activate student'}
          </Button>
        </DialogActions>
      </CustomDialog>

      {waiverCheck ? (
        <StudentOnboardingStepWaiverDialog
          check={waiverCheck}
          student={activeStudent}
          onClose={() => setWaiverCheck(null)}
        />
      ) : null}
    </Drawer>
  );
}
