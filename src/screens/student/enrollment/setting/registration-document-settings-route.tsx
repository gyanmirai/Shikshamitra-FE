'use client';

import { Alert, Stack } from '@mui/material';

import AdmissionsDocumentConfiguration from './admissions-document-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import AdmissionsRegistrationConfiguration from './admissions-registration-configuration';
import { EnrollmentSettingsPage, EnrollmentSettingsPanelTabs } from './enrollment-settings-page';

export function RegistrationDocumentSettingsRoute() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const panel = state.settingsPanel === 'documents' ? 'documents' : 'registration';

  return (
    <EnrollmentSettingsPage
      title="Registration & Documents"
      description="Design registration forms, numbering, and document verification requirements."
    >
      <EnrollmentSettingsPanelTabs
        label="Registration and document settings"
        value={panel}
        options={[
          { value: 'registration', label: 'Registration Setup' },
          { value: 'documents', label: 'Document Checklists' },
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
