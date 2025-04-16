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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IGroup } from './type';

const GroupManagement = () => {
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
        <Button startIcon={<Add />} variant="outlined" onClick={dialog.onTrue}>
          Add Group
        </Button>
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title={`${editData ? 'Update' : 'Create'}`}
        content={`Are you sure want to ${editData ? 'Update' : 'Create'} Education Board ?`}
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              try {
                await deleteGroup().unwrap();
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
        noDataText={<>No Group Management Data Found </>}
        searchFieldProps={{
          placeholder: 'Search by name...',
          label: 'Search by name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        isLoading={isLoading}
        columns={[
          { label: 'Name', id: 'name' },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
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
        title={editData ? 'Update Group' : 'Add Group'}
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
        } else {
          // Add new group if no editData
          await addGroup({ name: values.name }).unwrap();
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
