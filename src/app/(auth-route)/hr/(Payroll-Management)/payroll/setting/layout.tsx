'use client';

import { Box, Alert, Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PayrollSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.root}>
    <Box>
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button
            size="small"
            color="inherit"
            component={RouterLink}
            href="/hr/policies?tab=payroll"
          >
            Open Payroll Policies
          </Button>
        }
      >
        Policy rules are managed in Policies & Rules.
      </Alert>
      {children}
    </Box>
  </StudentPermissionGuard>
);

export default PayrollSettingLayout;
