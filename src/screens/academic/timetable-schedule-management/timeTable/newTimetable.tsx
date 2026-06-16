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
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import { DEFAULT_CONFIG } from 'src/components/timetable/utils';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  TimetableStatusType,
  TimetableStatusColors,
  TimetableStatusOptions,
} from 'src/enums/timatable-type';
import {
  Box,
  Card,
  Chip,
  Paper,
  Button,
  Divider,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useCreateTimetableMutation,
  useGetTimetableByStandardDivisionQuery,
  useGetTimetableManagementByStandardQuery,
} from 'src/redux/academicAPI/timetableApi/timetableManagementApi';

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
  const router = useRouter();
  // Dialog state for creating time slots modal
  // const createSlotsDialog = useBoolean();
  const [subjectsGroups, setSubjectsGroups] = useState<any>(subjectGroupsData);
  const [showConfirm, ConfirmDialog] = useConfirmDialog();
  const [isDirty, setIsDirty] = useState(false);

  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.management}.Add`
  );

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard name
  const [classes, setClasses] = useState<string>('');
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
    setSelectedStandardId(allClasses[0]?.id || '');
  }, [medium]);

  // State for managing modal/dialog open state
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const handleCloseDialog = async (isSubmit?: boolean) => {
    if (
      isSubmit ||
      !isDirty ||
      (await showConfirm({
        title: 'Alert',
        message: 'Are you sure you want to leave this page? Your changes will be lost.',
        icon: 'warning',
      }))
    ) {
      setIsDirty(false);
      setTimetable(initialTimetableData);
      setSubjectsGroups(initialSubjectsGroups);
      setOpen(false);
      setIsEdit(false);
    }
  };

  // Theme object from Material-UI
  const [initialTimetableData, setInitialTimetableData] = useState<TimetableSlot[]>([]);
  const [initialSubjectsGroups, setInitialSubjectsGroups] = useState<any>([]);

  // Initialize timetable as an array of arrays
  const defaultTimetableData = useMemo(() => cloneDeep(timetableData), []);

  const [timetable, setTimetable] = useState<TimetableSlot[]>(defaultTimetableData);

  // Function to open dialog and store initial state
  const handleOpenDialog = useCallback(() => {
    setInitialTimetableData(cloneDeep(timetable));
    setInitialSubjectsGroups(cloneDeep(subjectsGroups));
    setOpen(true);
  }, [timetable, subjectsGroups]);

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'divisionName', label: 'Division', align: 'left' },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: TimetableStatusOptions,
        align: 'left',
        width: 10,
        minWidth: 10,
        render(value, row) {
          const color = TimetableStatusColors[value as TimetableStatusType] as LabelColor;
          return <Label color={color}>{TimetableStatusType[value]}</Label>;
        },
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: 40,
        width: 40,
        align: 'left',
        sticky: true,
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          if (row.status === 0) {
            return canAdd ? (
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: '100px' }}
                startIcon={<Iconify icon="mdi:add" sx={{ height: '16px', width: '16px' }} />}
                onClick={() => {
                  handleOpenDialog();
                  setDivision(row.divisionName);
                  setSelectedDivisionId(row.divisionId);
                }}
              >
                Create
              </Button>
            ) : null;
          }
          if (row.status === 1 || row.status === 2) {
            return canAdd ? (
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: '100px' }}
                startIcon={
                  <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
                }
                onClick={() => {
                  handleOpenDialog();
                  setDivision(row.divisionName);
                  setSelectedDivisionId(row.divisionId);
                  setIsEdit(true);
                }}
              >
                Update
              </Button>
            ) : null;
          }
          return null;
        },
      },
    ],
    [handleOpenDialog, canAdd]
  );

  const {
    currentData: timetableManagementData,
    isLoading: isTimetableManagementLoading,
    isFetching: isTimetableManagementFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTimetableManagementByStandardQuery,
    params: selectedStandardId,
    options: {
      skip: !selectedStandardId,
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {open ? (
        <CustomBreadcrumbs
          heading="Timetable"
          links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Timetable' }]}
          description="Create and manage class schedules by assigning subjects, teachers and rooms to specific time slots"
          isBack
          onBack={() => handleCloseDialog()}
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
        handleClose={() => handleCloseDialog()}
        open={open}
        fullScreen
      >
        <TimeTableForm
          selectedClass={classes}
          classId={selectedStandardId}
          selectedDivision={division}
          standardId={selectedStandardId}
          divisionId={selectedDivisionId}
          onClose={() => handleCloseDialog(true)}
          setIsDirty={setIsDirty}
        />
      </CustomDialog>

      {ConfirmDialog}
      {!open && (
        <>
          <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                  const name = value as string;
                  setClasses(name);
                  const found = allClass.find((c) => c.name === name);
                  setSelectedStandardId(found?.id || '');
                }}
              />
            </Box>
          </Card>
          <CustomizableTable
            tableId="timetable-table"
            noDataText={
              <>
                No Time Table Data Found. <br />
                <Box
                  component="span"
                  onClick={() => router.push('/academic/timetableSettings/lectureSlots')}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Lecture Slots
                </Box>
              </>
            }
            columns={columns}
            isLoading={isTimetableManagementLoading || isTimetableManagementFetching}
            data={timetableManagementData?.items || []}
          />{' '}
        </>
      )}
    </Box>
  );
};

export default TimeTableGrid;

const TimetableBoardSkeleton = () => {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const TIMELINE_START_MIN = 7 * 60;
  const MINUTE_HEIGHT = 50 / 30;
  const totalHeight = (15 - 7) * 60 * MINUTE_HEIGHT; // 800px

  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const calcPosition = (startTime: string, endTime: string) => {
    const top = (parseTime(startTime) - TIMELINE_START_MIN) * MINUTE_HEIGHT;
    const height = (parseTime(endTime) - parseTime(startTime)) * MINUTE_HEIGHT;
    return { top, height };
  };

  const timeStamps: string[] = [];
  for (let h = 7; h <= 15; h += 1) {
    timeStamps.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 15) timeStamps.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const weekdaySlots = DEFAULT_CONFIG[0].timeSlots;
  const saturdaySlots = DEFAULT_CONFIG[1].timeSlots;

  return (
    <Box
      sx={{ display: 'flex', height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}
    >
      {/* Left Panel Skeleton (matches SubjectPalette) */}
      <Card
        sx={{
          width: '280px',
          height: '100%',
          ml: 1,
          mt: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          boxShadow: 'var(--shadows-4)',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="text" width={100} height={32} />
        <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1, mb: 1.5 }} />
        ))}
      </Card>

      {/* Main Area Skeleton */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'auto',
          position: 'relative',
          bgcolor: 'background.paper',
          height: '100%',
          mt: 1,
        }}
      >
        {/* Time Column (matches sticky Paper in TimetableBoard) */}
        <Paper
          elevation={1}
          sx={{
            width: '80px',
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            position: 'sticky',
            left: 0,
            zIndex: 5,
            pt: '40px',
            borderRadius: 0,
            height: '100%',
          }}
        >
          {timeStamps.map((_, i) => (
            <Box
              key={i}
              sx={{
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: 1.5,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '6px',
                  height: '1px',
                  bgcolor: 'divider',
                },
              }}
            >
              <Skeleton variant="text" width={38} height={12} />
            </Box>
          ))}
        </Paper>

        {/* Days Grid (matches DayColumn layout) */}
        <Box sx={{ display: 'flex', flex: 1, width: '100%', gap: 0.5 }}>
          {days.map((day) => {
            const slots = day === 'SATURDAY' ? saturdaySlots : weekdaySlots;
            return (
              <Box
                key={day}
                sx={{
                  flex: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '140px',
                }}
              >
                {/* Day Header (matches DayColumn header) */}
                <Box
                  sx={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 4,
                    gap: 1,
                  }}
                >
                  <Skeleton variant="text" width={40} height={20} />
                  <Skeleton
                    variant="rounded"
                    width={30}
                    height={18}
                    sx={{ borderRadius: '10px' }}
                  />
                </Box>

                {/* Slot Area (absolute positioned skeletons match actual slot positions) */}
                <Box
                  sx={{
                    position: 'relative',
                    height: `${totalHeight}px`,
                    bgcolor: 'background.neutral',
                  }}
                >
                  {slots.map((slot, i) => {
                    const { top, height } = calcPosition(slot.startTime, slot.endTime);
                    const isBreak = (slot.type as string) === 'BREAK';
                    return (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        sx={{
                          position: 'absolute',
                          top: `${top + 1}px`,
                          left: '4px',
                          right: '4px',
                          height: `${height - 2}px`,
                          borderRadius: 1,
                          ...(isBreak && { bgcolor: 'action.selected', animation: 'none' }),
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const TimeTableForm = ({
  selectedClass,
  classId,
  selectedDivision,
  standardId,
  divisionId,
  onClose,
  setIsDirty,
}: {
  selectedClass: string;
  classId: string;
  selectedDivision: string;
  standardId: string;
  divisionId: string;
  onClose: () => void;
  setIsDirty: (dirty: boolean) => void;
}) => {
  const {
    data: slotConfigData,
    isLoading: isSlotConfigLoading,
    isFetching: isSlotConfigFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTimetableByStandardDivisionQuery,
    params: { standardId: classId, divisionId },
    options: {
      skip: !classId || !divisionId,
    },
  });
  const [createTimetable, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateTimetableMutation,
  });

  const draftTimetableDialog = useBoolean();

  const transformSlotsToPayload = useCallback(
    (slots: Record<DayOfWeek, TimeSlot[]>, status: number) => {
      const dayNameMap: Record<DayOfWeek, string> = {
        MONDAY: 'Monday',
        TUESDAY: 'Tuesday',
        WEDNESDAY: 'Wednesday',
        THURSDAY: 'Thursday',
        FRIDAY: 'Friday',
        SATURDAY: 'Saturday',
      };

      const timetable: Record<string, any[]> = {};

      (Object.keys(slots) as DayOfWeek[]).forEach((day) => {
        const apiDay = dayNameMap[day];
        timetable[apiDay] = slots[day].map((slot, index) => ({
          sequence: slot.sequence ?? index,
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: slot.type === 'LECTURE' ? 0 : 1,
          breakType: slot.breakType === 'SHORT' ? 0 : slot.breakType === 'LUNCH' ? 1 : 0,
          subjectType: slot.subjectType ?? 0,
          electiveGroupId: slot.electiveGroupId ?? null,
          subjects: (slot.subjects ?? []).map((s) => ({
            subjectId: s.subjectId,
            teacherId: s.teacherId ?? '',
            roomId: s.roomId ?? '',
          })),
        }));
      });

      return { status, timetable };
    },
    []
  );

  const handleSubmit = useCallback(
    async (slots: Record<DayOfWeek, TimeSlot[]>, status: number) => {
      const body = transformSlotsToPayload(slots, status);
      await createTimetable({ standardId, divisionId, body }).unwrap();
      shikshaMitraToast.success({
        message: status === 1 ? 'Timetable saved as draft.' : 'Timetable published successfully.',
      });
      setIsDirty(false);
      onClose();
    },
    [createTimetable, divisionId, onClose, setIsDirty, standardId, transformSlotsToPayload]
  );

  // API returns type as integers (1 = LECTURE, 0 = BREAK). Transform to string
  // values the rest of the frontend (DayColumn counts, slotSummary, etc.) expects.
  const initialSlots = useMemo(() => {
    const empty = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
    } as Record<DayOfWeek, TimeSlot[]>;
    if (!slotConfigData?.days) return empty;
    return Object.fromEntries(
      Object.entries(slotConfigData.days).map(([day, daySlots]) => [
        day,
        (daySlots as any[]).map((slot: any) => ({
          ...slot,
          type: slot.type === 0 ? 'LECTURE' : 'BREAK',
          breakType: slot.breakType === 0 ? 'SHORT' : slot.breakType === 1 ? 'LUNCH' : 'SHORT',
        })),
      ])
    ) as Record<DayOfWeek, TimeSlot[]>;
  }, [slotConfigData?.days]);

  const formik = useFormik<{ slots: Record<DayOfWeek, TimeSlot[]> }>({
    initialValues: {
      slots: initialSlots,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
    },
  });

  const subjects = useMemo(
    () =>
      slotConfigData?.subjectSummary.map((subject: any) => {
        const resolvedId = subject?.electiveGroupId
          ? subject?.electiveGroupId
          : subject?.subjects?.[0]?.subjectId;
        return {
          ...subject,
          id: resolvedId,
          subjectId: resolvedId,
          name: subject?.electiveGroupId
            ? subject?.electiveGroupName
            : subject?.subjects?.[0]?.subjectName,
          color: subject?.color,
          defaultDuration: 60,
          totalLectures: subject?.totalSlots,
        };
      }) || [],
    [slotConfigData]
  );

  // Real-time slot summary
  const slotSummary = useMemo(() => {
    let filled = 0;
    let total = 0;
    Object.values(formik.values.slots).forEach((daySlots) => {
      (daySlots as TimeSlot[]).forEach((slot) => {
        if (slot.type === 'LECTURE') {
          total += 1;
          if ((slot.subjects && slot.subjects.length > 0) || slot.subjectId) filled += 1;
        }
      });
    });
    return { filled, total, remaining: total - filled };
  }, [formik.values.slots]);

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
        {/* Enhanced header bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pb: 1,
            flexWrap: 'wrap',
          }}
        >
          {/* Class + Division context */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify
                icon="mdi:school-outline"
                sx={{ width: 18, height: 18, color: 'text.secondary' }}
              />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}
              >
                {selectedClass}
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ color: 'text.disabled', mx: 0.25 }}>
              •
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify
                icon="mdi:door-open"
                sx={{ width: 16, height: 16, color: 'text.secondary' }}
              />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}
              >
                Division {selectedDivision}
              </Typography>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5, height: 18, alignSelf: 'center' }}
            />

            {/* Slot summary pills */}
            <Chip
              icon={<Iconify icon="mdi:check-circle-outline" sx={{ width: 14, height: 14 }} />}
              label={`${slotSummary.filled} filled`}
              size="small"
              color={slotSummary.filled > 0 ? 'success' : 'default'}
              variant="outlined"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Chip
              icon={<Iconify icon="mdi:clock-outline" sx={{ width: 14, height: 14 }} />}
              label={`${slotSummary.remaining} remaining`}
              size="small"
              color={slotSummary.remaining > 0 ? 'warning' : 'default'}
              variant="outlined"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {/* Progress indicator */}
            {slotSummary.total > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                <LinearProgress
                  variant="determinate"
                  value={(slotSummary.filled / slotSummary.total) * 100}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: slotSummary.remaining === 0 ? 'success.main' : 'primary.main',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {Math.round((slotSummary.filled / slotSummary.total) * 100)}%
                </Typography>
              </Box>
            )}

            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
              onClick={() => draftTimetableDialog.onTrue()}
              disabled={isSubmitting}
              sx={{
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { borderColor: 'text.primary', color: 'text.primary' },
              }}
            >
              Draft
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={() => handleSubmit(formik.values.slots, 2)}
              disabled={isSubmitting}
              loading={isSubmitting}
              color="primary"
            >
              Publish
            </Button>
          </Box>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {isSlotConfigLoading || isSlotConfigFetching ? (
            <TimetableBoardSkeleton />
          ) : (
            <TimetableBoard
              slots={formik.values.slots}
              onChange={(value) => {
                formik.setFieldValue('slots', value);
                setIsDirty(true);
              }}
              subjects={subjects}
              readOnly={false}
              selectedClass={selectedClass}
              selectedDivision={selectedDivision}
              standardId={standardId}
              divisionId={divisionId}
            />
          )}
        </Box>
      </Box>
    </DialogScrollContent>
  );
};
