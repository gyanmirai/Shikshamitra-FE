'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { hasGrantedPermission, hasNavigationPermission } from 'src/utils/permissions';
import {
  hrPaths,
  hrPermissions,
  payrollDocumentPages,
  payslipViewPermission,
} from 'src/constants/hr-menus';

import MonthlyPayslipsWorkspace from './monthly-payslips-workspace';
import { usePayrollMonth } from '../payroll-cycle/use-payroll-month';
import SalaryDocumentsWorkspace from '../salarySlip-generate/salary-documents-workspace';

export default function PayrollDocumentPage({ kind }: { kind: keyof typeof payrollDocumentPages }) {
  const [month] = usePayrollMonth();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { title } = payrollDocumentPages[kind];
  const isMonthly = kind === 'monthly';
  const canView =
    hasGrantedPermission(permissions, payslipViewPermission) &&
    (isMonthly || hasGrantedPermission(permissions, hrPermissions.reportActions.view));
  const canOpenSettings =
    hasNavigationPermission(permissions, hrPermissions.payroll.settings.root) &&
    hasGrantedPermission(permissions, hrPermissions.payroll.settings.payrollDocuments);

  if (!canView) return <View403 />;

  return (
    <Stack
      spacing={1}
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: 1,
        overflowY:
          kind === 'register'
            ? 'auto'
            : kind === 'statement'
              ? { xs: 'auto', sm: 'hidden' }
              : 'hidden',
        ...(kind === 'register' && { '& > *': { flexShrink: 0 } }),
      }}
    >
      <CustomBreadcrumbs
        heading={title}
        description={
          isMonthly
            ? 'Browse issued payslips by staff member or pay period.'
            : 'Saved payroll records for the selected period. Missing months and historical fields appear as unavailable.'
        }
        sx={{ minHeight: 40, flexShrink: 0 }}
        links={[
          {
            name: 'Payroll Management',
            href: `${hrPaths.payroll.root}?month=${month.format('YYYY-MM')}`,
          },
          { name: 'Payslips & Reports' },
          { name: title },
        ]}
        action={
          canOpenSettings && (
            <Button
              component={RouterLink}
              href={hrPaths.payroll.settings.payrollDocuments}
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:cog-outline" />}
            >
              Settings
            </Button>
          )
        }
      />
      {isMonthly ? <MonthlyPayslipsWorkspace /> : <SalaryDocumentsWorkspace kind={kind} />}
    </Stack>
  );
}
