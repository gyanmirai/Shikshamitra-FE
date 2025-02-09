'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const tableData = [
  {
    roomNumber: '104',
    buildingName: 'A',
    floor: '2',
    capacity: 50,
  },
  {
    roomNumber: '102',
    buildingName: 'A',
    floor: '2',
    capacity: 50,
  },
  {
    roomNumber: '101',
    buildingName: 'A',
    floor: '2',
    capacity: 50,
  },
];

const RoomDetails = () => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any>(tableData);
  const [isEdit, setIsEdit] = useState(false);
  const [roomData, setRoomData] = useState(tableData);
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const handleSave = (dataFromDialog: any) => {
    const { roomNumber, buildingName, floor, capacity } = dataFromDialog;

    if (dataFromDialog) {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const existingEntryIndex = roomData.findIndex(
        (val) =>
          normalize(roomNumber) === normalize(val.roomNumber) &&
          normalize(buildingName) === normalize(val.buildingName)
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
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
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
          { id: 'roomNumber', label: 'Room Number' },
          { id: 'buildingName', label: 'Building Name' },
          { id: 'floor', label: 'Floor' },
          { id: 'capacity', label: 'Capacity' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
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

interface RoomCreationFormProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}
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
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      roomNumber: isEdit ? (data.roomNumber ?? '') : '',
      buildingName: isEdit ? (data.buildingName ?? '') : '',
      floor: isEdit ? (data.floor ?? '') : '',
      capacity: isEdit ? (data.capacity ?? '') : '',
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
      console.log('Form Submitted type', values);
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
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
