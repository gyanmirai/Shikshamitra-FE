'use client';

import { Alert } from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';
import AdmissionsPlaybookConfiguration from './admissions-playbook-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

export function ExamSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();
  return (
    <EnrollmentSettingsPage
      title="Entrance Exams"
      description="Configure admission playbooks, exam definitions, slot capacity, assignment, and result rules."
    >
      {academicYearId ? (
        <AdmissionsPlaybookConfiguration academicYearId={academicYearId} />
      ) : (
        <Alert severity="info">Select an academic year to configure entrance exams.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
