import type { ReactNode } from 'react';

import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function Layout({ children }: { children: ReactNode }) { return <StudentPermissionGuard permissionKey="Students.Records.Changes.View">{children}</StudentPermissionGuard>; }
