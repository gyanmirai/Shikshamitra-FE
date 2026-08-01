'use client';

import { Alert, Stack } from '@mui/material';

import { RegistrationOfferHandoffGuidance } from './admission-journey-guidance';
import AdmissionsDocumentConfiguration from './admissions-document-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import AdmissionsRegistrationConfiguration from './admissions-registration-configuration';
import { EnrollmentSettingsPage, EnrollmentSettingsTaskNav } from './enrollment-settings-page';

export function RegistrationDocumentSettingsRoute() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const panel =
    state.settingsPanel === 'documents' || state.settingsPanel === 'form-numbering'
      ? state.settingsPanel
      : 'registration';

  return (
    <EnrollmentSettingsPage
      title="Registration Settings"
      description="Configure form sections, required information, documents, corrections, and verification."
      layout={panel === 'registration' ? 'table' : 'document'}
    >
      <RegistrationOfferHandoffGuidance />
      <EnrollmentSettingsTaskNav
        label="Registration settings"
        value={panel}
        options={[
          {
            value: 'registration',
            label: 'Form Templates',
            description: 'Build the secure family-facing form and control when it is issued.',
            icon: 'mdi:form-select',
          },
          {
            value: 'form-numbering',
            label: 'Form Numbering',
            description: 'Create recognizable registration references for staff and families.',
            icon: 'mdi:format-list-numbered',
          },
          {
            value: 'documents',
            label: 'Required Documents',
            description: 'Checklist rules, verification, correction, and readiness.',
            icon: 'mdi:file-document-check-outline',
          },
        ]}
      />
      {academicYearId ? (
        <Stack spacing={1.5} sx={{ flex: panel === 'registration' ? 1 : undefined, minHeight: 0 }}>
          {panel === 'registration' || panel === 'form-numbering' ? (
            <AdmissionsRegistrationConfiguration
              academicYearId={academicYearId}
              view={panel === 'form-numbering' ? 'numbering' : 'templates'}
            />
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
