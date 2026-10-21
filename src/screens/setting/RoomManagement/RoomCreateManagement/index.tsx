'use client';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
  const { confirmWithUndo } = useConfirmWithUndo();

  // State for managing selected room and room data
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

  const handleClose = () => {
    addRoomDialog.onFalse();
    setSelectedRoom(null);
  };

  return (
    <Box
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading="Rooms"
        description="Create and manage rooms for effective facility management."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'Rooms & Buildings', href: instituteSetupPaths.roomsManagement.building },
          { name: 'Rooms' },
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

      {addRoomDialog.value && (
        <RoomForm open={addRoomDialog} onClose={handleClose} editData={selectedRoom} />
      )}

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
        disableBackdropClick
        onClose={() => {
          setSelectedRoom(null);
          deleteRoomDialog.onFalse();
        }}
        title="Delete Room?"
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
            Delete
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RoomCreateManagement;
