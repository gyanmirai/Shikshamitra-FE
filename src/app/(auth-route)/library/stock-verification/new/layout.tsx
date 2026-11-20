'use client';

import type { ReactNode } from 'react';

import { libraryPermissions } from 'src/constants/library-menus';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function OpenStockCountLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey={libraryPermissions.stockVerificationAdd}>
      {children}
    </ExactPermissionGuard>
  );
}
