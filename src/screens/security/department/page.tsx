'use client';

import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import React, { useState, cloneElement } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
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
  drawerClasses,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { flattenArray } from 'src/utils/helper';

import { paper, varAlpha } from 'src/theme/styles';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
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

import { Iconify } from 'src/components/iconify';
import ZoomAndDrag from 'src/components/zoom-drag';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { ComponentBlock } from 'src/components/component-block';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import StandardNode from './standard-node';

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});

type RoleData = {
  name: string;
  count: number;
  employee?: any[];
  children?: RoleData[];
};

type OrgChartListProps<T extends RoleData> = {
  data: T;
  depth: number;
  nodeItem: (props: T) => React.ReactElement<any>;
};

type OrgChartSubListProps<T extends RoleData> = {
  data: T[];
  depth: number;
  nodeItem: (props: T) => React.ReactElement<any>;
};

export function TreeList<T extends RoleData>({ data, depth, nodeItem }: OrgChartListProps<T>) {
  const childs = data.children;

  const cloneNode = (props: RoleData) => cloneElement(nodeItem(props as T));

  const totalChildren = childs ? flattenArray(childs).length : 0;

  const label = cloneNode({ ...data, depth, count: totalChildren });

  return (
    <TreeNode label={label}>
      {childs && <TreeSubList data={childs as T[]} depth={depth} nodeItem={nodeItem} />}
    </TreeNode>
  );
}
function TreeSubList<T extends RoleData>({ data, depth, nodeItem }: OrgChartSubListProps<T>) {
  return (
    <>
      {data.map((list, index) => (
        <TreeList key={index} data={list} depth={depth + 1} nodeItem={nodeItem} />
      ))}
    </>
  );
}

const Department = () => {
  const theme = useTheme();
  // const assignDialog = useBoolean();
  const confirm = useBoolean();

  const roleAndUserDialog = useBoolean();
  const organizationUnitDialog = useBoolean();
  const [editData, setEditData] = useState<any>(null);

  const [parentData, setParentData] = useState(null);
  const { data: organizationUnit } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitsQuery,
  });
  const [deleteOrganizationUnit, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationUnitMutation,
  });

  const dialog = useBoolean();

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
          {/* <MenuItem
            onClick={() => {
              popover.onClose();
              dialog.onTrue();
            }}
          >
            <Iconify icon="si:assignment-duotone" />
            Assign / Remove Employee
          </MenuItem> */}
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
          {/* <MenuItem onClick={assignDialog.onTrue}>
            <Iconify icon="carbon:data-structured" />
            Assign Module
          </MenuItem> */}
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

  const handelCloseOrganizationUnitDialog = () => {
    organizationUnitDialog.onFalse();
    setEditData(null);
    setParentData(null);
  };
  const handleRoleClick = (item: any) => {
    roleAndUserDialog.onTrue();
    setEditData({ ...item, tab: 'role' });
  };
  const handleUserClick = (item: any) => {
    roleAndUserDialog.onTrue();
    setEditData({ ...item, tab: 'user' });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={organizationUnitDialog.onTrue}
        >
          Department
        </Button>
      </Box>
      <ComponentBlock title="Department" sx={{ height: '100%', mt: 2 }}>
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
      </ComponentBlock>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
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
            Delete
          </LoadingButton>
        }
      />
      {/* <CustomDialog
        title="Assign Module"
        open={assignDialog.value}
        handleClose={assignDialog.onFalse}
        fullScreen
      >
        <AssignModule />
      </CustomDialog> */}
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
        // slotProps={{ backdrop: { invisible: true } }}
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

            // transition: 'all 0.3s ease',
            // transform: openDetails.value ? 'translateX(0)' : 'translateX(110%)',
          }}

          // ref={ref}
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

const OrganizationUnitFrom = ({
  handleClose,
  editData,
  parentData,
}: {
  handleClose: () => void;
  editData: any;
  parentData: any;
}) => {
  console.log('🚀 ~ file: page.tsx:265 ~ parentData:', parentData, editData);

  const [addOrganizationUnit, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddOrganizationUnitMutation,
  });
  const [updateOrganizationUnit, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateOrganizationUnitMutation,
  });
  const formik = useFormik({
    initialValues: {
      title: editData?.title || '',
    },
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
        console.log(error);
      }
    },
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <TextField
          name="title"
          label="Title"
          fullWidth
          value={formik.values.title}
          onChange={formik.handleChange}
          size="small"
        />
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={handleClose} />

        <SubmitButton loading={isAddLoading || isUpdateLoading} />
      </DialogActions>
    </Box>
  );
};

const AssignUserForm = () => {
  const formik = useFormik({
    initialValues: {
      users: [],
    },
    onSubmit: (values) => {
      console.log(values);
    },
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

const RenderRoleTable = ({ organizationId }: { organizationId: string }) => {
  const confirm = useBoolean();
  const formDialog = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitRoleQuery,
    params: organizationId,
    options: {
      skip: !organizationId,
    },
  });

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
        content="Are you sure want to delete?"
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
            Delete
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

const RenderRoleForm = ({
  organizationId,
  handleClose,
}: {
  organizationId: string;
  handleClose: () => void;
}) => {
  const [addRole, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoleToOrganizationUnitMutation,
  });
  const formik = useFormik({
    initialValues: {
      role: [],
    },
    onSubmit: async (values) => {
      await addRole({
        organizationUnitId: organizationId,
        roleId: values.role,
      }).unwrap();

      handleClose();
    },
  });
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
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
        />
      </Scrollbar>

      <DialogActions>
        <Button onClick={formik.handleReset}>Cancel</Button>
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          disabled={isAddLoading}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

const RenderUserTable = ({ organizationId }: { organizationId: string }) => {
  const confirm = useBoolean();
  const formDialog = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationUnitUserQuery,
    params: organizationId,
    options: {
      skip: !organizationId,
    },
  });
  console.log('🚀 ~ file: page.tsx:718 ~ RenderUserTable ~ data:', data);

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
        content="Are you sure want to delete?"
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
            Delete
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
      <CustomDialog title="Assign Role" open={formDialog.value} handleClose={formDialog.onFalse}>
        <RenderUserForm organizationId={organizationId} handleClose={formDialog.onFalse} />
      </CustomDialog>
    </>
  );
};

const RenderUserForm = ({
  organizationId,
  handleClose,
}: {
  organizationId: string;
  handleClose: () => void;
}) => {
  const [addUser, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserToOrganizationUnitMutation,
  });
  const formik = useFormik({
    initialValues: {
      user: [],
    },
    onSubmit: async (values) => {
      await addUser({
        organizationUnitId: organizationId,
        userId: values.user,
      }).unwrap();

      handleClose();
    },
  });
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUsersQuery,
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
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
        />
      </Scrollbar>

      <DialogActions>
        <Button onClick={formik.handleReset}>Cancel</Button>
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          disabled={isAddLoading}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
