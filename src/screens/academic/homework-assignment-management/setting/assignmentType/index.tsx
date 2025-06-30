'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import AssignmentTypeForm from './assignmentTypeForm';
import AssignmentTypeTable from './assignmentTypeTable';

import type { IAssignmentType } from './type';

const AssignmentTypeCreation = ({ addAssignmentTypeDialog }: any) => {
  // Dialog control for add/edit form
  // const addAssignmentTypeDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();
  // State to control modal visibility (unused)
  const [open, setOpen] = useState(false);
  // Get changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Selected assignment type data for edit/delete operations
  const [selectedData, setSelectedData] = useState<IAssignmentType | null>(null);
  // Table data containing list of assignment types
  const [tableData, setTableData] = useState<IAssignmentType[]>([]);

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Handles dialog close with form submission check
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedData(null);
      addAssignmentTypeDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedData(null);
      addAssignmentTypeDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={addAssignmentTypeDialog.onTrue} startIcon={<Add />} size="small">
          Assignment Type
        </Button>
      </Box> */}

      <AssignmentTypeTable
        data={tableData}
        onEdit={(data) => {
          setSelectedData(data);
          addAssignmentTypeDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addAssignmentTypeDialog.value}
        handleClose={() => {
          addAssignmentTypeDialog.onFalse();
          setSelectedData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedData ? 'Update Assignment Type' : 'Add Assignment Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedData
                  ? 'You can update the assignment type details including name and other information'
                  : 'You can create a new assignment type by entering the name and other required details'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignmentTypeForm
          open={addAssignmentTypeDialog}
          onClose={() => handleClose(null, false)}
          editData={selectedData}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedData(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete assignment type{' '}
            <strong>{selectedData?.assignmentTypeName}</strong>?
          </>
        }
        action={
          <Button
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteDialog.onFalse();
              shikshaMitraToast.success({
                message: `Assignment Type : ${selectedData?.assignmentTypeName} deleted successfullly`,
              });
              setSelectedData(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default AssignmentTypeCreation;
