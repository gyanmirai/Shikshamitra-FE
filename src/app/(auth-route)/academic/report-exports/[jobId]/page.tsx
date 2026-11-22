import { notFound } from 'next/navigation';
import { academicReportIdPattern } from 'src/constants/academic-report-paths';
import { AcademicReportRecoveryScreen } from 'src/screens/academic/components/reports/AcademicReportRecoveryScreen';

export default async function AcademicReportExportPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  if (!academicReportIdPattern.test(jobId)) notFound();
  return <AcademicReportRecoveryScreen jobId={jobId} />;
}
