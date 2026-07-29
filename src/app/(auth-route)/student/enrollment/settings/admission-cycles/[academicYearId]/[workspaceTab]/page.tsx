import { notFound } from 'next/navigation';
import { AdmissionsCycleDetailWorkspace } from 'src/screens/student/enrollment/admissions-crm/workspace-pages';

type AdmissionCycleWorkspaceTab = 'setup' | 'journey-rules' | 'activity';

const validTabs = new Set<AdmissionCycleWorkspaceTab>(['setup', 'journey-rules', 'activity']);

const AdmissionCycleWorkspaceTabPage = async ({
  params,
}: {
  params: Promise<{ academicYearId: string; workspaceTab: string }>;
}) => {
  const { academicYearId, workspaceTab } = await params;

  if (!validTabs.has(workspaceTab as AdmissionCycleWorkspaceTab)) {
    notFound();
  }

  return (
    <AdmissionsCycleDetailWorkspace
      academicYearId={academicYearId}
      initialTab={workspaceTab as AdmissionCycleWorkspaceTab}
    />
  );
};

export default AdmissionCycleWorkspaceTabPage;
