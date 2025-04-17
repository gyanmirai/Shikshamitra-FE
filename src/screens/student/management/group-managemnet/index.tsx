import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetStudentGroupQuery,
  useAddStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useUpdateStudentGroupMutation,
} from 'src/redux/student/student-group/student-group';

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
                  showThreeDots={false}
                  handleEditClick={() => {
                    setEditData(row as IGroup);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IGroup);
                    confirm.onTrue();
                  }}
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
