'use client';

import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Checkbox, DialogActions, FormControlLabel } from '@mui/material';

import { ApplicationFinalizationReadiness } from './application-finalization-readiness';

type SubmitValue = {
  existingStudentId?: string;
  confirmCreateNew: boolean;
  confirmGuardianContactVerified: boolean;
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
  const selectedIdentity =
    identityChoice ||
    preview?.linkedStudentId ||
    (preview && !preview.possibleMatches.length ? 'new' : '');
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
    <CustomDialog open handleClose={onClose} title="Finalize admission" maxWidth="sm">
      <DialogScrollContent>
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="mdi:account-check-outline" />}>
            This closes Admissions, creates or links one Student identity, and opens Student
            Onboarding. It does not assign a class division, seat, GR number, roll number, fees, or
            login account.
          </Alert>
          <ApplicationFinalizationReadiness
            applicantId={applicantId}
            preview={preview}
            loading={loading}
            hasError={hasError}
            identityChoice={selectedIdentity}
            onIdentityChoice={setIdentityChoice}
            onRetry={onRetry}
          />
          <FormControlLabel
            control={
              <Checkbox
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
