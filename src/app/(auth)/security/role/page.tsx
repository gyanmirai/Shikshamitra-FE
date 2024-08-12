'use client';

import { useFormik } from 'formik';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Paper,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  Collapse,
  MenuList,
  MenuItem,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  IconButton,
  DialogActions,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

// import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import * as Yup from 'yup';

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
import DataTable from 'src/components/commonTable';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';

const Role = () => {
  const confirm = useBoolean();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);

  const { data: roles, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  const [deleteRole] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoleMutation,
    popupConfig: {
      success: true,
      successMessage: 'Role deleted successfully',
    },
  });

  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  return (
    <Box p={1}>
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button variant="contained" onClick={() => setOpen(true)} size="small">
          Add Role
        </Button>
      </Box>
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
      <DataTable
        columns={[
          { key: 'name', label: 'Role' },
          {
            label: 'Action',
            key: 'action',
            render: (data) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setDeleteInformation(data);
                        confirm.onTrue();
                        popover.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ height: '16px', width: '16px' }}
                      />
                      Delete
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        setEditData(data);
                        setOpen(true);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                      Edit
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

      <CustomDialog title="Add Role" handleClose={handleClose} open={open} fullScreen>
        <RoleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default Role;

const RoleForm = ({ handleClose, editData }: any) => {
  const [modulePermissionData, setModulePermissionData] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const { data: permissionData } = useQueryAndMutation({
    type: 'query',
    options: {
      refetchOnMountOrArgChange: true,
    },
    currentQueryAndMutation: useGetPermissionsQuery,
    params: editData ? editData.name : 'abc-xyz',
  });

  const [updatePermission] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePermissionMutation,
  });

  const [addRole, { isLoading, isSuccess }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleMutation,
    popupConfig: {
      successMessage: 'Role Created successfully',
      success: true,
    },
  });

  const [updateRole] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoleMutation,
    popupConfig: {
      successMessage: 'Role Updated successfully',
      success: true,
    },
  });
  useEffect(() => {
    if (permissionData?.groups) {
      setModulePermissionData(permissionData?.groups);
      const allPer: any = [];
      const recurFunction = (data: any) => {
        data.forEach((item: any) => {
          if (item?.permissions) {
            allPer.splice(allPer.length, 0, ...item.permissions);
            recurFunction(item?.permissions);
          }
        });
      };
      recurFunction(permissionData?.groups);
      setAllPermissions(allPer);
    }
  }, [permissionData]);

  const formik = useFormik({
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
            // bgcolor: 'background.neutral',
            height: 'calc(100vh - 150px)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 1, height: '100%', alignItems: 'center' }}>
            <TextField
              label="Role"
              name="role"
              size="small"
              disabled={isSuccess}
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && !!formik.errors.role}
              // @ts-ignore
              helperText={formik.touched.role && formik.errors.role}
              sx={{ maxWidth: 300, width: '100%' }}
              onBlur={formik.handleBlur}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={allPermissions.every((item: any) => item.isGranted)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAllPermissions((pre: any) =>
                      pre.map((item: any) => ({ ...item, isGranted: true }))
                    );
                  } else {
                    setAllPermissions((pre: any) =>
                      pre.map((item: any) => ({ ...item, isGranted: false }))
                    );
                  }
                }}
              />
            }
            label="Give All Permission"
          />

          <ModuleTable
            data={modulePermissionData}
            allPermissions={allPermissions}
            setAllPermissions={setAllPermissions}
          />
        </Scrollbar>
        <DialogActions sx={{ flexShrink: 0 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
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
            <TableCell>Module</TableCell>
            <TableCell> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item: any) => (
            <RowComponent
              item={item}
              handlePermissionClick={handlePermissionClick}
              allPermissions={allPermissions}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RowComponent = ({ item, handlePermissionClick, allPermissions }: any) => {
  const collapse = useBoolean();
  const { permissions } = item;

  const subData = useMemo(
    () =>
      permissions
        .filter((i: any) => !i.parentName)
        .map((i: any) => ({
          ...i,
          permissions: permissions.filter((j: any) => i.name === j.parentName),
        })),
    [permissions]
  );

  const renderSecondary = useCallback(
    (data: any, allPer: any) => (
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
          {data.map((ite: any) => (
            <Paper sx={{ m: 1, display: 'flex', gap: 1, p: 1, justifyContent: 'space-between' }}>
              <Box>{ite?.displayName}</Box>
              <Box flexGrow={1}>
                <Stack direction="row" spacing={1} gap={1} flexWrap="wrap">
                  {ite.permissions.map((el: any) => {
                    const isGranted = allPer.find((i: any) => i.name === el.name)?.isGranted;
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
    [collapse.value, handlePermissionClick]
  );
  return (
    <>
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

      {renderSecondary(subData, allPermissions)}
    </>
  );
};
