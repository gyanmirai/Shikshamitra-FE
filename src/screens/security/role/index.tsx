'use client';

import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
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
  Stack,
  Button,
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

  const visibilityDialog = useBoolean();

  // Query hook for fetching all roles
  const { data: roles, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  // Mutation hook for deleting a role
  const [deleteRole, { isLoading: isDeleteLoading }] = useQueryAndMutation({
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
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setOpen(true)}
            size="small"
            sx={{ px: '32px' }}
          >
            Role
          </Button>
        }
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setDeleteInformation(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete role <strong>{deleteInformation?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDeleteLoading}
            onClick={async () => {
              if (deleteInformation?.id) {
                await deleteRole(deleteInformation.id);
              }
              confirm.onFalse();
              setDeleteInformation(null);
            }}
          >
            Yes
          </LoadingButton>
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
          {
            id: 'name',
            label: 'Role',
            render: (value, row) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SubjectColorIndicator
                  color={row.extraProperties?.color || row.extraProperties?.Color || row.color}
                />
                <Typography variant="caption" fontSize="13px">
                  {value}
                </Typography>
              </Box>
            ),
          },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'left',
            minWidth: '30px',
            render: (value, data) => (
              <ThreeDotsActions
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  setDeleteInformation(data);
                  confirm.onTrue();
                }}
                placement="left-center"
                handleEditClick={() => {
                  setEditData(data);
                  setOpen(true);
                }}
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setEditData(data);
                        pop.onClose();
                        visibilityDialog.onTrue();
                      }}
                    >
                      <Iconify icon="material-symbols:beenhere-outline" />
                      Set Module Visibility
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setEditData(data);
                        permissionDialog.onTrue();
                        pop.onClose();
                      }}
                    >
                      <Iconify icon="mdi:account-lock" sx={{ height: '16px', width: '16px' }} />
                      Module Permission
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
      <CustomDialog
        fullScreen
        title={`Set Visibility for ${editData?.name}`}
        open={visibilityDialog.value}
        handleClose={visibilityDialog.onFalse}
      >
        <VisibilityForm editData={editData} handleClose={visibilityDialog.onFalse} />
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

  // const [visibility, setVisibility] = useState<{ name: string; isGranted: boolean }[]>([]);

  // Query hook to fetch permission data based on role name
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const { data: _permissionData, isLoading: isPermissionLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetPermissionsQuery,
  //   params: { providerName: 'R', providerKey: editData?.name },
  //   options: {
  //     skip: !editData,
  //   },
  // });

  // useEffect(() => {
  //   if (_permissionData?.groups?.length > 0) {
  //     setVisibility(extractGrantedPermissions(_permissionData?.groups));
  //   }
  // }, [_permissionData]);

  // Mutation hook to update permissions
  const [updatePermission, { isLoading: isUpdatePermissionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });

  // Mutation hook to add new role with success message
  const [addRole, { isLoading, isSuccess }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleMutation,
  });

  // Mutation hook to update existing role with success message
  const [updateRole, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoleMutation,
  });

  // Formik instance for form handling and validation
  const formik = useFormik<{ role: string; color: string }>({
    initialValues: {
      role: editData ? editData.name : null,
      color: editData
        ? editData.extraProperties?.color || editData.extraProperties?.Color || editData.color
        : null,
    },
    validationSchema: Yup.object().shape({
      role: Yup.string().required('Role is required'),
      color: Yup.string().required('Color is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateRole({
            id: editData.id,
            body: {
              name: values.role,
              color: values.color,
              isDefault: true,
              isPublic: false,
              extraProperties: {
                color: values.color,
              },
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: `${editData.name} to ${values.role} role updated successfully`,
          });
        } else {
          await addRole({
            name: values.role,
            color: values.color,

            isDefault: true,
            isPublic: false,
            extraProperties: {
              color: values.color,
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.role} role created successfully`,
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
          py: 2,
        }}
      >
        <Stack spacing={2}>
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
              fullWidth
              sx={{ width: '100%' }}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
          <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
              color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
            >
              Color *
            </Typography>
            <ColorPickerCircle
              onSelect={(color: string) => formik.setFieldValue('color', color)}
              initialColor={formik.values.color}
            />
          </ShakingTextField>

          {/* {isPermissionLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Visibility visibility={visibility} setVisibility={setVisibility} />
        )} */}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />
        <LoadingButton
          size="small"
          variant="contained"
          loading={isLoading || isUpdateLoading || isUpdatePermissionLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => formik.handleSubmit(e)}
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
  const initialData = useRef<{ name: string; isGranted: boolean }[]>([]);
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
          initialData={initialData}
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
            const diff = _.differenceWith(permissioNData, initialData.current, _.isEqual);
            await updatePermission({
              providerName,
              providerKey: providerName === 'R' ? editData?.name : editData?.id,
              data: {
                permissions: diff,
              },
            }).unwrap();
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
    params: { providerName: 'R', providerKey: editData?.name },
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
        scrollBarProps={{
          sx: {
            overflow: 'hidden',
            '.simplebar-content': {
              height: '100%',
            },
          },
        }}
      >
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
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
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
              providerName: 'R',
              providerKey: editData?.name,
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
