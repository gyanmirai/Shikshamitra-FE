'use client';

import { useBoolean } from 'src/hooks/use-boolean';

import AdmissionsCrmConfiguration from './admissions-crm-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { EnrollmentSettingsPage, EnrollmentSettingsPanelTabs } from './enrollment-settings-page';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';
import type { AdmissionsCrmConfigurationFocusSection } from './admissions-crm-configuration';

type SectionDefinition = {
  title: string;
  description: string;
  defaultPanel?: EnrollmentSettingsPanel;
  panels?: Array<{ value: EnrollmentSettingsPanel; label: string }>;
};

const sectionDefinitions: Record<AdmissionsCrmConfigurationFocusSection, SectionDefinition> = {
  journey: {
    title: 'Journey & Cycles',
    description:
      'Define admission cycles, readiness requirements, pipeline stages, and service levels.',
    defaultPanel: 'cycle',
    panels: [
      { value: 'cycle', label: 'Cycle & Readiness' },
      { value: 'pipeline', label: 'Pipeline Stages' },
    ],
  },
  capture: {
    title: 'Inquiry Capture',
    description: 'Control inquiry channels, source defaults, consent, and public form templates.',
    defaultPanel: 'capture',
    panels: [
      { value: 'capture', label: 'Channels & Sources' },
      { value: 'forms', label: 'Form Templates' },
    ],
  },
  routing: {
    title: 'Routing & Scoring',
    description: 'Prioritize inquiries and assign them to the right admissions staff.',
    defaultPanel: 'scoring',
    panels: [
      { value: 'scoring', label: 'Lead Scoring' },
      { value: 'routing', label: 'Assignment Rules' },
    ],
  },
  communications: {
    title: 'Communications',
    description: 'Manage approved message content and the supported manual or webhook adapters.',
    defaultPanel: 'templates',
    panels: [
      { value: 'templates', label: 'Message Templates' },
      { value: 'providers', label: 'Provider Setup' },
    ],
  },
  automation: {
    title: 'Automation',
    description: 'Configure follow-up, stale, archive, and internal journey rules.',
  },
};

export function CoreSettingsRoute({
  section,
}: {
  section: AdmissionsCrmConfigurationFocusSection;
}) {
  const configurationDialog = useBoolean();
  const { academicYearId, state } = useEnrollmentWorkspace();
  const definition = sectionDefinitions[section];
  const allowedPanels = definition.panels?.map(({ value }) => value) || [];
  const focusPanel = allowedPanels.includes(state.settingsPanel as EnrollmentSettingsPanel)
    ? state.settingsPanel
    : definition.defaultPanel;

  return (
    <EnrollmentSettingsPage title={definition.title} description={definition.description}>
      {definition.panels && focusPanel ? (
        <EnrollmentSettingsPanelTabs
          label={`${definition.title} settings`}
          value={focusPanel}
          options={definition.panels}
        />
      ) : null}
      <AdmissionsCrmConfiguration
        academicYearId={academicYearId}
        admissionsCrmConfigurationDialog={configurationDialog}
        focusSection={section}
        focusPanel={focusPanel}
      />
    </EnrollmentSettingsPage>
  );
}
