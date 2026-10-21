'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { securityPaths } from 'src/constants/security-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import UserTable from './user-table';
import PermissionAccessForm from '../role/permission-access-form';
import AcademicPermissionDialog from './academic-permission-dialog';

import type { UserRecord, UserActionHandler } from './user-record';

const UserManagementScreen = () => {
  const dialog = useBoolean();
  const academicDialog = useBoolean();
  const visibilityDialog = useBoolean();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [permissionBusy, setPermissionBusy] = useState(false);
  const onAction: UserActionHandler = (action, selectedUser) => {
    setUser(selectedUser);
    if (action === 'visibility') visibilityDialog.onTrue();
    if (action === 'permissions') dialog.onTrue();
    if (action === 'academic') academicDialog.onTrue();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="User Management"
        description="Review user accounts and manage module visibility, permissions, and academic access."
        links={[
          { name: 'Security', href: securityPaths.roleAndPermission.role },
          { name: 'Role And Permission', href: securityPaths.roleAndPermission.role },
          { name: 'User Management' },
        ]}
      />
      <UserTable onAction={onAction} />
      <CustomDialog
        fullScreen
        title={`Permissions of ${user?.userName}`}
        open={dialog.value}
        disableClose={permissionBusy}
        paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
        handleClose={() => {
          dialog.onFalse();
          setUser(null);
        }}
      >
        <PermissionAccessForm
          editData={{ id: user?.id, userName: user?.userName }}
          handleClose={dialog.onFalse}
          providerName="U"
          onBusyChange={setPermissionBusy}
        />
      </CustomDialog>
      <AcademicPermissionDialog
        key={`${academicDialog.value}:${user?.id}`}
        open={academicDialog.value}
        user={user}
        onClose={academicDialog.onFalse}
      />
      <CustomDialog
        fullScreen
        title="Set Visibility"
        open={visibilityDialog.value}
        disableClose={permissionBusy}
        paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
        handleClose={visibilityDialog.onFalse}
      >
        <VisibilityForm
          editData={{ id: user?.id, userName: user?.userName }}
          handleClose={visibilityDialog.onFalse}
          onBusyChange={setPermissionBusy}
        />
      </CustomDialog>
    </Box>
  );
};
export default UserManagementScreen;

const VisibilityForm = (
  props: Omit<React.ComponentProps<typeof PermissionAccessForm>, 'providerName' | 'mode'>
) => <PermissionAccessForm {...props} providerName="U" mode="visibility" />;
