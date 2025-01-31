'use client';

import React from 'react';

import { Box, Avatar, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignModule from '../role/modules';

const UserManagementScreen = () => {
  const dialog = useBoolean();
  const { data: employee, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  const tableData = employee?.items?.map((item: any) => ({
    ...item,

    roleValue: item?.role?.name || 'Not Assigned',
    statusValue: EmployeeStatusType[item?.employeeStatusType],
  }));
  return (
    <Box>
      <CustomBreadcrumbs
        heading="User Management"
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'User Management' }]}
        sx={{ px: 1, mb: 3 }}
      />

      <CustomizableTable
        tableId="user-management-table"
        isLoading={isLoading}
        data={tableData || []}
        columns={[
          {
            id: 'employeeName',
            label: 'Full Name',
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    alt={value}
                    src={convertBase64Format(row.profilePicture)}
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
                  </MenuList>
                )}
              />
            ),
          },
        ]}
      />
      <CustomDialog fullScreen title="Permissions" open={dialog.value} handleClose={dialog.onFalse}>
        <UserPermission />
      </CustomDialog>
    </Box>
  );
};

export default UserManagementScreen;

const UserPermission = () => {
  const a = null;
  return (
    <Box>
      <AssignModule />
    </Box>
  );
};
