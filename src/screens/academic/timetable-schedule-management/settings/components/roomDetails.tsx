'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Create } from '@mui/icons-material';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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

const RoomDetails = () => {
  // Dialog state to control the visibility of the dialog
  const dialog = useBoolean();

  // State to store the selected entry for editing
  const [selectedEntry, setSelectedEntry] = useState<any>(tableData);

  // State to track whether we are in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store all room data entries
  const [roomData, setRoomData] = useState(tableData);

  // Function to close dialog and reset edit mode
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  /**
   * Handles saving room data from the dialog form
   * @param dataFromDialog - Object containing room details (roomNumber, buildingName, floor, capacity)
   * @returns void
   *
   * This method:
   * 1. Checks if the room already exists using room number and building name
   * 2. Prevents duplicate entries when creating new rooms
   * 3. Creates new room entry or updates existing room based on isEdit flag
   * 4. Updates the roomData state with new/modified entry
   * 5. Closes the dialog after successful operation
   */
  const handleSave = (dataFromDialog: any) => {
    const { roomNumber, buildingName, floor, capacity } = dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = roomData.findIndex(
        (val) => roomNumber === val.roomNumber && buildingName === val.buildingName
      );

      // If the entry already exists and it's not an edit, show duplicate dialog
      if (existingEntryIndex !== -1 && !isEdit) {
        closeDialog();
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

    closeDialog();
  };

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          size="small"
          variant="contained"
          onClick={dialog.onTrue}
        >
          Room
        </Button>
      </Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
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
                    dialog.onTrue();
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
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
      >
        <RoomCreationForm
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={roomData}
        />
      </CustomDialog>
    </Box>
  );
};

export default RoomDetails;

/**
 * Props interface for the RoomCreationForm component
 * @property {boolean} dialogValue - Controls the visibility of the dialog
 * @property {any} data - Data of the room to be edited
 * @property {Function} onSave - Callback function to handle form submission
 * @property {Function} onClose - Callback function to close the dialog
 * @property {boolean} isEdit - Flag to determine if form is in edit mode
 * @property {any} allData - Array of all existing room data
 */

interface RoomCreationFormProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

/**
 * Interface for form values used in Formik
 * @property {string} roomNumber - Room number/name identifier
 * @property {string} buildingName - Name of the building
 * @property {string} floor - Floor number where room is located
 * @property {string} capacity - Maximum capacity of the room
 */
interface FormikValue {
  roomNumber: string;
  buildingName: string;
  floor: string;
  capacity: string;
}
// eslint-disable-next-line @typescript-eslint/no-shadow
const RoomCreationForm: React.FC<RoomCreationFormProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  // State to track and display message when a duplicate room entry is attempted
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      roomNumber: isEdit ? (data.roomNumber ?? 0) : 0,
      buildingName: isEdit ? (data.buildingName ?? '') : '',
      floor: isEdit ? (data.floor ?? 0) : 0,
      capacity: isEdit ? (data.capacity ?? 0) : 0,
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.roomNumber) === normalize(values.roomNumber)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                disabled={isEdit}
                label="Room Name"
                size="small"
                name="roomNumber"
                type="number"
                value={formik.values.roomNumber}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                disabled={isEdit}
                label="Building Name"
                size="small"
                value={formik.values.buildingName}
                name="buildingName"
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="floor"
                disabled={isEdit}
                type="number"
                value={formik.values.floor}
                onChange={formik.handleChange}
                label="Floors"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="capacity"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                label="Room Capacity"
                type="number"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button startIcon={<Create />} type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
