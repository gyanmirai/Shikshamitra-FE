'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Box, Card, Stack } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PayslipSettingsForm from '../salarySlip-generate/payslip-settings-form';

export default function PayslipStatementSettings() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.payrollDocuments
  );
  const canEdit = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.generateSalarySlip}.Add`
  );

  return (
    <Stack spacing={2} sx={{ height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
      <CustomBreadcrumbs
        heading="Payslip & statement settings"
        description="Set payslip appearance, statement columns and delivery defaults for new documents."
        sx={{
          '& .MuiBreadcrumbs-root': { minWidth: 0 },
          '& .MuiBreadcrumbs-li': { flexShrink: 0, whiteSpace: 'nowrap' },
        }}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Settings', href: hrPaths.payroll.settings.root },
          { name: 'Payslip & statement settings' },
        ]}
      />
      {canView ? (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            maxWidth: 1000,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!canEdit && (
            <HrNotice role="alert" severity="info" sx={{ mb: 2 }}>
              You can view these settings. Editing requires payslip and statement settings access.
            </HrNotice>
          )}
          <Box
            sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <PayslipSettingsForm canEdit={canEdit} />
          </Box>
        </Card>
      ) : (
        <HrNotice role="alert" severity="info">You do not have access to payslip and statement settings.</HrNotice>
      )}
    </Stack>
  );
}
