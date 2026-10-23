'use client';

import type { StudentOnboardingServiceHandoffStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Stack,
  Button,
  Skeleton,
  Accordion,
  TextField,
  Typography,
  DialogActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import {
  useCancelStudentOnboardingMutation,
  useSetStudentOnboardingRouteMutation,
  useGetStudentOnboardingServiceHandoffsQuery,
  useRetryStudentOnboardingServiceHandoffMutation,
  useConfirmStudentOnboardingServiceConsentMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { StudentSetupLoadingRows } from './student-setup-loading';
import { useOnboardingSettings } from '../onboarding-settings-context';
import { isAcademicApplicabilityMatch } from '../onboarding-settings-model';
import {
  type StudentOnboardingItem,
  getStudentAcademicPathContext,
} from './student-onboarding-model';

type UserOption = {
  id: string;
  userName?: string;
  name?: string;
  surname?: string;
  email?: string;
};

const handoffStatusMeta: Record<
  StudentOnboardingServiceHandoffStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' | 'warning' }
> = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Dispatched', color: 'info' },
  2: { label: 'Acknowledged', color: 'success' },
  3: { label: 'Failed', color: 'error' },
  4: { label: 'Cancelled', color: 'default' },
};

const handoffLabels: Record<string, string> = {
  'finance-first-payment': 'Fee assignment and first payment',
  'student-account': 'Student portal account',
  'guardian-account': 'Guardian portal account',
  'service-consent': 'Service consent',
};

type StudentOnboardingCaseOperationsProps = {
  student: StudentOnboardingItem;
  canManage: boolean;
  canCancel: boolean;
  onCancelled: () => void;
};

export default function StudentOnboardingCaseOperations({
  student,
  canManage,
  canCancel,
  onCancelled,
}: StudentOnboardingCaseOperationsProps) {
  const isClosed =
    Boolean(student.studentEnrollmentId) ||
    student.backendStatus === 4 ||
    student.backendStatus === 5;
  const { settings } = useOnboardingSettings();
  const [setRoute, routeState] = useSetStudentOnboardingRouteMutation();
  const [route, setRouteDraft] = useState(student.admissionRoute);
  const handoffsQuery = useGetStudentOnboardingServiceHandoffsQuery(student.id, {
    skip: student.source !== 'onboarding-case',
  });
  const [cancelOnboarding, cancelState] = useCancelStudentOnboardingMutation();
  const [retryHandoff, retryState] = useRetryStudentOnboardingServiceHandoffMutation();
  const [confirmConsent, consentState] = useConfirmStudentOnboardingServiceConsentMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentReference, setConsentReference] = useState('');
  const consentEditable =
    canManage &&
    Boolean(student.studentEnrollmentId) &&
    student.backendStatus !== 4 &&
    student.backendStatus !== 5;
  const routeOptions = useMemo(
    () =>
      Array.from(
        new Set([
          'Fresh admission',
          'Transfer student',
          'Mid-year admission',
          'Returning student',
          ...settings.onboardingProfiles
            .filter((profile) =>
              isAcademicApplicabilityMatch(
                profile.applicability,
                getStudentAcademicPathContext(student)
              )
            )
            .flatMap((profile) => profile.admissionRoutes),
          student.admissionRoute,
        ])
      )
        .filter(Boolean)
        .map((name) => ({ label: name, value: name })),
    [settings.onboardingProfiles, student]
  );

  useEffect(() => {
    setRouteDraft(student.admissionRoute);
    setCancelOpen(false);
    setCancellationReason('');
    setConsentOpen(false);
    setConsentReference('');
  }, [student.admissionRoute, student.id]);

  const cancelCase = async () => {
    if (!cancellationReason.trim()) return;

    try {
      await cancelOnboarding({
        id: student.id,
        concurrencyStamp: student.concurrencyStamp,
        reason: cancellationReason.trim(),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Onboarding case cancelled.' });
      setCancelOpen(false);
      onCancelled();
    } catch {
      shikshaMitraToast.error({
        message: 'The onboarding case could not be cancelled. Refresh the case and retry.',
      });
    }
  };

  const saveConsent = async () => {
    const evidenceReference = consentReference.trim();
    if (evidenceReference.length < 3 || evidenceReference.length > 200 || !student.concurrencyStamp)
      return;
    try {
      await confirmConsent({
        id: student.id,
        concurrencyStamp: student.concurrencyStamp,
        evidenceReference,
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Service consent recorded. Onboarding readiness was rechecked.',
      });
      setConsentOpen(false);
      setConsentReference('');
    } catch {
      shikshaMitraToast.error({
        message: 'Service consent could not be recorded. Reload the case and retry.',
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      {!isClosed && (canManage || canCancel) && (
        <Accordion variant="outlined" disableGutters sx={{ order: 2, boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}>
            <Typography variant="subtitle2">Case Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <CustomSelect
                  label="Admission route"
                  size="small"
                  value={route}
                  options={routeOptions}
                  disabled={!canManage || isClosed || routeState.isLoading}
                  onChange={(value) => setRouteDraft(String(value))}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:content-save-outline" />}
                  disabled={
                    !canManage ||
                    isClosed ||
                    routeState.isLoading ||
                    route === student.admissionRoute
                  }
                  onClick={async () => {
                    try {
                      await setRoute({
                        id: student.id,
                        admissionRoute: route,
                        concurrencyStamp: student.concurrencyStamp,
                      }).unwrap();
                      shikshaMitraToast.success({
                        message: 'Admission route saved and readiness rules refreshed.',
                      });
                    } catch {
                      shikshaMitraToast.error({
                        message: 'Admission route could not be saved. Refresh the case and retry.',
                      });
                    }
                  }}
                >
                  Save route
                </Button>
              </Stack>

              {canCancel && !isClosed && (
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mdi:cancel" width={18} />}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel onboarding
                  </Button>
                </Stack>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {handoffsQuery.isError && !handoffsQuery.data ? (
        <StudentFeedback
          notificationKey="STU-0976"
          presentation="toast"
          severity="error"
          sx={{ order: 1 }}
          action={
            <Button size="small" onClick={() => handoffsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Service handoffs could not be loaded.
        </StudentFeedback>
      ) : handoffsQuery.isFetching && !handoffsQuery.data ? (
        <Stack spacing={1} sx={{ order: 1 }}>
          <Skeleton variant="text" width={150} height={24} />
          <StudentSetupLoadingRows label="Loading service handoffs" />
        </Stack>
      ) : handoffsQuery.data?.length ? (
        <Stack spacing={1} sx={{ order: 1 }}>
          <Typography variant="subtitle2">Service Handoffs</Typography>
          {handoffsQuery.data.map((handoff) => {
            const meta = handoffStatusMeta[handoff.status];
            return (
              <Stack
                key={handoff.id}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={1}
                sx={{
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {handoffLabels[handoff.serviceKey] ?? handoff.serviceKey.replaceAll('-', ' ')}
                  </Typography>
                  {(handoff.lastError || handoff.attemptCount > 0) && (
                    <Typography variant="caption" color="text.secondary">
                      {handoff.lastError ||
                        `${handoff.attemptCount} dispatch attempt${handoff.attemptCount === 1 ? '' : 's'}`}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Label color={meta.color}>{meta.label}</Label>
                  {handoff.serviceKey === 'service-consent' &&
                  handoff.status !== 2 &&
                  handoff.status !== 4 &&
                  consentEditable ? (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={consentState.isLoading || !student.concurrencyStamp}
                      onClick={() => setConsentOpen(true)}
                    >
                      Confirm consent
                    </Button>
                  ) : null}
                  {handoff.status === 3 &&
                  canManage &&
                  ['finance-first-payment', 'student-account', 'guardian-account'].includes(
                    handoff.serviceKey
                  ) ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:refresh" width={18} />}
                      disabled={retryState.isLoading}
                      onClick={async () => {
                        try {
                          await retryHandoff({ id: student.id, handoffId: handoff.id }).unwrap();
                          shikshaMitraToast.success({
                            message: 'Service handoff checked. Review its updated status.',
                          });
                        } catch {
                          shikshaMitraToast.error({
                            message: 'The service handoff could not be checked.',
                          });
                        }
                      }}
                    >
                      Recheck
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      ) : null}

      <CustomDialog
        open={consentOpen}
        handleClose={() => {
          if (!consentState.isLoading) setConsentOpen(false);
        }}
        title="Confirm Service Consent"
        maxWidth="sm"
      >
        <DialogScrollContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Use an existing consent record. This does not collect consent.
            </Typography>
            <TextField
              fullWidth
              required
              size="small"
              label="Consent record reference"
              value={consentReference}
              onChange={(event) => setConsentReference(event.target.value)}
              disabled={consentState.isLoading}
              inputProps={{ maxLength: 200 }}
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            color="inherit"
            disabled={consentState.isLoading}
            onClick={() => setConsentOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={consentState.isLoading || consentReference.trim().length < 3}
            onClick={saveConsent}
          >
            {consentState.isLoading ? 'Recording…' : 'Record confirmation'}
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        open={cancelOpen}
        handleClose={() => setCancelOpen(false)}
        title="Cancel Onboarding"
        maxWidth="sm"
      >
        <DialogScrollContent dividers>
          <Stack spacing={1.5}>
            <StudentFeedback
              notificationKey="STU-0979"
              presentation="inline"
              severity="warning"
              variant="outlined"
            >
              Cancelling releases the reserved seat and identifier. The case cannot be activated.
            </StudentFeedback>
            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              label="Cancellation reason"
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              inputProps={{ maxLength: 1000 }}
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button color="inherit" onClick={() => setCancelOpen(false)}>
            Keep case
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!cancellationReason.trim() || cancelState.isLoading}
            onClick={cancelCase}
          >
            {cancelState.isLoading ? 'Cancelling...' : 'Confirm cancellation'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}
