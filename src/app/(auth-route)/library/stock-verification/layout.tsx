'use client';

import type { ReactNode } from 'react';

import { libraryPermissions } from 'src/constants/library-menus';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function LibraryStockVerificationLayout({ children }: { children: ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey={libraryPermissions.stockVerification}>
      <ExactPermissionGuard permissionKey={libraryPermissions.allBooks}>
        {children}
      </ExactPermissionGuard>
    </ExactPermissionGuard>
  );
}
