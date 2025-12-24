'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useDeleteHomeworkTypeMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';

import HomeworkTypeForm from './homeworkTypeForm';
import HomeworkTypeTable from './homeworkTypeTable';

import type { IHomeworkType } from './type';

const HomeworkTypeCreation = () => {
  // Dialog control for add/Update Homework Type
  const addHomeworkTypeDialog = useBoolean();

  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();

  // Modal open/close state
  const [, setOpen] = useState(false);

  // Track unsaved changes from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Get current medium from global state
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  // Currently selected homework type for edit/delete
  const [selectedData, setSelectedData] = useState<IHomeworkType | null>(null);

  // Redux dispatch function
  const dispatch = useDispatch();

  // Delete mutation hook
  const [deleteHomeworkType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteHomeworkTypeMutation,
  });

  /**
   * Handles closing of the add/edit dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay as needed
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addHomeworkTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addHomeworkTypeDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Homework Type"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment' },
          { name: 'Settings' },
          { name: 'Homework Type' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={addHomeworkTypeDialog.onTrue}
            size="small"
            sx={{ width: '160px' }}
          >
            Homework Type
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <HomeworkTypeTable
        onEdit={(data) => {
          setSelectedData(data);
          addHomeworkTypeDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addHomeworkTypeDialog.value}
        handleClose={() => {
          addHomeworkTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedData(null);
          }, 300); // Adjust delay if your dialog's animation is longer
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedData ? 'Update Homework Type' : 'Add Homework Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedData
                  ? 'You can update the homework type details entering the name.'
                  : 'You can create a new homework type by entering the name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <HomeworkTypeForm
          open={addHomeworkTypeDialog}
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
            Are you sure you want to delete Homework Type{' '}
            <strong>{selectedData?.homeworkTypeName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              try {
                const payload = {
                  academicMediumId: (currentMedium as any).id,
                  id: selectedData?.id,
                };
                await deleteHomeworkType(payload).unwrap();
                deleteDialog.onFalse();
                setSelectedData(null);
                shikshaMitraToast.success({
                  message: `Homework Type "${selectedData?.homeworkTypeName}" deleted successfully`,
                });
              } catch (error) {
                console.error('Failed to delete homework type', error);
              }
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default HomeworkTypeCreation;
