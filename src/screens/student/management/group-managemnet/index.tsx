import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { StudentApi } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetAllGroupQuery,
  useSetGroupLeaderMutation,
  useAddStudentGroupMutation,
  useRemoveGroupLeaderMutation,
  useDeleteStudentGroupMutation,
  useUpdateStudentGroupMutation,
  useAssignStudentGroupMutation,
  useRemoveDivisionLeaderMutation,
  useRemoveStudentFromGroupMutation,
  useSetGroupLeaderAsDivisionMutation,
} from 'src/redux/student/student-group/student-group';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IGroup } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry';

const GroupManagement = ({
  tableData,
  isLoading,
}: {
  tableData: IInquiryData[];
  isLoading: boolean;
}) => {
  // State to store query parameters
  const [queryParams, setQueryParams] = useState({
    SkipCount: 0,
    MaxResultCount: 10,
    Sorting: 'name ASC',
  });
  // State to manage dialog for assigning group leaders
  const assignLeaderAsDivisionDialog = useBoolean();
  // State to manage dialog for assigning students
  const assignStudentDialog = useBoolean();
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // State to manage group data
  const dispatch = useDispatch();
  // State to manage group data
  const isConfirmForDivisionLeader = useBoolean();
  // State to manage group data
  const isConfirmForMainLeader = useBoolean();
  // State to manage group data
  const isRemoveFromDivisionLeader = useBoolean();
  // State to manage group data
  const isRemoveLeader = useBoolean();
  // State to manage group data
  const isRemovestudetToHouse = useBoolean();

  // State to store group data being edited
  const [editData, setEditData] = useState<null | IInquiryData>(null);

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
  // set division leader  group mutation hook
  const [assignDivisionLeader, { isLoading: isAssignDivisionLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetGroupLeaderAsDivisionMutation,
  });
  // set division leader  group mutation hook
  const [assignMainLeader, { isLoading: isAssignMainLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetGroupLeaderMutation,
  });
  // set division leader  group mutation hook
  const [removeDivisionLeader, { isLoading: isRemoveDivisionLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveDivisionLeaderMutation,
  });
  // remove  leader  group mutation hook
  const [removeLeader, { isLoading: isRemoveLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveGroupLeaderMutation,
  });
  // remove  leader  group mutation hook
  const [removeStudentFromHouse, { isLoading: isRemoveStudentFromHouse }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveStudentFromGroupMutation,
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
            Are you sure you want to delete <b>{`${editData?.name}`}</b> House ?
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
            Yes
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isRemoveFromDivisionLeader.value}
        onClose={() => {
          isRemoveFromDivisionLeader.onFalse();
          setEditData(null);
        }}
        title="Remove Division Leader"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.name}`}</b> from Division Leader ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveDivisionLeaderLoading}
            color="error"
            onClick={async () => {
              try {
                await removeDivisionLeader(editData?.groupMembership?.groupId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: 'Removed Division Leader Successfully',
                });
                isRemoveFromDivisionLeader.onFalse();
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isRemoveLeader.value}
        onClose={() => {
          isRemoveLeader.onFalse();
          setEditData(null);
        }}
        title="Remove Division Leader"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.name}`}</b> from House Leader ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveLeaderLoading}
            color="error"
            onClick={async () => {
              try {
                await removeLeader(editData?.groupMembership?.groupId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: 'Removed House Leader Successfully',
                });
                isRemoveLeader.onFalse();
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isRemovestudetToHouse.value}
        onClose={() => {
          isRemovestudetToHouse.onFalse();
          setEditData(null);
        }}
        title="Remove Student from house"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.name}`}</b> from House ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveStudentFromHouse}
            color="error"
            onClick={async () => {
              try {
                await removeStudentFromHouse({
                  groupId: editData?.groupMembership?.groupId,
                  studentId: editData?.id,
                }).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: 'Removed Student From House Successfully',
                });
                isRemovestudetToHouse.onFalse();
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isConfirmForDivisionLeader.value}
        onClose={() => {
          isConfirmForDivisionLeader.onFalse();
          setEditData(null);
        }}
        title="Assign Division Leader"
        content={
          <>
            Are you sure want to Assign Division Leader to <b>{`${editData?.name}`}</b> ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isAssignDivisionLeaderLoading}
            onClick={async () => {
              try {
                await assignDivisionLeader({
                  studentId: editData?.id,
                  studentGroupId: editData?.groupMembership?.groupId,
                }).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                isConfirmForDivisionLeader.onFalse();

                shikshaMitraToast.success({
                  message: 'Assigned Division Leader Successfully',
                });
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Assign
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isConfirmForMainLeader.value}
        onClose={() => {
          isConfirmForMainLeader.onFalse();
          setEditData(null);
        }}
        title="Assign Leader"
        content={
          <>
            Are you sure want to Assign Leader to <b>{`${editData?.name}`}</b> ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isAssignMainLeaderLoading}
            onClick={async () => {
              try {
                await assignMainLeader({
                  studentId: editData?.id,
                  studentGroupId: editData?.groupMembership?.groupId,
                }).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                isConfirmForMainLeader.onFalse();
                shikshaMitraToast.success({
                  message: 'Assigned House Leader Successfully',
                });
              } catch (error) {
                console.log(error);
              }
              setEditData(null);
            }}
          >
            Assign
          </LoadingButton>
        }
      />
      <CustomizableTable
        // onSendNotification={handlerSendNotification}
        // showCheckbox={selectedStudent.length !== 0}
        tableId="group-management-table"
        noDataText="No Student data available"
        isLoading={isLoading}
        columns={[
          // { id: 'srNo', label: 'Sr. No.' },
          { id: 'grNoRecord', label: 'GR No.', align: 'left', minWidth: '110px' },
          { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '120px' },
          { id: 'name', label: 'Name', align: 'left', minWidth: '160px' },
          {
            id: 'groupMembership.groupName',
            label: 'House Name',
            minWidth: '160px',
            render(value, row) {
              return (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {value ? <Label color="info">{value} House</Label> : <Box />}
                  <Box>
                    <Tooltip title="Change House">
                      <IconButton
                        sx={{ color: 'info.main' }}
                        onClick={() => {
                          setEditData(row as IInquiryData);
                          assignStudentDialog.onTrue();
                        }}
                      >
                        <Iconify icon="mage:exchange-a" />
                      </IconButton>
                    </Tooltip>
                    {value && (
                      <Tooltip
                        title="Remove from House"
                        onClick={() => {
                          setEditData(row as IInquiryData);
                          isRemovestudetToHouse.onTrue();
                        }}
                      >
                        <IconButton sx={{ color: 'error.main' }}>
                          <Iconify icon="jam:user-remove" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'groupMembership.isDivisionLeader',
            label: 'Division Leader',
            minWidth: '160px',
            render(value, row) {
              return (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {value ? <Label color="success">Yes</Label> : <Box />}
                  <Box>
                    {!value ? (
                      <Tooltip title="Assign Division Leader">
                        <IconButton
                          sx={{ color: 'info.main' }}
                          onClick={() => {
                            if (!row.groupMembership) {
                              shikshaMitraToast.error({ message: 'Please assign house first' });
                              return;
                            }
                            setEditData(row as IInquiryData);
                            isConfirmForDivisionLeader.onTrue();
                          }}
                        >
                          <Iconify icon="fluent-mdl2:party-leader" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove from Division Leader">
                        <IconButton
                          sx={{ color: 'error.main' }}
                          onClick={() => {
                            setEditData(row as IInquiryData);
                            isRemoveFromDivisionLeader.onTrue();
                          }}
                        >
                          <Iconify icon="material-symbols:group-remove-outline" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'groupMembership.isLeader',
            label: 'House Leader',
            minWidth: '160px',
            render(value, row) {
              return (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {value ? <Label color="success">Yes</Label> : <Box />}
                  <Box>
                    {!value ? (
                      <Tooltip title=" Assign House Leader">
                        <IconButton
                          sx={{ color: 'info.main' }}
                          onClick={() => {
                            if (!row.groupMembership) {
                              shikshaMitraToast.error({ message: 'Please assign house first' });
                              return;
                            }
                            setEditData(row as IInquiryData);
                            isConfirmForMainLeader.onTrue();
                          }}
                        >
                          <Iconify icon="fluent-mdl2:party-leader" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove from  Leader">
                        <IconButton
                          sx={{ color: 'error.main' }}
                          onClick={() => {
                            setEditData(row as IInquiryData);
                            isRemoveLeader.onTrue();
                          }}
                        >
                          <Iconify icon="material-symbols:group-remove-outline" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            },
          },
        ]}
        data={tableData || []}
      />{' '}
      {/* <CustomizableTable
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
      />{' '} */}
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
        title="Assign House"
      >
        <AssignStudentForm
          editData={editData}
          handleClose={() => {
            assignStudentDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
      {/* <CustomDialog
        open={assignLeaderAsDivisionDialog.value}
        handleClose={() => {
          assignLeaderAsDivisionDialog.onFalse();
          setEditData(null);
        }}
        title="Assign Students"
      >
        <AssignStudentForm
          editData={editData}
          handleClose={() => {
            assignLeaderAsDivisionDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog> */}
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

/**
 * Component for assigning a leader to a group
 * @param {Object} props - Component props
 * @param {Function} props.handleClose - Function to handle dialog close
 * @param {Object|null} props.editData - Group data being edited
 */
const AssignStudentForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: IInquiryData | null;
}) => {
  /**
   * Custom hook for assigning students as group leaders
   * Returns mutation function and loading state
   */
  const [assignStudent, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignStudentGroupMutation,
  });

  // Fetch all student groups
  // const { data: groupData, isLoading: isGetHouseLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetStudentGroupQuery,
  // });

  const { data: groupData, isLoading: isGetGroupLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllGroupQuery,
  });
  console.log('🚀 ~ groupData:', groupData);

  /**
   * Formik instance for handling form state and validation
   * Manages student selection and form submission
   */
  const formik = useFormik<{
    house: { name: string; id: string };
  }>({
    // Initial form values
    initialValues: {
      house: { name: '', id: '' },
    },
    // Validation schema for form fields
    validationSchema: Yup.object({
      house: Yup.object({
        id: Yup.string().required('please select a house'),
      }),
    }),
    /**
     * Handles form submission
     * Assigns selected student as group leader
     * @param {Object} values - Form values
     */
    onSubmit: async (values) => {
      try {
        await assignStudent({
          studentId: editData?.id,
          studentGroupId: values.house.id,
          isLeader: false,
          isDivisionLeader: false,
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
          noOptionsText="No House Found"
          fullWidth
          loading={isGetGroupLoading}
          value={formik.values.house}
          onChange={(_, val) => formik.setFieldValue('house', val)}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {option?.name}
            </li>
          )}
          options={groupData?.items || []}
          getOptionLabel={(option: any) => `${option?.name}`}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label="Search House"
              placeholder="Search House"
              error={formik.touched.house && Boolean(formik.errors.house?.id)}
              helperText={formik.touched.house && formik.errors.house?.id}
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
