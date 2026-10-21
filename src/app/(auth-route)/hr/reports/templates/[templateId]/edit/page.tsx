import ReportsScreen from 'src/screens/hr/reports';

export default async function Page({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  return <ReportsScreen view="design" templateId={templateId} />;
}
