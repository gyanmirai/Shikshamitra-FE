'use client';

import { useState } from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Tab, Tabs, Stack } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MonthlyPayslips from '../salarySlip-generate/salarySlipGenerate';
import SalaryDocumentsWorkspace from '../salarySlip-generate/salary-documents-workspace';

export default function SalaryDocumentCenter() {
  const [tab, setTab] = useState('monthly');
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Salary documents"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll', href: hrPaths.payroll.runPayroll },
          { name: 'Salary documents' },
        ]}
      />
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Salary document type"
      >
        <Tab
          id="salary-document-monthly-tab"
          aria-controls="salary-document-monthly"
          value="monthly"
          label="Monthly payslips"
        />
        <Tab
          id="salary-document-statement-tab"
          aria-controls="salary-document-statement"
          value="statement"
          label="Employee statements"
        />
        <Tab
          id="salary-document-register-tab"
          aria-controls="salary-document-register"
          value="register"
          label="School register"
        />
      </Tabs>
      <Box
        id="salary-document-monthly"
        role="tabpanel"
        aria-labelledby="salary-document-monthly-tab"
        hidden={tab !== 'monthly'}
      >
        <MonthlyPayslips hideHeading />
      </Box>
      <Box
        id="salary-document-statement"
        role="tabpanel"
        aria-labelledby="salary-document-statement-tab"
        hidden={tab !== 'statement'}
      >
        <SalaryDocumentsWorkspace kind="statement" active={tab === 'statement'} />
      </Box>
      <Box
        id="salary-document-register"
        role="tabpanel"
        aria-labelledby="salary-document-register-tab"
        hidden={tab !== 'register'}
      >
        <SalaryDocumentsWorkspace kind="register" active={tab === 'register'} />
      </Box>
    </Stack>
  );
}
