'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionFinalizationPreview,
} from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomAccordion from 'src/components/custom-accordian';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  Divider,
  Checkbox,
  IconButton,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { ApplicationFinalizationReadiness } from './application-finalization-readiness';
import { ApplicationApplicantIdentityDialog } from './application-applicant-identity-dialog';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

type SubmitValue = {
  existingStudentId?: string;
  confirmCreateNew: boolean;
  confirmGuardianContactVerified: boolean;
  applyStudentProfileFields?: boolean;
};
type Props = {
  open: boolean;
  presentation?: 'dialog' | 'inline';
  applicantId: string;
  application?: Pick<
    AdmissionApplication,
    'applicantName' | 'applicationNumber' | 'offeringCode' | 'status'
  >;
  busy: boolean;
  preview?: AdmissionFinalizationPreview;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onClose: () => void;
  onSubmit: (value: SubmitValue) => Promise<boolean>;
};
type OpenProps = Omit<Props, 'open'>;

const FINALIZATION_INFO =
  'This closes Admissions and creates or links one Student identity and an Onboarding case. It does not assign a class division, seat, GR number, roll number, fees, or login account. Placement and enrollment are completed in Student Onboarding.';

function FinalizationSurface({
  presentation,
  busy,
  hidden,
  onClose,
  children,
}: {
  presentation: 'dialog' | 'inline';
  busy: boolean;
  hidden: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (presentation === 'inline' && !hidden) headingRef.current?.focus();
  }, [presentation, hidden]);
  if (presentation === 'inline')
    return hidden ? null : (
      <Stack sx={{ minWidth: 0 }}>
        <Stack spacing={0.5} sx={{ px: 1.5, pt: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h6" component="h2" ref={headingRef} tabIndex={-1}>
              Finalize admission
            </Typography>
            <CustomTooltip title={FINALIZATION_INFO} arrow>
              <IconButton
                size="small"
                aria-label="Finalize admission information"
                sx={{ color: 'info.main' }}
              >
                <Iconify icon="mdi:information-outline" width={18} />
              </IconButton>
            </CustomTooltip>
          </Stack>
        </Stack>
        {children}
      </Stack>
    );
  return (
    <CustomDialog
      open={!hidden}
      handleClose={onClose}
      disableClose={busy}
      title="Finalize Admission"
      titleInfo={FINALIZATION_INFO}
      maxWidth="md"
      hasForm={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      {children}
    </CustomDialog>
  );
}

export function ApplicationFinalizationDialog({ open, ...props }: Props) {
  if (!open) return null;
  return <OpenApplicationFinalizationDialog {...props} />;
}

function OpenApplicationFinalizationDialog({
  presentation = 'dialog',
  applicantId,
  application,
  busy: externalBusy,
  preview,
  loading,
  hasError,
  onRetry,
  onClose,
  onSubmit,
}: OpenProps) {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const busy = externalBusy || submitting;
  const [identityChoice, setIdentityChoice] = useState('');
  const [guardianVerified, setGuardianVerified] = useState(false);
  const [reviewedIdentity, setReviewedIdentity] = useState<string | null>(null);
  const [repairOpen, setRepairOpen] = useState(false);
  const profileRules = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRepairIdentity =
    hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View') &&
    hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add');
  const selectedIdentity =
    identityChoice ||
    preview?.linkedStudentId ||
    (preview && !preview.possibleMatches.length ? 'new' : '');
  const capturedFields = preview?.capturedStudentFields ?? [];
  const existingStudent = Boolean(selectedIdentity && selectedIdentity !== 'new');
  const canApplyDirectly =
    preview?.linkedStudentId === selectedIdentity
      ? preview?.canApplyProfileFieldsDirectly === true
      : preview?.possibleMatches.find((match) => match.studentId === selectedIdentity)
          ?.canApplyProfileFieldsDirectly === true;
  const canReviewProfileFields =
    (preview?.linkedStudentId === selectedIdentity
      ? preview?.canReviewProfileFields
      : preview?.possibleMatches.find((match) => match.studentId === selectedIdentity)
          ?.canReviewProfileFields) !== false;
  const readinessBlocked = Boolean(
    preview?.items.some((item) => !item.passed && item.key !== 'duplicate_resolution')
  );
  const cannotSubmit =
    busy ||
    loading ||
    hasError ||
    !preview ||
    !preview.items.length ||
    readinessBlocked ||
    !selectedIdentity ||
    !guardianVerified;
  return (
    <>
      <FinalizationSurface
        presentation={presentation}
        busy={busy}
        hidden={repairOpen}
        onClose={onClose}
      >
        <Box
          component={presentation === 'inline' ? 'div' : DialogScrollContent}
          sx={presentation === 'inline' ? { p: 1.5 } : undefined}
        >
          <Stack spacing={1.5}>
            {presentation !== 'inline' && (
              <Box
                sx={(theme) => ({
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 1,
                  borderLeft: 4,
                  borderColor: 'primary.main',
                })}
              >
                {application && (
                  <>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="h6" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {application.applicantName}
                      </Typography>
                      <Label
                        color={getAdmissionApplicationStatusColor(application.status)}
                        sx={{ flexShrink: 0 }}
                      >
                        {getAdmissionApplicationStatusLabel(application.status)}
                      </Label>
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.25, sm: 2 }}
                      sx={{ mt: 0.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Application {application.applicationNumber}
                      </Typography>
                    </Stack>
                  </>
                )}
              </Box>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                gap: 1.5,
              }}
            >
              <Box
                sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}
              >
                <ApplicationFinalizationReadiness
                  preview={preview}
                  loading={loading}
                  hasError={hasError}
                  disabled={busy}
                  identityChoice={selectedIdentity}
                  onIdentityChoice={(identity) => {
                    setIdentityChoice(identity);
                    setReviewedIdentity(null);
                  }}
                  onRetry={onRetry}
                  onRepairIdentity={
                    canRepairIdentity && !loading && !hasError
                      ? () => setRepairOpen(true)
                      : undefined
                  }
                />
              </Box>
              <Stack
                spacing={1.5}
                sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}
              >
                <Typography variant="subtitle1" component="h3">
                  Student record details
                </Typography>
                <Divider />
                {capturedFields.length > 0 && (
                  <Stack spacing={1}>
                    <Box component="dl" sx={{ m: 0 }}>
                      {capturedFields.map((field) => (
                        <Stack
                          key={field.key}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={{ xs: 0.25, sm: 1 }}
                          sx={{ py: 0.75, '& + div': { borderTop: 1, borderColor: 'divider' } }}
                        >
                          <Typography
                            component="dt"
                            variant="body2"
                            color="text.secondary"
                            sx={{ flex: 1 }}
                          >
                            {field.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="dd"
                            sx={{ m: 0, flex: 1, overflowWrap: 'anywhere' }}
                          >
                            {field.key === 'Applicant.ProfilePhoto'
                              ? 'Photo provided'
                              : field.value}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                    {existingStudent && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              disabled={busy || loading || hasError || !canReviewProfileFields}
                              checked={
                                canReviewProfileFields && reviewedIdentity === selectedIdentity
                              }
                              onChange={(_, checked) =>
                                setReviewedIdentity(checked ? selectedIdentity : null)
                              }
                            />
                          }
                          label={
                            canApplyDirectly
                              ? 'Apply these reviewed details to the Student profile.'
                              : 'Submit these admission details for Student profile review.'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {!canReviewProfileFields
                            ? 'You can finalize admission and retain these answers. Your access does not allow Student profile review.'
                            : canApplyDirectly
                              ? 'Updates only supported profile fields supplied in this admission.'
                              : 'Existing profile details remain until the Student Records review is approved.'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                )}
                {preview?.profileReviewDescription &&
                  (presentation === 'inline' ? (
                    <CustomAccordion
                      title="Profile review rules"
                      expanded={profileRules.value}
                      onChange={profileRules.onToggle}
                      content={
                        <Typography variant="body2" color="text.secondary">
                          {preview.profileReviewDescription}
                        </Typography>
                      }
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {preview.profileReviewDescription}
                    </Typography>
                  ))}
                {!capturedFields.length && (
                  <Typography variant="body2" color="text.secondary">
                    No additional Student profile details were captured.
                  </Typography>
                )}
                <Divider />
                <Typography variant="subtitle2" component="h3">
                  Guardian verification
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      disabled={busy || loading || hasError}
                      checked={guardianVerified}
                      onChange={(event) => setGuardianVerified(event.target.checked)}
                    />
                  }
                  label="I verified the primary guardian’s phone number or email."
                  sx={{
                    m: 0,
                    p: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    '& .MuiFormControlLabel-label': { typography: 'body2' },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Required to finalize admission.
                </Typography>
                <Divider />
                <Typography variant="subtitle2">Onboarding handover</Typography>
                <Typography variant="body2" color="text.secondary">
                  Finalizing creates or links a Student identity and an Onboarding case. Placement,
                  GR and roll numbers, fees and accounts are completed in Student Onboarding.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <DialogActions
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            flexWrap: 'wrap',
            gap: 1,
            ...(presentation === 'inline'
              ? { position: 'sticky', bottom: 0, bgcolor: 'background.paper', zIndex: 1 }
              : {}),
          }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="inherit"
            size="small"
            loading={busy}
            loadingPosition="start"
            disabled={cannotSubmit}
            startIcon={<Iconify icon="mdi:check-decagram-outline" />}
            onClick={async () => {
              if (submittingRef.current || cannotSubmit) return;
              submittingRef.current = true;
              setSubmitting(true);
              try {
                const success = await onSubmit({
                  existingStudentId: selectedIdentity !== 'new' ? selectedIdentity : undefined,
                  confirmCreateNew: selectedIdentity === 'new',
                  confirmGuardianContactVerified: guardianVerified,
                  ...(existingStudent && capturedFields.length
                    ? {
                        applyStudentProfileFields:
                          canReviewProfileFields && reviewedIdentity === selectedIdentity,
                      }
                    : {}),
                });
                if (success) onClose();
              } finally {
                submittingRef.current = false;
                setSubmitting(false);
              }
            }}
          >
            {busy ? 'Finalizing admission…' : 'Finalize admission'}
          </LoadingButton>
        </DialogActions>
      </FinalizationSurface>
      <ApplicationApplicantIdentityDialog
        open={repairOpen}
        applicantId={applicantId}
        onClose={() => setRepairOpen(false)}
        onUpdated={() => {
          setIdentityChoice('');
          setGuardianVerified(false);
          setReviewedIdentity(null);
          onRetry();
        }}
      />
    </>
  );
}
