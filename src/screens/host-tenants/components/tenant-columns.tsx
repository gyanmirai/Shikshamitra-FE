import type { IColumn } from 'src/components/customizabaleTable/types';
import type { HostTenant, HostSessionContext } from 'src/redux/host-tenants/types';

import { Label } from 'src/components/label';
import Typography from '@mui/material/Typography';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

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
      render: (code: string) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {code}
        </Typography>
      ),
    },
    {
      id: 'instituteName',
      label: 'Institute',
      filterType: 'string',
      isFilter: false,
      isSort: true,
      minWidth: 220,
      render: (name: string) => name || '—',
    },
    {
      id: 'email',
      label: 'Email',
      isFilter: false,
      isSort: false,
      minWidth: 200,
      render: (email: string) => email || '—',
    },
    {
      id: 'contactNumber',
      label: 'Contact',
      isFilter: false,
      isSort: false,
      minWidth: 140,
      render: (contact: string) => contact || '—',
    },
    {
      id: 'isActive',
      label: 'Status',
      isFilter: false,
      isSort: true,
      sticky: true,
      stickyPosition: 'right',
      width: 110,
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
      stickyPosition: 'right',
      align: 'right',
      excludeFromExport: true,
      width: 124,
      minWidth: 124,
      render: (_value, row) => {
        const tenant = row as HostTenant;
        const statusAction = tenant.isActive ? 'Deactivate' : 'Activate';
        return (
          <AdaptiveThreeDotsActions
            moreLabel={`More actions for ${tenant.instituteName}`}
            sx={{ justifyContent: 'flex-end' }}
            actions={[
              {
                id: 'edit',
                label: `Edit ${tenant.instituteName}`,
                icon: 'mdi:pencil-outline',
                disabled: !context.canUpdateTenants,
                tooltip: context.canUpdateTenants
                  ? 'Edit'
                  : 'You do not have permission to edit tenants.',
                onClick: () => edit(tenant),
              },
              {
                id: 'status',
                label: `${statusAction} ${tenant.instituteName}`,
                icon: 'mdi:power',
                color: tenant.isActive ? 'warning.main' : 'success.main',
                disabled: !context.canManageTenantStatus,
                tooltip: context.canManageTenantStatus
                  ? statusAction
                  : 'You do not have permission to change tenant status.',
                onClick: () => changeStatus(tenant),
              },
            ]}
          />
        );
      },
    },
  ];
}
