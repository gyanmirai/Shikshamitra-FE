'use client';

import { useParams } from 'next/navigation';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';

export default function SalaryTemplateEditorPage() {
  const params = useParams<{ templateId: string }>();

  return <SalaryTemplateEditor templateId={params.templateId} mode="edit" />;
}
