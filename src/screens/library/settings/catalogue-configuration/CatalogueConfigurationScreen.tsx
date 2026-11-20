'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Stack, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { libraryPaths, libraryPermissions } from 'src/constants/library-menus';

import { CatalogueConfigurationEditor } from './CatalogueConfigurationEditor';
import { useCatalogueConfigurationSnapshot } from './useCatalogueConfigurationSnapshot';

export default function CatalogueConfigurationScreen() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRead = hasGrantedPermission(
    permissions,
    libraryPermissions.settings.catalogueConfiguration
  );
  const query = useCatalogueConfigurationSnapshot(canRead);
  const [busy, setBusy] = useState(false);
  const data = query.opened ? query.current || query.opened : null;
  const canManage =
    Boolean(data?.canManageConfiguration) &&
    !query.isError &&
    hasGrantedPermission(permissions, libraryPermissions.settings.catalogueConfigurationUpdate) &&
    canRead;
  return (
    <Stack spacing={2}>
      <CustomBreadcrumbs
        heading="Catalogue Configuration"
        description="Configure descriptive catalogue requirements and school choices."
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Catalogue Configuration' },
        ]}
      />
      {!canRead && (
        <Alert severity="info">Catalogue configuration view permission is required.</Alert>
      )}
      {query.error && (
        <Alert
          severity="error"
          action={
            <Button size="small" disabled={busy || query.loading} onClick={query.retry}>
              Retry
            </Button>
          }
        >
          {query.error} Existing drafts are retained.
        </Alert>
      )}
      {!data && query.loading && <Skeleton variant="rounded" height={180} />}
      {data && query.opened && (
        <CatalogueConfigurationEditor
          data={data}
          initialData={query.opened}
          canManage={canManage}
          reload={query.reload}
          onBusyChange={setBusy}
        />
      )}
    </Stack>
  );
}
