'use client';

import { Alert, Stack } from '@mui/material';

import { RegistrationOfferHandoffGuidance } from './admission-journey-guidance';
import AdmissionsDocumentConfiguration from './admissions-document-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import AdmissionsRegistrationConfiguration from './admissions-registration-configuration';
import { EnrollmentSettingsPage, EnrollmentSettingsSetupSteps } from './enrollment-settings-page';

export function RegistrationDocumentSettingsRoute() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const panel = state.settingsPanel === 'documents' ? 'documents' : 'registration';

  return (
    <EnrollmentSettingsPage
      title="Registration & Documents"
      description="Control how eligible applicants receive forms and complete document verification."
    >
      <RegistrationOfferHandoffGuidance />
      <EnrollmentSettingsSetupSteps
        label="Registration and document setup sequence"
        value={panel}
        options={[
          {
            value: 'registration',
            label: 'Registration Forms',
            description: 'Issue rules, secure links, form fields, fees, and numbering.',
          },
          {
            value: 'documents',
            label: 'Required Documents',
            description: 'Checklist rules, verification, correction, and readiness.',
          },
        ]}
      />
      {academicYearId ? (
        <Stack spacing={1.5}>
          {panel === 'registration' ? (
            <AdmissionsRegistrationConfiguration academicYearId={academicYearId} />
          ) : (
            <AdmissionsDocumentConfiguration academicYearId={academicYearId} />
          )}
        </Stack>
      ) : (
        <Alert severity="info">
          Select an academic year to configure registration and documents.
        </Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
