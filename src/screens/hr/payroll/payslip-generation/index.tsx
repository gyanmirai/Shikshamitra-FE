'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { RouterLink } from 'src/routes/components';
import { Box, Tab, Stack, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { hasGrantedPermission, hasNavigationPermission } from 'src/utils/permissions';

import MonthlyPayslips from '../salarySlip-generate/salarySlipGenerate';
import SalaryDocumentsWorkspace from '../salarySlip-generate/salary-documents-workspace';

const DOCUMENT_TABS = [
  { value: 'monthly', label: 'Monthly payslips' },
  { value: 'statement', label: 'Employee statements' },
  { value: 'register', label: 'School register' },
];

export default function SalaryDocumentCenter() {
  const tabs = useTabs(DOCUMENT_TABS[0].value);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canOpenSettings =
    hasNavigationPermission(permissions, hrPermissions.payroll.settings.root) &&
    hasGrantedPermission(permissions, hrPermissions.payroll.settings.payrollDocuments);
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
      {canOpenSettings && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            component={RouterLink}
            href={hrPaths.payroll.settings.payrollDocuments}
            size="small"
          >
            Document settings
          </Button>
        </Box>
      )}
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
