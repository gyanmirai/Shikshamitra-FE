import { EnrollmentSettingsPage } from 'src/screens/student/enrollment/setting/enrollment-settings-page';
import AdmissionsNumberSeriesConfiguration from 'src/screens/student/enrollment/setting/admissions-number-series-configuration';

export default function ActivationSettingsPage() {
  return (
    <EnrollmentSettingsPage
      title="Activation"
      description="Configure admission and GR number series used during final student activation."
    >
      <AdmissionsNumberSeriesConfiguration />
    </EnrollmentSettingsPage>
  );
}
