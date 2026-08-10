'use client';

import { AdmissionsRegistrationView } from './admissions-registration-configuration-view';
import { AdmissionsRegistrationProvider } from './admissions-registration-configuration-context';
import { useAdmissionsRegistrationController } from './admissions-registration-configuration-controller';

type Props = {
  academicYearId?: string;
  view: 'templates' | 'numbering';
};

export default function AdmissionsRegistrationConfiguration({ academicYearId, view }: Props) {
  const controller = useAdmissionsRegistrationController({ academicYearId, view });

  return (
    <AdmissionsRegistrationProvider value={controller}>
      <AdmissionsRegistrationView />
    </AdmissionsRegistrationProvider>
  );
}
