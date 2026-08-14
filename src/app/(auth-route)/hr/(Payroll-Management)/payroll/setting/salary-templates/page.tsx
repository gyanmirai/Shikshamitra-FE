'use client';

import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SalaryTemplateSettings from 'src/screens/hr/payroll/setting/salary-templates';

export default function SalaryTemplatesPage() {
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Salary Templates"
        description="Create versioned salary structure templates for employee payroll onboarding."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Settings' },
          { name: 'Salary Templates' },
        ]}
      />
      <SalaryTemplateSettings />
    </Box>
  );
}
