'use client';

import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';

export default function SalaryTemplateEditorPage() {
  const params = useParams<{ templateId: string; versionId: string }>();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Edit salary template"
        description="Choose payroll components and define how each amount is calculated."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Settings' },
          { name: 'Salary Templates' },
          { name: 'Edit Draft' },
        ]}
      />
      <SalaryTemplateEditor templateId={params.templateId} versionId={params.versionId} />
    </Box>
  );
}
