'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Paper,
  Table,
  Button,
  useTheme,
  TableRow,
  MenuList,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectList from './component/subjectList';
import TimeTableCell from './component/timeTableCell';
import CreateSlotsForm from '../settings/components/lectureSlots/createSlotsForm';

import type { TSubjectGroup, TRemainingLectures } from './type';

export const subjectGroups: TSubjectGroup[] = [
  {
    subjectName: 'Core Subjects',
    subjectColor: '#FFB74D',
    noOfLecture: 7,
    subjectType: 'core',
    subjects: [
      {
        name: 'Math',
        teachers: ['Mr. Smith', 'Mrs. Johnson'],
      },
    ],
    id: '1',
  },
  {
    subjectName: 'Language Subjects',
    subjectColor: '#64B5F6',
    noOfLecture: 7,
    subjectType: 'elective',
    subjects: [
      {
        name: 'English',
        teachers: ['Ms. Wilson', 'Mr. Brown'],
      },
      {
        name: 'Hindi',
        teachers: ['Mr. Mehta', 'Mrs. Kapoor'],
      },
    ],
    id: '2',
  },
];

const TimeTableGrid = (props: TabComponentType) => {
  const createSlotsDialog = useBoolean();

  // Query to fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State for managing classroom selection
  const [classroom, setClassroom] = useState<string>('');

  // State for managing modal/dialog open state
  const [open, setOpen] = useState(false);

  // Props for managing URL search parameters
  const { searchParams, setSearchParams } = props;

  // classes: Stores the selected class ID from the available classes
  const [classes, setClasses] = useState<string>('');

  // division: Stores the selected division ID for the chosen class
  const [division, setDivision] = useState<string>('');

  // divisionOptions: Stores array of available divisions for the selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Theme object from Material-UI
  const theme = useTheme();

  // Initialize remaining lectures count for each subject
  const [remainingLectures, setRemainingLectures] = useState<TRemainingLectures>(() =>
    subjectGroups.reduce(
      (acc, subject) => ({
        ...acc,
        [subject.id]: subject.noOfLecture,
      }),
      {}
    )
  );

  // Effect hook to handle class and division selection logic
  useEffect(() => {
    // Check if class data exists and has items
    if (classData?.items?.length) {
      if (classes) {
        // If a class is selected, find the selected class from the data
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        // Set division options based on selected class
        setDivisionOptions(selectedClass?.divisions || []);
        // If divisions exist, set the first division as default
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        // If no class is selected, use the first class as default
        const firstClass = classData.items[0];
        // Update URL search params with the first class ID
        setSearchParams?.({
          classId: firstClass.id,
        });
        // Set division options for the first class
        setDivisionOptions(firstClass?.divisions || []);
        // If divisions exist, set the first division as default
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  // Define time slots for the timetable
  const timeSlots = [
    '8:00 - 8:45', // First period
    '8:45 - 9:30', // Second period
    '9:30 - 10:15', // Third period
    '10:15 - 10:30', // Break time
    '10:30 - 11:15', // Fourth period
    '11:15 - 12:00', // Fifth period
  ];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize timetable as an array of arrays
  const [timetable, setTimetable] = useState<
    Array<
      Array<{
        subject?: TSubjectGroup;
        teacher?: string;
        room?: string;
      } | null>
    >
  >(() =>
    Array(timeSlots.length)
      .fill(null)
      .map(() => Array(weekDays.length).fill(null))
  );

  // Handle the start of a drag operation for a subject
  const handleDragStart = (e: React.DragEvent<HTMLElement>, subject: TSubjectGroup) => {
    // Store the subject data in the drag event
    e.dataTransfer.setData('subject', JSON.stringify(subject));
  };

  // Handle dropping a subject into a timetable slot
  const handleDrop = (e: React.DragEvent<HTMLElement>, timeSlot: string, day: string) => {
    e.preventDefault();
    // Get the subject data from the drag event
    const subject = JSON.parse(e.dataTransfer.getData('subject'));
    // Get source location if moving an existing slot
    const sourceTimeSlot = e.dataTransfer.getData('sourceTimeSlot');
    const sourceDay = e.dataTransfer.getData('sourceDay');

    // Convert time slot and day to array indices
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    // Prevent dropping into an occupied slot
    if (timetable[timeSlotIndex][dayIndex] !== null) {
      return;
    }

    // Handle new subject placement (not moving existing)
    if (!sourceTimeSlot && !sourceDay) {
      // Check if there are any remaining lectures for this subject
      if (remainingLectures[subject.id] <= 0) {
        return;
      }

      // Decrease the count of remaining lectures for this subject
      setRemainingLectures((prev: TRemainingLectures) => ({
        ...prev,
        [subject.id]: prev[subject.id] - 1,
      }));
    }

    // Update the timetable with the new subject placement
    setTimetable((prev) => {
      // Create a deep copy of the timetable
      const newTimetable = prev.map((row) => [...row]);

      // Handle moving an existing slot
      if (sourceTimeSlot && sourceDay) {
        // Get indices for the source location
        const sourceTimeSlotIndex = timeSlots.indexOf(sourceTimeSlot);
        const sourceDayIndex = weekDays.indexOf(sourceDay);
        // Store the source slot data before clearing it
        const sourceSlotData = newTimetable[sourceTimeSlotIndex][sourceDayIndex];
        // Clear the source slot
        newTimetable[sourceTimeSlotIndex][sourceDayIndex] = null;
        // Place the subject in the new slot with existing teacher and room
        newTimetable[timeSlotIndex][dayIndex] = {
          subject,
          teacher: sourceSlotData?.teacher,
          room: sourceSlotData?.room || subject.room,
        };
      } else {
        // Place new subject in the slot with default values
        newTimetable[timeSlotIndex][dayIndex] = {
          subject,
          teacher: '',
          room: subject.room || classroom,
        };
      }

      return newTimetable;
    });
  };

  // Handles deletion of a subject from a time slot and updates remaining lectures count
  const handleDeleteSlot = (timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const deletedSubject = prev[timeSlotIndex][dayIndex]?.subject;
      if (deletedSubject) {
        // Increment the remaining lectures count for the deleted subject
        setRemainingLectures((pre: TRemainingLectures) => ({
          ...pre,
          [deletedSubject.id]: pre[deletedSubject.id] + 1,
        }));
      }

      // Create new timetable with the slot cleared
      const newTimetable = prev.map((row) => [...row]);
      newTimetable[timeSlotIndex][dayIndex] = null;
      return newTimetable;
    });
  };

  // Handles assigning a teacher to a specific time slot
  const handleTeacherSelect = (teacher: string, timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const newTimetable = prev.map((row) => [...row]);
      if (newTimetable[timeSlotIndex][dayIndex]) {
        // Update the teacher for the selected time slot while preserving other data
        newTimetable[timeSlotIndex][dayIndex] = {
          ...newTimetable[timeSlotIndex][dayIndex]!,
          teacher,
        };
      }
      return newTimetable;
    });
  };

  // Handles assigning a room to a specific time slot
  const handleRoomSelect = (room: string, timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const newTimetable = prev.map((row) => [...row]);
      if (newTimetable[timeSlotIndex][dayIndex]) {
        // Update the room for the selected time slot while preserving other data
        newTimetable[timeSlotIndex][dayIndex] = {
          ...newTimetable[timeSlotIndex][dayIndex]!,
          room,
        };
      }
      return newTimetable;
    });
  };

  // Checks if the given time slot is a break period
  const isBreak = (timeSlot: string) => timeSlot === '10:15 - 10:30';

  // Defines action menu items for different timetable statuses
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* Show Add Timetable option for Pending status */}
          {row.status === 'Pending' && (
            <MenuItem
              onClick={() => {
                setOpen(true);
              }}
            >
              <Iconify icon="mdi:add" sx={{ height: '16px', width: '16px' }} />
              Timetable
            </MenuItem>
          )}
          {/* Show Update option for Draft or Published timetables */}
          {(row.status === 'Draft' || row.status === 'Publish') && (
            <MenuItem
              onClick={() => {
                // TODO: Implement update functionality
              }}
            >
              <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
              Update
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    []
  );

  const links = open
    ? [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Time Table', href: '/academic/timeTableDashboard' },
        { name: 'New Timetable', href: '/academic/newTimetable' },
      ]
    : [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Time Table', href: '/academic/timeTableDashboard' },
      ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="New Timetable"
        links={links}
        description={
          open
            ? 'Create new timetable for selected class and division'
            : 'View and manage division-wise timetables'
        }
        sx={{ px: 1, mb: 2 }}
        action={
          open && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => {
                setOpen(false);
              }}
            >
              Back
            </Button>
          )
        }
      />
      {open && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomSelect
              label="Class"
              options={classData?.items || []}
              labelKey="name"
              disabled
              valueKey="id"
              onChange={(val) => {
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === val
                );
                setSearchParams?.({
                  classId: val as string,
                });
                setDivisionOptions(selectedClass?.divisions || []);
              }}
              value={classes}
              formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            />
            <CustomSelect
              label="Division"
              disabled={!classes}
              labelKey="name"
              valueKey="id"
              options={divisionOptions}
              value={division}
              onChange={(val) => {
                setDivision(val as string);
              }}
              formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
              variant="outlined"
              size="small"
            >
              Draft
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              variant="contained"
              size="small"
            >
              Publish
            </Button>
          </Box>
        </Box>
      )}
      {open && (
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mt: 2, mb: 2 }}
        >
          <Button
            startIcon={<Add />}
            size="small"
            variant="contained"
            onClick={() => {
              createSlotsDialog.onTrue();
            }}
          >
            Create Slots
          </Button>
        </Box>
      )}
      <CustomDialog
        open={createSlotsDialog.value}
        handleClose={createSlotsDialog.onFalse}
        title="Create Slots"
        maxWidth="md"
      >
        <CreateSlotsForm onClose={createSlotsDialog.onFalse} />
      </CustomDialog>
      {!open && (
        <>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <CustomSelect
              label="Class"
              name="class"
              isLoading={isLoading}
              options={classData?.items || []}
              valueKey="id"
              labelKey="name"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              value={classes}
              onChange={(value) => {
                setClasses(value as string);
              }}
            />
          </Box>
          <CustomizableTable
            tableId="timetable-table"
            searchFieldProps={{
              placeholder: 'Search by Division, Status',
              label: 'Search by Division, Status',
            }}
            noDataText="No Time Table Data Found"
            columns={[
              { id: 'division', label: 'Division' },
              {
                id: 'status',
                label: 'Status',
                render: (value, row) => (
                  <Label
                    color={
                      value === 'Pending'
                        ? 'error'
                        : value === 'Draft'
                          ? 'warning'
                          : value === 'Publish'
                            ? 'primary'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                ),
              },
              {
                id: 'action',
                label: 'Actions',
                minWidth: 50,
                sticky: true,
                isSort: false,
                isFilter: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                  />
                ),
              },
            ]}
            data={[
              {
                id: 1,
                className: 'Class 10',
                division: 'A',
                status: 'Publish',
              },
              {
                id: 2,
                className: 'Class 9',
                division: 'B',
                status: 'Pending',
              },
              {
                id: 3,
                className: 'Class 8',
                division: 'C',
                status: 'Draft',
              },
              {
                id: 5,
                className: 'Class 6',
                division: 'E',
                status: 'Pending',
              },
              {
                id: 6,
                className: 'Class 5',
                division: 'F',
                status: 'Draft',
              },
              {
                id: 7,
                className: 'Class 4',
                division: 'G',
                status: 'Publish',
              },
            ]}
          />{' '}
        </>
      )}
      {open && (
        <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
          <Paper
            elevation={2}
            sx={{
              width: 200,
              height: 'fit-content',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Subjects</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <SubjectList onDragStart={handleDragStart} remainingLectures={remainingLectures} />
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ flexGrow: 1 }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '8%' }}>Time Slot</TableCell>
                    {weekDays.map((day) => (
                      <TableCell key={day} align="center">
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((timeSlot, timeSlotIndex) => (
                    <TableRow key={timeSlot}>
                      <TableCell>{timeSlot}</TableCell>
                      {weekDays.map((day, dayIndex) => (
                        <TimeTableCell
                          key={`${timeSlot}-${day}`}
                          timeSlot={timeSlot}
                          day={day}
                          slotData={timetable[timeSlotIndex][dayIndex]}
                          isBreak={isBreak(timeSlot)}
                          onDrop={handleDrop}
                          selectedRoom={timetable[timeSlotIndex][dayIndex]?.room || classroom}
                          onTeacherSelect={handleTeacherSelect}
                          onRoomSelect={handleRoomSelect}
                          onDeleteSlot={handleDeleteSlot}
                        />
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default TimeTableGrid;
