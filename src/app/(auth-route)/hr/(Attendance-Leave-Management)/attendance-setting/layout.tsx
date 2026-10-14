'use client';

import { Box } from '@mui/material';
import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.attendance.setting.root}>
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
  </StudentPermissionGuard>
);

export default AttendanceSettingLayout;
