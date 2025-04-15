'use client';

import React, { useState } from 'react';

import { Box, Avatar, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';

import { useGetUsersQuery } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignModule from '../role/modules';
import { AccessControlForm } from '../accessControl';

const UserManagementScreen = () => {
  const dialog = useBoolean();
  const [user, setUser] = useState(null);
  const academicDialog = useBoolean();
  const { data: users, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUsersQuery,
  });
  const tableData = users?.items?.map((item: any) => ({
    ...item,

    userName: `${item?.name} ${item?.surname || ''}`,
  }));
  return (
    <Box>
      <CustomBreadcrumbs
        heading="User Management"
        description="The process of creating, managing, and controlling user accounts, roles, and permissions within a system to ensure secure and efficient access to resources."
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'User Management' }]}
        sx={{ px: 1, mb: 3 }}
      />

      <CustomizableTable
        noDataText={<>No User Found </>}
        tableId="user-management-table"
        isLoading={isLoading}
        data={tableData || []}
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
            render: (value, data) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        dialog.onTrue();
                      }}
                    >
                      <Iconify icon="fluent-mdl2:permissions" />
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
      <CustomDialog fullScreen title="Permissions" open={dialog.value} handleClose={dialog.onFalse}>
        <AssignModule />
      </CustomDialog>
      <CustomDialog
        maxWidth="md"
        title="Academic Permission"
        open={academicDialog.value}
        handleClose={academicDialog.onFalse}
      >
        <AccessControlForm user={user} handleClose={academicDialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

export default UserManagementScreen;
