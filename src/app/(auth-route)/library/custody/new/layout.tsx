'use client';

import type { ReactNode } from 'react';

import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function NewCustodyLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey="Library.Custody.Add">{children}</ExactPermissionGuard>
  );
}
