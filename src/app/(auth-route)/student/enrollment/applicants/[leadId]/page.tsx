import { AdmissionsApplicantWorkspace } from 'src/screens/student/enrollment/admissions-crm/workspace-pages';

const ApplicantPage = async ({ params }: { params: Promise<{ leadId: string }> }) => {
  const { leadId } = await params;

  return <AdmissionsApplicantWorkspace leadId={leadId} />;
};

export default ApplicantPage;
