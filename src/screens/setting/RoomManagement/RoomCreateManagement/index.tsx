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
import { roomsApi, useDeleteRoomMutation } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import RoomTable from './components/roomTable';
import RoomForm from './components/AddRoomForm';

import type { IRoom } from './types';

const RoomCreateManagement = () => {
  // Dialog control hooks for add/edit and delete room modals
  const addRoomDialog = useBoolean();
  const deleteRoomDialog = useBoolean();
  const [deleteRoom, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoomMutation,
  });
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();

  // State for managing selected room and room data
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

  // Redux dispatch hook
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit room dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset component state
    const resetState = () => {
      setTimeout(() => {
        setSelectedRoom(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Close dialog if form submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addRoomDialog.onFalse();
      resetState();
    }
    // Close dialog if no unsaved changes
    else if (!isChanges) {
      addRoomDialog.onFalse();
      setTimeout(() => {
        setSelectedRoom(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Management"
        description="Create and manage rooms for effective facility management."
        links={[
          { name: 'Institute Setup', href: '/academic/dashboard' },
          { name: 'Rooms Management', href: '/academic/curriculumSubjects' },
          { name: 'Room Management' },
        ]}
        action={
          <Button
            variant="contained"
            onClick={addRoomDialog.onTrue}
            startIcon={<Add />}
            size="small"
            sx={{
              width: '130px',
            }}
          >
            Add Room
          </Button>
        }
      />

      <CustomDialog
        open={addRoomDialog.value}
        handleClose={() => {
          addRoomDialog.onFalse();
        }}
        maxWidth="sm"
        title={selectedRoom ? 'Update Room' : 'Add Room'}
      >
        <RoomForm open={addRoomDialog} onClose={handleClose} editData={selectedRoom} />
      </CustomDialog>

      <RoomTable
        onDelete={(data) => {
          setSelectedRoom(data);
          deleteRoomDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedRoom(data);
          addRoomDialog.onTrue();
        }}
      />

      <ConfirmDialog
        open={deleteRoomDialog.value}
        onClose={() => {
          setSelectedRoom(null);
          deleteRoomDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete room <strong>{selectedRoom?.roomName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              const roomToDelete = selectedRoom;
              let deletedRoomIndex = -1;

              confirmWithUndo({
                item: roomToDelete,
                message: `Room "${roomToDelete?.roomName}" deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    roomsApi.util.updateQueryData('getRooms', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray) return;
                      const index = targetArray.findIndex(
                        (item: any) => item.id === roomToDelete?.id
                      );
                      deletedRoomIndex = index;
                      setDeleteIndex(index);
                      if (index !== -1) {
                        targetArray.splice(index, 1);
                      }
                    })
                  ),
                onUndoRestore: (dispatchFn) => {
                  dispatchFn(
                    roomsApi.util.updateQueryData('getRooms', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray || deletedRoomIndex === -1 || !roomToDelete) return;
                      targetArray.splice(deletedRoomIndex, 0, roomToDelete);
                    })
                  );
                },
                onCommit: () => deleteRoom(roomToDelete?.id),
              });
              deleteRoomDialog.onFalse();
              setSelectedRoom(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RoomCreateManagement;
