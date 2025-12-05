'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import AssignmentTypeForm from './assignmentTypeForm';
import AssignmentTypeTable from './assignmentTypeTable';

import type { IAssignmentType } from './type';

const AssignmentTypeCreation = () => {
  // Dialog control for add/edit form
  const addAssignmentTypeDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();
  // State to control modal visibility (unused)
  const [, setOpen] = useState(false);
  // Get changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Selected assignment type data for edit/delete operations
  const [selectedData, setSelectedData] = useState<IAssignmentType | null>(null);
  // Table data containing list of assignment types
  const [tableData] = useState<IAssignmentType[]>([]);

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Handles dialog close with form submission check
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedData(null);
        dispatch(setIsChanges(false));
      }, 300); // Optional: adjust delay to match your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addAssignmentTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addAssignmentTypeDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment' },
          { name: 'Settings' },
          { name: 'Assignment Type' },
        ]}
        heading="Assignment Type"
        description="Create and manage assignment types for homework and assignments. Add, edit, or delete assignment types as needed."
        action={
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            variant="contained"
            onClick={addAssignmentTypeDialog.onTrue}
            size="small"
            sx={{ px: '32px' }}
          >
            Assignment Type
          </Button>
        }
        sx={{ mb: 3 }}
      />

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
          setTimeout(() => {
            setSelectedData(null);
          }, 200); // Match this delay to your dialog's transition duration
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
                  ? 'You can update the assignment type details entering the name.'
                  : 'You can create a new assignment type by entering the name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignmentTypeForm
          open={addAssignmentTypeDialog}
          onClose={handleClose}
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
                message: `${selectedData?.assignmentTypeName} Assignment Type deleted successfullly`,
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
