'use client';

import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { ApplicationFinalizationReadiness } from './application-finalization-readiness';

type SubmitValue = {
  existingStudentId?: string;
  confirmCreateNew: boolean;
  confirmGuardianContactVerified: boolean;
  applyStudentProfileFields?: boolean;
};
type Props = {
  open: boolean;
  applicantId: string;
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
    readinessBlocked ||
    !selectedIdentity ||
    !guardianVerified;
  return (
    <CustomDialog
      open
      handleClose={onClose}
      disableClose={busy}
      title="Finalize admission"
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="mdi:account-check-outline" />}>
            This closes Admissions and creates or links one Student identity. It does not assign a
            class division, seat, GR number, roll number, fees, or login account.
          </Alert>
          <ApplicationFinalizationReadiness
            applicantId={applicantId}
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
          />
          {capturedFields.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Admission details for the Student record</Typography>
              {preview?.profileReviewDescription && (
                <Typography variant="body2" color="text.secondary">
                  {preview.profileReviewDescription}
                </Typography>
              )}
              {capturedFields.map((field) => (
                <Stack key={field.key} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {field.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1, overflowWrap: 'anywhere' }}
                  >
                    {field.key === 'Applicant.ProfilePhoto' ? 'Photo provided' : field.value}
                  </Typography>
                </Stack>
              ))}
              {existingStudent && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
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
                disabled={busy || loading || hasError}
                checked={guardianVerified}
                onChange={(event) => setGuardianVerified(event.target.checked)}
              />
            }
            label="I verified the primary guardian’s phone number or email."
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" size="small" disabled={busy} onClick={onClose}>
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
  );
}
