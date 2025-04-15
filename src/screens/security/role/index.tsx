'use client';

import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Paper,
  Table,
  Stack,
  Button,
  Tooltip,
  Checkbox,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  IconButton,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

// import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import _ from 'lodash';
import * as Yup from 'yup';

import { Add } from '@mui/icons-material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignModule from './modules';

import type { IPermission, IRowComponentProps } from './type';

// Main component for managing roles and permissions in the system
const RoleScreen = () => {
  // State for managing confirmation dialog
  const confirm = useBoolean();

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
    <Box p={1}>
      <CustomBreadcrumbs
        heading="Role Management"
        description="Defines and controls user roles, permissions, and access levels within the system, ensuring users have appropriate privileges based on their responsibilities."
        links={[
          { name: 'Security', href: '/security/role' },
          { name: 'Role And Permission', href: '/security/role' },
          { name: 'Role Management' },
        ]}
        sx={{ px: 1, mb: 3 }}
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
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteRole(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Delete
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
            minWidth: 80,
            render: (value, data) => (
              <ThreeDotsActions
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  setDeleteInformation(data);
                  confirm.onTrue();
                }}
                handleEditClick={() => {
                  setEditData(data);
                  setOpen(true);
                }}
                showThreeDots={false}
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
            <Tooltip
              arrow
              placement="right"
              title="Roles help assign specific permissions to users based on their responsibilities, ensuring secure and efficient access control within the system"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>{' '}
          </Box>
        }
        handleClose={handleClose}
        open={open}
        fullScreen
      >
        <RoleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};
export default RoleScreen;

// Component for handling role creation and editing form
const RoleForm = ({ handleClose, editData }: any) => {
  // State to store module permission data
  // const [modulePermissionData, setModulePermissionData] = useState([]);
  // State to store all permissions data
  const [allPermissions, setAllPermissions] = useState([]);

  // Query hook to fetch permission data based on role name
  const { data: permissionData } = useQueryAndMutation({
    type: 'query',
    options: {
      refetchOnMountOrArgChange: true,
    },
    currentQueryAndMutation: useGetPermissionsQuery,
    params: editData ? editData.name : 'abc-xyz',
  });

  // Mutation hook to update permissions
  const [updatePermission] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });

  // Mutation hook to add new role with success message
  const [addRole, { isSuccess }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleMutation,
    popupConfig: {
      successMessage: 'Role Created successfully',
      success: true,
    },
  });

  // Mutation hook to update existing role with success message
  const [updateRole] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoleMutation,
    popupConfig: {
      successMessage: 'Role Updated successfully',
      success: true,
    },
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
      if (editData) {
        await updateRole({
          id: editData.id,
          body: {
            name: values.role,
            isDefault: true,
            isPublic: false,
          },
        });
        await updatePermission({
          role: values.role,
          data: {
            permissions: allPermissions.map((i: any) => ({ name: i.name, isGranted: i.isGranted })),
          },
        });
      } else {
        await addRole({
          name: values.role,
          isDefault: true,
          isPublic: false,
        });
        await updatePermission({
          role: values.role,
          data: {
            permissions: allPermissions.map((i: any) => ({ name: i.name, isGranted: i.isGranted })),
          },
        });
      }
      handleClose();
    },
  });
  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar
          sx={{
            p: 3,
            height: 'calc(100vh - 150px)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 1, height: '100%', alignItems: 'center' }}>
            <ShakingTextField error={formik.touched.role && !!formik.errors.role}>
              <TextField
                label="Role"
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
          <AssignModule allPermissions={allPermissions} setAllPermissions={setAllPermissions} />
        </Scrollbar>
        <DialogActions sx={{ flexShrink: 0 }}>
          <CancelButton onClick={handleClose} />
          <SubmitButton />
        </DialogActions>
      </form>
    </Box>
  );
};

const ModuleTable = ({ data, allPermissions, setAllPermissions }: any) => {
  const handlePermissionClick = useCallback(
    (currentItem: any) => {
      setAllPermissions((pre: any) => {
        const newData = pre.map((item: any) =>
          item.name === currentItem.name ? { ...item, isGranted: !item.isGranted } : item
        );
        return newData;
      });
    },
    [setAllPermissions]
  );

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Modules</TableCell>
            <TableCell> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item: any) => (
            <RowComponent
              item={item}
              handlePermissionClick={handlePermissionClick}
              allPermissions={allPermissions}
              setAllPermissions={setAllPermissions}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Component for rendering a row in the permissions table
// Props:
// - item: permission item data
// - handlePermissionClick: callback for permission click events
// - allPermissions: array of all available permissions
// - setAllPermissions: function to update permissions state

const RowComponent = ({
  item,
  handlePermissionClick,
  allPermissions,
  setAllPermissions,
}: IRowComponentProps) => {
  // State to control collapse/expand of row
  const collapse = useBoolean();

  // Callback to render secondary content (nested permissions) for each row
  const renderSecondary = useCallback(
    (data: IPermission[], allPer: IPermission[]) => (
      <TableRow>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
          component={TableCell}
          // @ts-ignore
          colSpan={3}
        >
          {data.map((ite: IPermission) => (
            <Paper
              sx={{
                m: 1,
                display: 'flex',
                gap: 1,
                p: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box display="flex" alignItems="center">
                {/* Checkbox to toggle all child permissions */}
                <Checkbox
                  checked={ite.children.every(
                    (el) => !!allPermissions.find((i) => i.name === el.name)?.isGranted
                  )}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Enable all child permissions
                      const newData = ite.children.map((el) => ({
                        ...el,
                        isGranted: true,
                      }));
                      const uniqData = _.unionBy([...newData, ...allPermissions], 'name');
                      setAllPermissions(uniqData);
                    } else {
                      // Disable all child permissions
                      const removeItem = allPermissions.map((el) =>
                        ite.children.some((i) => i.name === el.name)
                          ? { ...el, isGranted: false }
                          : el
                      );
                      setAllPermissions(removeItem);
                    }
                  }}
                />
                {ite?.displayName}
              </Box>
              <Box flexGrow={1}>
                {/* Container for permission labels */}
                <Stack
                  direction="row"
                  spacing={1}
                  gap={1}
                  flexWrap="wrap"
                  justifyContent="flex-end"
                >
                  {ite.children.map((el) => {
                    // Check if permission is granted
                    const isGranted = allPer.find((i) => i.name === el.name)?.isGranted;
                    return (
                      <Label
                        color={isGranted ? 'success' : 'error'}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handlePermissionClick(el)}
                      >
                        {el.displayName}
                      </Label>
                    );
                  })}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Collapse>
      </TableRow>
    ),
    [allPermissions, collapse.value, handlePermissionClick, setAllPermissions]
  );

  return (
    <>
      {/* Main row with collapse toggle */}
      <TableRow onClick={collapse.onToggle}>
        <TableCell>
          {/* <FormControlLabel
            control={
              <Checkbox
              // checked={formik.values.role?.create || false}
              // onChange={(e) => formik.setFieldValue('role.create', e.target.checked)}
              />
            }
            label=" "
          />{' '} */}
          {item?.displayName}
        </TableCell>
        <TableCell>
          {/* Collapse toggle button */}
          <IconButton
            color={collapse.value ? 'inherit' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              collapse.onToggle();
            }}
            sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {renderSecondary(item.children, allPermissions)}
    </>
  );
};
