import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const AdmissionCycleWorkspaceTabPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ academicYearId: string; workspaceTab: string }>;
  searchParams: EnrollmentRouteSearchParams;
}) => {
  const { academicYearId } = await params;

  return redirectEnrollmentRoute(
    studentPaths.enrollment.settingsSections.admissionYear,
    searchParams,
    { cycle: academicYearId }
  );
};

export default AdmissionCycleWorkspaceTabPage;
