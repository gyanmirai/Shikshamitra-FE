'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AnnouncementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.announcement}>
    {children}
  </StudentPermissionGuard>
);

export default AnnouncementLayout;
