'use client';

import AdmissionsRouteConfiguration from './admissions-route-configuration';
import AdmissionsGovernanceConfiguration from './admissions-governance-configuration';
import AdmissionsPolicyPackConfiguration from './admissions-policy-pack-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { EnrollmentSettingsPage, EnrollmentSettingsPanelTabs } from './enrollment-settings-page';

export function GovernanceSettingsRoute() {
  const { state } = useEnrollmentWorkspace();
  const panel = ['policy-packs', 'compliance'].includes(state.settingsPanel || '')
    ? state.settingsPanel
    : 'routes';

  return (
    <EnrollmentSettingsPage
      title="Policies & Compliance"
      description="Manage admission routes, policy defaults, privacy, retention, and controlled exceptions."
    >
      <EnrollmentSettingsPanelTabs
        label="Enrollment governance settings"
        value={panel as 'routes' | 'policy-packs' | 'compliance'}
        options={[
          { value: 'routes', label: 'Admission Routes' },
          { value: 'policy-packs', label: 'Policy Packs' },
          { value: 'compliance', label: 'Compliance & Privacy' },
        ]}
      />
      {panel === 'routes' ? <AdmissionsRouteConfiguration /> : null}
      {panel === 'policy-packs' ? <AdmissionsPolicyPackConfiguration /> : null}
      {panel === 'compliance' ? <AdmissionsGovernanceConfiguration /> : null}
    </EnrollmentSettingsPage>
  );
}
