import type { ReactNode } from 'react';

import AdmissionSettingsLayout from '../intake-assignment/layout';

export default function Layout({ children }: { children: ReactNode }) {
  return <AdmissionSettingsLayout>{children}</AdmissionSettingsLayout>;
}
