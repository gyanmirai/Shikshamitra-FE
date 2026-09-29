'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useRef, useState, useEffect, type ReactNode } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetStudentOnboardingCaseQuery,
  usePreviewStudentOnboardingActivationQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Box,
  Card,
  Stack,
  Alert,
  Avatar,
  Button,
  Drawer,
  Divider,
  IconButton,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import StudentOnboardingFees from './student-onboarding-fees';
import StudentOnboardingDocuments from './student-onboarding-documents';
import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';
import StudentOnboardingCaseOperations from './student-onboarding-case-operations';
import StudentOnboardingStepWaiverDialog from './student-onboarding-step-waiver-dialog';
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
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'background.neutral',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h3" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}

function KeyValueGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {items.map(([label, value]) => (
        <Box
          key={label}
          sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
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
}: StudentSetupDrawerProps) {
  const lastStudentRef = useRef(student);
  if (student) {
    lastStudentRef.current = student;
  }
  const activeStudent = student || lastStudentRef.current;
  const [showAlert, setShowAlert] = useState(true);
  const [confirmActivation, setConfirmActivation] = useState(false);
  const [waiverCheck, setWaiverCheck] = useState<OnboardingChecklistItem | null>(null);
  const capturedFieldsQuery = useGetStudentOnboardingCaseQuery(activeStudent?.id ?? '', {
    skip: !open || activeStudent?.source !== 'onboarding-case',
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
      setShowAlert(true);
      setConfirmActivation(false);
      setWaiverCheck(null);
    }
  }, [student]);

  if (!activeStudent) return null;

  const status = onboardingStageMeta[activeStudent.status];
  const readiness = getReadinessSummary(activeStudent);
  const canOpenActivation =
    activeStudent.source === 'onboarding-case' &&
    !activeStudent.studentEnrollmentId &&
    (activeStudent.backendStatus === 2 || readiness.blockingCount === 0);
  const primaryAction = activeStudent.studentEnrollmentId && activeStudent.backendStatus !== 4
    ? primaryActions.provisioning : canOpenActivation
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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 'min(760px, 95vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{
          p: { xs: 1.5, sm: 2 },
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{ bgcolor: 'action.selected', color: 'text.secondary', width: 44, height: 44 }}
          >
            {activeStudent.studentName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="subtitle1" fontWeight={700} noWrap>
              {activeStudent.studentName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {activeStudent.applicationNumber} · {activeStudent.standardName} /{' '}
              {activeStudent.divisionName}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Label color={status.color} variant="outlined">
            {status.label}
          </Label>
          <IconButton
            aria-label="Close Student Setup"
            onClick={onClose}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </Stack>

      <Scrollbar sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5}>
          {showAlert ? (
            <Alert
              severity={activeStudent.source === 'student-records' ? 'warning' : 'info'}
              variant="outlined"
              onClose={() => setShowAlert(false)}
            >
              {activeStudent.source === 'preview'
                ? 'Frontend preview data is active. The layout and workflow are ready, but actions are not persisted.'
                : activeStudent.source === 'onboarding-case'
                  ? 'This is a live onboarding case. Readiness refresh and activation actions are persisted and protected by backend permissions.'
                  : 'This compatibility view uses Student Records. Admission readiness, approvals and account state require the Onboarding API.'}
            </Alert>
          ) : null}

          <Card variant="outlined" sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                <Box>
                  <Typography variant="subtitle2">Onboarding readiness</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {readiness.passedCount} of {readiness.requiredCount} required checks passed
                  </Typography>
                </Box>
                <Label color={readiness.blockingCount ? 'warning' : 'success'}>
                  {readiness.blockingCount
                    ? `${readiness.blockingCount} blocker${readiness.blockingCount === 1 ? '' : 's'}`
                    : 'Ready'}
                </Label>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={readiness.progress}
                aria-label={`Student readiness ${readiness.progress} percent`}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          </Card>

          <SectionCard
            icon="mdi:file-check-outline"
            title="Admission handoff"
            description="Read-only admission context handed over from Enrollment."
          >
            <KeyValueGrid
              items={[
                ['Application number', activeStudent.applicationNumber],
                ['Admission reference', displayValue(activeStudent.admissionReference)],
                ['Admission route', activeStudent.admissionRoute],
                ['Admission date', displayValue(activeStudent.admissionDate)],
                ['Owner', activeStudent.ownerName],
                [
                  'Source',
                  activeStudent.source === 'preview'
                    ? 'Frontend preview'
                    : activeStudent.source === 'onboarding-case'
                      ? 'Student Onboarding service'
                      : 'Student Records',
                ],
              ]}
            />
          </SectionCard>

          {activeStudent.source === 'onboarding-case' &&
            Boolean(capturedFieldsQuery.data?.capturedStudentFields?.length) && (
              <SectionCard
                icon="mdi:card-account-details-outline"
                title="Captured admission details"
                description="Answers carried into this Student record. Review them before using them as verified student details."
              >
                <KeyValueGrid
                  items={capturedFieldsQuery.data!.capturedStudentFields!.map((field) => [
                    field.label,
                    field.value,
                  ])}
                />
              </SectionCard>
            )}

          {activeStudent.source === 'onboarding-case' ? (
            <SectionCard
              icon="mdi:account-cog-outline"
              title="Case ownership & operations"
              description="Assign accountability, inspect downstream handoffs, or cancel the case with an audit reason."
            >
              <StudentOnboardingCaseOperations
                student={activeStudent}
                canManage={canManage}
                canCancel={canCancel}
                onCancelled={onClose}
              />
            </SectionCard>
          ) : null}

          {activeStudent.source === 'onboarding-case' && (
            <SectionCard icon="mdi:cash-check" title="Fee assignment & first payment"
              description="Finance confirms the saved assignment and first installment. No manual paid checkbox.">
              <StudentOnboardingFees caseId={activeStudent.id} />
            </SectionCard>
          )}

          {activeStudent.source === 'onboarding-case' && (
            <SectionCard icon="mdi:account-key-outline" title="Portal accounts"
              description="Create and link the required student and guardian identities securely.">
              <StudentOnboardingPortalAccounts key={activeStudent.id} student={activeStudent} canManage={canManage} />
            </SectionCard>
          )}

          <SectionCard
            icon="mdi:account-school-outline"
            title="Placement"
            description="Review the academic placement that will become active after activation."
          >
            <KeyValueGrid
              items={[
                ['Board', activeStudent.boardName],
                ['Medium', activeStudent.mediumName],
                ['Class', activeStudent.standardName],
                ['Division', activeStudent.divisionName],
              ]}
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mdi:google-classroom" width={18} />}
                onClick={onAssignDivision}
                disabled={!canManage || Boolean(activeStudent.studentEnrollmentId)}
              >
                {activeStudent.divisionName && activeStudent.divisionName !== '—'
                  ? 'Change Division'
                  : 'Assign Division'}
              </Button>
            </Stack>
          </SectionCard>

          <SectionCard
            icon="mdi:identifier"
            title="Identifiers"
            description="Review the saved GR and Roll number assignments."
          >
            <KeyValueGrid
              items={[
                ['GR number', displayValue(activeStudent.grNo)],
                ['Roll number', displayValue(activeStudent.rollNo)],
                ['Assignment', activeStudent.grNo ? 'Assigned' : 'Pending activation'],
              ]}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mdi:identifier" width={18} />}
                onClick={onAssignGrNumber}
                disabled={!canManage || Boolean(activeStudent.studentEnrollmentId)}
              >
                {activeStudent.grNo ? 'Change GR No.' : 'Assign GR No.'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mdi:format-list-numbered" width={18} />}
                onClick={onAssignRollNumber}
                disabled={!canManage || Boolean(activeStudent.studentEnrollmentId)}
              >
                {activeStudent.rollNo !== undefined && activeStudent.rollNo !== null
                  ? 'Change Roll No.'
                  : 'Assign Roll No.'}
              </Button>
            </Stack>
          </SectionCard>

          <SectionCard
            icon="mdi:file-document-check-outline"
            title="Documents"
            description="Review accepted admission evidence and Student document uploads."
          >
            {activeStudent.source === 'onboarding-case' ? (
              <StudentOnboardingDocuments
                caseId={activeStudent.id}
                enabled={activeStudent.documentUploadsEnabled !== false}
                canManage={canManage}
              />
            ) : (
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
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
          </SectionCard>

          <SectionCard
            icon="mdi:clipboard-check-outline"
            title="Readiness & activation"
            description="Blocking checks must pass before the activation action becomes available."
          >
            <Stack spacing={1}>
              {activeStudent.readinessItems.filter((check) =>
                !(activeStudent.source === 'onboarding-case' &&
                  check.key === 'finance_accounts_services' && check.status === 'not-required')
              ).map((check) => {
                const meta = onboardingCheckMeta[check.status];
                return (
                  <Stack
                    key={check.key}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    gap={1}
                    sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
                      <Iconify
                        icon={meta.icon}
                        width={18}
                        sx={{ mt: 0.25, color: 'text.secondary' }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {check.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {check.detail} · Owner: {check.owner}
                        </Typography>
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
                      canManage &&
                      check.blocking &&
                      check.status === 'failed' &&
                      check.key !== 'final_readiness' ? (
                        <Button
                          variant="text"
                          color="warning"
                          size="small"
                          aria-label={`Review exception for ${check.label}`}
                          onClick={() => setWaiverCheck(check)}
                        >
                          Review exception
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </SectionCard>

          <SectionCard
            icon="mdi:history"
            title="Activity & audit"
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
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {event.occurredAt}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Stack>
      </Scrollbar>

      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.25, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {activeStudent.source === 'preview'
            ? 'This action is disabled because preview changes are not persisted.'
            : activeStudent.source === 'onboarding-case'
              ? activeStudent.backendStatus === 4
                ? 'Onboarding is complete. Open Student Records for the operational profile.'
                : activeStudent.backendStatus === 5
                  ? 'Cancelled cases are retained for audit and cannot be activated.'
                  : 'The service revalidates concurrency and blockers before saving this action.'
              : 'Connect the Onboarding activation contract to enable this action.'}
        </Typography>
        <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ flexShrink: 0 }}>
          <Button variant="outlined" size="small" onClick={onClose}>
            Close
          </Button>
          {activeStudent.backendStatus !== 4 && activeStudent.backendStatus !== 5 && <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={primaryAction.icon} />}
            disabled={!canRunPrimaryAction || primaryActionLoading}
            onClick={() => {
              if (canOpenActivation) {
                setConfirmActivation(true);
                return;
              }
              onPrimaryAction?.(activeStudent, undefined, 'refresh');
            }}
          >
            {primaryActionLoading ? 'Saving...' : primaryAction.label}
          </Button>}
        </Stack>
      </Stack>

      <CustomDialog
        open={confirmActivation}
        handleClose={() => setConfirmActivation(false)}
        title="Activate student?"
        maxWidth="sm"
      >
        <DialogScrollContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              This will commit the reserved placement and identifiers, create the operational
              enrollment, and start required service handoffs for {activeStudent.studentName}.
            </Typography>
            <Alert severity="warning" variant="outlined">
              Confirm only after reviewing every required readiness step. The backend will reject
              activation if the case changed or a blocker is still active.
            </Alert>
            {activationPreviewQuery.isFetching ? (
              <Stack spacing={0.75}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary">
                  Rechecking placement, identifiers, documents, and readiness…
                </Typography>
              </Stack>
            ) : null}
            {activationPreviewQuery.isError ? (
              <Alert severity="error" variant="outlined">
                The latest activation preview could not be loaded. Close this dialog, refresh the
                case, and retry.
              </Alert>
            ) : null}
            {activationPreview ? (
              <Alert severity={activationPreviewReady ? 'success' : 'error'} variant="outlined">
                {activationPreviewReady
                  ? `Backend readiness confirmed at ${activationPreview.progressPercent}%.`
                  : activationPreview.primaryBlocker ||
                    'This case is no longer ready to activate. Refresh the case before continuing.'}
              </Alert>
            ) : null}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button color="inherit" onClick={() => setConfirmActivation(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
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
            {primaryActionLoading ? 'Activating...' : 'Confirm activation'}
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
