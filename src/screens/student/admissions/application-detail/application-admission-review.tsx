'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionFinalizationResult,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useAdmissionApproval } from './use-admission-approval';
import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionStatus } from './application-decision-status';
import { canPerformAdmissionDecision } from './use-admission-application-decisions';
import { ApplicationFormCorrectionDrawer } from './application-form-correction-drawer';
import { ApplicationFinalizationReadiness } from './application-finalization-readiness';
import { ApplicationApplicantIdentityDialog } from './application-applicant-identity-dialog';
import {
  ApplicationFinalizedActions,
  ApplicationFinalizedSummary,
} from './application-finalized-summary';

export type ApplicationAdmissionReviewProps = {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  disabled?: boolean;
  navigationDisabled?: boolean;
  footerElement?: HTMLElement | null;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onFinalizationOpenChange?: (open: boolean) => void;
  onFinalized?: (result: AdmissionFinalizationResult) => boolean | void;
};

export function ApplicationAdmissionReview({
  application,
  workflow,
  disabled = false,
  navigationDisabled = disabled,
  footerElement,
  onCancel,
  onBusyChange,
  onDirtyChange,
  onFinalizationOpenChange,
  onFinalized,
}: ApplicationAdmissionReviewProps) {
  const [submitting, setSubmitting] = useState(false);
  const [opening, setOpening] = useState<AdmissionFinalizationResult | null>(null);
  const submittingRef = useRef(false);
  const decisions = useAdmissionApproval(application, !submitting && !opening);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [identity, setIdentity] = useState('');
  const [reviewed, setReviewed] = useState<string | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [action, setAction] = useState<'waitlist' | 'reject' | null>(null);
  const preview = decisions.previewQuery.data;
  const reviewable = [1, 4, 5, 6].includes(application.status);
  const loading = decisions.previewQuery.isLoading || decisions.previewQuery.isFetching;
  const hasError = decisions.previewQuery.isError;
  const busy = submitting || decisions.busy || Boolean(opening);
  const selectedIdentity =
    identity ||
    preview?.linkedStudentId ||
    (preview && !preview.possibleMatches.length ? 'new' : '');
  const match = preview?.possibleMatches.find((item) => item.studentId === selectedIdentity);
  const existing = Boolean(selectedIdentity && selectedIdentity !== 'new');
  const direct =
    preview?.linkedStudentId === selectedIdentity
      ? preview?.canApplyProfileFieldsDirectly
      : match?.canApplyProfileFieldsDirectly;
  const canReview =
    (preview?.linkedStudentId === selectedIdentity
      ? preview?.canReviewProfileFields
      : match?.canReviewProfileFields) !== false;
  const blocked =
    !preview?.items.length ||
    preview.items.some((item) => !item.passed && item.key !== 'duplicate_resolution');
  const canSubmit =
    decisions.canManage &&
    [1, 4, 5, 6].includes(application.status) &&
    Boolean(application.concurrencyStamp) &&
    !blocked &&
    Boolean(selectedIdentity) &&
    !loading &&
    !hasError &&
    !disabled &&
    !busy;
  const modalOpen = correctionOpen || repairOpen || Boolean(action);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    onFinalizationOpenChange?.(modalOpen);
  }, [modalOpen, onFinalizationOpenChange]);
  useEffect(() => () => onFinalizationOpenChange?.(false), [onFinalizationOpenChange]);
  useEffect(() => {
    onDirtyChange?.(application.status !== 11 && Boolean(identity || reviewed));
  }, [identity, reviewed, application.status, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const resetReview = () => {
    setIdentity('');
    setReviewed(null);
    decisions.resetRequest();
    decisions.previewQuery.refetch();
  };
  const submit = async () => {
    if (submittingRef.current || !canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await decisions.runApproval({
        existingStudentId: existing ? selectedIdentity : undefined,
        confirmCreateNew: selectedIdentity === 'new',
        applyStudentProfileFields: existing && canReview && reviewed === selectedIdentity,
      });
      if (result) {
        // Keep progress mounted before cache invalidation can render a historical summary.
        setOpening(result);
        try {
          if (!onFinalized?.(result)) setOpening(null);
        } catch {
          // The command succeeded. Keep navigation recovery available without resubmitting.
        }
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const finalized = application.status === 11 && !submitting && !opening;
  const actions = opening ? (
    <Button size="small" variant="contained" color="inherit" onClick={() => onFinalized?.(opening)}>
      Open Student Setup
    </Button>
  ) : finalized ? (
    <ApplicationFinalizedActions
      application={application}
      disabled={navigationDisabled}
      onBack={onCancel}
    />
  ) : (
    <>
      {onCancel && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          onClick={onCancel}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
      )}
      {decisions.canManage && (
        <>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            disabled={
              busy || disabled || !canPerformAdmissionDecision(application.status, 'waitlist')
            }
            startIcon={<Iconify icon="mdi:clock-outline" />}
            onClick={() => setAction('waitlist')}
          >
            Waitlist
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={
              busy || disabled || !canPerformAdmissionDecision(application.status, 'reject')
            }
            startIcon={<Iconify icon="mdi:close-circle-outline" />}
            onClick={() => setAction('reject')}
          >
            Reject
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            color="inherit"
            loading={submitting}
            disabled={!canSubmit}
            startIcon={<Iconify icon="mdi:check-decagram-outline" />}
            onClick={submit}
          >
            Approve &amp; Finalize
          </LoadingButton>
        </>
      )}
    </>
  );
  const footer = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      useFlexGap
      flexWrap="wrap"
      gap={1}
      sx={{ minWidth: 0, width: 1 }}
    >
      {actions}
    </Stack>
  );
  const renderFooter = footerElement ? (
    createPortal(footer, footerElement)
  ) : footerElement === undefined ? (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        p: 1.5,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {footer}
    </Box>
  ) : null;

  if (submitting || opening)
    return (
      <>
        <Stack
          role="status"
          aria-live="polite"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ flex: 1, py: 4 }}
        >
          <CircularProgress size={28} />
          <Typography variant="subtitle1">
            {opening ? 'Opening Student Setup…' : 'Finalizing admission…'}
          </Typography>
        </Stack>
        {renderFooter}
      </>
    );
  if (finalized)
    return (
      <>
        <ApplicationFinalizedSummary
          application={application}
          workflow={workflow}
          history={decisions.historyQuery.currentData}
          historyLoading={decisions.historyQuery.isLoading}
          historyError={decisions.historyQuery.isError}
          onRetryHistory={() => decisions.historyQuery.refetch()}
          hideActions
          navigationDisabled={navigationDisabled}
        />
        {renderFooter}
      </>
    );

  return (
    <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="h6" component="h2">
        Admission Decision
      </Typography>
      {!loading && !hasError && !decisions.error && !blocked && selectedIdentity && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          role="status"
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="mdi:check-circle" width={20} />
          <Typography variant="body2">Ready to approve &amp; finalize</Typography>
        </Stack>
      )}
      {decisions.error && (
        <StudentFeedback
          notificationKey="STU-0195"
          presentation="persistent"
          severity="error"
          action={
            <Button
              size="small"
              color="inherit"
              disabled={busy}
              onClick={async () => {
                try {
                  await decisions.reloadLatest();
                  setIdentity('');
                  setReviewed(null);
                } catch {
                  /* Keep the saved review and failure visible until a reload succeeds. */
                }
              }}
            >
              Reload latest application
            </Button>
          }
        >
          {decisions.error}
        </StudentFeedback>
      )}
      {!decisions.canManage && (
        <StudentFeedback notificationKey="STU-0185" presentation="inline" severity="info">
          Decision actions are not available for your role.
        </StudentFeedback>
      )}
      {decisions.canManage && reviewable && (
        <ApplicationFinalizationReadiness
          compact
          preview={preview}
          loading={loading}
          hasError={Boolean(hasError)}
          disabled={busy || disabled || Boolean(decisions.error)}
          identityChoice={selectedIdentity}
          onIdentityChoice={(value) => {
            setIdentity(value);
            setReviewed(null);
          }}
          onRetry={() => decisions.previewQuery.refetch()}
          onRepairIdentity={
            hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add') &&
            hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View')
              ? () => setRepairOpen(true)
              : undefined
          }
        />
      )}
      {!reviewable && <ApplicationDecisionStatus application={application} compact />}
      <FormSectionCard
        title="Admission Summary"
        icon={GlobalIcons.admissionDetails}
        descriptionTooltip="Review the saved applicant and primary contact before finalizing admission."
        action={
          decisions.canManage && [1, 4, 5, 6].includes(application.status) ? (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy || loading || hasError || Boolean(decisions.error)}
              startIcon={<Iconify icon={GlobalIcons.edit} />}
              onClick={() => setCorrectionOpen(true)}
            >
              Edit details
            </Button>
          ) : undefined
        }
      >
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {[
            ['Student', application.applicantName],
            ['Class', application.standardName],
            ...(preview?.joiningDate ? [['Joining date', fDate(preview.joiningDate)]] : []),
            ...(preview?.primaryContact
              ? [
                  ['Primary contact', preview.primaryContact.name],
                  ['Mobile', preview.primaryContact.mobile],
                  ['Email', preview.primaryContact.email],
                ]
              : []),
          ].map(([label, value]) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                {value || '—'}
              </Typography>
            </Box>
          ))}
        </Box>
        {existing && Boolean(preview?.capturedStudentFields?.length) && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  disabled={busy || loading || !canReview || Boolean(decisions.error)}
                  checked={canReview && reviewed === selectedIdentity}
                  onChange={(_, checked) => setReviewed(checked ? selectedIdentity : null)}
                />
              }
              label={
                direct
                  ? 'Apply reviewed admission details to the student profile'
                  : 'Submit admission details for Student Records review'
              }
            />
            {reviewed === selectedIdentity && (
              <Box component="dl" sx={{ m: 0 }}>
                {preview?.capturedStudentFields?.map((field) => (
                  <Box key={field.key} sx={{ mb: 1 }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body2"
                      sx={{ m: 0, overflowWrap: 'anywhere' }}
                    >
                      {field.key === 'Applicant.ProfilePhoto' ? 'Photo provided' : field.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </FormSectionCard>
      <FormSectionCard
        title="Next in Student Onboarding"
        icon="mdi:account-school-outline"
        descriptionTooltip="Admission finalization opens Student Setup. Placement and identification numbers are completed there."
      >
        <Typography variant="body2" color="text.secondary">
          Division, GR number and roll number are completed in Student Setup.
        </Typography>
      </FormSectionCard>
      {renderFooter}
      <ApplicationDecisionDialog
        key={action ?? 'closed'}
        open={Boolean(action)}
        action={action}
        application={application}
        busy={busy || disabled}
        onClose={() => setAction(null)}
        onReload={decisions.reloadApplication}
        onSubmit={(input) =>
          action ? decisions.runDecision(action, input) : Promise.resolve(false)
        }
      />
      <ApplicationApplicantIdentityDialog
        open={repairOpen}
        applicantId={application.applicantId}
        onClose={() => setRepairOpen(false)}
        onUpdated={resetReview}
      />
      <ApplicationFormCorrectionDrawer
        open={correctionOpen}
        applicationId={application.id}
        onClose={() => setCorrectionOpen(false)}
        onSaved={resetReview}
        onRefresh={resetReview}
      />
    </Stack>
  );
}
