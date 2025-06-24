'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { Division, Standards, Organization } from 'src/types/school';

import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
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

import {
  TimetableStatusType,
  TimetableStatusColors,
  TimetableStatusOptions,
} from 'src/enums/timatable-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectList from './component/subjectList';
import TimeTableCell from './component/timeTableCell';
import CreateSlotsForm from '../settings/components/lectureSlots/createSlotsForm';

import type { DayData, Subject, TimetableSlot, TSubjectGroup } from './type';

export const subjectGroupsData: TSubjectGroup[] = [
  {
    subjectName: 'Core Subjects',
    subjectColor: '#ef5350',
    allocateLectures: 7,
    totalLectures: 7,
    subjectType: 'core',
    subjects: [
      {
        subject: 'Math',
        teachers: ['Mr. Smith', 'Mrs. Johnson'],
      },
    ],
    id: '1',
  },
  {
    subjectName: 'Language Subjects',
    subjectColor: '#42a5f5',
    allocateLectures: 7,
    totalLectures: 7,
    subjectType: 'Elective',
    subjects: [
      {
        subject: 'English',
        teachers: ['Ms. Wilson', 'Mr. Brown'],
      },
      {
        subject: 'Hindi',
        teachers: ['Mr. Mehta', 'Mrs. Kapoor'],
      },
    ],
    id: '2',
  },
];

const timetableData: TimetableSlot[] = [
  {
    startTime: '08:00',
    endTime: '09:00',
    isBreak: false,
    dayData: [
      { day: 'Mon', subjects: [], subjectColor: '' },
      { day: 'Tue', subjects: [], subjectColor: '' },
      { day: 'Wed', subjects: [], subjectColor: '' },
      { day: 'Thu', subjects: [], subjectColor: '' },
      { day: 'Fri', subjects: [], subjectColor: '' },
      { day: 'Sat', subjects: [], subjectColor: '' },
    ],
  },
  {
    startTime: '09:00',
    endTime: '10:00',
    isBreak: false,
    dayData: [
      { day: 'Mon', subjects: [], subjectColor: '' },
      { day: 'Tue', subjects: [], subjectColor: '' },
      { day: 'Wed', subjects: [], subjectColor: '' },
      { day: 'Thu', subjects: [], subjectColor: '' },
      { day: 'Fri', subjects: [], subjectColor: '' },
      { day: 'Sat', subjects: [], subjectColor: '' },
    ],
  },
  {
    startTime: '10:00',
    endTime: '10:15',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '10:15',
    endTime: '11:15',
    isBreak: false,
    dayData: [
      { day: 'Mon', subjects: [], subjectColor: '' },
      { day: 'Tue', subjects: [], subjectColor: '' },
      { day: 'Wed', subjects: [], subjectColor: '' },
      { day: 'Thu', subjects: [], subjectColor: '' },
      { day: 'Fri', subjects: [], subjectColor: '' },
      { day: 'Sat', subjects: [], subjectColor: '' },
    ],
  },
  {
    startTime: '11:15',
    endTime: '12:15',
    isBreak: false,
    dayData: [
      { day: 'Mon', subjects: [], subjectColor: '' },
      { day: 'Tue', subjects: [], subjectColor: '' },
      { day: 'Wed', subjects: [], subjectColor: '' },
      { day: 'Thu', subjects: [], subjectColor: '' },
      { day: 'Fri', subjects: [], subjectColor: '' },
      { day: 'Sat', subjects: [], subjectColor: '' },
    ],
  },
];

const TimeTableGrid = (props: TabComponentType) => {
  // Dialog state for creating time slots modal
  const createSlotsDialog = useBoolean();
  const [subjectsGroups, setSubjectsGroups] = useState<any>(subjectGroupsData);
  // Dialog state for publishing marks modal (currently unused)
  const publishTimetableDialog = useBoolean();
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  // State for managing classroom selection
  const [classroom, setClassroom] = useState<string>('');

  // State for managing modal/dialog open state
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Props for managing URL search parameters
  const { searchParams, setSearchParams } = props;

  // Theme object from Material-UI
  const theme = useTheme();

  // Initialize remaining lectures count for each subject

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
  const [timetable, setTimetable] = useState<TimetableSlot[]>(timetableData);

  // Handle the start of a drag operation for a subject
  const handleDragStart = (e: React.DragEvent<HTMLElement>, subject: TSubjectGroup) => {
    // Store the subject data in the drag event
    e.dataTransfer.setData('subject', JSON.stringify(subject));
  };

  // Handle dropping a subject into a timetable slot
  // const handleDrop = (e: React.DragEvent<HTMLElement>, timeSlot: string, day: string) => {
  //   e.preventDefault();
  //   // Get the subject data from the drag event
  //   const subject = JSON.parse(e.dataTransfer.getData('subject'));
  //   // Get source location if moving an existing slot
  //   const sourceTimeSlot = e.dataTransfer.getData('sourceTimeSlot');
  //   const sourceDay = e.dataTransfer.getData('sourceDay');

  //   // Convert time slot and day to array indices
  //   const timeSlotIndex = timeSlots.indexOf(timeSlot);
  //   const dayIndex = weekDays.indexOf(day);

  //   // Prevent dropping into an occupied slot
  //   if (timetable[timeSlotIndex][dayIndex] !== null) {
  //     return;
  //   }

  //   // Handle new subject placement (not moving existing)
  //   if (!sourceTimeSlot && !sourceDay) {
  //     // Check if there are any remaining lectures for this subject
  //     if (remainingLectures[subject.id] <= 0) {
  //       return;
  //     }

  //     // Decrease the count of remaining lectures for this subject
  //     setRemainingLectures((prev: TRemainingLectures) => ({
  //       ...prev,
  //       [subject.id]: prev[subject.id] - 1,
  //     }));
  //   }

  //   // Update the timetable with the new subject placement
  //   setTimetable((prev : any) => {
  //     // Create a deep copy of the timetable
  //     const newTimetable = prev.map((row : any) => [...row]);

  //     // Handle moving an existing slot
  //     if (sourceTimeSlot && sourceDay) {
  //       // Get indices for the source location
  //       const sourceTimeSlotIndex = timeSlots.indexOf(sourceTimeSlot);
  //       const sourceDayIndex = weekDays.indexOf(sourceDay);
  //       // Store the source slot data before clearing it
  //       const sourceSlotData = newTimetable[sourceTimeSlotIndex][sourceDayIndex];
  //       // Clear the source slot
  //       newTimetable[sourceTimeSlotIndex][sourceDayIndex] = null;
  //       // Place the subject in the new slot with existing teacher and room
  //       newTimetable[timeSlotIndex][dayIndex] = {
  //         subject,
  //         teacher: sourceSlotData?.teacher,
  //         room: sourceSlotData?.room || subject.room,
  //       };
  //     } else {
  //       // Place new subject in the slot with default values
  //       newTimetable[timeSlotIndex][dayIndex] = {
  //         subject,
  //         teacher: '',
  //         room: subject.room || classroom,
  //       };
  //     }

  //     return newTimetable;
  //   });
  // };

  const handleDrop = (e: any, item: DayData, rowIndex: number, colIndex: number) => {
    const subjectData = e.dataTransfer.getData('subject');
    if (subjectData) {
      const subject = JSON.parse(subjectData);
      const droppedSubjectGroup = JSON.parse(subjectData);

      const cloneTimeTableData = cloneDeep(timetable);
      const cloneSubjectGroups = cloneDeep(subjectsGroups);
      const existingDayData = cloneTimeTableData[rowIndex].dayData[colIndex];
      if (existingDayData?.subjects?.length > 0) {
        return;
      }
      const cleanedSubjects = (subject.subjects || []).map((s: Subject) => ({
        subject: s.subject,
        teacher: '',
        room: '',
      }));

      cloneTimeTableData[rowIndex].dayData[colIndex] = {
        day: weekDays[colIndex],
        subjectColor: subject.subjectColor,
        subjects: cleanedSubjects,
      };

      const firstSubject = cleanedSubjects[0];
      const group = cloneSubjectGroups.find((g: TSubjectGroup) =>
        g.subjects.some((sub: Subject) => sub.subject === firstSubject.subject)
      );

      if (group) {
        group.allocateLectures = Math.max(0, group.allocateLectures - 1);
      }

      console.log('cloneTimeTableData---', cloneTimeTableData);

      setTimetable(cloneTimeTableData);
      setSubjectsGroups(cloneSubjectGroups);
    }
  };

  // Handles deletion of a subject from a time slot and updates remaining lectures count
  const handleDeleteSlot = (rowIndex: number, colIndex: number) => {
    const cloneTimeTableData = cloneDeep(timetable);
    const cloneSubjectGroups = cloneDeep(subjectsGroups);
    const cleanedSubjects = cloneTimeTableData[rowIndex]?.dayData?.[colIndex]?.subjects || [];

    cloneTimeTableData[rowIndex].dayData[colIndex] = {
      day: weekDays[colIndex],
      subjectColor: '',
      subjects: [],
    };
    const firstSubject = cleanedSubjects[0];
    const group = cloneSubjectGroups.find((g: TSubjectGroup) =>
      g.subjects.some((sub: Subject) => sub.subject === firstSubject.subject)
    );

    if (group) {
      group.allocateLectures = Math.max(0, group.allocateLectures + 1);
    }
    setTimetable(cloneTimeTableData);
    setSubjectsGroups(cloneSubjectGroups);
  };

  // Handles assigning a teacher to a specific time slot
  const handleTeacherSelect = (
    updatedSlotData: any, // Contains the updated subjects array with teachers
    rowIndex: number,
    colIndex: number
  ) => {
    setTimetable((prev: any) => {
      const newTimetable = [...prev]; // clone outer array
      const dayData = newTimetable[rowIndex].dayData[colIndex];

      if (dayData && Array.isArray(dayData.subjects)) {
        // Merge updated teacher values per subject
        const updatedSubjects = dayData.subjects.map((subjectItem: any) => {
          const updated = updatedSlotData.subjects.find(
            (s: any) => s.subject === subjectItem.subject
          );
          return updated ? { ...subjectItem, teacher: updated.teacher } : subjectItem;
        });

        newTimetable[rowIndex].dayData[colIndex] = {
          ...dayData,
          subjects: updatedSubjects,
        };
      }

      return newTimetable;
    });
  };

  // Handles assigning a room to a specific time slot
  const handleRoomSelect = (
    updatedSlotData: any, // Contains the updated subjects array with rooms
    rowIndex: number,
    colIndex: number
  ) => {
    setTimetable((prev: any) => {
      const newTimetable = [...prev]; // clone outer array
      const dayData = newTimetable[rowIndex].dayData[colIndex];

      if (dayData && Array.isArray(dayData.subjects)) {
        // Merge updated room values per subject
        const updatedSubjects = dayData.subjects.map((subjectItem: any) => {
          const updated = updatedSlotData.subjects.find(
            (s: any) => s.subject === subjectItem.subject
          );
          return updated ? { ...subjectItem, room: updated.room } : subjectItem;
        });

        newTimetable[rowIndex].dayData[colIndex] = {
          ...dayData,
          subjects: updatedSubjects,
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
          {row.status === 0 && (
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
          {(row.status === 1 || row.status === 2) && (
            <MenuItem
              onClick={() => {
                setOpen(true);
                setIsEdit(true);
                // TODO: Implement update functionality
              }}
            >
              <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
              Update
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      {open ? (
        <CustomBreadcrumbs
          heading="Timetable"
          links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Timetable' }]}
          description="Create and manage class schedules by assigning subjects, teachers and rooms to specific time slots"
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => {
            setOpen(false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Manage Timetable"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable' },
            { name: 'Manage Timetable' },
          ]}
          description="View and manage timetables for different classes and divisions. Create new schedules or modify existing ones to organize academic activities"
          sx={{ px: 1, mb: 2 }}
        />
      )}
      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {isEdit ? 'Update Timetable' : 'Create Timetable'}{' '}
            <CustomTooltip
              arrow
              placement="right"
              title="Create or update timetable schedules for classes and divisions to organize daily academic activities"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>{' '}
          </Box>
        }
        handleClose={() => {
          setOpen(false);
        }}
        open={open}
        fullScreen
      >
        <Box p={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CustomSelect
                options={allClass}
                label="Class"
                value={classes}
                onChange={(val) => setClasses(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
              />
              <CustomSelect
                options={allDivision}
                label="Division"
                value={division}
                onChange={(val) => setDivision(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!classes}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                onClick={() => {
                  publishTimetableDialog.onTrue();
                }}
              >
                Publish
              </Button>
            </Box>
          </Box>
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
                <SubjectList onDragStart={handleDragStart} subjectsGroups={subjectsGroups} />
              </Box>
            </Paper>
            {timeSlots.length > 0 ? (
              <Paper elevation={2} sx={{ flexGrow: 1 }}>
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '9%' }}>Time Slot</TableCell>
                        {weekDays.map((day) => (
                          <TableCell key={day} align="center">
                            {day}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* {timeSlots.map((timeSlot, timeSlotIndex) => (
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
                      ))} */}
                      {timetable.map((timeTableItem, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {timeTableItem.startTime} - {timeTableItem.endTime}
                          </TableCell>
                          {(timeTableItem.isBreak ? [''] : timeTableItem.dayData).map(
                            (dayItem, ind) => (
                              <TimeTableCell
                                key={ind}
                                timeSlot={`${timeTableItem.startTime} - ${timeTableItem.endTime}`}
                                day={typeof dayItem === 'string' ? dayItem : dayItem.day}
                                item={timeTableItem}
                                rowIndex={index}
                                colIndex={ind}
                                slotData={dayItem}
                                isBreak={timeTableItem.isBreak}
                                onDrop={handleDrop}
                                // selectedRoom={timetable[timeSlotIndex][dayIndex]?.room || classroom}
                                onTeacherSelect={handleTeacherSelect}
                                onRoomSelect={handleRoomSelect}
                                onDeleteSlot={handleDeleteSlot}
                              />
                            )
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  mt: 2,
                  mb: 2,
                }}
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
          </Box>
        </Box>
      </CustomDialog>

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
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              ml: 1,
            }}
          >
            <CustomSelect
              label="Class"
              name="class"
              options={allClass}
              valueKey="id"
              labelKey="name"
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
              value={classes}
              onChange={(value) => {
                setClasses(value as string);
              }}
            />
          </Box>
          <CustomizableTable
            tableId="timetable-table"
            noDataText="No Time Table Data Found"
            columns={[
              { id: 'division', label: 'Division' },
              {
                id: 'status',
                label: 'Status',
                filterType: 'enum',
                enumOptions: TimetableStatusOptions,
                align: 'left',
                render(value, row) {
                  const color = TimetableStatusColors[value as TimetableStatusType] as LabelColor;
                  return <Label color={color}>{TimetableStatusType[value]}</Label>;
                },
              },
              {
                id: 'action',
                label: 'Action',
                minWidth: 40,
                align: 'left',
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
                status: 0,
              },
              {
                id: 2,
                className: 'Class 9',
                division: 'B',
                status: 1,
              },
              {
                id: 3,
                className: 'Class 8',
                division: 'C',
                status: 2,
              },
              {
                id: 5,
                className: 'Class 6',
                division: 'E',
                status: 1,
              },
              {
                id: 6,
                className: 'Class 5',
                division: 'F',
                status: 2,
              },
              {
                id: 7,
                className: 'Class 4',
                division: 'G',
                status: 0,
              },
            ]}
          />{' '}
        </>
      )}

      <ConfirmDialog
        open={publishTimetableDialog.value}
        onClose={() => {
          publishTimetableDialog.onFalse();
          // setSelectedExam(null);
        }}
        title="Publish"
        content="Are you sure you want to Publish Timetable ?"
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              // handleDelete(selectedExam?.id);
            }}
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default TimeTableGrid;
