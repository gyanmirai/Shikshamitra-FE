import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Button, Divider, Typography } from '@mui/material';

import { managedReviewAllowsDecision } from '../review/review-model';

export function ApplicationFinalizationCallout({
  application,
  busy,
  onOpen,
}: {
  application: AdmissionApplication;
  busy: boolean;
  onOpen: () => void;
}) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" color="text.secondary">
        The offer is accepted. Finalize Admissions to link the Student identity and start
        onboarding. Placement and enrollment happen later.
      </Typography>
      <Button
        variant="contained"
        color="success"
        size="small"
        disabled={busy || !managedReviewAllowsDecision(application.reviewDecision, 'finalize')}
        startIcon={<Iconify icon="mdi:school-outline" />}
        onClick={onOpen}
        sx={{ mt: 1, alignSelf: 'flex-start' }}
      >
        Finalize admission
      </Button>
    </>
  );
}
