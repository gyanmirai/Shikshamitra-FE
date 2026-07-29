import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const AdmissionsExamsPage = async ({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) => redirectEnrollmentRoute(studentPaths.enrollment.entranceExams, searchParams);

export default AdmissionsExamsPage;
