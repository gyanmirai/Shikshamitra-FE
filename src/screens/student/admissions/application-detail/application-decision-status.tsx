import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { StudentFeedback } from 'src/components/student-feedback';

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
        <StudentFeedback
          notificationKey="STU-0190"
          presentation="inline"
          severity="info"
          sx={{ mt: compact ? 1 : 2 }}
        >
          Latest note: {application.decisionReason}
        </StudentFeedback>
      )}
      {application.status === 10 && application.enrolledStudentId && (
        <StudentFeedback
          notificationKey="STU-0191"
          presentation="inline"
          severity="success"
          sx={{ mt: compact ? 1 : 2 }}
        >
          Historical enrollment record: {application.enrolledStudentId}
        </StudentFeedback>
      )}
      {application.status === 11 && application.studentId && (
        <StudentFeedback
          notificationKey="STU-0192"
          presentation="inline"
          severity="success"
          sx={{ mt: compact ? 1 : 2 }}
        >
          Admission finalized. Student identity: {application.studentId}.
        </StudentFeedback>
      )}
    </>
  );
}
