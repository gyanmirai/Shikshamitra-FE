'use client';

import { useBoolean } from 'src/hooks/use-boolean';
import AdmissionsCrmConfiguration from 'src/screens/student/enrollment/setting/admissions-crm-configuration';

const AdmissionsSettingsPage = () => {
  const admissionsCrmConfigurationDialog = useBoolean();

  return (
    <AdmissionsCrmConfiguration
      admissionsCrmConfigurationDialog={admissionsCrmConfigurationDialog}
    />
  );
};

export default AdmissionsSettingsPage;
