import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

type PeriodSetting = {
  label: string;
  unit: string;
};
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

type AssignedTeacher = {
  subject: string;
  optionLabel: string;
  optionList: string[];
};

const TimeScheduleManagementSetting = () => {
  const [selectedEntry, setSelectedEntry] = useState(tableData);
  const [isEdit, setIsEdit] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [roomData, setRoomData] = useState(tableData);
  const dialog = useBoolean();
  const periodSettings: PeriodSetting[] = [
    { label: 'Class Duration (e.g., 45 minutes)', unit: 'Select Unit' },
    { label: 'Break Duration (e.g., 10 minutes)', unit: 'Select Unit' },
    { label: 'School Hours (e.g., 9 AM - 3 PM)', unit: 'Select Unit' },
  ];

  const assigningTeachers: AssignedTeacher[] = [
    { subject: 'Maths', optionLabel: 'List of teachers', optionList: ['Morris', 'Trump', 'Modi'] },
    {
      subject: 'Science',
      optionLabel: 'List of teachers',
      optionList: ['Morris', 'Trump', 'Modi'],
    },
  ];

  const handleCloseDuplicateDialog = () => {
    setShowDuplicateDialog(false);
  };

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
        setShowDuplicateDialog(true);
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
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Room
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Room Details
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'roomNumber', label: 'Room Number' },
          { id: 'buildingName', label: 'Building Name' },
          { id: 'floor', label: 'Floor' },
          { id: 'capacity', label: 'Capacity' },
          {
            id: 'action',
            label: 'Action',
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);

                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={roomData}
      />
      <Box>
        {dialog.value && selectedEntry && (
          <RoomCreationForm
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={roomData}
          />
        )}
      </Box>
      <Card sx={{ p: 2, mb: 1, mt: 3 }}>
        <Typography variant="h6">General Settings</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Switch />
          <Typography>Enable Notification for Timetable Changes</Typography>
          <Switch />
          <Typography>Auto-scheduling of classes</Typography>
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Period Settings</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 1 }}>
          {periodSettings.map((setting, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '200px',
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                name="description"
                label={setting.label}
                size="small"
                sx={{ mb: 1 }}
              />
              <CustomSelect
                label={setting.unit}
                options={[
                  { value: 'hours', label: 'Hours' },
                  { value: 'minute', label: 'Minute' },
                ]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { width: '100%' } }}
              />
            </Box>
          ))}
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Conflict Resolution Settings</Typography>
        <Box display="flex" sx={{ gap: 2, py: '20px' }}>
          <CustomSelect
            label="How Should TimeTable Conflicts Be Handled ?"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 320 } }}
          />
          <CustomSelect
            label="Notify Admin"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 320 } }}
          />
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Teacher and Subject Assignments</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '350px', py: '10px' }}>
          {assigningTeachers.map((teacher, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                mb: 2,
                gap: 2,
                pl: 1,
              }}
            >
              <TextField
                fullWidth
                name="description"
                label={teacher.subject}
                size="small"
                sx={{ flex: '1 1 auto', minWidth: '200px' }}
              />
              <Box sx={{ width: '16px' }} />
              <CustomSelect
                label={teacher.optionLabel}
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 150 } }}
              />
            </Box>
          ))}
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Teacher Availability</Typography>
        <Box display="flex" sx={{ gap: 2 }}>
          <CustomSelect
            label="Available Teacher"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 200 } }}
          />

          <DatePicker
            label="Date"
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />

          <CustomSelect
            label="Subject"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Button variant="contained">Save Changes</Button>
        </Box>
      </Card>
      <CustomDialog title="New Room" open={dialog.value} handleClose={dialog.onFalse} maxWidth="sm">
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

export default TimeScheduleManagementSetting;

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
      roomNumber: isEdit ? data.roomNumber ?? '' : '',
      buildingName: isEdit ? data.buildingName ?? '' : '',
      floor: isEdit ? data.floor ?? '' : '',
      capacity: isEdit ? data.capacity ?? '' : '',
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
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
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
          <DialogActions>
            <Button variant="contained" onClick={() => {}} color="warning">
              Cancel
            </Button>
            <Button type="submit" variant="contained" onClick={() => {}}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Scrollbar>
  );
};
