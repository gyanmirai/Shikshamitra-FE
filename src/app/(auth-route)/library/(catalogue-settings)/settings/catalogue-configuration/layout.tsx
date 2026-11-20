'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function CatalogueConfigurationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey={libraryPermissions.settings.catalogueConfiguration}>
      {children}
    </ExactPermissionGuard>
  );
}
