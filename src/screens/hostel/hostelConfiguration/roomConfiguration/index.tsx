'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import hostelRoomData from 'src/json/hostel/hostelConfiguration/hostelRoomData.json';

import AddRoomForm from './roomForm';
import RoomTable from './roomDetailsTable';

import type { IHostelRoom } from './type';

const RoomConfiguration = () => {
  // Dialog state for adding new room
  const addNewRoomDialog = useBoolean();

  // State to store selected room for editing
  const [selectedRoom, setSelectedRoom] = useState<IHostelRoom | null>(null);

  // State to control form dialog visibility
  const [open, setOpen] = useState(false);

  // Get changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Dialog state for delete confirmation
  const deleteDialog = useBoolean();

  // Redux dispatch function
  const dispatch = useDispatch();

  // State to store all hostel room data
  const [roomData, setRoomData] = useState<IHostelRoom[]>(hostelRoomData);
  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Room Configuration', href: '' },
        { name: 'Room Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Room Configuration', href: '' },
      ];

  // Function to handle closing the form dialog
  // Parameters:
  // _e: any - Event object (unused)
  // isSubmit: boolean - Flag indicating if form was submitted
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false); // Close the dialog
      dispatch(setIsChanges(false)); // Reset changes flag in redux store
      setSelectedRoom(null); // Clear selected room data
    } else if (!isChanges) {
      // If no unsaved changes, simply close the dialog
      setOpen(false); // Close the dialog
      setSelectedRoom(null); // Clear selected room data
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Configuration"
        description={
          open
            ? 'Create or update room details such as name, type, floor, capacity, and status.'
            : 'View and manage all hostel rooms. Add new rooms, update details, or delete them.'
        }
        links={links}
        sx={{ mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleClose(null, false)
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Room'}
          </Button>
        }
      />

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddRoomForm
            open={addNewRoomDialog}
            onClose={() => handleClose(null, false)}
            editData={selectedRoom}
          />
        </Card>
      ) : (
        <RoomTable
          onAddRoom={() => {
            addNewRoomDialog.onTrue();
            setOpen(true);
          }}
          onDelete={(data) => {
            setSelectedRoom(data);
            deleteDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedRoom(data);
            setOpen(true);
          }}
          open={open}
          setOpen={setOpen}
          data={roomData}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedRoom(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete this room?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default RoomConfiguration;
