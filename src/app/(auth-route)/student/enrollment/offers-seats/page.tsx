import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const AdmissionsOffersSeatsPage = async ({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) => redirectEnrollmentRoute(studentPaths.enrollment.classPlacement, searchParams);

export default AdmissionsOffersSeatsPage;
