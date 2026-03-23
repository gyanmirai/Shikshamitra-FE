'use client';

import * as yup from 'yup';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { flattenArray } from 'src/utils/helper';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { paper, varAlpha } from 'src/theme/styles';
import ZoomAndDrag from 'src/components/zoom-drag';
import { drawerClasses } from '@mui/material/Drawer';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useState, cloneElement } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { ComponentBlock } from 'src/components/component-block';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Tab,
  Chip,
  Stack,
  Paper,
  Button,
  Drawer,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useGetOrganizationUnitsQuery,
  useAddOrganizationUnitMutation,
  useGetOrganizationUnitRoleQuery,
  useGetOrganizationUnitUserQuery,
  useUpdateOrganizationUnitMutation,
  useDeleteOrganizationUnitMutation,
  useAddRoleToOrganizationUnitMutation,
  useAddUserToOrganizationUnitMutation,
  useRemoveRoleFromOrganizationUnitMutation,
  useRemoveUserFromOrganizationUnitMutation,
} from 'src/redux/organizationUnit/organizationUnitApi';

import StandardNode from './standard-node';

import type { IRoleData, IOrgChartListProps, IOrgChartSubListProps } from './type';

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});
/**
 * TreeList Component - Renders a hierarchical tree structure with customizable nodes
 * @template T - Generic type extending IRoleData interface
 * @param {Object} props - Component props
 * @param {T} props.data - The data object containing node information and children
 * @param {number} props.depth - Current depth level in the tree
 * @param {Function} props.nodeItem - Function to render custom node items
 * @returns {JSX.Element} Tree node structure with its children
 */
export function TreeList<T extends IRoleData>({ data, depth, nodeItem }: IOrgChartListProps<T>) {
  // Extract children from data object
  const childs = data.children;

  // Helper function to clone and customize node elements
  const cloneNode = (props: IRoleData) => cloneElement(nodeItem(props as T));

  // Calculate total number of nested children
  const totalChildren = childs ? flattenArray(childs).length : 0;

  // Create the node label with additional props
  const label = cloneNode({ ...data, depth, count: totalChildren });

  return (
    <TreeNode label={label}>
      {childs && <TreeSubList data={childs as T[]} depth={depth} nodeItem={nodeItem} />}
    </TreeNode>
  );
}
/**
 * TreeSubList Component - Renders a list of child nodes in the organizational tree
 * @template T - Generic type extending IRoleData interface
 * @param {Object} props - Component props
 * @param {T[]} props.data - Array of child node data
 * @param {number} props.depth - Current depth level in the tree
 * @param {Function} props.nodeItem - Function to render custom node items
 * @returns {JSX.Element} Fragment containing child tree nodes
 */
function TreeSubList<T extends IRoleData>({ data, depth, nodeItem }: IOrgChartSubListProps<T>) {
  return (
    <>
      {data.map((list, index) => (
        <TreeList key={index} data={list} depth={depth + 1} nodeItem={nodeItem} />
      ))}
    </>
  );
}

/**
 * Department Component - Main component for managing organizational departments
 * Handles department creation, editing, deletion, and role/user assignments
 * @returns {JSX.Element} Department management interface
 */
const Department = () => {
  /** Theme object from Material-UI for styling */
  const theme = useTheme();

  /** Dialog control hooks using boolean state */
  const confirm = useBoolean();
  const roleAndUserDialog = useBoolean();
  const organizationUnitDialog = useBoolean();
  const dialog = useBoolean();

  /** State for managing edit operations and parent-child relationships */
  const [editData, setEditData] = useState<any>(null);
  const [parentData, setParentData] = useState(null);

  /** Query hook for fetching organization units data */
  const { data: organizationUnit, isLoading: isLoadingOrganizationUnit } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitsQuery,
  });

  /** Mutation hook for deleting organization units */
  const [deleteOrganizationUnit, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationUnitMutation,
  });

  /**
   * Renders the three dots action menu for each department node
   * @param {any} item - Department item data
   * @returns {JSX.Element} Three dots action menu
   */
  const renderThreeDotsAction = (item: any) => (
    <ThreeDotsActions
      sx={{ position: 'absolute', top: 8, right: 8 }}
      actions={({ popover }) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              setEditData(item);
              setParentData(item);
              organizationUnitDialog.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setEditData(item);
              confirm.onTrue();
              popover.onClose();
            }}
            color="error.main"
          >
            <Iconify icon="solar:trash-bin-trash-bold" color="error.main" />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => {
              setEditData(item);
              popover.onClose();
              roleAndUserDialog.onTrue();
            }}
          >
            <Iconify icon="tdesign:user-setting-filled" />
            Assign Role and Employee
          </MenuItem>

          <MenuItem
            onClick={() => {
              setParentData(item);
              organizationUnitDialog.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="mingcute:department-line" />
            Add Sub Department
          </MenuItem>
        </MenuList>
      )}
    />
  );

  /**
   * Handles closing of organization unit dialog and resetting related states
   */
  const handelCloseOrganizationUnitDialog = () => {
    organizationUnitDialog.onFalse();
    setEditData(null);
    setParentData(null);
  };

  /**
   * Handles role assignment click event
   * @param {any} item - Department item data
   */
  const handleRoleClick = (item: any) => {
    roleAndUserDialog.onTrue();
    setEditData({ ...item, tab: 'role' });
  };

  /**
   * Handles user assignment click event
   * @param {any} item - Department item data
   */
  const handleUserClick = (item: any) => {
    roleAndUserDialog.onTrue();
    setEditData({ ...item, tab: 'user' });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Department"
        description="Manage and organize departments, assign roles and user, and create hierarchical department structures"
        links={[
          { name: 'Security', href: '/security/role' },
          { name: 'Role And Permission', href: '/security/role' },
          { name: 'Department' },
        ]}
        sx={{ px: 1 }}
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={organizationUnitDialog.onTrue}
            sx={{ px: '32px' }}
          >
            Department
          </Button>
        }
      />

      <ComponentBlock title="Department" sx={{ height: '100%', mt: 2 }}>
        {isLoadingOrganizationUnit ? (
          <Box className="loader" />
        ) : organizationUnit.length ? (
          <ZoomAndDrag>
            <Box>
              {organizationUnit?.map((item: any, index: number) => (
                <Tree
                  lineWidth="1px"
                  key={item.key}
                  nodePadding="4px"
                  lineBorderRadius="24px"
                  lineColor={theme.vars.palette.text.disabled}
                  label={
                    <StandardNode
                      name={item.title}
                      count={5}
                      RenderThreeDotsAction={renderThreeDotsAction}
                      item={item}
                      onRolesClick={handleRoleClick}
                      onUserClick={handleUserClick}
                    />
                  }
                >
                  {item?.children?.map((list: any, ind: number) => (
                    <TreeList
                      key={ind}
                      depth={1}
                      data={list}
                      nodeItem={(props) =>
                        StandardNode({
                          ...props,
                          RenderThreeDotsAction: renderThreeDotsAction,
                          item: list,
                          name: list.title,
                          onRolesClick: handleRoleClick,
                          onUserClick: handleUserClick,
                        })
                      }
                    />
                  ))}
                </Tree>
              ))}
            </Box>
          </ZoomAndDrag>
        ) : (
          <EmptyContent title="No Department Created" />
        )}
      </ComponentBlock>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteOrganizationUnit(editData?.key || '');
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomDialog
        title="Department"
        open={organizationUnitDialog.value}
        handleClose={handelCloseOrganizationUnitDialog}
      >
        <OrganizationUnitFrom
          handleClose={handelCloseOrganizationUnitDialog}
          editData={editData}
          parentData={parentData}
        />
      </CustomDialog>

      <CustomDialog title="Assign user" open={dialog.value} handleClose={dialog.onFalse}>
        <AssignUserForm />
      </CustomDialog>
      <Drawer
        anchor="right"
        open={roleAndUserDialog.value}
        onClose={() => {
          setEditData(null);
          roleAndUserDialog.onFalse();
        }}
        variant="temporary"
        sx={{
          [`& .${drawerClasses.paper}`]: {
            ...paper({
              theme,
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
            }),
            width: 600,
          },
        }}
      >
        <Paper
          elevation={12}
          sx={{
            border: 'none',
            width: '100%',
            zIndex: 9999,
            height: '100%',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <Typography variant="h6">Assign Role And User</Typography>

            <Iconify
              icon="zondicons:close-outline"
              onClick={() => {
                setEditData(null);
                roleAndUserDialog.onFalse();
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
          <Scrollbar sx={{ p: 2 }}>
            <RenderAssignRoleAndEmployee
              organizationId={editData?.key}
              tab={editData?.tab || 'role'}
            />
          </Scrollbar>
        </Paper>
      </Drawer>
    </Box>
  );
};

export default Department;

/**
 * Component for creating or editing organization units
 * @param {Function} handleClose - Function to close the form dialog
 * @param {Object} editData - Data of the organization unit being edited
 * @param {Object} parentData - Data of the parent organization unit
 */
const OrganizationUnitFrom = ({
  handleClose,
  editData,
  parentData,
}: {
  handleClose: () => void;
  editData: any;
  parentData: any;
}) => {
  /**
   * Mutation hook for adding new organization units
   * @returns {Array} [addOrganizationUnit, { isLoading }] - Mutation function and loading state
   */
  const [addOrganizationUnit, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddOrganizationUnitMutation,
  });

  /**
   * Mutation hook for updating existing organization units
   * @returns {Array} [updateOrganizationUnit, { isLoading }] - Mutation function and loading state
   */
  const [updateOrganizationUnit, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateOrganizationUnitMutation,
  });

  /**
   * Formik instance for form handling
   * Manages form state and submission logic
   */
  const formik = useFormik<{ title: string }>({
    initialValues: {
      title: editData?.title || '',
    },
    validationSchema: yup.object().shape({
      title: yup.string().required('Name is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateOrganizationUnit({
            title: values.title,
            id: editData?.key || null,
          }).unwrap();
        } else {
          await addOrganizationUnit({
            title: values.title,
            parentId: parentData?.key || null,
          }).unwrap();
        }
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <>
      <DialogScrollContent>
        <ShakingTextField error={!!formik.errors.title && !!formik.touched.title}>
          <TextField
            name="title"
            label="Name"
            fullWidth
            value={formik.values.title}
            onChange={(e) => {
              const value = e.target.value
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              formik.setFieldValue('title', value);
            }}
            size="small"
            error={!!formik.errors.title && !!formik.touched.title}
            helperText={formik.touched.title && formik.errors.title}
          />
        </ShakingTextField>
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />

        <SubmitButton
          onClick={() => formik.handleSubmit()}
          loading={isAddLoading || isUpdateLoading}
        />
      </DialogActions>
    </>
  );
};
const AssignUserForm = () => {
  const formik = useFormik({
    initialValues: {
      users: [],
    },
    onSubmit: (values) => {},
  });
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neautral', p: 2 }}>
        <Stack spacing={2}>
          <Autocomplete
            loading={isLoading}
            multiple
            limitTags={3}
            value={formik.values.users}
            onChange={(e, value) => {
              formik.setFieldValue('users', value);
            }}
            options={employees?.items || []}
            getOptionLabel={(option: any) => `${option?.firstName || ''} ${option?.lastName || ''}`}
            // defaultValue={top100Films.slice(0, 8)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Employee" placeholder="Search  Employee" />
            )}
            renderOption={(props, option: any) => (
              <li {...props} key={option.id}>
                {`${option?.firstName || ''} ${option?.lastName || ''}`}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option: any, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option?.firstName || ''} ${option?.lastName || ''}`}
                  size="small"
                  variant="soft"
                />
              ))
            }
            fullWidth
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={() => {}} />

        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </Box>
  );
};
/**
 * Array of tab configurations for the department security interface.
 * Each tab object contains a value identifier and display label.
 * Used to toggle between role and user management views.
 */
const TABS = [
  { value: 'role', label: 'Roles' },
  { value: 'user', label: 'Users' },
];
const RenderAssignRoleAndEmployee = ({
  organizationId,
  tab: currentTab,
}: {
  organizationId: string;
  tab: string;
}) => {
  const tabs = useTabs(currentTab);
  return (
    <>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>
      <Box>
        {tabs.value === 'role' && <RenderRoleTable organizationId={organizationId} />}
        {tabs.value === 'user' && <RenderUserTable organizationId={organizationId} />}
      </Box>
    </>
  );
};

/**
 * Renders a table displaying roles associated with an organization unit and provides functionality
 * to add and delete roles.
 * @param {string} organizationId - The ID of the organization unit
 * @returns {JSX.Element} A component containing a table of roles with management actions
 */
const RenderRoleTable = ({ organizationId }: { organizationId: string }) => {
  /**
   * Manages the state of the confirmation dialog
   */
  const confirm = useBoolean();

  /**
   * Manages the state of the form dialog for adding roles
   */
  const formDialog = useBoolean();

  /**
   * Stores the currently selected role data for editing/deleting
   */
  const [editData, setEditData] = useState<any>(null);

  /**
   * Fetches the roles associated with the organization unit
   */
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitRoleQuery,
    params: organizationId,
    options: {
      skip: !organizationId,
    },
  });

  /**
   * Mutation hook for removing a role from the organization unit
   */
  const [deleteRole, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveRoleFromOrganizationUnitMutation,
  });

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading || isLoading}
            color="error"
            onClick={async () => {
              await deleteRole({
                organizationUnitId: organizationId,
                roleId: editData?.id,
              });

              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button size="small" variant="contained" startIcon={<Add />} onClick={formDialog.onTrue}>
          Add Roles
        </Button>
      </Box>
      <CustomizableTable
        isLoading={isLoading}
        tableId="role-id"
        searchFieldProps={{
          label: 'Search Role',
        }}
        noDataText={
          <>
            No Roles found
            <Box
              onClick={formDialog.onTrue}
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
              Add Roles
            </Box>
          </>
        }
        columns={[
          { label: 'Role Name', id: 'name' },
          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    confirm.onTrue();
                    setEditData(row);
                  }}
                />
              );
            },
          },
        ]}
        data={data?.items || []}
      />
      <CustomDialog title="Assign Role" open={formDialog.value} handleClose={formDialog.onFalse}>
        <RenderRoleForm organizationId={organizationId} handleClose={formDialog.onFalse} />
      </CustomDialog>
    </>
  );
};
/**
 * Form component for rendering and handling role assignments to organization units
 * @param {string} organizationId - The ID of the organization unit
 * @param {Function} handleClose - Callback function to close the form dialog
 */
const RenderRoleForm = ({
  organizationId,
  handleClose,
}: {
  organizationId: string;
  handleClose: () => void;
}) => {
  /**
   * Mutation hook for adding roles to organization unit
   */
  const [addRole, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleToOrganizationUnitMutation,
  });

  /**
   * Formik instance for managing form state and submission
   */
  const formik = useFormik({
    initialValues: {
      role: [],
    },
    validationSchema: yup.object({
      role: yup.array().min(1, 'Please select at least one role'),
    }),
    onSubmit: async (values) => {
      await addRole({
        organizationUnitId: organizationId,
        roleId: values.role,
      }).unwrap();

      handleClose();
    },
  });

  /**
   * Query hook for fetching available roles
   */
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  return (
    <>
      <DialogScrollContent>
        <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
          <CustomSelect
            options={data?.items || []}
            value={formik.values.role}
            multiple
            isLoading={isLoading}
            name="role"
            label="Roles"
            valueKey="id"
            labelKey="name"
            onChange={(val) => {
              formik.setFieldValue('role', val);
            }}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={((formik.touched.role && formik.errors.role) as string) || ''}
          />
        </ShakingTextField>
      </DialogScrollContent>

      <DialogActions>
        <Button onClick={formik.handleReset}>Cancel</Button>
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          disabled={isAddLoading}
          onClick={() => formik.handleSubmit()}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </>
  );
};
/**
 * Component for rendering a table of users associated with an organization unit
 * @param {string} organizationId - The ID of the organization unit
 */
const RenderUserTable = ({ organizationId }: { organizationId: string }) => {
  /**
   * Hook for managing confirmation dialog state
   */
  const confirm = useBoolean();

  /**
   * Hook for managing form dialog state
   */
  const formDialog = useBoolean();

  /**
   * State for storing data of the user being edited
   */
  const [editData, setEditData] = useState<any>(null);

  /**
   * Query hook for fetching organization unit users
   */
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitUserQuery,
    params: organizationId,
    options: {
      skip: !organizationId,
    },
  });

  /**
   * Mutation hook for removing a user from organization unit
   */
  const [deleteUser, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveUserFromOrganizationUnitMutation,
  });

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading || isLoading}
            color="error"
            onClick={async () => {
              await deleteUser({
                organizationUnitId: organizationId,
                userId: editData?.id,
              });

              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button size="small" variant="contained" startIcon={<Add />} onClick={formDialog.onTrue}>
          Add Users
        </Button>
      </Box>
      <CustomizableTable
        tableId="user-id"
        searchFieldProps={{
          label: 'Search Role',
        }}
        noDataText={
          <>
            No User found
            <Box
              onClick={formDialog.onTrue}
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
              Add Users
            </Box>
          </>
        }
        columns={[
          { label: 'User Name', id: 'userName' },
          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    confirm.onTrue();
                    setEditData(row);
                  }}
                />
              );
            },
          },
        ]}
        data={data?.items || []}
      />
      <CustomDialog title="Assign User" open={formDialog.value} handleClose={formDialog.onFalse}>
        <RenderUserForm organizationId={organizationId} handleClose={formDialog.onFalse} />
      </CustomDialog>
    </>
  );
};
// Component for rendering a form to add users to an organization unit
const RenderUserForm = ({
  organizationId,
  handleClose,
}: {
  organizationId: string;
  handleClose: () => void;
}) => {
  // Hook for handling user addition mutation and loading state
  const [addUser, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserToOrganizationUnitMutation,
  });

  // Formik hook for form state management and submission handling
  const formik = useFormik<{ user: string[] }>({
    initialValues: {
      user: [],
    },
    validationSchema: yup.object().shape({
      user: yup.array().min(1, 'At least one user is required'),
    }),
    onSubmit: async (values) => {
      await addUser({
        organizationUnitId: organizationId,
        userId: values.user,
      }).unwrap();

      handleClose();
    },
  });

  // Hook for fetching users data and managing loading state
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUsersQuery,
  });

  return (
    <>
      <DialogScrollContent>
        <ShakingTextField error={formik.touched.user && Boolean(formik.errors.user)}>
          <CustomSelect
            options={data?.items || []}
            value={formik.values.user}
            multiple
            isLoading={isLoading}
            name="user"
            label="Users"
            valueKey="id"
            labelKey="name"
            onChange={(val) => {
              formik.setFieldValue('user', val);
            }}
            error={formik.touched.user && Boolean(formik.errors.user)}
            helperText={((formik.touched.user && formik.errors.user) as string) || ''}
          />
        </ShakingTextField>
      </DialogScrollContent>

      <DialogActions>
        <Button onClick={formik.handleReset}>Cancel</Button>
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          disabled={isAddLoading}
          onClick={() => formik.handleSubmit()}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </>
  );
};
