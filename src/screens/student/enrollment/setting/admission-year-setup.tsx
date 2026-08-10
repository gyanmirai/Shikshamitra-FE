'use client';

import { AdmissionYearSetupView } from './admission-year-setup-view';
import { AdmissionYearSetupProvider } from './admission-year-setup-context';
import { useAdmissionYearSetupController } from './admission-year-setup-controller';

export function AdmissionYearSetup() {
  const controller = useAdmissionYearSetupController();

  return (
    <AdmissionYearSetupProvider value={controller}>
      <AdmissionYearSetupView />
    </AdmissionYearSetupProvider>
  );
}
