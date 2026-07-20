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
      description="Choose whether applicants need an exam, how results are decided, and whether the school issues hall tickets."
      fillAvailableHeight
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
