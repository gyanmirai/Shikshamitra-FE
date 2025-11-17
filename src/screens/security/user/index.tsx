'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import { convertBase64Format } from 'src/utils/base64Formate';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Avatar, Button, MenuList, MenuItem, DialogActions } from '@mui/material';

import AssignModule from '../role/modules';
import { AccessControlForm } from '../accessControl';

const UserManagementScreen = () => {
  // Dialog control hook for permissions dialog
  const dialog = useBoolean();

  // State to store selected user data
  const [user, setUser] = useState(null);

  // Dialog control hook for academic permissions dialog
  const academicDialog = useBoolean();

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
        sx={{ mb: 1 }}
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
        <DialogScrollContent
          sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          scrollBarProps={{
            sx: {
              '& .simplebar-content': {
                height: '100%',
              },
            },
          }}
        >
          <AssignModule />
        </DialogScrollContent>
        <DialogActions sx={{ flexShrink: 0 }}>
          <Button size="small" onClick={dialog.onFalse}>
            Cancel
          </Button>
          <Button size="small" type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
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
