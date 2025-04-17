import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetAllStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetStudentGroupQuery,
  useSetGroupLeaderMutation,
  useAddStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useUpdateStudentGroupMutation,
  useAssignStudentGroupMutation,
} from 'src/redux/student/student-group/student-group';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IGroup } from './type';

const GroupManagement = () => {
  // State to store query parameters
  const [queryParams, setQueryParams] = useState({
    SkipCount: 0,
    MaxResultCount: 10,
    Sorting: 'name ASC',
  });
  // State to manage dialog for assigning group leaders
  const assignLeaderDialog = useBoolean();
  // State to manage dialog for assigning students
  const assignStudentDialog = useBoolean();
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // State to store group data being edited
  const [editData, setEditData] = useState<null | IGroup>(null);
  // Fetch all student groups
  const { data: groupData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentGroupQuery,
    params: queryParams,
  });
  // Close dialog and reset edit data
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };

  // Delete group mutation hook
  const [deleteGroup, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteStudentGroupMutation,
  });
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          House
        </Button>
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete House"
        content={
          <>
            Are you sure want to Delete <b>{`${editData?.name}`}</b> House ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              try {
                await deleteGroup(editData?.id).unwrap();
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: 'House Deleted Successfully',
                });
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="group-management-table"
        noDataText={
          <>
            No House Data Found{' '}
            <Box
              onClick={dialog.onTrue}
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
              Add House
            </Box>{' '}
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by house name...',
          label: 'Search by house name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        totalCount={groupData?.totalCount || 0}
        isLoading={isLoading}
        // serverSide
        onServerPagination={async (page, rowPerPage) => {
          const newParams = {
            ...queryParams,
            SkipCount: page * rowPerPage,
            MaxResultCount: rowPerPage,
          };
          setQueryParams(newParams);
        }}
        onServerSort={async (column, sort) => {}}
        columns={[
          { label: 'House Name', id: 'name' },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '100px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row as IGroup);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IGroup);
                    confirm.onTrue();
                  }}
                  placement="right-top"
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setEditData(row as IGroup);
                          assignStudentDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="hugeicons:student" />
                        Assign Student
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setEditData(row as IGroup);
                          assignLeaderDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent-mdl2:party-leader" />
                        Assign leader
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={groupData?.items || []}
      />{' '}
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={editData ? 'Update House' : 'Add House'}
      >
        <GroupManagementForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
      <CustomDialog
        open={assignStudentDialog.value}
        handleClose={() => {
          assignStudentDialog.onFalse();
          setEditData(null);
        }}
        title="Assign Students"
      >
        <AssignStudentForm
          editData={editData}
          handleClose={() => {
            assignStudentDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
      <CustomDialog
        open={assignLeaderDialog.value}
        handleClose={() => {
          assignLeaderDialog.onFalse();
          setEditData(null);
        }}
        title="Assign Students"
      >
        <AssignLeaderForm
          editData={editData}
          handleClose={() => {
            assignLeaderDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default GroupManagement;

const GroupManagementForm = ({
  editData,
  handleClose,
}: {
  editData: IGroup | null;
  handleClose: () => void;
}) => {
  // Hooks for adding and updating student groups using custom query and mutation hook
  const [addGroup, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentGroupMutation,
  });
  const [updateGroup, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGroupMutation,
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    // Set initial name value from editData if exists, otherwise empty string
    initialValues: {
      name: editData?.name || '',
    },
    // Handle form submission for both add and update operations
    onSubmit: async (values) => {
      console.log('formik');
      try {
        if (editData) {
          // Update existing group if editData exists
          await updateGroup({
            id: editData.id,
            body: {
              name: values.name,
            },
          }).unwrap();
          shikshaMitraToast.success({ message: `House Updated Successfully` });
        } else {
          // Add new group if no editData
          await addGroup({ name: values.name }).unwrap();
          shikshaMitraToast.success({ message: `House Added Successfully` });
        }
        // Close dialog after successful operation
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2} p={2}>
        <TextField
          size="small"
          value={formik.values.name}
          name="name"
          placeholder="Enter House Name"
          label="House Name"
          autoFocus
          onChange={(e) => {
            const value = capitalize(e.target.value);
            formik.setFieldValue('name', value);
          }}
        />
        <DialogActions sx={{ p: 0 }}>
          <Button size="small" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            loading={isLoading || isUpdateLoading}
          >
            {editData ? 'Update' : 'Add'}
          </LoadingButton>
        </DialogActions>
      </Stack>
    </Box>
  );
};

// Component for assigning students to groups
const AssignStudentForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: IGroup | null;
}) => {
  // Hook for assigning students to groups mutation
  const [assignStudent, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignStudentGroupMutation,
  });

  // Hook for fetching all students data
  const { data: studentData, isLoading: isStudentLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentsQuery,
  });

  // Formik instance for form handling
  const formik = useFormik<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>({
    // Initial form values
    initialValues: {
      student: { id: '', firstName: '', lastName: '' },
    },
    // Validation schema for form fields
    validationSchema: Yup.object({
      student: Yup.object({
        id: Yup.string().required('Student is required'),
      }),
    }),
    // Form submission handler
    onSubmit: async (values) => {
      try {
        await assignStudent({
          studentId: values.student.id,
          studentGroupId: editData?.id || '',
          isLeader: false,
        }).unwrap();
        shikshaMitraToast.success({ message: `Student Assigned Successfully` });
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <Stack spacing={2}>
        <Autocomplete
          noOptionsText="No Student Found"
          fullWidth
          value={formik.values.student}
          onChange={(_, val) => formik.setFieldValue('student', val)}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {`${option?.firstName || ''} ${option?.lastName || ''}`}
            </li>
          )}
          options={studentData?.items || []}
          getOptionLabel={(option: any) => `${option?.firstName} ${option?.lastName}`}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label="Search Student"
              placeholder="Search Student"
              error={formik.touched.student && Boolean(formik.errors.student?.id)}
              helperText={formik.touched.student && formik.errors.student?.id}
            />
          )}
        />
      </Stack>
      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button size="small" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton size="small" type="submit" variant="contained" loading={isLoading}>
          Assign
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

/**
 * Component for assigning a leader to a group
 * @param {Object} props - Component props
 * @param {Function} props.handleClose - Function to handle dialog close
 * @param {Object|null} props.editData - Group data being edited
 */
const AssignLeaderForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: IGroup | null;
}) => {
  /**
   * Custom hook for assigning students as group leaders
   * Returns mutation function and loading state
   */
  const [assignLeader, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetGroupLeaderMutation,
  });

  /**
   * Custom hook for fetching all students data
   * Returns students data and loading state
   */
  const { data: studentData, isLoading: isStudentLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentsQuery,
  });

  /**
   * Formik instance for handling form state and validation
   * Manages student selection and form submission
   */
  const formik = useFormik<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
      groupId: string;
    };
  }>({
    // Initial form values
    initialValues: {
      student: { id: '', firstName: '', lastName: '', groupId: '' },
    },
    // Validation schema for form fields
    validationSchema: Yup.object({
      student: Yup.object({
        id: Yup.string().required('Student is required'),
      }),
    }),
    /**
     * Handles form submission
     * Assigns selected student as group leader
     * @param {Object} values - Form values
     */
    onSubmit: async (values) => {
      try {
        await assignLeader({
          studentId: values.student.id,
          studentGroupId: editData?.id,
        }).unwrap();
        shikshaMitraToast.success({ message: `leader Assigned Successfully` });
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <Stack spacing={2}>
        <Autocomplete
          noOptionsText="No Student Found"
          fullWidth
          loading={isStudentLoading}
          value={formik.values.student}
          onChange={(_, val) => formik.setFieldValue('student', val)}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {`${option?.firstName || ''} ${option?.lastName || ''}`}
            </li>
          )}
          options={studentData?.items || []}
          getOptionLabel={(option: any) => `${option?.firstName} ${option?.lastName}`}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label="Search Student"
              placeholder="Search Student"
              error={formik.touched.student && Boolean(formik.errors.student?.id)}
              helperText={formik.touched.student && formik.errors.student?.id}
            />
          )}
        />
      </Stack>
      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button size="small" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton size="small" type="submit" variant="contained" loading={isLoading}>
          Assign
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
