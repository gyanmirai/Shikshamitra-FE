'use client';

import { Box, Alert, Button } from '@mui/material';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.attendance.setting.root}>
    <Box>
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button size="small" color="inherit" href={hrPaths.policies.attendance}>
            Open Attendance Policies
          </Button>
        }
      >
        Use this area for simple attendance setup. Advanced attendance rules are managed in Policies
        & Rules.
      </Alert>
      {children}
    </Box>
  </StudentPermissionGuard>
);

export default AttendanceSettingLayout;
