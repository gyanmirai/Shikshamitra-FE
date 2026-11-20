'use client';

import type { ReactNode } from 'react';

import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function CampusDispatchLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey="Library.CampusTransfers.Dispatch">
      {children}
    </ExactPermissionGuard>
  );
}
