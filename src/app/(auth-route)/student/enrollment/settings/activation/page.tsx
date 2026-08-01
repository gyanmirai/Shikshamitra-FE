'use client';

import { Alert } from '@mui/material';
import {
  EnrollmentSettingsPage,
  EnrollmentSettingsTaskNav,
} from 'src/screens/student/enrollment/setting/enrollment-settings-page';
import { useEnrollmentWorkspace } from 'src/screens/student/enrollment/admissions-crm/enrollment-workspace-context';
import { ActivationSettingsConfiguration } from 'src/screens/student/enrollment/setting/activation-settings-configuration';
import AdmissionsNumberSeriesConfiguration from 'src/screens/student/enrollment/setting/admissions-number-series-configuration';

export default function ActivationSettingsPage() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const panel = state.settingsPanel === 'numbering' ? 'numbering' : 'activation';

  return (
    <EnrollmentSettingsPage
      title="Activation Settings"
      description="Configure required gates, approval ownership, cancellation timing, and activation messages."
      layout="document"
    >
      <EnrollmentSettingsTaskNav
        label="Activation settings"
        value={panel}
        options={[
          {
            value: 'activation',
            label: 'Activation Rules',
            description: 'Review enforced readiness gates, cancellation, and family communication.',
            icon: 'mdi:account-check-outline',
          },
          {
            value: 'numbering',
            label: 'Student Identifiers',
            description: 'Create, publish, and audit permanent student number series.',
            icon: 'mdi:identifier',
          },
        ]}
      />
      {academicYearId ? (
        panel === 'activation' ? (
          <ActivationSettingsConfiguration academicYearId={academicYearId} />
        ) : (
          <AdmissionsNumberSeriesConfiguration />
        )
      ) : (
        <Alert severity="info">Select an academic year to configure Activation.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
