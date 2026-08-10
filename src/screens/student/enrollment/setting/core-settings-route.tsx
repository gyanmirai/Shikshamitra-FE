'use client';

import { Alert } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import AdmissionsCrmConfiguration from './admissions-crm-configuration';
import { CommunicationTemplateSettings } from './communication-template-settings';
import { CommunicationReminderSettings } from './communication-reminder-settings';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { EnrollmentSettingsPage, EnrollmentSettingsTaskNav } from './enrollment-settings-page';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

const communicationPanels: Array<{
  value: EnrollmentSettingsPanel;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'templates',
    label: 'Message Content',
    description: 'Write the approved messages families receive during admission.',
    icon: 'mdi:message-text-outline',
  },
  {
    value: 'providers',
    label: 'Delivery Setup',
    description: 'Connect the school-approved channels used to deliver messages.',
    icon: 'mdi:connection',
  },
  {
    value: 'reminders',
    label: 'Reminders',
    description: 'Set simple, bounded reminders for incomplete admission work.',
    icon: 'mdi:bell-clock-outline',
  },
];

const communicationPanelValues = communicationPanels.map(({ value }) => value);

export function CoreSettingsRoute() {
  const configurationDialog = useBoolean();
  const { academicYearId, state } = useEnrollmentWorkspace();
  const focusPanel = communicationPanelValues.includes(
    state.settingsPanel as EnrollmentSettingsPanel
  )
    ? (state.settingsPanel as EnrollmentSettingsPanel)
    : 'templates';

  return (
    <EnrollmentSettingsPage
      title="Communication Settings"
      description="Manage approved messages, delivery channels, consent, and simple reminders."
      layout={focusPanel === 'templates' || focusPanel === 'reminders' ? 'table' : 'document'}
    >
      <EnrollmentSettingsTaskNav
        label="Communication settings"
        value={focusPanel}
        options={communicationPanels}
      />
      {academicYearId ? (
        focusPanel === 'templates' ? (
          <CommunicationTemplateSettings academicYearId={academicYearId} />
        ) : focusPanel === 'reminders' ? (
          <CommunicationReminderSettings academicYearId={academicYearId} />
        ) : (
          <AdmissionsCrmConfiguration
            academicYearId={academicYearId}
            admissionsCrmConfigurationDialog={configurationDialog}
            focusSection="communications"
            focusPanel="providers"
          />
        )
      ) : (
        <Alert severity="info">Select an academic year to configure communications.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
