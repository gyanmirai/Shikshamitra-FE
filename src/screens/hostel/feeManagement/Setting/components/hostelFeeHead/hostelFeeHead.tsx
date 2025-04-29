import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetfeeHeadQuery,
  useAddfeeHeadMutation,
  useDeletefeeHeadMutation,
  useUpdatefeeHeadMutation,
} from 'src/redux/feeHead/feeHeadApi';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

const HostelFeeHead = (props: TabComponentType) => {
  // State to store and manage the new fee head name input value
  const [newFeeHead, setNewFeeHead] = useState<string>('');
  // State to track if a fee head is being added
  const [isAdding, setIsAdding] = useState<boolean>(false);
  // State to store the ID of the selected fee head
  const [selectedFeeHeadId, setSelectedFeeHeadId] = useState<string | null>(null);
  // State to store the name of the selected fee head
  const [selectedFeeHeadName, setSelectedFeeHeadName] = useState<string | null>(null);
  // Boolean state to control delete confirmation dialog visibility
  const dialogForDeleteConfirmation = useBoolean();
  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // Fetch the list of fee heads from the API
  const { data: feeHeadList, isLoading: isFeeHeadLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetfeeHeadQuery,
  });

  // Mutation hook for adding a new fee head
  const [addFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddfeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head added Successfully',
    },
  });

  // Mutation hook for deleting a fee head
  const [deleteFeeHead, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletefeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head Delete Successfully',
    },
  });

  // Mutation hook for updating a fee head
  const [updateFeeHead, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatefeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head Update Successfully',
    },
  });

  // Handler for adding or updating a fee head
  const handleAddFeeHead = async () => {
    if (isEdit) {
      // Validation for empty fee head name
      if (!newFeeHead.trim()) {
        alert('Fee head name cannot be empty!');
        return;
      }

      // Check for duplicate fee head names when updating
      const isDuplicate = feeHeadList?.items?.some(
        (item: any) =>
          item.feeHeadName.toLowerCase() === newFeeHead.toLowerCase() &&
          item.id !== selectedFeeHeadId
      );

      if (isDuplicate) {
        alert('This fee head name already exists!');
        return;
      }

      setIsAdding(true);

      try {
        // Update existing fee head
        await updateFeeHead({
          id: selectedFeeHeadId,
          body: {
            feeHeadName: newFeeHead,
          },
        }).unwrap();
        setNewFeeHead('');
        setIsEdit(false);
      } catch (error) {
        console.error('Failed to update Fee Head:', error);
      } finally {
        setIsAdding(false);
      }
    } else {
      // Validation for empty fee head name
      if (!newFeeHead.trim()) {
        alert('Fee head name cannot be empty!');
        return;
      }

      // Check for duplicate fee head names when adding
      const isDuplicate = feeHeadList?.items?.some(
        (item: any) => item.feeHeadName.toLowerCase() === newFeeHead.toLowerCase()
      );

      if (isDuplicate) {
        alert('This fee head name already exists!');
        return;
      }

      setIsAdding(true);

      try {
        // Add new fee head
        await addFeeHead({ feeHeadName: newFeeHead }).unwrap();
        setNewFeeHead('');
      } catch (error) {
        console.error('Failed to add Fee Head:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  // Handler for deleting a fee head
  const handleDeleteFeeHead = async () => {
    if (!selectedFeeHeadId) return;

    try {
      await deleteFeeHead(selectedFeeHeadId).unwrap();
      dialogForDeleteConfirmation.onFalse();
    } catch (error) {
      console.error('Failed to delete Fee Head:', error);
    }
  };

  // Handler for initiating edit mode
  const handleEditClick = (value: any) => {
    setIsEdit(true);
    setNewFeeHead(value.feeHeadName);
    setSelectedFeeHeadId(value.id);
  };
  return (
    <Box display="flex" flexDirection="column" gap={2} p={2}>
      {/* Add New Fee Head */}
      <Grid item xs={12} md={6}>
        <Box
          pt="15px"
          display="flex"
          justifyItems="center"
          alignItems="center"
          flexDirection="row"
          gap={3}
        >
          <TextField
            autoFocus
            name="newFeeHead"
            label="Add New Fee Head"
            size="small"
            value={newFeeHead}
            onChange={(e) => setNewFeeHead(capitalizeWords(e.target.value))}
          />

          {isEdit ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleAddFeeHead}
              disabled={isUpdateLoading || newFeeHead.trim() === ''}
            >
              {isUpdateLoading ? 'Updating...' : 'Save'}
            </Button>
          ) : (
            <Button
              startIcon={<Iconify icon="ic:outline-plus" />}
              variant="contained"
              size="small"
              onClick={handleAddFeeHead}
              disabled={isAdding || newFeeHead.trim() === ''}
            >
              {isAdding ? 'Adding...' : 'Add New Fee Head'}
            </Button>
          )}
        </Box>
      </Grid>

      {/* Fee Heads Table */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Box>
            <CustomizableTable
              noDataText={<>No Fee Head Found </>}
              isLoading={isFeeHeadLoading}
              tableId="set-default-fee"
              isShowedDense={false}
              isPagination={false}
              isFilter={false}
              isSearch={false}
              columns={[
                {
                  id: 'feeHeadName',
                  label: 'Existing Fee Head',
                  render(value) {
                    return (
                      <Typography fontSize="12px" sx={{ textTransform: 'capitalize' }}>
                        {value}
                      </Typography>
                    );
                  },
                },
                {
                  id: 'action',
                  label: 'Action',
                  isFilter: false,
                  isSort: false,
                  minWidth: 70,
                  sticky: true,
                  align: 'center',
                  render(row, value) {
                    return (
                      <ThreeDotsActions
                        showThreeDots={false}
                        showDeleteIcon
                        showEditIcon
                        handleEditClick={() => {
                          handleEditClick(value);
                        }}
                        handleDeleteClick={() => {
                          setSelectedFeeHeadId(value.id);
                          const capitalizeName =
                            value.feeHeadName.charAt(0).toUpperCase() +
                            value.feeHeadName.slice(1).toLowerCase();
                          setSelectedFeeHeadName(capitalizeName);
                          dialogForDeleteConfirmation.onTrue();
                        }}
                      />
                    );
                  },
                },
              ]}
              data={feeHeadList?.items || []}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedFeeHeadId(null);
            setSelectedFeeHeadName(null);
          }}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton
              variant="contained"
              loading={isDeleteLoading}
              color="error"
              onClick={handleDeleteFeeHead}
            >
              Delete
            </LoadingButton>
          }
        />

        // <DeleteConfirmationDialog

        //   onConfirm={handleDeleteFeeHead}
        //   title="Delete Item"
        //   description={
        //     <>
        //       Are you sure you want to delete <strong>{`${selectedFeeHeadName} Fee Head`}</strong> ?
        //       This action cannot be undone.
        //     </>
        //   }
        //   isDeleteLoading={isDeleteLoading}
        // />
      )}
    </Box>
  );
};

export default HostelFeeHead;
