'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import RoomCreationForm from './addRoomForm';

const tableData = [
  {
    roomNumber: 104,
    buildingName: 'A',
    floor: 2,
    capacity: 50,
  },
  {
    roomNumber: 102,
    buildingName: 'A',
    floor: 2,
    capacity: 50,
  },
  {
    roomNumber: 101,
    buildingName: 'A',
    floor: 2,
    capacity: 50,
  },
];

const RoomDetails = ({ addRoomDialog }: any) => {
  // addRoomDialog state to control the visibility of the addRoomDialog
  // const addRoomDialog = useBoolean();

  // State to store the selected entry for editing
  const [selectedEntry, setSelectedEntry] = useState<any>(tableData);

  // State to track whether we are in edit mode
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // State to store all room data entries
  const [roomData, setRoomData] = useState(tableData);

  /**
   * Handles saving room data from the addRoomDialog form
   * @param dataFromaddRoomDialog - Object containing room details (roomNumber, buildingName, floor, capacity)
   * @returns void
   *
   * This method:
   * 1. Checks if the room already exists using room number and building name
   * 2. Prevents duplicate entries when creating new rooms
   * 3. Creates new room entry or updates existing room based on isEdit flag
   * 4. Updates the roomData state with new/modified entry
   * 5. Closes the addRoomDialog after successful operation
   */
  const handleSave = (dataFromaddRoomDialog: any) => {
    const { roomNumber, buildingName, floor, capacity } = dataFromaddRoomDialog;

    if (dataFromaddRoomDialog) {
      const existingEntryIndex = roomData.findIndex(
        (val) => roomNumber === val.roomNumber && buildingName === val.buildingName
      );

      // If the entry already exists and it's not an edit, show duplicate addRoomDialog
      if (existingEntryIndex !== -1 && !isEdit) {
        addRoomDialog.onFalse();
        return;
      }

      const newRoomEntry = {
        roomNumber,
        buildingName,
        floor,
        capacity,
        action: 'View',
      };

      // If it's not an edit, add the new entry; if it's an edit, update the existing entry
      if (!isEdit && existingEntryIndex === -1) {
        setRoomData([...roomData, newRoomEntry]); // Add new room entry
      } else if (isEdit && existingEntryIndex !== -1) {
        const updatedRoomData = roomData.map((room, index) =>
          index === existingEntryIndex ? { ...room, ...newRoomEntry } : room
        );
        setRoomData(updatedRoomData); // Update room data
      }
    }
    addRoomDialog.onFalse();

    shikshaMitraToast.success({ message: 'Room added successfully' });
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addRoomDialog.onFalse();
      setIsEdit(false);
      setSelectedEntry(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addRoomDialog.onFalse();
      setIsEdit(false);
      setSelectedEntry(null);
    }
  };

  return (
    <Box>
      {/* <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          size="small"
          variant="contained"
          onClick={addRoomDialog.onTrue}
          sx={{
            width: '145px',
          }}
        >
          Room
        </Button>
      </Box> */}
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        searchFieldProps={{
          placeholder: 'Search by Room Number, Building Name, Floor...',
          label: 'Search by Room Number, Building Name, Floor...',
          sx: {
            width: '100%',
            maxWidth: '400px',
          },
        }}
        noDataText={
          <>
            No Rooms Data Found{' '}
            <Box
              onClick={() => {
                addRoomDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Room
            </Box>
          </>
        }
        columns={[
          { id: 'roomNumber', label: 'Room Number', filterType: 'number' },
          { id: 'buildingName', label: 'Building Name', filterType: 'number' },
          { id: 'floor', label: 'Floor', filterType: 'number' },
          { id: 'capacity', label: 'Capacity', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            minWidth: '50px',
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setIsEdit(true);
                    setSelectedEntry(row);
                    addRoomDialog.onTrue();
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={roomData}
      />
      <CustomDialog
        title={isEdit ? 'Update Room' : 'Create Room'}
        open={addRoomDialog.value}
        handleClose={addRoomDialog.onFalse}
        maxWidth="sm"
      >
        <RoomCreationForm
          onSave={handleSave}
          dialogValue={addRoomDialog.value}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
          allData={roomData}
        />
      </CustomDialog>
    </Box>
  );
};

export default RoomDetails;

// eslint-disable-next-line @typescript-eslint/no-shadow
