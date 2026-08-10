'use client';

import { Alert, AlertTitle } from '@mui/material';

export function ExamRegistrationGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>After an exam decision</AlertTitle>
      Recording attendance, results, and the final exam decision updates the applicant journey. When
      an eligible applicant needs registration, the system sends the matching published form
      automatically only when that rule is enabled. Otherwise, staff can send it from Ready to
      Invite.
    </Alert>
  );
}

export function RegistrationReadinessGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>After registration</AlertTitle>
      Staff can send a registration form from Ready to Invite. After the form and required documents
      are verified, confirm readiness to move the applicant to the next required step shown in their
      admission journey.
    </Alert>
  );
}
