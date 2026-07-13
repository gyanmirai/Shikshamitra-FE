import StudentAdmissionsCrmScreen from 'src/screens/student/enrollment/admissions-crm';

const AdmissionsAnalyticsPage = () => (
  <StudentAdmissionsCrmScreen
    heading="Enrollment Analytics"
    initialView="list"
    fixedView
    workspace="analytics"
  />
);

export default AdmissionsAnalyticsPage;
