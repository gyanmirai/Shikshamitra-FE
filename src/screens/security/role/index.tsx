'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { securityPaths } from 'src/constants/security-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RoleTable from './role-table';
import RoleFormDialog from './role-form-dialog';
import RoleDeleteDialog from './role-delete-dialog';
import RolePermissionDialogs from './role-permission-dialogs';

import type { RoleRecord, RoleDialogState } from './role-form-values';

export { default as PermissionForm } from './permission-access-form';

const RoleScreen = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, 'AbpIdentity.Roles.Create');
  const [dialog, setDialog] = useState<RoleDialogState | null>(null);
  const close = () => setDialog(null);
  const open = (type: RoleDialogState['type'], role: RoleRecord) => setDialog({ type, role });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Role Management"
        description="Manage roles, employee availability, module visibility, and permissions."
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' } },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        links={[
          { name: 'Security', href: securityPaths.roleAndPermission.role },
          { name: 'Role And Permission', href: securityPaths.roleAndPermission.role },
          { name: 'Role Management' },
        ]}
        action={
          canCreate && (
            <Button
              type="button"
              aria-label="Add Role"
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => setDialog({ type: 'form', role: null })}
            >
              Role
            </Button>
          )
        }
      />
      <RoleTable
        canCreate={canCreate}
        onCreate={() => setDialog({ type: 'form', role: null })}
        onAction={open}
      />
      {dialog?.type === 'form' && <RoleFormDialog role={dialog.role} onClose={close} />}
      {dialog?.type === 'delete' && dialog.role && (
        <RoleDeleteDialog role={dialog.role} onClose={close} />
      )}
      {(dialog?.type === 'permissions' || dialog?.type === 'visibility') && dialog.role && (
        <RolePermissionDialogs mode={dialog.type} role={dialog.role} onClose={close} />
      )}
    </Box>
  );
};

export default RoleScreen;
