import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { Alert } from '@mui/material';

import { formatWorkflowDateTime } from '../workflow-list/workflow-list-format';

export function ApplicationDecisionStatus({ application }: { application: AdmissionApplication }) {
  return (
    <>
      {application.decisionReason && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Latest note: {application.decisionReason}
        </Alert>
      )}
      {application.offerExpiresAt && application.status === 7 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Offer expires {formatWorkflowDateTime(application.offerExpiresAt)}.
        </Alert>
      )}
      {application.status === 10 && application.enrolledStudentId && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Historical enrollment record: {application.enrolledStudentId}
        </Alert>
      )}
      {application.status === 11 && application.studentId && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Admission finalized. Student identity: {application.studentId}.
        </Alert>
      )}
    </>
  );
}
