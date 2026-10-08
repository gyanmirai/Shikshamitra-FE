import type { IColumn } from 'src/components/customizabaleTable/types';
import type { HostTenant, HostSessionContext } from 'src/redux/host-tenants/types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Label } from 'src/components/label';

export function tenantColumns(
  context: HostSessionContext,
  edit: (tenant: HostTenant) => void,
  changeStatus: (tenant: HostTenant) => void
): IColumn[] {
  return [
    {
      id: 'name',
      label: 'School code',
      filterType: 'string',
      isFilter: false,
      isSort: true,
      minWidth: 160,
    },
    {
      id: 'instituteName',
      label: 'Institute',
      filterType: 'string',
      isFilter: false,
      isSort: true,
      minWidth: 220,
    },
    { id: 'email', label: 'Email', isFilter: false, isSort: false, minWidth: 200 },
    { id: 'contactNumber', label: 'Contact', isFilter: false, isSort: false, minWidth: 140 },
    {
      id: 'isActive',
      label: 'Status',
      isFilter: false,
      isSort: true,
      sticky: true,
      minWidth: 100,
      render: (active: boolean) => (
        <Label color={active ? 'success' : 'warning'}>{active ? 'Active' : 'Inactive'}</Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      isFilter: false,
      isSort: false,
      sticky: true,
      excludeFromExport: true,
      minWidth: 170,
      render: (_value, row) => (
        <Stack direction="row" gap={0.5}>
          <Button
            size="small"
            disabled={!context.canUpdateTenants}
            aria-label={`Edit ${row.instituteName}`}
            onClick={() => edit(row as HostTenant)}
          >
            Edit
          </Button>
          <Button
            size="small"
            disabled={!context.canManageTenantStatus}
            onClick={() => changeStatus(row as HostTenant)}
            aria-label={`${row.isActive ? 'Deactivate' : 'Activate'} ${row.instituteName}`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Stack>
      ),
    },
  ];
}
