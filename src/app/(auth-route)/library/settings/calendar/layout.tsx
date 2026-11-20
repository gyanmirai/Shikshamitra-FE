'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function LibraryCalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={libraryPermissions.settings.calendar}>
      {children}
    </StudentPermissionGuard>
  );
}
