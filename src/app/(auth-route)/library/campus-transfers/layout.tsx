'use client';

import type { ReactNode } from 'react';

import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function CampusTransferLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey="Library.CampusTransfers.View">
      <ExactPermissionGuard permissionKey="Library.AllBooks.View">{children}</ExactPermissionGuard>
    </ExactPermissionGuard>
  );
}
