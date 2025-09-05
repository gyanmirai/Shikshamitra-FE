'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

const LibraryPermissionSettingScreen = () => {
  const data = [
    { roleName: 'Librarian', permission: ['Full Access'] },
    { roleName: 'Teacher', permission: ['Book Reservations', 'Resource Requests'] },
    { roleName: 'Student', permission: ['Limited Access'] },
  ];

  const addRoleAndPermissionDialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any>();
  const [isEdit, setIsEdit] = useState<any>(false);
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Permission Setting"
          links={[
            { name: 'Library' },
            { name: 'Setting' },
            { name: 'Permission Setting' },
            // {
            //   name:
            //     searchParams.tab !== 'Fee-structure-overview'
            //       ? 'Student Fee Management'
            //       : 'Fee-Structure-Overview',
            // },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box display="flex" flexDirection="row" justifyContent="flex-end">
          <Button
            startIcon={<Add />}
            onClick={() => {
              setIsEdit(false);
              addRoleAndPermissionDialog.onTrue();
            }}
            variant="contained"
            size="small"
          >
            Add Role And Permission
          </Button>
        </Box>
      </Box>

      <CustomizableTable
        tableId="library-permission-setting-table"
        isFilter={false}
        isShowedDense={false}
        isSearch={false}
        columns={[
          { id: 'roleName', label: 'Role' },
          {
            id: 'permission',
            label: 'Permission',
            render: (value, row) => (
              <Typography fontSize="12PX">{row.permission.join(', ')}</Typography>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover: pop }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          addRoleAndPermissionDialog.onTrue();

                          setSelectedEntry(row);
                        }}
                      >
                        <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                        Edit
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {addRoleAndPermissionDialog.value && (
        <CustomDialog
          title={`${isEdit ? 'Edit' : 'Add'} Role and Permissions`}
          open={addRoleAndPermissionDialog.value}
          handleClose={() => {
            addRoleAndPermissionDialog.onFalse();
          }}
        >
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Role Name" value="" onChange={(e) => console.log(e)} fullWidth />
              <TextField
                label="Permissions"
                value=""
                onChange={(e) => console.log('permissions', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Scrollbar>
          <DialogActions>
            <Button onClick={() => {}} variant="contained" size="small">
              Save
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
};

export default LibraryPermissionSettingScreen;
