import ReportsScreen from 'src/screens/hr/reports';

export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return <ReportsScreen view="result" runId={runId} />;
}
