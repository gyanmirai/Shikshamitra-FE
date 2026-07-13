'use client';

import { useBoolean } from 'src/hooks/use-boolean';

import AdmissionsCrmConfiguration from './admissions-crm-configuration';

import type { AdmissionsCrmConfigurationFocusSection } from './admissions-crm-configuration';

export function CoreSettingsRoute({
  section,
}: {
  section: AdmissionsCrmConfigurationFocusSection;
}) {
  const configurationDialog = useBoolean();
  return (
    <AdmissionsCrmConfiguration
      admissionsCrmConfigurationDialog={configurationDialog}
      focusSection={section}
    />
  );
}
