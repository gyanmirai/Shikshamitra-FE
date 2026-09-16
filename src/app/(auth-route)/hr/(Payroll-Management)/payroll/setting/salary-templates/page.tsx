'use client';

import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SalaryTemplateSettings from 'src/screens/hr/payroll/setting/salary-templates';

export default function SalaryTemplatesPage() {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Salary Templates"
        description="Configure reusable salary defaults for fast, consistent employee payroll setup."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Settings' },
          { name: 'Salary Templates' },
        ]}
      />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <SalaryTemplateSettings />
      </Box>
    </Box>
  );
}
