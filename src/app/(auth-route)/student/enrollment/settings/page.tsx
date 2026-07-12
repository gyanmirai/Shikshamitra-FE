import AdmissionsCrmConfiguration from 'src/screens/student/enrollment/setting/admissions-crm-configuration';
import { useBoolean } from 'src/hooks/use-boolean';

const AdmissionsSettingsPage = () => {
  const admissionsCrmConfigurationDialog = useBoolean();

  return (
    <AdmissionsCrmConfiguration
      admissionsCrmConfigurationDialog={admissionsCrmConfigurationDialog}
    />
  );
};

export default AdmissionsSettingsPage;
