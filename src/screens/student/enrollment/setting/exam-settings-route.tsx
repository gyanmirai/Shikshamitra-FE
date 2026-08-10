'use client';

import { Alert } from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';
import { ExamRegistrationGuidance } from './admission-journey-guidance';
import AdmissionsPlaybookConfiguration from './admissions-playbook-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

export function ExamSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();
  return (
    <EnrollmentSettingsPage
      title="Assessment Settings"
      description="Configure written tests, interviews, interactions, schedules, decisions, and parent messages."
      layout="table"
    >
      <ExamRegistrationGuidance />
      {academicYearId ? (
        <AdmissionsPlaybookConfiguration academicYearId={academicYearId} mode="entrance-exam" />
      ) : (
        <Alert severity="info">Select an academic year to configure admission assessments.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
