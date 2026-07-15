'use client';

import { Alert } from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';
import { ExamRegistrationHandoffGuidance } from './admission-journey-guidance';
import AdmissionsPlaybookConfiguration from './admissions-playbook-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

export function ExamSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();
  return (
    <EnrollmentSettingsPage
      title="Exam & Eligibility"
      description="Configure admission paths, exam slots, assignment, result rules, and eligibility decisions."
    >
      <ExamRegistrationHandoffGuidance />
      {academicYearId ? (
        <AdmissionsPlaybookConfiguration academicYearId={academicYearId} />
      ) : (
        <Alert severity="info">Select an academic year to configure entrance exams.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
