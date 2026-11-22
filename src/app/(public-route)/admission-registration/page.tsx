import type { Metadata } from 'next';

import PublicAdmissionRegistrationScreen from 'src/screens/public/admission-registration';

export const metadata: Metadata = {
  title: 'Registration form',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  return <PublicAdmissionRegistrationScreen />;
}
