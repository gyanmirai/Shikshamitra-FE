'use client';

import type { RootState } from 'src/redux/store';
import type { HostTenant } from 'src/redux/host-tenants/types';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import { hostTenantPath } from 'src/constants/host-tenant-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useTenantTable } from './hooks/use-tenant-table';
import { tenantColumns } from './components/tenant-columns';
import TenantFormDialog from './components/tenant-form-dialog';
import TenantStatusDialog from './components/tenant-status-dialog';
import { tenantTouchStyles } from './services/tenant-accessibility';

export default function HostTenantsScreen() {
  const context = useSelector((state: RootState) => state.auth.sessionContext);
  const [form, setForm] = useState<{ tenant?: HostTenant } | null>(null);
  const [statusTenant, setStatusTenant] = useState<HostTenant | null>(null);
  const table = useTenantTable(context?.accountMode === 'host' && context.canViewTenants);
  const columns = context
    ? tenantColumns(context, (tenant) => setForm({ tenant }), setStatusTenant)
    : [];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        gap: 1,
        ...tenantTouchStyles,
      }}
    >
      <CustomBreadcrumbs
        heading="Tenant"
        description="Manage schools, their basic details and access."
        links={[{ name: 'Platform', href: hostTenantPath }, { name: 'Tenant' }]}
        action={
          <Button
            variant="contained"
            disabled={!context?.canCreateTenants}
            onClick={() => setForm({})}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add tenant
          </Button>
        }
      />
      {!context?.canViewTenants ? (
        <Alert severity="warning">
          You do not have permission to view tenants. Contact the platform administrator.
        </Alert>
      ) : (
        <>
          <Box sx={{ px: 1 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={table.status}
              onChange={(event) => table.changeStatus(event.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomizableTable
              tableId="host-tenant-table"
              columns={columns}
              data={table.query.currentData?.items ?? []}
              isLoading={table.query.isFetching}
              isPagination
              isSearch
              isFilter={false}
              serverSidePagination
              serverSideSearch
              serverSideSort
              serverSideSortMode="single"
              onServerPagination={table.paginate}
              onServerSearch={table.search}
              onServerSort={table.sort}
              totalCount={table.query.currentData?.totalCount ?? 0}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              searchTerm={table.filter}
              rowsPerPageOptions={[10, 25, 50, 100]}
              noDataText={
                table.filter || table.status !== 'all'
                  ? 'No tenants match these filters.'
                  : 'No tenants yet. Add your first school.'
              }
              errorContent={
                table.query.isError && (
                  <Alert
                    severity="error"
                    action={<Button onClick={() => table.query.refetch()}>Retry</Button>}
                  >
                    Unable to load tenants.
                  </Alert>
                )
              }
              wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
              tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
            />
          </Box>
        </>
      )}
      {form && (
        <TenantFormDialog
          key={form.tenant?.id ?? 'new'}
          tenant={form.tenant}
          onClose={() => setForm(null)}
        />
      )}
      {statusTenant && (
        <TenantStatusDialog
          key={statusTenant.id}
          tenant={statusTenant}
          onClose={() => setStatusTenant(null)}
        />
      )}
    </Box>
  );
}
