'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  useUpdatePermissionMutation,
} from 'src/redux/permission/permissionApi';
import {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
} from 'src/redux/role/roleApi';
import {
  Box,
  Stack,
  Button,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import RoleDeleteDialog from './role-delete-dialog';
import PermissionAccessForm from './permission-access-form';
import {
  getEmployeeOnboardingAssignable,
  isReservedEmployeeOnboardingRoleName,
  normalizeEmployeeOnboardingAssignable,
} from './employee-onboarding-role';

type EmployeeGroupAudienceValue = 'Teaching' | 'NonTeaching' | 'Both';

const EMPLOYEE_GROUP_AUDIENCE_OPTIONS: {
  label: string;
  value: EmployeeGroupAudienceValue;
}[] = [
  { label: 'Teaching only', value: 'Teaching' },
  { label: 'Non Teaching only', value: 'NonTeaching' },
  { label: 'Both groups', value: 'Both' },
];

const getRoleAudience = (role: any): string =>
  role?.roleAudience ??
  role?.RoleAudience ??
  role?.extraProperties?.roleAudience ??
  role?.extraProperties?.RoleAudience ??
  'Employee';

const getEmployeeGroupAudience = (role: any): EmployeeGroupAudienceValue =>
  role?.employeeGroupAudience ??
  role?.EmployeeGroupAudience ??
  role?.extraProperties?.employeeGroupAudience ??
  role?.extraProperties?.EmployeeGroupAudience ??
  'Both';

// Main component for managing roles and permissions in the system
const RoleScreen = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManagePermissions = hasGrantedPermission(permissions, 'AbpIdentity.Roles.ManagePermissions');

  const permissionDialog = useBoolean();
  const [permissionBusy, setPermissionBusy] = useState(false);

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

      {deleteInformation && (
        <RoleDeleteDialog role={deleteInformation} onClose={() => setDeleteInformation(null)} />
      )}
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
                showThreeDots={canManagePermissions}
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  setDeleteInformation(data);
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
        disableClose={permissionBusy}
        paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
        fullScreen
      >
        <PermissionForm
          handleClose={() => permissionDialog.onFalse()}
          editData={editData}
          providerName="R"
          onBusyChange={setPermissionBusy}
        />
      </CustomDialog>
      <CustomDialog
        fullScreen
        title={`Set Visibility for ${editData?.name}`}
        open={visibilityDialog.value}
        disableClose={permissionBusy}
        paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
        handleClose={visibilityDialog.onFalse}
      >
        <VisibilityForm editData={editData} handleClose={visibilityDialog.onFalse} onBusyChange={setPermissionBusy} />
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
  const formik = useFormik<{
    role: string;
    color: string;
    employeeGroupAudience: EmployeeGroupAudienceValue;
    employeeOnboardingAssignable: boolean;
  }>({
    initialValues: {
      role: editData ? editData.name : '',
      color: editData
        ? editData.extraProperties?.color || editData.extraProperties?.Color || editData.color
        : '',
      employeeGroupAudience: getEmployeeGroupAudience(editData),
      employeeOnboardingAssignable: getEmployeeOnboardingAssignable(editData),
    },
    validationSchema: Yup.object().shape({
      role: Yup.string().required('Role is required'),
      color: Yup.string().required('Color is required'),
      employeeGroupAudience: Yup.string()
        .oneOf(['Teaching', 'NonTeaching', 'Both'])
        .required('Employee group availability is required'),
    }),
    onSubmit: async (values) => {
      try {
        const roleAudience = editData ? getRoleAudience(editData) : 'Employee';
        const employeeOnboardingAssignable = normalizeEmployeeOnboardingAssignable({
          roleName: values.role,
          roleAudience,
          requested: values.employeeOnboardingAssignable,
        });
        if (editData) {
          await updateRole({
            id: editData.id,
            body: {
              name: values.role,
              color: values.color,
              employeeGroupAudience: values.employeeGroupAudience,
              employeeOnboardingAssignable,
              isDefault: true,
              isPublic: false,
              extraProperties: {
                color: values.color,
                roleAudience,
                employeeGroupAudience: values.employeeGroupAudience,
                employeeOnboardingAssignable,
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
            employeeGroupAudience: values.employeeGroupAudience,
            employeeOnboardingAssignable,

            isDefault: true,
            isPublic: false,
            extraProperties: {
              color: values.color,
              roleAudience: 'Employee',
              employeeGroupAudience: values.employeeGroupAudience,
              employeeOnboardingAssignable,
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
          <ShakingTextField
            error={
              formik.touched.employeeGroupAudience && Boolean(formik.errors.employeeGroupAudience)
            }
          >
            <TextField
              select
              label="Employee Group Availability"
              name="employeeGroupAudience"
              size="small"
              disabled={isSuccess}
              value={formik.values.employeeGroupAudience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.employeeGroupAudience && Boolean(formik.errors.employeeGroupAudience)
              }
              helperText={
                (formik.touched.employeeGroupAudience && formik.errors.employeeGroupAudience) ||
                'Controls which employee groups can select this role.'
              }
              fullWidth
            >
              {EMPLOYEE_GROUP_AUDIENCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  name="employeeOnboardingAssignable"
                  checked={
                    !isReservedEmployeeOnboardingRoleName(formik.values.role) &&
                    formik.values.employeeOnboardingAssignable
                  }
                  disabled={isSuccess || isReservedEmployeeOnboardingRoleName(formik.values.role)}
                  onChange={formik.handleChange}
                />
              }
              label="Available for employee onboarding"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              Allows HR users to assign this role when creating an employee. Reserved system roles
              cannot be enabled.
            </Typography>
          </Box>
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

export const PermissionForm = PermissionAccessForm;

const VisibilityForm = (props: Omit<React.ComponentProps<typeof PermissionAccessForm>, 'providerName' | 'mode'>) => (
  <PermissionAccessForm {...props} providerName="R" mode="visibility" />
);
