import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

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
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

const SetDefaultFeeComponent = () => {
  const [newFeeHead, setNewFeeHead] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFeeHeadId, setSelectedFeeHeadId] = useState(null);
  const [selectedFeeHeadName, setSelectedFeeHeadName] = useState(null);
  const dialogForDeleteConfirmation = useBoolean();
  const [isEdit, setIsEdit] = useState(false);

  const { data: feeHeadList, isLoading: isFeeHeadLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetfeeHeadQuery,
  });

  const [addFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddfeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head added Successfully',
    },
  });

  const [deleteFeeHead, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletefeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head Delete Successfully',
    },
  });

  const [updateFeeHead, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatefeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head Update Successfully',
    },
  });

  const handleAddFeeHead = async () => {
    if (isEdit) {
      if (!newFeeHead.trim()) {
        alert('Fee head name cannot be empty!');
        return;
      }

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
      if (!newFeeHead.trim()) {
        alert('Fee head name cannot be empty!');
        return;
      }

      const isDuplicate = feeHeadList?.items?.some(
        (item: any) => item.feeHeadName.toLowerCase() === newFeeHead.toLowerCase()
      );

      if (isDuplicate) {
        alert('This fee head name already exists!');
        return;
      }

      setIsAdding(true);

      try {
        await addFeeHead({ feeHeadName: newFeeHead }).unwrap();
        setNewFeeHead('');
      } catch (error) {
        console.error('Failed to add Fee Head:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleDeleteFeeHead = async () => {
    if (!selectedFeeHeadId) return;

    try {
      await deleteFeeHead(selectedFeeHeadId).unwrap();
      dialogForDeleteConfirmation.onFalse();
    } catch (error) {
      console.error('Failed to delete Fee Head:', error);
    }
  };

  const handleEditClick = (value: any) => {
    setIsEdit(true);
    setNewFeeHead(value.feeHeadName);
    setSelectedFeeHeadId(value.id);
  };
  return (
    <Box display="flex" flexDirection="column" gap={2}>
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
            name="newFeeHead"
            label="Add New Fee Head"
            size="small"
            value={newFeeHead}
            onChange={(e) => setNewFeeHead(e.target.value)}
          />
          {isEdit ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleAddFeeHead}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? 'Updating...' : 'Save'}
            </Button>
          ) : (
            <Button
              startIcon={<Iconify icon="ic:outline-plus" />}
              variant="contained"
              size="small"
              onClick={handleAddFeeHead}
              disabled={isAdding}
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
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedFeeHeadId(null);
            setSelectedFeeHeadName(null);
          }}
          onConfirm={handleDeleteFeeHead}
          title="Delete Item"
          description={
            <>
              Are you sure you want to delete <strong>{`${selectedFeeHeadName} Fee Head`}</strong> ?
              This action cannot be undone.
            </>
          }
          isDeleteLoading={isDeleteLoading}
        />
      )}
    </Box>
  );
};

export default SetDefaultFeeComponent;
