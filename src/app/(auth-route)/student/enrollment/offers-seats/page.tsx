import StudentAdmissionsCrmScreen from 'src/screens/student/enrollment/admissions-crm';
import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

const AdmissionsOffersSeatsPage = () => (
  <StudentAdmissionsCrmScreen
    heading="Offers and Seats"
    initialView="operations"
    initialOperationsQueueType={AdmissionCrmOperationsQueueType.FinalApproval}
    fixedView
  />
);

export default AdmissionsOffersSeatsPage;
