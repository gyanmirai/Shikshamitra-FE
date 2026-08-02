'use client';

import { Alert } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import { PipelineCatalogSettings } from './pipeline-catalog-settings';
import AdmissionsCrmConfiguration from './admissions-crm-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { EnrollmentSettingsPage, EnrollmentSettingsTaskNav } from './enrollment-settings-page';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';
import type { AdmissionsCrmConfigurationFocusSection } from './admissions-crm-configuration';

const panels: Array<{
  value: EnrollmentSettingsPanel;
  label: string;
  description: string;
  icon: string;
  section: AdmissionsCrmConfigurationFocusSection;
}> = [
  {
    value: 'sources',
    label: 'Inquiry Sources',
    description: 'Define where inquiries originate and which intake channels can use each source.',
    icon: 'mdi:source-branch',
    section: 'capture',
  },
  {
    value: 'types',
    label: 'Inquiry Types',
    description: 'Name the reasons families contact the school without mixing them with sources.',
    icon: 'mdi:shape-outline',
    section: 'capture',
  },
  {
    value: 'forms',
    label: 'Capture Fields',
    description: 'Configure the staff and family inquiry forms used to create Pipeline records.',
    icon: 'mdi:form-select',
    section: 'capture',
  },
  {
    value: 'routing',
    label: 'Ownership',
    description: 'Choose the admissions staff pool and default assignment behavior.',
    icon: 'mdi:account-switch-outline',
    section: 'routing',
  },
  {
    value: 'scoring',
    label: 'Lead Scoring',
    description: 'Apply recommended intent signals and preview how inquiries will be prioritized.',
    icon: 'mdi:speedometer',
    section: 'routing',
  },
];

export function PipelineSettingsRoute() {
  const configurationDialog = useBoolean();
  const { academicYearId, state } = useEnrollmentWorkspace();
  const requestedPanel = state.settingsPanel === 'capture' ? 'sources' : state.settingsPanel;
  const selectedPanel = panels.find((panel) => panel.value === requestedPanel) || panels[0];
  const isCatalogPanel = selectedPanel.value === 'sources' || selectedPanel.value === 'types';

  return (
    <EnrollmentSettingsPage
      title="Pipeline Settings"
      description="Configure inquiry capture, ownership, and prioritization without changing the admission lifecycle."
      layout={isCatalogPanel ? 'table' : 'document'}
    >
      <EnrollmentSettingsTaskNav
        label="Pipeline settings"
        value={selectedPanel.value}
        options={panels.map(({ value, label, description, icon }) => ({
          value,
          label,
          description,
          icon,
        }))}
      />
      {academicYearId ? (
        isCatalogPanel ? (
          <PipelineCatalogSettings
            academicYearId={academicYearId}
            view={selectedPanel.value === 'types' ? 'types' : 'sources'}
          />
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
