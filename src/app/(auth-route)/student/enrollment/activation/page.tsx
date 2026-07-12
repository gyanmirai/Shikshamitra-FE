import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';
import StudentAdmissionsCrmScreen from 'src/screens/student/enrollment/admissions-crm';

const AdmissionsActivationPage = () => (
  <StudentAdmissionsCrmScreen
    heading="Student Activation"
    initialView="operations"
    initialOperationsQueueType={AdmissionCrmOperationsQueueType.ActivationRepair}
    fixedView
  />
);

export default AdmissionsActivationPage;
