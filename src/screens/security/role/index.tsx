'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetPermissionsQuery,
  useUpdatePermissionMutation,
} from 'src/redux/permission/permissionApi';
import {
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} from 'src/redux/role/roleApi';
import {
  Box,
  Button,
  Divider,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import Visibility from './visibility';
import Permission from './permission';

// Main component for managing roles and permissions in the system
const RoleScreen = () => {
  // State for managing confirmation dialog
  const confirm = useBoolean();

  const permissionDialog = useBoolean();

  // State for managing dialog open/close
  const [open, setOpen] = useState(false);
  // State for storing role data being edited
  const [editData, setEditData] = useState<any>(null);
  // State for storing role data being deleted
  const [deleteInformation, setDeleteInformation] = useState<any>(null);

  // Query hook for fetching all roles
  const { data: roles, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  // Mutation hook for deleting a role
  const [deleteRole] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoleMutation,
    popupConfig: {
      success: true,
      successMessage: 'Role deleted successfully',
    },
  });

  // Handler for closing the dialog and resetting edit data
  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Role Management"
        description="Defines and controls user roles, permissions, and access levels within the system, ensuring users have appropriate privileges based on their responsibilities."
        links={[
          { name: 'Security', href: '/security/role' },
          { name: 'Role And Permission', href: '/security/role' },
          { name: 'Role Management' },
        ]}
        sx={{ mb: 1 }}
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setOpen(true)}
            size="small"
          >
            Role
          </Button>
        }
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteRole(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomizableTable
        noDataText={
          <>
            No Role have been added yet{' '}
            <Box
              onClick={() => {
                setOpen(true);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Role
            </Box>
          </>
        }
        tableId="role-table"
        searchFieldProps={{
          placeholder: 'Search Role',
          label: 'Search Role',
        }}
        columns={[
          { id: 'name', label: 'Role' },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'left',
            minWidth: 80,
            render: (value, data) => (
              <ThreeDotsActions
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  setDeleteInformation(data);
                  confirm.onTrue();
                }}
                placement="right-center"
                handleEditClick={() => {
                  setEditData(data);
                  setOpen(true);
                }}
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setEditData(data);
                        permissionDialog.onTrue();
                        pop.onClose();
                      }}
                    >
                      <Iconify icon="mdi:account-lock" sx={{ height: '16px', width: '16px' }} />
                      Permissions
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={roles?.items || []}
        isLoading={isLoading}
      />

      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {editData ? 'Update Role' : 'Create Role'}{' '}
            <CustomTooltip
              arrow
              placement="right"
              title="Roles help assign specific permissions to users based on their responsibilities, ensuring secure and efficient access control within the system"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>{' '}
          </Box>
        }
        handleClose={handleClose}
        open={open}
        fullScreen
      >
        <RoleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            Permissions of {editData?.name}
            <CustomTooltip
              arrow
              placement="right"
              title="Permissions define the actions users can perform within the system, ensuring secure and efficient access control"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>{' '}
          </Box>
        }
        handleClose={() => {
          permissionDialog.onFalse();
          setEditData(null);
        }}
        open={permissionDialog.value}
        fullScreen
      >
        <PermissionForm
          handleClose={() => permissionDialog.onFalse()}
          editData={editData}
          providerName="R"
        />
      </CustomDialog>
    </Box>
  );
};
export default RoleScreen;

export function extractGrantedPermissions(groups: any): { name: string; isGranted: boolean }[] {
  if (!Array.isArray(groups)) return [];

  return groups.flatMap((group: any) =>
    group.permissions.map((permission: any) => ({
      name: permission.name,
      isGranted: permission.isGranted,
    }))
  );
}

// Component for handling role creation and editing form
const RoleForm = ({ handleClose, editData }: any) => {
  // State to store all permissions data

  const [visibility, setVisibility] = useState<{ name: string; isGranted: boolean }[]>([]);

  // Query hook to fetch permission data based on role name
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _permissionData, isLoading: isPermissionLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPermissionsQuery,
    params: { providerName: 'R', providerKey: editData?.name },
    options: {
      skip: !editData,
    },
  });

  useEffect(() => {
    if (_permissionData?.groups?.length > 0) {
      setVisibility(extractGrantedPermissions(_permissionData?.groups));
    }
  }, [_permissionData]);

  // Mutation hook to update permissions
  const [updatePermission, { isLoading: isUpdatePermissionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });

  // Mutation hook to add new role with success message
  const [addRole, { isLoading, isSuccess }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleMutation,
    popupConfig: {
      successMessage: 'Role Created successfully',
      success: true,
    },
  });

  // Mutation hook to update existing role with success message
  const [updateRole, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoleMutation,
  });

  // Formik instance for form handling and validation
  const formik = useFormik<{ role: string }>({
    initialValues: {
      role: editData ? editData.name : null,
    },
    validationSchema: Yup.object().shape({
      role: Yup.string().required('Role is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateRole({
            id: editData.id,
            body: {
              name: values.role,
              isDefault: true,
              isPublic: false,
            },
          });
        } else {
          await addRole({
            name: values.role,
            isDefault: true,
            isPublic: false,
          });
        }
        await updatePermission({
          providerName: 'R',
          providerKey: values.role,
          data: {
            permissions: visibility,
          },
        });
        if (editData) {
          shikshaMitraToast.success({
            message: 'Updated role and its visibility successfully',
          });
        } else {
          shikshaMitraToast.success({
            message: 'Created role and its visibility successfully',
          });
        }
        handleClose();
      } catch (error) {
        console.error('Role operation failed:', error);
      }
    },
  });
  return (
    <>
      <DialogScrollContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          height: '100%',
        }}
        scrollBarProps={{
          sx: {
            '& .simplebar-content': {
              height: '100%',
            },
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          <ShakingTextField error={formik.touched.role && !!formik.errors.role}>
            <TextField
              label="Role Name"
              name="role"
              size="small"
              disabled={isSuccess}
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && !!formik.errors.role}
              helperText={(formik.touched.role && formik.errors.role) || ''}
              sx={{ maxWidth: 300, width: '100%' }}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
        </Box>
        <Divider sx={{ mt: 1 }} />
        {/* <AssignModule allPermissions={allPermissions} setAllPermissions={setAllPermissions} /> */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Typography color="primary.main" variant="subtitle1">
            Set Module Visibility
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="fluent:bot-sparkle-24-filled" />}
            onClick={() => {
              // setVisibilityOpen(true);
            }}
          >
            MIRU Visibility
          </Button>
        </Box>
        {isPermissionLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Visibility visibility={visibility} setVisibility={setVisibility} />
        )}
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />
        <LoadingButton
          size="small"
          variant="contained"
          loading={isLoading || isUpdateLoading || isUpdatePermissionLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export const PermissionForm = ({
  handleClose,
  editData,
  providerName,
}: {
  handleClose: () => void;
  editData: any;
  providerName: string;
}) => {
  const [permissioNData, setPermissionData] = useState<{ name: string; isGranted: boolean }[]>([]);

  // Mutation hook to update permissions
  const [updatePermission, { isLoading: isUpdatePermissionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });
  return (
    <>
      <DialogScrollContent
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '0', height: '100%', p: 0 }}
        scrollBarProps={{ sx: { overflow: 'hidden' } }}
      >
        <Permission
          editData={editData}
          permissionData={permissioNData}
          setPermissionData={setPermissionData}
          providerName={providerName}
        />
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdatePermissionLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={async () => {
            await updatePermission({
              providerName,
              providerKey: providerName === 'R' ? editData?.name : editData?.id,
              data: {
                permissions: permissioNData,
              },
            });
            shikshaMitraToast.success({
              message: 'Updated Permissions successfully',
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
