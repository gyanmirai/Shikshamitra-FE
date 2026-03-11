'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Standards, Organization } from 'src/types/school';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { TimeSlot, DayOfWeek } from 'src/components/timetable/types';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';
import { MOCK_SUBJECTS, DEFAULT_CONFIG, generateWeeklySlots } from 'src/components/timetable/utils';
import {
  TimetableStatusType,
  TimetableStatusColors,
  TimetableStatusOptions,
} from 'src/enums/timatable-type';

import type { TimetableSlot, TSubjectGroup } from './type';

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

const mockDayScheduleData: any[] = [
  {
    day: 'Mon',
    timeSlots: [
      { id: '0', startTime: '08:00', endTime: '08:40', slotType: 'period' },
      {
        id: '1',
        startTime: '08:40',
        endTime: '09:20',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '2', startTime: '09:20', endTime: '10:10', slotType: 'period' },
      { id: '3', startTime: '10:10', endTime: '10:50', slotType: 'period' },
      { id: '4', startTime: '10:50', endTime: '11:30', slotType: 'period' },
      {
        id: '5',
        startTime: '11:30',
        endTime: '12:00',
        slotType: 'break',
        breakType: 'lunch',
      },
      { id: '6', startTime: '12:00', endTime: '12:30', slotType: 'period' },
    ],
  },
  {
    day: 'Tue',
    timeSlots: [
      { id: '0', startTime: '07:00', endTime: '08:40', slotType: 'period' },
      { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
      {
        id: '2',
        startTime: '09:20',
        endTime: '09:30',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
      { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
      { id: '5', startTime: '10:50', endTime: '11:30', slotType: 'period' },
      {
        id: '6',
        startTime: '11:30',
        endTime: '12:00',
        slotType: 'break',
        breakType: 'lunch',
      },
      { id: '7', startTime: '12:00', endTime: '12:30', slotType: 'period' },
    ],
  },
  {
    day: 'Wed',
    timeSlots: [
      { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
      {
        id: '2',
        startTime: '09:20',
        endTime: '09:30',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
      { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
      { id: '5', startTime: '10:50', endTime: '11:30', slotType: 'period' },
      {
        id: '6',
        startTime: '11:30',
        endTime: '12:00',
        slotType: 'break',
        breakType: 'lunch',
      },
      { id: '7', startTime: '12:00', endTime: '12:30', slotType: 'period' },
    ],
  },
  {
    day: 'Thu',
    timeSlots: [
      { id: '0', startTime: '07:00', endTime: '08:40', slotType: 'period' },
      { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
      {
        id: '2',
        startTime: '09:20',
        endTime: '09:30',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
      { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
      { id: '5', startTime: '10:50', endTime: '11:30', slotType: 'period' },
      {
        id: '6',
        startTime: '11:30',
        endTime: '12:00',
        slotType: 'break',
        breakType: 'lunch',
      },
      { id: '7', startTime: '12:00', endTime: '12:30', slotType: 'period' },
    ],
  },
  {
    day: 'Fri',
    timeSlots: [
      { id: '0', startTime: '07:00', endTime: '08:40', slotType: 'period' },
      { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
      {
        id: '2',
        startTime: '09:20',
        endTime: '09:30',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
      { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
      { id: '5', startTime: '10:50', endTime: '11:30', slotType: 'period' },
      {
        id: '6',
        startTime: '11:30',
        endTime: '12:00',
        slotType: 'break',
        breakType: 'lunch',
      },
      { id: '7', startTime: '12:00', endTime: '12:30', slotType: 'period' },
    ],
  },
  {
    day: 'Sat',
    timeSlots: [
      { id: '0', startTime: '07:00', endTime: '08:40', slotType: 'period' },
      { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
      {
        id: '2',
        startTime: '09:20',
        endTime: '09:30',
        slotType: 'break',
        breakType: 'short',
      },
      { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
      { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
    ],
  },
];

const transformScheduleToGrid = (scheduleData: any[]): TimetableSlot[] => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 1. Fixed Time Range: 08:00 AM to 04:00 PM (16:00)
  const minTime = dayjs('08:00', 'HH:mm');
  const maxTime = dayjs('16:00', 'HH:mm');

  // 2. Generate 30-min slots from Min to Max
  const gridSlots: TimetableSlot[] = [];
  let currentTime = minTime;

  while (currentTime.isBefore(maxTime)) {
    const slotStart = currentTime;
    const slotEnd = currentTime.add(30, 'minute');

    const dayData = weekDays.map((day) => {
      const daySchedule = scheduleData.find((d) => d.day === day);
      // Find if any slot in this day OVERLAPS with current grid slot
      // Overlap: (ScheduleStart < GridEnd) && (ScheduleEnd > GridStart)
      const overlappingSlot = daySchedule?.timeSlots.find((s: any) => {
        const sStart = dayjs(s.startTime, 'HH:mm');
        const sEnd = dayjs(s.endTime, 'HH:mm');
        return sStart.isBefore(slotEnd) && sEnd.isAfter(slotStart);
      });

      let slotType: 'period' | 'break' | 'zed' = 'zed';
      let isDisabled = true;
      let slotId;

      if (overlappingSlot) {
        slotId = overlappingSlot.id;
        if (overlappingSlot.slotType === 'break') {
          slotType = 'break';
          isDisabled = false; // Break is "enabled" in terms of existence, but handled specifically in UI
        } else {
          slotType = 'period';
          isDisabled = false; // Lecture slot is enabled
        }
      }

      return {
        day,
        subjectColor: '',
        subjects: [],
        isDisabled,
        slotId,
        slotType,
      };
    });

    gridSlots.push({
      startTime: slotStart.format('hh:mm A'),
      endTime: slotEnd.format('hh:mm A'),
      isBreak: false,
      dayData,
    });

    currentTime = slotEnd;
  }

  return gridSlots;
};

const timetableData: TimetableSlot[] = transformScheduleToGrid(mockDayScheduleData);

const TimeTableGrid = () => {
  // Dialog state for creating time slots modal
  // const createSlotsDialog = useBoolean();
  const [subjectsGroups, setSubjectsGroups] = useState<any>(subjectGroupsData);
  // Dialog state for publishing marks modal (currently unused)
  const publishTimetableDialog = useBoolean();
  const draftTimetableDialog = useBoolean();
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard name
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  // State for managing classroom selection
  // const [classroom, setClassroom] = useState<string>('');

  // State for managing modal/dialog open state
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Theme object from Material-UI
  const [initialTimetableData, setInitialTimetableData] = useState<TimetableSlot[]>([]);
  const [initialSubjectsGroups, setInitialSubjectsGroups] = useState<any>([]);

  // Initialize remaining lectures count for each subject

  // Define time slots for the timetable
  // const timeSlots = [
  //   '8:00 - 8:45', // First period
  //   '8:45 - 9:30', // Second period
  //   '9:30 - 10:15', // Third period
  //   '10:15 - 10:30', // Break time
  //   '10:30 - 11:15', // Fourth period
  //   '11:15 - 12:00', // Fifth period
  // ];

  // Initialize timetable as an array of arrays
  const defaultTimetableData = useMemo(() => cloneDeep(timetableData), []);

  const [timetable, setTimetable] = useState<TimetableSlot[]>(defaultTimetableData);

  // Function to open dialog and store initial state
  const handleOpenDialog = useCallback(() => {
    setInitialTimetableData(cloneDeep(timetable));
    setInitialSubjectsGroups(cloneDeep(subjectsGroups));
    setOpen(true);
  }, [timetable, subjectsGroups]);

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
                setDivision(row.division);
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
  const columns: IColumn[] = useMemo(
    () => [
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
          <ThreeDotsActions actions={(prop) => actions({ ...prop, row })} placement="right-top" />
        ),
      },
    ],
    [actions]
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {open ? (
        <CustomBreadcrumbs
          heading="Timetable"
          links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Timetable' }]}
          description="Create and manage class schedules by assigning subjects, teachers and rooms to specific time slots"
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
        <TimeTableForm selectedClass={classes} selectedDivision={division} />
      </CustomDialog>

      {!open && (
        <>
          <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <CustomSelect
                label="Class"
                name="class"
                options={allClass}
                valueKey="name"
                labelKey="name"
                formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
                value={classes}
                onChange={(value) => {
                  setClasses(value as string);
                }}
              />
            </Box>
          </Card>
          <CustomizableTable
            tableId="timetable-table"
            noDataText="No Time Table Data Found"
            columns={columns}
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

const TimeTableForm = ({
  selectedClass,
  selectedDivision,
}: {
  selectedClass: string;
  selectedDivision: string;
}) => {
  const formik = useFormik<{ slots: Record<DayOfWeek, TimeSlot[]> }>({
    initialValues: {
      slots: generateWeeklySlots(DEFAULT_CONFIG),
    },
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log(values);
    },
  });

  return (
    <DialogScrollContent
      sx={{ paddingBottom: '16px', height: '100%', p: 2 }}
      scrollBarProps={{
        sx: {
          height: '100%',
          overflow: 'hidden',
          '& .simplebar-content': {
            height: '100%',
          },
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Class :
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {selectedClass}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Division :
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {selectedDivision}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
              onClick={() => {}}
            >
              Draft
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={() => {}}
            >
              Publish
            </Button>
          </Box>
        </Box>
        <TimetableBoard
          slots={formik.values.slots}
          onChange={(value) => formik.setFieldValue('slots', value)}
          subjects={MOCK_SUBJECTS}
          readOnly={false}
          selectedClass={selectedClass}
          selectedDivision={selectedDivision}
        />
      </Box>
    </DialogScrollContent>
  );
};
