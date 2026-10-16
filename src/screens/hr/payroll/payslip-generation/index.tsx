'use client';

import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Stack } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MonthlyPayslips from '../salarySlip-generate/salarySlipGenerate';
import SalaryDocumentsWorkspace from '../salarySlip-generate/salary-documents-workspace';

const DOCUMENT_TABS = [
  { value: 'monthly', label: 'Monthly payslips' },
  { value: 'statement', label: 'Employee statements' },
  { value: 'register', label: 'School register' },
];

export default function SalaryDocumentCenter() {
  const tabs = useTabs(DOCUMENT_TABS[0].value);
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Salary documents"
        description="Review monthly payslips, employee salary statements and the school payroll register."
        sx={{ minHeight: 40 }}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll', href: hrPaths.payroll.runPayroll },
          { name: 'Salary documents' },
        ]}
      />
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Salary document type"
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        {DOCUMENT_TABS.map((tab) => (
          <Tab
            key={tab.value}
            id={`salary-document-${tab.value}-tab`}
            aria-controls={`salary-document-${tab.value}`}
            value={tab.value}
            label={tab.label}
          />
        ))}
      </CustomTabs>
      <Box
        id="salary-document-monthly"
        role="tabpanel"
        aria-labelledby="salary-document-monthly-tab"
        hidden={tabs.value !== 'monthly'}
      >
        <MonthlyPayslips hideHeading />
      </Box>
      <Box
        id="salary-document-statement"
        role="tabpanel"
        aria-labelledby="salary-document-statement-tab"
        hidden={tabs.value !== 'statement'}
      >
        <SalaryDocumentsWorkspace kind="statement" active={tabs.value === 'statement'} />
      </Box>
      <Box
        id="salary-document-register"
        role="tabpanel"
        aria-labelledby="salary-document-register-tab"
        hidden={tabs.value !== 'register'}
      >
        <SalaryDocumentsWorkspace kind="register" active={tabs.value === 'register'} />
      </Box>
    </Stack>
  );
}
