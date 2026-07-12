import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';
import StudentAdmissionsCrmScreen from 'src/screens/student/enrollment/admissions-crm';

const AdmissionsRegistrationsPage = () => (
  <StudentAdmissionsCrmScreen
    heading="Registrations and Documents"
    initialView="operations"
    initialOperationsQueueType={AdmissionCrmOperationsQueueType.IncompleteRegistration}
    fixedView
  />
);

export default AdmissionsRegistrationsPage;
