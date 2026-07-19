'use client';

import { Box, Alert, Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PayrollSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.root}>
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Alert
        severity="info"
        sx={{ mb: 2, flexShrink: 0 }}
        action={
          <Button
            size="small"
            color="inherit"
            component={RouterLink}
            href={hrPaths.policies.payroll}
          >
            Open Payroll Policies
          </Button>
        }
      >
        Policy rules are managed in Policies & Rules.
      </Alert>
      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  </StudentPermissionGuard>
);

export default PayrollSettingLayout;
