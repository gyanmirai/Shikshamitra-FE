'use client';

import { useParams, useSearchParams } from 'next/navigation';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';

export default function SalaryTemplatePage() {
  const { templateId } = useParams<{ templateId: string }>();
  const params = useSearchParams();
  return (
    <SalaryTemplateEditor
      key={templateId}
      templateId={templateId}
      mode={params.get('mode') === 'view' ? 'view' : 'edit'}
    />
  );
}
