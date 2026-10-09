import SalaryEditorScreen from 'src/screens/hr/payroll/structure/salary-editor-screen';

export default async function SalaryEditorPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <SalaryEditorScreen employeeId={employeeId} />;
}
