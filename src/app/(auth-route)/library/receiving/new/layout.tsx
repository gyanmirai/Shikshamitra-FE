'use client';

import type { ReactNode } from 'react';

import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function ReceiveNewStockLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey="Library.Receiving.Add">{children}</ExactPermissionGuard>
  );
}
