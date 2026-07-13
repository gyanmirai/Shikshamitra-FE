'use client';

import { Alert } from '@mui/material';

import AdmissionsPlaybookConfiguration from './admissions-playbook-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

export function ExamSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();
  return academicYearId ? (
    <AdmissionsPlaybookConfiguration academicYearId={academicYearId} />
  ) : (
    <Alert severity="info">Select an academic year to configure entrance exams.</Alert>
  );
}
