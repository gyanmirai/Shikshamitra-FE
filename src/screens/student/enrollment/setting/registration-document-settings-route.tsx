'use client';

import { Alert, Stack } from '@mui/material';

import { RegistrationOfferHandoffGuidance } from './admission-journey-guidance';
import AdmissionsDocumentConfiguration from './admissions-document-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import AdmissionsRegistrationConfiguration from './admissions-registration-configuration';
import { EnrollmentSettingsPage, EnrollmentSettingsSetupSteps } from './enrollment-settings-page';

export function RegistrationDocumentSettingsRoute() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const panel = state.settingsPanel === 'documents' ? state.settingsPanel : 'registration';

  return (
    <EnrollmentSettingsPage
      title="Registration Settings"
      description="Configure form sections, required information, documents, corrections, and verification."
    >
      <RegistrationOfferHandoffGuidance />
      <EnrollmentSettingsSetupSteps
        label="Registration setup sequence"
        value={panel}
        options={[
          {
            value: 'registration',
            label: 'Registration Forms',
            description: 'Issue rules, secure links, form fields, and numbering.',
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
