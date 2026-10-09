import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { Alert } from '@mui/material';

export function ApplicationDecisionStatus({
  application,
  compact = false,
}: {
  application: AdmissionApplication;
  compact?: boolean;
}) {
  return (
    <>
      {application.decisionReason && (
        <Alert severity="info" sx={{ mt: compact ? 1 : 2 }}>
          Latest note: {application.decisionReason}
        </Alert>
      )}
      {application.status === 10 && application.enrolledStudentId && (
        <Alert severity="success" sx={{ mt: compact ? 1 : 2 }}>
          Historical enrollment record: {application.enrolledStudentId}
        </Alert>
      )}
      {application.status === 11 && application.studentId && (
        <Alert severity="success" sx={{ mt: compact ? 1 : 2 }}>
          Admission finalized. Student identity: {application.studentId}.
        </Alert>
      )}
    </>
  );
}
