'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import { convertBase64Format } from 'src/utils/base64Formate';
import { Box, Avatar, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PermissionForm } from '../role';
import { AccessControlForm } from '../accessControl';
import PermissionAccessForm from '../role/permission-access-form';

const UserManagementScreen = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManagePermissions = hasGrantedPermission(
    permissions,
    'AbpIdentity.Users.ManagePermissions'
  );
  const canManageScope = hasGrantedPermission(permissions, 'ShikshaMitra.UserScope.Manage');
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const yearSuffix = currentYear?.name ? ` - ${currentYear.name}` : '';

  // Dialog control hook for permissions dialog
  const dialog = useBoolean();

  // State to store selected user data
  const [user, setUser] = useState<any>(null);
  const [permissionBusy, setPermissionBusy] = useState(false);

  // Dialog control hook for academic permissions dialog
  const academicDialog = useBoolean();

  // Dialog control hook for visibility dialog
  const visibilityDialog = useBoolean();

  // Query hook to fetch users data with loading state
  const { data: users, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUsersQuery,
  });

  // Transform users data to include formatted full name
  const tableData = users?.items?.map((item: any) => ({
    ...item,
    userName: `${item?.name} ${item?.surname || ''}`,
  }));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="User Management"
        description="The process of creating, managing, and controlling user accounts, roles, and permissions within a system to ensure secure and efficient access to resources."
        links={[
          { name: 'Security', href: '/security/role' },
          { name: 'Role And Permission', href: '/security/role' },
          { name: 'User Management' },
        ]}
      />

      <CustomizableTable
        tableId="user-management-table"
        isLoading={isLoading}
        data={tableData || []}
        searchFieldProps={{
          placeholder: 'Search by Name',
          label: 'Search by Name',
          sx: { width: 300 },
        }}
        columns={[
          {
            id: 'userName',
            label: 'Full Name',
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    alt={value}
                    src={row.profilePicture ? convertBase64Format(row.profilePicture) : ''}
                    sx={{ height: 32, width: 32 }}
                  />{' '}
                  {value}
                </Box>
              );
            },
          },
          {
            label: 'Action',
            id: 'action',
            minWidth: 80,
            isSort: false,
            isFilter: false,
            sticky: true,
            render: (value, data) => (
              <ThreeDotsActions
                showThreeDots={canManagePermissions || canManageScope}
                placement="right-center"
                actions={({ popover }) => (
                  <MenuList>
                    {canManagePermissions && [
                      <MenuItem
                        key="visibility"
                        onClick={() => {
                          setUser(data as any);
                          popover.onClose();
                          visibilityDialog.onTrue();
                        }}
                      >
                        <Iconify icon="material-symbols:beenhere-outline" />
                        Set Module Visibility
                      </MenuItem>,
                      <MenuItem
                        key="permissions"
                        onClick={() => {
                          popover.onClose();
                          dialog.onTrue();
                          setUser(data as any);
                        }}
                      >
                        <Iconify icon="mdi:account-lock" />
                        Module Permission
                      </MenuItem>,
                    ]}
                    {canManageScope && (
                      <MenuItem
                        onClick={() => {
                          setUser(data as any);
                          popover.onClose();
                          academicDialog.onTrue();
                        }}
                      >
                        <Iconify icon="material-symbols:beenhere-outline" />
                        Academic Permission
                      </MenuItem>
                    )}
                  </MenuList>
                )}
              />
            ),
          },
        ]}
      />
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
        <PermissionForm
          editData={user}
          handleClose={dialog.onFalse}
          providerName="U"
          onBusyChange={setPermissionBusy}
        />
      </CustomDialog>
      <CustomDialog
        fullScreen
        title={`Academic Permission${yearSuffix}`}
        open={academicDialog.value}
        handleClose={academicDialog.onFalse}
      >
        <AccessControlForm user={user} handleClose={academicDialog.onFalse} />
      </CustomDialog>
      <CustomDialog
        fullScreen
        title="Set Visibility"
        open={visibilityDialog.value}
        disableClose={permissionBusy}
        paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
        handleClose={visibilityDialog.onFalse}
      >
        <VisibilityForm
          editData={user}
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
