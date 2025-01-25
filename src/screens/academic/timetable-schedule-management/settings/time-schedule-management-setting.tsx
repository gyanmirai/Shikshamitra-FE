'use client';

import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { Add } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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

const TimeScheduleManagementSetting = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';

  const [selectedEntry, setSelectedEntry] = useState<any>(tableData);
  const [isEdit, setIsEdit] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [roomData, setRoomData] = useState(tableData);
  const dialog = useBoolean();
  const createSlotsDialog = useBoolean();
  const createLectureNumberDialog = useBoolean();

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

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
      }
    } else {
      const firstClass = classData?.items[0];
      setSearchParams?.({
        classId: firstClass?.id,
      });
    }
  }, [classData, classes, setSearchParams]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[{ name: 'Academic and Assignment' }, { name: 'Time Table' }, { name: 'Settings' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 1 }}
      >
        <Typography component="span" variant="h6" gutterBottom>
          Lectures Details
        </Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={createLectureNumberDialog.onTrue}
        >
          Create Number Of Lectures
        </Button>
      </Box>
      {/* <CustomSelect
        label="Class"
        options={classData?.items || []}
        labelKey="name"
        valueKey="id"
        onChange={(val) => {
          const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
          setSearchParams?.({
            classId: val as string,
          });
        }}
        value={classes}
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      /> */}
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'noOfLecture', label: 'No of Lectures' },
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
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            class: 'Class 1',
            noOfLecture: 8,
          },
          {
            class: 'Class 2',
            noOfLecture: 9,
          },
          {
            class: 'Class 3',
            noOfLecture: 6,
          },
          {
            class: 'Class 4',
            noOfLecture: 7,
          },
          {
            class: 'Class 5',
            noOfLecture: 5,
          },
        ]}
      />

      <Box
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 1 }}
      >
        <Typography component="span" variant="h6" gutterBottom>
          Slot Details
        </Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={createSlotsDialog.onTrue}
        >
          Create Slots
        </Button>
      </Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        columns={[
          { id: 'className', label: 'Class' },
          { id: 'periodSlots', label: 'Period Slots' },
          { id: 'breakSlots', label: 'Break Slots' },
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
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            className: 'Class 1',
            periodSlots: 6, // Number of periods
            breakSlots: 2, // Number of breaks
          },
          {
            id: 2,
            className: 'Class 2',
            periodSlots: 5,
            breakSlots: 1,
          },
          {
            id: 3,
            className: 'Class 3',
            periodSlots: 7,
            breakSlots: 2,
          },
        ]}
      />

      <Box
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 1 }}
      >
        <Typography component="span" variant="h6" gutterBottom>
          Room Details
        </Typography>
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

      {/* <Card sx={{ p: 2, mb: 1, mt: 3 }}>
        <Typography variant="h6">General Settings</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Switch />
          <Typography>Enable Notification for Timetable Changes</Typography>
          <Switch />
          <Typography>Auto-scheduling of classes</Typography>
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
            formControlProps={{ sx: { minWidth: 330 } }}
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
        <Box display="flex" sx={{ gap: 2, py: '20px' }}>
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
      </Card> */}
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

      <CustomDialog
        title="Create Slots"
        open={createSlotsDialog.value}
        handleClose={createSlotsDialog.onFalse}
        maxWidth="md"
      >
        <CreateSlotsForm
        // onSave={handleSave}
        // dialogValue={dialog.value}
        // onClose={closeDialog}
        // data={selectedEntry}
        // isEdit={isEdit}
        // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title="Create Number of Lectures"
        open={createLectureNumberDialog.value}
        handleClose={createLectureNumberDialog.onFalse}
        maxWidth="md"
      >
        <CreateNoOfLecture
        // onSave={handleSave}
        // dialogValue={dialog.value}
        // onClose={closeDialog}
        // data={selectedEntry}
        // isEdit={isEdit}
        // allData={roomData}
        />
      </CustomDialog>
    </Box>
  );
};

export default TimeScheduleManagementSetting;

const initialData = [
  { id: 1, subjects: 'Mathematics', noOfLecture: 0 },
  { id: 2, subjects: 'Science', noOfLecture: 0 },
  { id: 3, subjects: 'English', noOfLecture: 0 },
  { id: 4, subjects: 'History', noOfLecture: 0 },
  { id: 5, subjects: 'Geography', noOfLecture: 0 },
];

const CreateNoOfLecture = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [subjectList, setSubjectList] = useState(initialData);

  const handleInputChange = (id: number, value: string) => {
    const numValue = Math.max(0, parseInt(value, 10) || 0);

    setSubjectList((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, noOfLecture: numValue } : row))
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '450px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
              <FormHelperText error>{formik.errors.className}</FormHelperText>
            )} */}
            </Grid>
            <Grid item xs={12}>
              <CustomizableTable
                tableId="table-subject-list"
                isSearch={false}
                isShowedDense={false}
                isFilter={false}
                columns={[
                  {
                    id: 'subjects',
                    label: 'Subjects',
                  },
                  {
                    id: 'noOfLecture',
                    label: 'No Of Lecture',
                    render(value, row) {
                      return (
                        <TextField
                          type="number"
                          size="small"
                          value={value}
                          onChange={(e) => handleInputChange(row.id, e.target.value)}
                          className="w-24"
                        />
                      );
                    },
                  },
                ]}
                data={subjectList}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface TimeSlot {
  id: number;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  slotType: string;
  breakType?: string; // Optional field for break type
}

const CreateSlotsForm = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [totalSlots, setTotalSlots] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const handleCreateSlots = () => {
    const slotsCount = parseInt(totalSlots, 10);
    if (slotsCount > 0) {
      const newSlots = Array(slotsCount)
        .fill(null)
        .map((_, index) => ({
          id: index,
          startTime: null,
          endTime: null,
          slotType: 'period', // default value
        }));
      setTimeSlots(newSlots);
      setShowTable(true);
    }
  };

  const handleTimeChange = (
    time: Dayjs | null,
    slotIndex: number,
    type: 'startTime' | 'endTime'
  ) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [type]: time,
      };
      return newSlots;
    });
  };

  const handleSlotTypeChange = (value: any, slotIndex: number) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        slotType: value,
        // Reset breakType when changing slot type
        breakType: value === 'break' ? '' : undefined,
      };
      return newSlots;
    });
  };

  const handleBreakTypeChange = (value: any, slotIndex: number) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        breakType: value,
      };
      return newSlots;
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="School Hours"
                name="schoolHours"
                //   value={formik.values.eventVenue}
                //   onChange={formik.handleChange}
                //   error={formik.touched.eventVenue && Boolean(formik.errors.eventVenue)}
                //   helperText={formik.touched.eventVenue && formik.errors.eventVenue}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Previous Class Slots"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Slots"
                name="totalSlots"
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                startIcon={<Add />}
                size="small"
                variant="contained"
                onClick={handleCreateSlots}
              >
                Create Slots
              </Button>
            </Grid>
          </Grid>

          {showTable && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Slot Times
              </Typography>
              <CustomizableTable
                tableId="time-schedule-management-setting"
                isSearch={false}
                isShowedDense={false}
                isFilter={false}
                columns={[
                  {
                    id: 'startTime',
                    label: 'Start Time',
                    render(value, row) {
                      return (
                        <TimePicker
                          value={value}
                          onChange={(newTime) => handleTimeChange(newTime, row.id, 'startTime')}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      );
                    },
                  },
                  {
                    id: 'endTime',
                    label: 'End Time',
                    render(value, row) {
                      return (
                        <TimePicker
                          value={value}
                          onChange={(newTime) => handleTimeChange(newTime, row.id, 'endTime')}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      );
                    },
                  },
                  {
                    id: 'slotType',
                    label: 'Slot Type',
                    render(value, row) {
                      return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <CustomSelect
                            label="Slot"
                            options={[
                              { value: 'period', label: 'Period' },
                              { value: 'break', label: 'Break' },
                            ]}
                            value={value}
                            onChange={(val: any) => {
                              handleSlotTypeChange(val, row.id);
                            }}
                            formControlProps={{ sx: { minWidth: '150px' } }}
                          />
                          {value === 'break' && (
                            <CustomSelect
                              label="Break Type"
                              options={[
                                { value: 'lunch', label: 'Lunch Break' },
                                { value: 'short', label: 'Short Break' },
                                { value: 'recess', label: 'Recess' },
                                { value: 'prayer', label: 'Prayer Break' },
                              ]}
                              value={row.breakType || ''}
                              onChange={(val: any) => {
                                handleBreakTypeChange(val, row.id);
                              }}
                              formControlProps={{ sx: { minWidth: '150px' } }}
                            />
                          )}
                        </Box>
                      );
                    },
                  },
                ]}
                data={timeSlots}
              />
            </>
          )}
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

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
