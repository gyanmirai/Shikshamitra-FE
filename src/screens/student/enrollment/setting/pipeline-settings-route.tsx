'use client';

import { Alert } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import { PipelineCatalogSettings } from './pipeline-catalog-settings';
import AdmissionsCrmConfiguration from './admissions-crm-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { EnrollmentSettingsPage, EnrollmentSettingsPanelTabs } from './enrollment-settings-page';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';
import type { AdmissionsCrmConfigurationFocusSection } from './admissions-crm-configuration';

const panels: Array<{
  value: EnrollmentSettingsPanel;
  label: string;
  description: string;
  section: AdmissionsCrmConfigurationFocusSection;
}> = [
  {
    value: 'capture',
    label: 'Sources & Types',
    description:
      'Configure inquiry sources, intake channels, consent, and acknowledgement defaults.',
    section: 'capture',
  },
  {
    value: 'forms',
    label: 'Capture Fields',
    description: 'Configure the staff and family inquiry forms used to create Pipeline records.',
    section: 'capture',
  },
  {
    value: 'routing',
    label: 'Ownership',
    description: 'Choose the admissions staff pool and default assignment behavior.',
    section: 'routing',
  },
  {
    value: 'scoring',
    label: 'Priority',
    description: 'Set simple priority signals without changing the admission lifecycle.',
    section: 'routing',
  },
];

export function PipelineSettingsRoute() {
  const configurationDialog = useBoolean();
  const { academicYearId, state } = useEnrollmentWorkspace();
  const selectedPanel = panels.find((panel) => panel.value === state.settingsPanel) || panels[0];

  return (
    <EnrollmentSettingsPage
      title="Pipeline Settings"
      description="Configure inquiry capture and ownership while keeping the admission stages fixed."
      layout={selectedPanel.value === 'capture' ? 'table' : 'document'}
    >
      <EnrollmentSettingsPanelTabs
        label="Pipeline settings"
        value={selectedPanel.value}
        options={panels.map(({ value, label, description }) => ({
          value,
          label,
          description,
        }))}
      />
      {academicYearId ? (
        selectedPanel.value === 'capture' ? (
          <PipelineCatalogSettings academicYearId={academicYearId} />
        ) : (
          <AdmissionsCrmConfiguration
            academicYearId={academicYearId}
            admissionsCrmConfigurationDialog={configurationDialog}
            focusSection={selectedPanel.section}
            focusPanel={selectedPanel.value}
          />
        )
      ) : (
        <Alert severity="info">Select an academic year to configure Pipeline.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
