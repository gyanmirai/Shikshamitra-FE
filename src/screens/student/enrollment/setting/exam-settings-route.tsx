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
      title="Entrance Exam Settings"
      description="Configure exam applicability, schedules, result rules, retests, and parent messages."
      layout="table"
    >
      <ExamRegistrationHandoffGuidance />
      {academicYearId ? (
        <AdmissionsPlaybookConfiguration academicYearId={academicYearId} mode="entrance-exam" />
      ) : (
        <Alert severity="info">Select an academic year to configure entrance exams.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
