'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ZoneAreaConfigLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.settings.zoneAreaConfiguration}>
    {children}
  </StudentPermissionGuard>
);

export default ZoneAreaConfigLayout;
