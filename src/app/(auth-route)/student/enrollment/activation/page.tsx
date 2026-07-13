import StudentAdmissionsCrmScreen from 'src/screens/student/enrollment/admissions-crm';
import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

const AdmissionsActivationPage = () => (
  <StudentAdmissionsCrmScreen
    heading="Student Activation"
    initialView="operations"
    initialOperationsQueueType={AdmissionCrmOperationsQueueType.ActivationRepair}
    fixedView
    workspace="activation"
  />
);

export default AdmissionsActivationPage;
