'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AnnouncementTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.settings.announcementType}>
    {children}
  </StudentPermissionGuard>
);

export default AnnouncementTypeLayout;
