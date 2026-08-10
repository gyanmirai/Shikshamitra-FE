'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

import { AdmissionsCrmConfigurationView } from './admissions-crm-configuration-view';
import { useAdmissionsCrmConfigurationController } from './admissions-crm-configuration-controller';
import { AdmissionsCrmConfigurationProvider } from './admissions-crm-configuration-context';

export type AdmissionsCrmConfigurationFocusSection =
  'journey' | 'capture' | 'routing' | 'communications' | 'automation';

type Props = {
  academicYearId?: string;
  admissionsCrmConfigurationDialog: UseBooleanReturn;
  focusSection?: AdmissionsCrmConfigurationFocusSection;
  focusPanel?: EnrollmentSettingsPanel;
};

export default function AdmissionsCrmConfiguration({
  academicYearId,
  admissionsCrmConfigurationDialog,
  focusSection,
  focusPanel,
}: Props) {
  const controller = useAdmissionsCrmConfigurationController({
    academicYearId,
    admissionsCrmConfigurationDialog,
    focusSection,
    focusPanel,
  });

  return (
    <AdmissionsCrmConfigurationProvider value={controller}>
      <AdmissionsCrmConfigurationView />
    </AdmissionsCrmConfigurationProvider>
  );
}
