import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetfeeHeadQuery, useDeletefeeHeadMutation } from 'src/redux/feeHead/feeHeadApi';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import SetFeeHeadDialog from '../dialogs/set-fee-head-dialog';

import type { IFinanceFeeSetHeadInterface } from '../dialogs/finance-general-settings-interface';

const SetDefaultFeeComponent = () => {
  // Dialog control for fee head add/edit form
  const setFeeHeadDialog = useBoolean();
  // Dialog control for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();

  // State to store selected fee head for editing
  const [selectedFeeHead, setSelectedFeeHead] = useState<IFinanceFeeSetHeadInterface | null>(null);
  // State to store ID of fee head to be deleted
  const [selectedFeeHeadId, setSelectedFeeHeadId] = useState<number | null>(null);
  // State to store name of fee head to be deleted (for confirmation message)
  const [selectedFeeHeadName, setSelectedFeeHeadName] = useState<string | null>(null);
  console.log('selectedFeeHead---', selectedFeeHead);

  // RTK Query hook to fetch all fee heads
  const { data: feeHeadList, isLoading: isFeeHeadLoading, refetch } = useGetfeeHeadQuery(null);

  // RTK Query mutation hook for deleting fee head
  const [deleteFeeHead, { isLoading: isDeleteLoading }] = useDeletefeeHeadMutation();

  /**
   * Handler for saving fee head (both add and edit operations)
   * Closes the dialog, resets selected fee head, and refreshes the list
   */
  const handleSaveFeeHead = () => {
    setFeeHeadDialog.onFalse();
    setSelectedFeeHead(null);
    refetch(); // Refresh list after add/edit
  };

  /**
   * Handler for deleting a fee head
   * Performs the delete operation, closes confirmation dialog,
   * resets selected states, and refreshes the list
   */
  const handleDeleteFeeHead = async () => {
    if (!selectedFeeHeadId) return;

    try {
      await deleteFeeHead(selectedFeeHeadId).unwrap();
      dialogForDeleteConfirmation.onFalse();
      setSelectedFeeHeadId(null);
      setSelectedFeeHeadName(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete Fee Head:', error);
    }
  };
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Fee Heads Table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box>
            <CustomizableTable
              noDataText={<>No Fee Head Found</>}
              isLoading={isFeeHeadLoading}
              tableId="set-default-fee"
              isShowedDense={false}
              isPagination={false}
              isFilter={false}
              columns={[
                {
                  id: 'feeHeadName',
                  label: 'Fee Head',
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
                  label: 'Actions',
                  isFilter: false,
                  isSort: false,
                  sticky: true,
                  align: 'left',
                  minWidth: 50,
                  render(value, row) {
                    return (
                      <ThreeDotsActions
                        showThreeDots={false}
                        showEditIcon
                        showDeleteIcon
                        handleEditClick={() => {
                          setSelectedFeeHead(row as IFinanceFeeSetHeadInterface);
                          setFeeHeadDialog.onTrue();
                        }}
                        handleDeleteClick={() => {
                          setSelectedFeeHeadId(row.id);
                          const capitalizedName =
                            row.feeHeadName.charAt(0).toUpperCase() +
                            row.feeHeadName.slice(1).toLowerCase();
                          setSelectedFeeHeadName(capitalizedName);
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

      {/* Edit Dialog */}

      <CustomDialog
        open={setFeeHeadDialog.value}
        handleClose={() => {
          setFeeHeadDialog.onFalse();
          setSelectedFeeHead(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFeeHead ? 'Update Fee Head' : 'Add Fee Head'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                selectedFeeHead
                  ? 'You can update the fee head details including name and other configurations.'
                  : 'You can add a new fee head by entering the name and configuring other settings.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SetFeeHeadDialog
          onClose={() => {
            setFeeHeadDialog.onFalse();
            setSelectedFeeHead(null);
          }}
          isEditMode
          data={selectedFeeHead}
          onSave={handleSaveFeeHead}
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedFeeHeadId(null);
            setSelectedFeeHeadName(null);
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete <strong>{selectedFeeHeadName}</strong> fee head?
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              loading={isDeleteLoading}
              color="error"
              size="small"
              onClick={handleDeleteFeeHead}
            >
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetDefaultFeeComponent;
