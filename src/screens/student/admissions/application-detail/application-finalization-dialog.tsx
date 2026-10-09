'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionFinalizationPreview,
} from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  Checkbox,
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

export function ApplicationFinalizationDialog({ open, ...props }: Props) {
  if (!open) return null;
  return <OpenApplicationFinalizationDialog {...props} />;
}

function OpenApplicationFinalizationDialog({
  applicantId,
  application,
  busy,
  preview,
  loading,
  hasError,
  onRetry,
  onClose,
  onSubmit,
}: OpenProps) {
  const [identityChoice, setIdentityChoice] = useState('');
  const [guardianVerified, setGuardianVerified] = useState(false);
  const [reviewedIdentity, setReviewedIdentity] = useState<string | null>(null);
  const [repairOpen, setRepairOpen] = useState(false);
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
      <CustomDialog
        open={!repairOpen}
        handleClose={onClose}
        disableClose={busy}
        title="Finalize Admission"
        titleInfo="This closes Admissions and creates or links one Student identity and an Onboarding case. It does not assign a class division, seat, GR number, roll number, fees, or login account. Placement and enrollment are completed in Student Onboarding."
        maxWidth="sm"
        hasForm={false}
        paperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
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
                    {application.offeringCode && (
                      <Typography variant="body2" color="text.secondary">
                        Offering {application.offeringCode}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}
              <Typography variant="body2" sx={{ mt: application ? 1 : 0 }}>
                Confirm the Student identity and guardian contact to hand this admission over to
                Student Onboarding.
              </Typography>
            </Box>
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
                canRepairIdentity && !loading && !hasError ? () => setRepairOpen(true) : undefined
              }
            />
            {capturedFields.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" component="h3">
                  Admission details for the Student record
                </Typography>
                {preview?.profileReviewDescription && (
                  <Typography variant="body2" color="text.secondary">
                    {preview.profileReviewDescription}
                  </Typography>
                )}
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
                        {field.key === 'Applicant.ProfilePhoto' ? 'Photo provided' : field.value}
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
                          checked={canReviewProfileFields && reviewedIdentity === selectedIdentity}
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
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
            color="success"
            size="small"
            loading={busy}
            disabled={cannotSubmit}
            startIcon={<Iconify icon="mdi:check-decagram-outline" />}
            onClick={async () => {
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
            }}
          >
            Finalize admission
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
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
