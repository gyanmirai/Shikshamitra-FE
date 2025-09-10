'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import RoomTable from './components/roomTable';
import RoomForm from './components/AddRoomForm';

import type { IRoom } from './types';

const RoomCreateManagement = () => {
  // Dialog control hooks for add/edit and delete room modals
  const addRoomDialog = useBoolean();
  const deleteRoomDialog = useBoolean();

  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State for managing selected room and room data
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomData, setRoomData] = useState<IRoom[]>([
    {
      id: 1,
      roomName: '101',
      capacity: 50,
      building: 'Building A',
      floor: '1',
      roomType: 'Lecture',
      totalBenches: 25,
      benchCapacity: 2,
      rows: 5,
      columns: 5,
      features: ['Projector', 'AC', 'Whiteboard'],
    },
    {
      id: 2,
      roomName: '102',
      capacity: 40,
      building: 'Building B',
      floor: '1',
      roomType: 'Lab',
      totalBenches: 20,
      benchCapacity: 2,
      rows: 4,
      columns: 5,
      features: ['Computers', 'AC', 'Whiteboard'],
    },
  ]);

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
        sx={{ px: 1, mb: 1 }}
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
        data={roomData}
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
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteRoomDialog.onFalse();
              setSelectedRoom(null);
              shikshaMitraToast.success({
                message: `Room ${selectedRoom?.roomName} deleted successfully`,
              });
              // handle delete action
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default RoomCreateManagement;
