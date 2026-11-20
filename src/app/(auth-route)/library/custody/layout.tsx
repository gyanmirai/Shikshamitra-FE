'use client';

import type { ReactNode } from 'react';

import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function CustodyLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey="Library.Custody.View">
      <ExactPermissionGuard permissionKey="Library.AllBooks.View">{children}</ExactPermissionGuard>
    </ExactPermissionGuard>
  );
}
