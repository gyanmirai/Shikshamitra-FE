'use client';

import _ from 'lodash';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import React, { useRef, useState, useEffect } from 'react';
import { convertBase64Format } from 'src/utils/base64Formate';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Avatar, MenuList, MenuItem, DialogActions, CircularProgress } from '@mui/material';
import {
  useGetPermissionsQuery,
  useUpdatePermissionMutation,
} from 'src/redux/permission/permissionApi';

import Visibility from '../role/visibility';
import { AccessControlForm } from '../accessControl';
import { PermissionForm, extractGrantedPermissions } from '../role';

const UserManagementScreen = () => {
  // Dialog control hook for permissions dialog
  const dialog = useBoolean();

  // State to store selected user data
  const [user, setUser] = useState<any>(null);
  console.log('user---', user);
  const [permissioNData, setPermissionData] = useState<{ name: string; isGranted: boolean }[]>([]);

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
                placement="right-center"
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setUser(data as any);
                        popover.onClose();
                        visibilityDialog.onTrue();
                      }}
                    >
                      <Iconify icon="material-symbols:beenhere-outline" />
                      Set Visibility
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        dialog.onTrue();
                        setUser(data as any);
                      }}
                    >
                      <Iconify icon="mdi:account-lock" />
                      Permissions
                    </MenuItem>
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
        handleClose={() => {
          dialog.onFalse();
          setUser(null);
        }}
      >
        <PermissionForm editData={user} handleClose={dialog.onFalse} providerName="U" />
      </CustomDialog>
      <CustomDialog
        fullScreen
        title="Academic Permission"
        open={academicDialog.value}
        handleClose={academicDialog.onFalse}
      >
        <AccessControlForm user={user} handleClose={academicDialog.onFalse} />
      </CustomDialog>
      <CustomDialog
        fullScreen
        title="Set Visibility"
        open={visibilityDialog.value}
        handleClose={visibilityDialog.onFalse}
      >
        <VisibilityForm editData={user} handleClose={visibilityDialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};
export default UserManagementScreen;

const VisibilityForm = ({ editData, handleClose }: any) => {
  const initialData = useRef<{ name: string; isGranted: boolean }[]>([]);
  const [visibilityData, setVisibilityData] = useState<{ name: string; isGranted: boolean }[]>([]);
  // Mutation hook to update permissions
  const [updatePermission, { isLoading: isUpdatePermissionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });

  // Query hook to fetch permission data based on role name
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _permissionData, isLoading: isPermissionLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPermissionsQuery,
    params: { providerName: 'U', providerKey: editData?.id },
    options: {
      skip: !editData,
    },
  });
  useEffect(() => {
    if (_permissionData?.groups?.length > 0) {
      const init = extractGrantedPermissions(_permissionData?.groups);
      setVisibilityData(init);
      initialData.current = init;
    }
  }, [_permissionData]);
  return (
    <>
      <DialogScrollContent
        sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        scrollBarProps={{ sx: { overflow: 'hidden' } }}
      >
        {isPermissionLoading ? (
          <CircularProgress />
        ) : (
          <Visibility setVisibility={setVisibilityData} visibility={visibilityData} />
        )}
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdatePermissionLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={async () => {
            const diff = _.differenceWith(visibilityData, initialData.current, _.isEqual);
            await updatePermission({
              providerName: 'U',
              providerKey: editData?.id,
              data: {
                permissions: diff,
              },
            });
            shikshaMitraToast.success({
              message: 'Updated Visibility successfully',
            });
            handleClose();
          }}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
