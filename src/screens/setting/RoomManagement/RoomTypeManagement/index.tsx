'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  roomTypeApi,
  useDeleteRoomTypeMutation,
} from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';

import RoomTypeForm from './components/roomTypeForm';
import RoomTypeTable from './components/roomTypeTable';

import type { IRoomType } from './types';

const RoomTypeManagement = () => {
  // Dialog control hooks for add/edit and delete room type modals
  const addRoomTypeDialog = useBoolean();
  const deleteRoomTypeDialog = useBoolean();
  const [deleteRoomType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoomTypeMutation,
  });
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();

  // State for managing selected room type and room type data
  const [selectedRoomType, setSelectedRoomType] = useState<IRoomType | null>(null);

  // Redux dispatch hook
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit room type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset component state
    const resetState = () => {
      setTimeout(() => {
        setSelectedRoomType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Close dialog if form submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addRoomTypeDialog.onFalse();
      resetState();
    }
    // Close dialog if no unsaved changes
    else if (!isChanges) {
      addRoomTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedRoomType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Type Management"
        description="Define and organize room types to ensure effective facility management."
        links={[
          { name: 'Institute Setup', href: '/academic/dashboard' },
          { name: 'Rooms Management', href: '/academic/curriculumSubjects' },
          { name: 'Room Type Management' },
        ]}
        action={
          <Button
            variant="contained"
            onClick={addRoomTypeDialog.onTrue}
            startIcon={<Add />}
            size="small"
            sx={{
              width: '130px',
            }}
          >
            Room Type
          </Button>
        }
      />

      <CustomDialog
        open={addRoomTypeDialog.value}
        handleClose={() => {
          addRoomTypeDialog.onFalse();
        }}
        title={selectedRoomType ? 'Update Room Type' : 'Add Room Type'}
      >
        <RoomTypeForm open={addRoomTypeDialog} onClose={handleClose} editData={selectedRoomType} />
      </CustomDialog>

      <RoomTypeTable
        onDelete={(data) => {
          setSelectedRoomType(data);
          deleteRoomTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedRoomType(data);
          addRoomTypeDialog.onTrue();
        }}
      />

      <ConfirmDialog
        open={deleteRoomTypeDialog.value}
        onClose={() => {
          deleteRoomTypeDialog.onFalse();
          setSelectedRoomType(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {selectedRoomType?.roomTypeName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedRoomType,
                message: `Room type "${selectedRoomType?.roomTypeName}" deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    roomTypeApi.util.updateQueryData('getRoomTypes', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray) return;
                      const index = targetArray.findIndex(
                        (item: any) => item.id === selectedRoomType?.id
                      );
                      setDeleteIndex(index);
                      if (index !== -1) {
                        targetArray.splice(index, 1);
                      }
                    })
                  ),
                onUndoRestore: (dispatchFn, index) => {
                  dispatchFn(
                    roomTypeApi.util.updateQueryData('getRoomTypes', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray || index === -1) return;
                      targetArray.splice(index, 0, selectedRoomType);
                    })
                  );
                },
                onCommit: () => deleteRoomType(selectedRoomType?.id),
              });
              deleteRoomTypeDialog.onFalse();
              setSelectedRoomType(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RoomTypeManagement;
