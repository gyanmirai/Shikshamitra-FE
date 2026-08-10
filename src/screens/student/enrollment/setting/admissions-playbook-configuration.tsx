'use client';

import { AdmissionsPlaybookView } from './admissions-playbook-configuration-view';
import { AdmissionsPlaybookProvider } from './admissions-playbook-configuration-context';
import { useAdmissionsPlaybookController } from './admissions-playbook-configuration-controller';

type Props = {
  academicYearId?: string;
  mode?: 'full' | 'entrance-exam';
};

export default function AdmissionsPlaybookConfiguration({ academicYearId, mode }: Props) {
  const controller = useAdmissionsPlaybookController({ academicYearId, mode });

  return (
    <AdmissionsPlaybookProvider value={controller}>
      <AdmissionsPlaybookView />
    </AdmissionsPlaybookProvider>
  );
}
