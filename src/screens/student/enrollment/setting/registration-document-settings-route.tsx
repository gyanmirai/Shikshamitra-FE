'use client';

import { Alert, Stack } from '@mui/material';

import AdmissionsDocumentConfiguration from './admissions-document-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import AdmissionsRegistrationConfiguration from './admissions-registration-configuration';

export function RegistrationDocumentSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();
  return academicYearId ? (
    <Stack spacing={1.5}>
      <AdmissionsRegistrationConfiguration academicYearId={academicYearId} />
      <AdmissionsDocumentConfiguration academicYearId={academicYearId} />
    </Stack>
  ) : (
    <Alert severity="info">Select an academic year to configure registration and documents.</Alert>
  );
}
