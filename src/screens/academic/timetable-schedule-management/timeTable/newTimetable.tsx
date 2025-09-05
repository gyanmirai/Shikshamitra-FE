'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { isNaN, parseInt, cloneDeep } from 'lodash';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Paper, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  TimetableStatusType,
  TimetableStatusColors,
  TimetableStatusOptions,
} from 'src/enums/timatable-type';

import SubjectList from './component/subjectList';
import TimeTableView from './component/timeTableView';

import type { DayData, Subject, TimetableSlot, TSubjectGroup } from './type';

export const subjectGroupsData: TSubjectGroup[] = [
  {
    subjectName: 'Tech & Fitness Group',
    subjectColor: '#1e88e5',
    allocateLectures: 5,
    totalLectures: 5,
    subjectType: 'Elective',
    subjects: [
      {
        subject: 'Computer',
        teachers: ['Mr. Rao', 'Ms. Patel'],
        subjectCode: 'CS-12',
      },
      {
        subject: 'Physical Training',
        teachers: ['Coach Vivek'],
        subjectCode: 'PE-12',
      },
    ],
    id: '1',
  },
  {
    subjectName: 'Language Enrichment Group',
    subjectColor: '#ab47bc',
    allocateLectures: 6,
    totalLectures: 6,
    subjectType: 'Elective',
    subjects: [
      {
        subject: 'Hindi',
        teachers: ['Mr. Mehta'],
        subjectCode: 'HIN-12',
      },
      {
        subject: 'Sanskrit',
        teachers: ['Ms. Sharma'],
        subjectCode: 'SAN-12',
      },
    ],
    id: '2',
  },
  {
    subjectName: 'Mathematics',
    subjectColor: '#ffb300',
    allocateLectures: 7,
    totalLectures: 7,
    subjectType: 'Core',
    subjects: [
      {
        subject: 'Mathematics',
        teachers: ['Mr. Mathur'],
        subjectCode: 'MATH-10',
      },
    ],
    id: '3',
  },
  {
    subjectName: 'Science',
    subjectColor: '#00acc1',
    allocateLectures: 6,
    totalLectures: 6,
    subjectType: 'Core',
    subjects: [
      {
        subject: 'Science',
        teachers: ['Mrs. Rao'],
        subjectCode: 'SCI-12',
      },
    ],
    id: '4',
  },
  {
    subjectName: 'Social Science',
    subjectColor: '#8d6e63',
    allocateLectures: 6,
    totalLectures: 6,
    subjectType: 'Core',
    subjects: [
      {
        subject: 'Social Science',
        teachers: ['Mr. Desai'],
        subjectCode: 'SOC-12',
      },
    ],
    id: '5',
  },
  {
    subjectName: 'Gujarati',
    subjectColor: '#43a047',
    allocateLectures: 5,
    totalLectures: 5,
    subjectType: 'Core',
    subjects: [
      {
        subject: 'Gujarati',
        teachers: ['Ms. Trivedi'],
        subjectCode: 'GUJ-12',
      },
    ],
    id: '6',
  },
  {
    subjectName: 'English',
    subjectColor: '#3949ab',
    allocateLectures: 6,
    totalLectures: 6,
    subjectType: 'Core',
    subjects: [
      {
        subject: 'English',
        teachers: ['Ms. Wilson'],
        subjectCode: 'ENG-12',
      },
    ],
    id: '7',
  },
];

const timetableData: TimetableSlot[] = [
  {
    startTime: '08:00 AM',
    endTime: '09:00 AM',
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
    startTime: '09:00 AM',
    endTime: '10:00 AM',
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
    startTime: '10:00 AM',
    endTime: '10:15 AM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '10:15 AM',
    endTime: '11:15 AM',
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
    startTime: '11:15 AM',
    endTime: '12:15 PM',
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

const TimeTableGrid = ({
  isClassVisible,
  isDivisionVisible,
  isRoomVisible,
  isTeacherVisible,
  timeTableData,
}: any) => {
  // Dialog state for creating time slots modal
  const createSlotsDialog = useBoolean();
  const [subjectsGroups, setSubjectsGroups] = useState<any>(subjectGroupsData);
  // Dialog state for publishing marks modal (currently unused)
  const publishTimetableDialog = useBoolean();
  const draftTimetableDialog = useBoolean();
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

  // Theme object from Material-UI
  const theme = useTheme();
  const [initialTimetableData, setInitialTimetableData] = useState<TimetableSlot[]>([]);
  const [initialSubjectsGroups, setInitialSubjectsGroups] = useState<any>([]);

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
  const defaultTimetableData = useMemo(() => cloneDeep(timetableData), []);

  const [timetable, setTimetable] = useState<TimetableSlot[]>(defaultTimetableData);

  // Handle the start of a drag operation for a subject
  const handleDragStart = (e: React.DragEvent<HTMLElement>, subject: TSubjectGroup) => {
    // Store the subject data in the drag event
    e.dataTransfer.setData('subject', JSON.stringify(subject));
  };

  // Function to open dialog and store initial state
  const handleOpenDialog = useCallback(() => {
    setInitialTimetableData(cloneDeep(timetable));
    setInitialSubjectsGroups(cloneDeep(subjectsGroups));
    setOpen(true);
  }, [timetable, subjectsGroups]);

  const handleDrop = (e: any, item: DayData, rowIndex: number, colIndex: number) => {
    const subjectData = e.dataTransfer.getData('subject');
    const sourceRowIndex = e.dataTransfer.getData('rowIndex');
    const sourceColIndex = e.dataTransfer.getData('colIndex');

    if (subjectData) {
      const subject = JSON.parse(subjectData);
      const cloneTimeTableData = cloneDeep(timetable);
      const cloneSubjectGroups = cloneDeep(subjectsGroups);

      // Check if target slot is already occupied
      const existingDayData = cloneTimeTableData[rowIndex].dayData[colIndex];
      if (existingDayData?.subjects?.length > 0) {
        return;
      }

      // Check if this is a move operation (has source coordinates and they are valid numbers)
      const isMove =
        sourceRowIndex !== '' &&
        sourceColIndex !== '' &&
        !isNaN(parseInt(sourceRowIndex)) &&
        !isNaN(parseInt(sourceColIndex));

      if (isMove) {
        // MOVE OPERATION: Moving from one slot to another
        const sourceRow = parseInt(sourceRowIndex);
        const sourceCol = parseInt(sourceColIndex);

        // Prevent moving to the same slot
        if (sourceRow === rowIndex && sourceCol === colIndex) {
          return;
        }

        // Get the source slot data
        const sourceSlotData = cloneTimeTableData[sourceRow].dayData[sourceCol];

        // Move the data to the target slot
        cloneTimeTableData[rowIndex].dayData[colIndex] = {
          day: weekDays[colIndex],
          subjectColor: sourceSlotData.subjectColor,
          subjects: [...sourceSlotData.subjects], // Create a copy of subjects
        };

        // Clear the source slot
        cloneTimeTableData[sourceRow].dayData[sourceCol] = {
          day: weekDays[sourceCol],
          subjectColor: '',
          subjects: [],
        };

        // Update both timetable and subject groups for move operations
        setTimetable(cloneTimeTableData);
        setSubjectsGroups(cloneSubjectGroups);
      } else {
        // NEW PLACEMENT: Dragging from subject list

        // Count how many times this subject is already placed in timetable
        const usedLectures = cloneTimeTableData.reduce(
          (count: number, row: any) =>
            count +
            row.dayData.reduce((dayCount: number, dayData: any) => {
              if (dayData.subjects && dayData.subjects.length > 0) {
                const hasThisSubject = dayData.subjects.some((s: any) =>
                  subject.subjects.some((subj: any) => subj.subject === s.subject)
                );
                return hasThisSubject ? dayCount + 1 : dayCount;
              }
              return dayCount;
            }, 0),
          0
        );

        // Check if subject has reached maximum lectures
        const group = cloneSubjectGroups.find((g: TSubjectGroup) =>
          g.subjects.some((sub: Subject) => sub.subject === subject.subjects[0].subject)
        );

        if (group && usedLectures >= group.totalLectures) {
          // Subject has reached maximum lectures, prevent placement
          return;
        }

        const cleanedSubjects = (subject.subjects || []).map((s: Subject) => ({
          subject: s.subject,
          subjectCode: s.subjectCode,
          teacher: '',
          room: '',
        }));

        cloneTimeTableData[rowIndex].dayData[colIndex] = {
          day: weekDays[colIndex],
          subjectColor: subject.subjectColor,
          subjects: cleanedSubjects,
        };

        // Update subject group allocation count for new placements
        if (group) {
          // Set allocateLectures to the actual count from timetable + 1
          group.allocateLectures = usedLectures + 1;
        }

        // Update both timetable and subject groups for new placements
        setTimetable(cloneTimeTableData);
        setSubjectsGroups(cloneSubjectGroups);
      }
    }
  };

  const handleDeleteSlot = (rowIndex: number, colIndex: number) => {
    const cloneTimeTableData = cloneDeep(timetable);
    const cloneSubjectGroups = cloneDeep(subjectsGroups);
    const cleanedSubjects = cloneTimeTableData[rowIndex]?.dayData?.[colIndex]?.subjects || [];

    // Clear the slot
    cloneTimeTableData[rowIndex].dayData[colIndex] = {
      day: weekDays[colIndex],
      subjectColor: '',
      subjects: [],
    };

    // Update subject group allocation count
    if (cleanedSubjects.length > 0) {
      const firstSubject = cleanedSubjects[0];
      const group = cloneSubjectGroups.find((g: TSubjectGroup) =>
        g.subjects.some((sub: Subject) => sub.subject === firstSubject.subject)
      );

      if (group) {
        group.allocateLectures = Math.max(0, group.allocateLectures - 1);
      }
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
                handleOpenDialog();
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
                handleOpenDialog(); // Use the new function
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
    [handleOpenDialog]
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
            // handleCloseDialog(false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Timetable Management"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable' },
            { name: 'Timetable Management' },
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
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="Create or update timetable schedules for classes and divisions to organize daily academic activities"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>{' '}
          </Box>
        }
        handleClose={() => {
          // handleCloseDialog(false);
          setTimetable(initialTimetableData);
          setSubjectsGroups(initialSubjectsGroups);
          setOpen(false);
          setIsEdit(false);
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
                onClick={() => {
                  draftTimetableDialog.onTrue();
                }}
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
                <SubjectList
                  onDragStart={handleDragStart}
                  subjectsGroups={subjectsGroups}
                  selectedClass={classes}
                  timetable={timetable} // Add this prop
                />
              </Box>
            </Paper>
            <BackPopUpChecked initialValues={initialTimetableData} currentValues={timetable}>
              <TimeTableView
                timeTableData={timetable}
                onDrop={handleDrop}
                onTeacherSelect={handleTeacherSelect}
                onRoomSelect={handleRoomSelect}
                handleDeleteSlot={handleDeleteSlot}
                showThreeDots
              />
            </BackPopUpChecked>
          </Box>
        </Box>
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
            onClick={() => {}}
          >
            Publish
          </Button>
        }
      />

      <ConfirmDialog
        open={draftTimetableDialog.value}
        onClose={() => {
          draftTimetableDialog.onFalse();
          // setSelectedExam(null);
        }}
        title="Draft"
        content="Are you sure you want to Draft Timetable ?"
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
            onClick={() => {}}
          >
            Draft
          </Button>
        }
      />
    </Box>
  );
};

export default TimeTableGrid;
