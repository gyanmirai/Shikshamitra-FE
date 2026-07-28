'use client';

import { useBoolean } from 'src/hooks/use-boolean';

import AdmissionsCrmConfiguration from './admissions-crm-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { ApplicationStagePolicyPanel } from './application-stage-policy-panel';
import {
  EnrollmentSettingsPage,
  EnrollmentSettingsPanelTabs,
  EnrollmentSettingsSetupSteps,
} from './enrollment-settings-page';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';
import type { AdmissionsCrmConfigurationFocusSection } from './admissions-crm-configuration';

type SectionDefinition = {
  title: string;
  description: string;
  defaultPanel?: EnrollmentSettingsPanel;
  panelNavigation?: 'tabs' | 'steps';
  panels?: Array<{ value: EnrollmentSettingsPanel; label: string; description?: string }>;
};

const sectionDefinitions: Record<AdmissionsCrmConfigurationFocusSection, SectionDefinition> = {
  journey: {
    title: 'Journey rules',
    description:
      'Manage advanced cycle rules, service targets, applicant stages, and team handoffs.',
    defaultPanel: 'cycle',
    panelNavigation: 'tabs',
    panels: [
      {
        value: 'cycle',
        label: 'Cycle Rules',
        description: 'Calendar, service levels, exam readiness, and inactivity rules.',
      },
      {
        value: 'pipeline',
        label: 'Stage Policy',
        description: 'Visible stage names, ownership, allowed next steps, and targets.',
      },
    ],
  },
  capture: {
    title: 'Inquiry Forms & Sources',
    description: 'Choose where inquiries arrive and what information each intake form collects.',
    defaultPanel: 'capture',
    panelNavigation: 'steps',
    panels: [
      {
        value: 'capture',
        label: 'Intake Sources',
        description: 'Enable channels, sources, consent, and acknowledgement defaults.',
      },
      {
        value: 'forms',
        label: 'Inquiry Forms',
        description: 'Build and publish the forms used by staff and families.',
      },
    ],
  },
  routing: {
    title: 'Assignment & Priority',
    description: 'Prioritize inquiries and assign them to the right admissions staff.',
    defaultPanel: 'scoring',
    panelNavigation: 'tabs',
    panels: [
      { value: 'scoring', label: 'Priority Rules' },
      { value: 'routing', label: 'Staff Assignment' },
    ],
  },
  communications: {
    title: 'Messages & Delivery',
    description: 'Manage approved message content and the supported manual or webhook adapters.',
    defaultPanel: 'templates',
    panelNavigation: 'tabs',
    panels: [
      { value: 'templates', label: 'Message Content' },
      { value: 'providers', label: 'Delivery Setup' },
    ],
  },
  automation: {
    title: 'Follow-up Automation',
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
      {section === 'journey' && academicYearId ? (
        <ApplicationStagePolicyPanel academicYearId={academicYearId} />
      ) : null}
      {definition.panels && focusPanel ? (
        definition.panelNavigation === 'steps' ? (
          <EnrollmentSettingsSetupSteps
            label={`${definition.title} setup sequence`}
            value={focusPanel}
            options={definition.panels}
          />
        ) : (
          <EnrollmentSettingsPanelTabs
            label={`${definition.title} settings`}
            value={focusPanel}
            options={definition.panels}
          />
        )
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
