import { AdmissionsCycleDetailWorkspace } from 'src/screens/student/enrollment/admissions-crm/workspace-pages';

const AdmissionCycleDetailPage = async ({
  params,
}: {
  params: Promise<{ academicYearId: string }>;
}) => {
  const { academicYearId } = await params;

  return <AdmissionsCycleDetailWorkspace academicYearId={academicYearId} />;
};

export default AdmissionCycleDetailPage;
