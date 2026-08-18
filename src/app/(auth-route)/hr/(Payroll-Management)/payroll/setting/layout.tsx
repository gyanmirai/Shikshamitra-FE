'use client';

import { Box } from '@mui/material';
import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PayrollSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.root}>
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  </StudentPermissionGuard>
);

export default PayrollSettingLayout;
