import AdmissionWorkflowBuilder from 'src/screens/student/admissions/admission-workflow-builder';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdmissionWorkflowBuilder workflowId={id} />;
}
