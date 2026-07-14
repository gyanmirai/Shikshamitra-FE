import { EnrollmentSettingsPage } from 'src/screens/student/enrollment/setting/enrollment-settings-page';
import AdmissionsSeatPoolConfiguration from 'src/screens/student/enrollment/setting/admissions-seat-pool-configuration';

export default function OfferSeatSettingsPage() {
  return (
    <EnrollmentSettingsPage
      title="Offers & Seats"
      description="Configure seat pools, reservation capacity, offer controls, and waitlist availability."
    >
      <AdmissionsSeatPoolConfiguration />
    </EnrollmentSettingsPage>
  );
}
