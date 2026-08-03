'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Standards, Organization } from 'src/types/school';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { TimeSlot, DayOfWeek } from 'src/components/timetable/types';
import type { TimetableValidationIssue } from 'src/components/timetable/timetableValidationIssues';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
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
import { extractTimetableApiIssues } from 'src/components/timetable/timetableValidationIssues';
import {
  TimetableStatusType,
  TimetableStatusColors,
  TimetableStatusOptions,
} from 'src/enums/timatable-type';
import {
  Box,
  Card,
  Chip,
  Alert,
  Paper,
  Button,
  Divider,
  Skeleton,
  Typography,
  LinearProgress,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  useCreateTimetableMutation,
  useValidateTimetableMutation,
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

const getTimetableApiErrorMessage = (error: unknown) => {
  const [issue] = extractTimetableApiIssues(error);
  return (
    issue?.description ||
    'Server validation failed. Please review timetable conflicts and try again.'
  );
};

const createValidationIssue = (
  title: string,
  description: string,
  details?: Record<string, string>
): TimetableValidationIssue => ({
  title,
  description,
  severity: 'error',
  details,
});

const getDisplayStatus = (row: any) => {
  if (!row.isReady) return 'Not Ready';
  if (row.status === 0) return 'Not Started';
  if (row.conflictCount > 0) return 'Conflict Found';
  if (row.status === 2) return 'Published';
  const teacherPending = row.teacherTotalCount - row.teacherAssignedCount;
  const roomPending = row.roomTotalCount - row.roomAssignedCount;
  if (row.filledSlots === row.weeklySlots && teacherPending === 0 && roomPending === 0) {
    return 'Ready to Publish';
  }
  if (row.filledSlots > 0) return 'In Progress';
  return 'Draft';
};

const DISPLAY_STATUS_COLORS: Record<string, LabelColor> = {
  'Not Ready': 'error',
  'Not Started': 'default',
  'Conflict Found': 'error',
  Published: 'success',
  'Ready to Publish': 'success',
  'In Progress': 'info',
  Draft: 'warning',
};

const DISPLAY_STATUS_FILTER_OPTIONS = Object.keys(DISPLAY_STATUS_COLORS).map((status) => ({
  value: status,
  label: status,
}));

const SummaryTile = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) => (
  <Card
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadows-2)',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1,
        display: 'grid',
        placeItems: 'center',
        color: `${color}.main`,
        bgcolor: (theme) =>
          alpha(
            theme.palette[
              color as 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
            ]?.main || theme.palette.primary.main,
            0.08
          ),
      }}
    >
      <Iconify icon={icon} width={24} />
    </Box>
  </Card>
);

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
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [readinessCheckDivision, setReadinessCheckDivision] = useState<any | null>(null);

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
      setSelectedStatus(null);
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
      {
        id: 'divisionName',
        label: 'Division',
        filterType: 'string',
        align: 'left',
        sticky: true,
        stickyPosition: 'left',
        minWidth: 130,
      },
      {
        id: 'weeklySlots',
        label: 'Weekly Slots',
        filterType: 'number',
        align: 'left',
        render: (value, row) => (row.weeklySlots === 0 ? '-' : `${row.weeklySlots} slots`),
      },
      {
        id: 'filledSlots',
        label: 'Filled Slots',
        filterType: 'number',
        align: 'left',
        render: (value, row) =>
          row.weeklySlots === 0 ? '-' : `${row.filledSlots}/${row.weeklySlots}`,
      },
      {
        id: 'subjectProgressText',
        label: 'Subject Progress',
        filterType: 'string',
        align: 'left',
        render: (value, row) =>
          row.weeklySlots === 0
            ? '-'
            : `${row.subjectCompletedCount}/${row.subjectTotalCount} complete`,
      },
      {
        id: 'teacherAssignmentText',
        label: 'Teacher Assignment',
        filterType: 'string',
        align: 'left',
        render: (value, row) => {
          if (row.weeklySlots === 0) return '-';
          if (row.teacherTotalCount === 0) return 'No slots filled';
          const pending = row.teacherTotalCount - row.teacherAssignedCount;
          return pending === 0 ? 'All assigned' : `${pending} pending`;
        },
      },
      {
        id: 'roomAssignmentText',
        label: 'Room Assignment',
        filterType: 'string',
        align: 'left',
        render: (value, row) => {
          if (row.weeklySlots === 0) return '-';
          if (row.roomTotalCount === 0) return 'No slots filled';
          const pending = row.roomTotalCount - row.roomAssignedCount;
          return pending === 0
            ? 'All assigned'
            : `${row.roomAssignedCount}/${row.roomTotalCount} assigned`;
        },
      },
      {
        id: 'conflictCount',
        label: 'Conflicts',
        filterType: 'number',
        align: 'left',
        render: (value, row) =>
          row.conflictCount > 0 ? (
            <Label color="error">{row.conflictCount} conflicts</Label>
          ) : (
            <Label color="success">0 conflicts</Label>
          ),
      },
      {
        id: 'displayStatus',
        label: 'Status',
        filterType: 'enum',
        enumOptions: DISPLAY_STATUS_FILTER_OPTIONS,
        sticky: true,
        stickyPosition: 'right',
        align: 'left',
        render: (value, row) => {
          const displayStatus = getDisplayStatus(row);
          const color = DISPLAY_STATUS_COLORS[displayStatus];
          return <Label color={color}>{displayStatus}</Label>;
        },
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          const displayStatus = getDisplayStatus(row);

          if (displayStatus === 'Not Ready') {
            return (
              <Button
                size="small"
                variant="outlined"
                color="error"
                sx={{ minWidth: '110px' }}
                startIcon={
                  <Iconify icon="lucide:settings" sx={{ height: '14px', width: '14px' }} />
                }
                onClick={() => {
                  setReadinessCheckDivision(row);
                }}
              >
                Setup Required
              </Button>
            );
          }

          let buttonText = 'Edit';
          let buttonIcon = GlobalIcons.edit;
          let buttonColor:
            'inherit' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' =
            'primary';

          if (displayStatus === 'Not Started') {
            buttonText = 'Create';
            buttonIcon = 'mdi:add';
            buttonColor = 'primary';
          } else if (displayStatus === 'Draft' || displayStatus === 'In Progress') {
            buttonText = 'Continue';
            buttonIcon = 'mdi:play-circle-outline';
            buttonColor = 'warning';
          } else if (displayStatus === 'Ready to Publish') {
            buttonText = 'Review';
            buttonIcon = 'mdi:eye-outline';
            buttonColor = 'info';
          } else if (displayStatus === 'Published') {
            buttonText = 'Edit / View';
            buttonIcon = GlobalIcons.edit;
            buttonColor = 'success';
          } else if (displayStatus === 'Conflict Found') {
            buttonText = 'Fix Issues';
            buttonIcon = 'mdi:alert-circle-outline';
            buttonColor = 'error';
          }

          return canAdd ? (
            <Button
              size="small"
              variant="outlined"
              color={buttonColor}
              sx={{ minWidth: '110px' }}
              startIcon={<Iconify icon={buttonIcon} sx={{ height: '16px', width: '16px' }} />}
              onClick={() => {
                handleOpenDialog();
                setDivision(row.divisionName);
                setSelectedDivisionId(row.divisionId);
                setSelectedStatus(row.status);
                setIsEdit(row.status !== 0);
              }}
            >
              {buttonText}
            </Button>
          ) : null;
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

  const stats = useMemo(() => {
    const itemsList = timetableManagementData?.items || [];
    const total = itemsList.length;
    let published = 0;
    let draftInProgress = 0;
    let readyToPublish = 0;
    let conflicts = 0;
    let notReady = 0;

    itemsList.forEach((row: any) => {
      const status = getDisplayStatus(row);
      if (status === 'Published') published += 1;
      else if (status === 'Draft' || status === 'In Progress') draftInProgress += 1;
      else if (status === 'Ready to Publish') readyToPublish += 1;
      else if (status === 'Not Ready') notReady += 1;

      if (row.conflictCount > 0) conflicts += 1;
    });

    return { total, published, draftInProgress, readyToPublish, conflicts, notReady };
  }, [timetableManagementData?.items]);

  const timetableRows = useMemo(
    () =>
      (timetableManagementData?.items || []).map((row: any) => {
        const teacherPending = row.teacherTotalCount - row.teacherAssignedCount;
        const roomPending = row.roomTotalCount - row.roomAssignedCount;

        return {
          ...row,
          displayStatus: getDisplayStatus(row),
          subjectProgressText:
            row.weeklySlots === 0
              ? '-'
              : `${row.subjectCompletedCount}/${row.subjectTotalCount} complete`,
          teacherAssignmentText:
            row.weeklySlots === 0
              ? '-'
              : row.teacherTotalCount === 0
                ? 'No slots filled'
                : teacherPending === 0
                  ? 'All assigned'
                  : `${teacherPending} pending`,
          roomAssignmentText:
            row.weeklySlots === 0
              ? '-'
              : row.roomTotalCount === 0
                ? 'No slots filled'
                : roomPending === 0
                  ? 'All assigned'
                  : `${row.roomAssignedCount}/${row.roomTotalCount} assigned`,
        };
      }),
    [timetableManagementData?.items]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {open ? (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Timetable"
          links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Timetable' }]}
          description="Create and manage class schedules by assigning subjects, teachers and rooms to specific time slots"
          isBack
          onBack={() => handleCloseDialog()}
        />
      ) : (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
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
          timetableStatus={selectedStatus}
        />
      </CustomDialog>

      {ConfirmDialog}
      <Dialog
        open={Boolean(readinessCheckDivision)}
        onClose={() => setReadinessCheckDivision(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <Iconify icon="lucide:alert-triangle" color="warning.main" />
          <Typography variant="h6">Readiness Checklist</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {readinessCheckDivision && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Class {classes} · Division {readinessCheckDivision.divisionName} (Readiness:{' '}
                {readinessCheckDivision.readinessScore}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={readinessCheckDivision.readinessScore}
                sx={{ mb: 2.5, height: 8, borderRadius: 4 }}
                color={readinessCheckDivision.readinessScore === 100 ? 'success' : 'warning'}
              />
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 600 }}
              >
                Pending Setup Items:
              </Typography>
              <Stack spacing={1}>
                {readinessCheckDivision.missingItems.map((item: string, idx: number) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="lucide:x-circle" color="error.main" sx={{ flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReadinessCheckDivision(null)}
            variant="contained"
            color="primary"
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
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
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Total Divisions"
                value={stats.total}
                icon="solar:users-group-two-rounded-bold"
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Published"
                value={stats.published}
                icon="mdi:check-circle-outline"
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Draft / In Progress"
                value={stats.draftInProgress}
                icon="mdi:play-circle-outline"
                color="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Ready to Publish"
                value={stats.readyToPublish}
                icon="mdi:eye-outline"
                color="info"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Conflicts"
                value={stats.conflicts}
                icon="mdi:alert-circle-outline"
                color="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <SummaryTile
                label="Not Ready"
                value={stats.notReady}
                icon="lucide:settings"
                color="error"
              />
            </Grid>
          </Grid>
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
            data={timetableRows}
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
  timetableStatus,
}: {
  selectedClass: string;
  classId: string;
  selectedDivision: string;
  standardId: string;
  divisionId: string;
  onClose: () => void;
  setIsDirty: (dirty: boolean) => void;
  timetableStatus: number | null;
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
  const [validateTimetable, { isLoading: isValidating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useValidateTimetableMutation,
  });

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
      try {
        const body = transformSlotsToPayload(slots, status);
        await createTimetable({ standardId, divisionId, body }).unwrap();
        shikshaMitraToast.success({
          message: status === 1 ? 'Timetable saved as draft.' : 'Timetable published successfully.',
        });
        setIsDirty(false);
        onClose();
        return true;
      } catch (error) {
        shikshaMitraToast.error({
          message: getTimetableApiErrorMessage(error),
        });
        return false;
      }
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

  const subjectProgress = useMemo(() => {
    let completed = 0;
    const total = subjects.length;

    subjects.forEach((subject: any) => {
      const subjectKey = subject.electiveGroupId || subject.subjectId;
      let count = 0;
      Object.values(formik.values.slots).forEach((daySlots) => {
        (daySlots as TimeSlot[]).forEach((slot: any) => {
          const key = slot.electiveGroupId || slot.subjectId || slot.subjects?.[0]?.subjectId;
          if (key === subjectKey) count += 1;
        });
      });
      if (count === subject.totalLectures) completed += 1;
    });

    return { completed, total };
  }, [subjects, formik.values.slots]);

  const assignmentProgress = useMemo(() => {
    let totalFilledSubjects = 0;
    let teacherAssigned = 0;
    let roomAssigned = 0;

    Object.values(formik.values.slots).forEach((daySlots) => {
      (daySlots as TimeSlot[]).forEach((slot) => {
        if (slot.type === 'LECTURE') {
          const slotSubs = slot.subjects || [];
          totalFilledSubjects += slotSubs.length;
          slotSubs.forEach((sub) => {
            if (sub.teacherId) teacherAssigned += 1;
            if (sub.roomId) roomAssigned += 1;
          });
        }
      });
    });

    return {
      totalFilledSubjects,
      teacherAssigned,
      roomAssigned,
    };
  }, [formik.values.slots]);

  const conflicts = useMemo(() => {
    const warnings: string[] = [];
    const slots = formik.values.slots;
    (Object.keys(slots) as DayOfWeek[]).forEach((day) => {
      (slots[day] || []).forEach((slot) => {
        if (!slot.subjects || slot.subjects.length < 2) return;

        const teacherIds = slot.subjects.map((s) => s.teacherId).filter(Boolean);
        const seenTeachers = new Set<string>();
        teacherIds.forEach((id) => {
          if (id && seenTeachers.has(id)) {
            warnings.push(
              `${day.charAt(0) + day.slice(1).toLowerCase()}: Same teacher double-booked at ${slot.startTime}–${slot.endTime}`
            );
          } else if (id) {
            seenTeachers.add(id);
          }
        });

        const roomIds = slot.subjects.map((s) => s.roomId).filter(Boolean);
        const seenRooms = new Set<string>();
        roomIds.forEach((id) => {
          if (id && seenRooms.has(id)) {
            warnings.push(
              `${day.charAt(0) + day.slice(1).toLowerCase()}: Same room double-booked at ${slot.startTime}–${slot.endTime}`
            );
          } else if (id) {
            seenRooms.add(id);
          }
        });
      });
    });
    return [...new Set(warnings)];
  }, [formik.values.slots]);

  const editorDisplayStatus = useMemo(() => {
    if (conflicts.length > 0) return 'Conflict Found';
    const teacherPending =
      assignmentProgress.totalFilledSubjects - assignmentProgress.teacherAssigned;
    const roomPending = assignmentProgress.totalFilledSubjects - assignmentProgress.roomAssigned;
    if (slotSummary.filled === slotSummary.total && teacherPending === 0 && roomPending === 0) {
      return 'Ready to Publish';
    }
    if (slotSummary.filled > 0) return 'In Progress';
    return 'Draft';
  }, [conflicts, assignmentProgress, slotSummary]);

  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    conflicts: TimetableValidationIssue[];
    emptySlots: number;
    incompleteSubjects: TimetableValidationIssue[];
  } | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const handleValidate = useCallback(async () => {
    const errors: TimetableValidationIssue[] = conflicts.map((conflict) =>
      createValidationIssue('Timetable conflict', conflict)
    );
    let emptySlots = 0;

    Object.values(formik.values.slots).forEach((daySlots) => {
      (daySlots as TimeSlot[]).forEach((slot) => {
        if (slot.type === 'LECTURE') {
          if (!slot.subjectId && (!slot.subjects || slot.subjects.length === 0)) {
            emptySlots += 1;
          }
        }
      });
    });

    if (emptySlots > 0) {
      errors.push(
        createValidationIssue(
          'Empty period slots found',
          `${emptySlots} lecture slot${emptySlots > 1 ? 's are' : ' is'} still empty.`,
          { Slots: String(emptySlots) }
        )
      );
    }

    const incompleteSubjects: TimetableValidationIssue[] = [];
    subjects.forEach((subject: any) => {
      const subjectKey = subject.electiveGroupId || subject.subjectId;
      let count = 0;
      Object.values(formik.values.slots).forEach((daySlots) => {
        (daySlots as TimeSlot[]).forEach((slot: any) => {
          const key = slot.electiveGroupId || slot.subjectId || slot.subjects?.[0]?.subjectId;
          if (key === subjectKey) count += 1;
        });
      });
      if (count < subject.totalLectures) {
        incompleteSubjects.push(
          createValidationIssue(
            'Subject lectures missing',
            `${subject.name} requires ${subject.totalLectures} lectures, but only ${count} are assigned.`,
            {
              Subject: subject.name,
              Required: String(subject.totalLectures),
              Assigned: String(count),
              Missing: String(subject.totalLectures - count),
            }
          )
        );
      } else if (count > subject.totalLectures) {
        incompleteSubjects.push(
          createValidationIssue(
            'Subject lectures over-assigned',
            `${subject.name} requires ${subject.totalLectures} lectures, but ${count} are assigned.`,
            {
              Subject: subject.name,
              Required: String(subject.totalLectures),
              Assigned: String(count),
              Extra: String(count - subject.totalLectures),
            }
          )
        );
      }
    });

    try {
      const body = transformSlotsToPayload(formik.values.slots, 1);
      await validateTimetable({ standardId, divisionId, body }).unwrap();
    } catch (error) {
      errors.push(...extractTimetableApiIssues(error, 'Timetable conflict found'));
    }

    setValidationResult({
      passed: errors.length === 0 && incompleteSubjects.length === 0,
      conflicts: errors,
      emptySlots,
      incompleteSubjects,
    });
  }, [
    conflicts,
    divisionId,
    formik.values.slots,
    standardId,
    subjects,
    transformSlotsToPayload,
    validateTimetable,
  ]);

  const validateProspectiveSlots = useCallback(
    async (
      nextSlots: Record<DayOfWeek, TimeSlot[]>,
      source: 'teacher' | 'room'
    ): Promise<TimetableValidationIssue[]> => {
      try {
        const body = transformSlotsToPayload(nextSlots, 1);
        await validateTimetable({ standardId, divisionId, body }).unwrap();
        return [];
      } catch (error) {
        return extractTimetableApiIssues(
          error,
          source === 'teacher' ? 'Teacher conflict found' : 'Room conflict found'
        );
      }
    },
    [divisionId, standardId, transformSlotsToPayload, validateTimetable]
  );

  const handlePublishClick = () => {
    let emptySlots = 0;
    Object.values(formik.values.slots).forEach((daySlots) => {
      (daySlots as TimeSlot[]).forEach((slot) => {
        if (slot.type === 'LECTURE') {
          if (!slot.subjectId && (!slot.subjects || slot.subjects.length === 0)) {
            emptySlots += 1;
          }
        }
      });
    });

    const incompleteCount = subjects.filter((subject: any) => {
      const subjectKey = subject.electiveGroupId || subject.subjectId;
      let count = 0;
      Object.values(formik.values.slots).forEach((daySlots) => {
        (daySlots as TimeSlot[]).forEach((slot: any) => {
          const key = slot.electiveGroupId || slot.subjectId || slot.subjects?.[0]?.subjectId;
          if (key === subjectKey) count += 1;
        });
      });
      return count !== subject.totalLectures;
    }).length;

    const teacherPending =
      assignmentProgress.totalFilledSubjects - assignmentProgress.teacherAssigned;
    const roomPending = assignmentProgress.totalFilledSubjects - assignmentProgress.roomAssigned;

    if (
      conflicts.length > 0 ||
      emptySlots > 0 ||
      incompleteCount > 0 ||
      teacherPending > 0 ||
      roomPending > 0
    ) {
      handleValidate();
      return;
    }

    setValidationResult(null);
    setPublishConfirmOpen(true);
  };

  const handlePublishFromValidation = () => {
    setValidationResult(null);
    setPublishConfirmOpen(true);
  };

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
            px: 2,
            py: 1.25,
            mb: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.8),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* Class + Division context */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify
                icon="mdi:school-outline"
                sx={{ width: 18, height: 18, color: 'primary.main' }}
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
              <Iconify icon="mdi:door-open" sx={{ width: 16, height: 16, color: 'primary.main' }} />
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
              label={`${slotSummary.filled}/${slotSummary.total} filled`}
              size="small"
              color={slotSummary.filled > 0 ? 'success' : 'default'}
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            {slotSummary.remaining > 0 && (
              <Chip
                icon={<Iconify icon="mdi:clock-outline" sx={{ width: 14, height: 14 }} />}
                label={`${slotSummary.remaining} remaining`}
                size="small"
                color="warning"
                variant="soft"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
            <Chip
              icon={<Iconify icon="solar:book-bold" sx={{ width: 14, height: 14 }} />}
              label={`${subjectProgress.completed}/${subjectProgress.total} subjects`}
              size="small"
              color={subjectProgress.completed === subjectProgress.total ? 'success' : 'default'}
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Chip
              icon={<Iconify icon="mdi:account-tie" sx={{ width: 14, height: 14 }} />}
              label={`Teachers: ${assignmentProgress.teacherAssigned}/${assignmentProgress.totalFilledSubjects}`}
              size="small"
              color={
                assignmentProgress.teacherAssigned === assignmentProgress.totalFilledSubjects &&
                  assignmentProgress.totalFilledSubjects > 0
                  ? 'success'
                  : 'default'
              }
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Chip
              icon={<Iconify icon="mdi:door-closed" sx={{ width: 14, height: 14 }} />}
              label={`Rooms: ${assignmentProgress.roomAssigned}/${assignmentProgress.totalFilledSubjects}`}
              size="small"
              color={
                assignmentProgress.roomAssigned === assignmentProgress.totalFilledSubjects &&
                  assignmentProgress.totalFilledSubjects > 0
                  ? 'success'
                  : 'default'
              }
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            {conflicts.length > 0 && (
              <Chip
                icon={<Iconify icon="mdi:alert-circle-outline" sx={{ width: 14, height: 14 }} />}
                label={`${conflicts.length} conflicts`}
                size="small"
                color="error"
                variant="soft"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
            <Chip
              label={editorDisplayStatus}
              size="small"
              color={DISPLAY_STATUS_COLORS[editorDisplayStatus] as any}
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 700,
                px: 0.5,
              }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Progress indicator */}
            {slotSummary.total > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 110, mr: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={(slotSummary.filled / slotSummary.total) * 100}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
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
              onClick={() => handleSubmit(formik.values.slots, 1)}
              disabled={isSubmitting}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              Save Draft
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<Iconify icon="lucide:check-square" />}
              onClick={handleValidate}
              disabled={isSubmitting || isValidating}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              Validate
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<Iconify icon="lucide:eye" />}
              onClick={() => setPreviewOpen(true)}
              disabled={isSubmitting}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              Preview
            </Button>

            <LoadingButton
              variant="contained"
              size="small"
              color="primary"
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={handlePublishClick}
              loading={isSubmitting}
              sx={{ fontWeight: 600 }}
            >
              Publish
            </LoadingButton>
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
              timetableStatus={timetableStatus}
              validateSlots={validateProspectiveSlots}
            />
          )}
        </Box>
      </Box>

      {/* Validation Dialog */}
      <Dialog
        open={Boolean(validationResult)}
        onClose={() => setValidationResult(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              color: validationResult?.passed ? 'success.main' : 'error.main',
              bgcolor: (theme) =>
                alpha(
                  validationResult?.passed ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
            }}
          >
            <Iconify
              icon={
                validationResult?.passed ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'
              }
              width={24}
            />
          </Box>
          <Box>
            <Typography variant="h6">
              {validationResult?.passed ? 'Validation Passed' : 'Validation Failed'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {validationResult?.passed
                ? 'The timetable is complete and ready to publish.'
                : 'Review the exact issues below before publishing.'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {validationResult && (
            <Stack spacing={2}>
              {validationResult.passed ? (
                <Stack spacing={2}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (theme) =>
                        varAlpha(theme.vars.palette.success.mainChannel, 0.24),
                      bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.06),
                      boxShadow: (theme) => `inset 4px 0 0 ${theme.palette.success.main}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1,
                          display: 'grid',
                          flexShrink: 0,
                          placeItems: 'center',
                          color: 'success.main',
                          bgcolor: (theme) =>
                            varAlpha(theme.vars.palette.success.mainChannel, 0.12),
                        }}
                      >
                        <Iconify icon="mdi:check-decagram-outline" width={26} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Timetable is ready to publish
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Class {selectedClass} Division {selectedDivision} passed every validation
                          check and can now move from draft to published.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Grid container spacing={1}>
                    {[
                      {
                        label: 'Slots filled',
                        value: `${slotSummary.filled}/${slotSummary.total}`,
                        helper:
                          slotSummary.remaining === 0
                            ? 'All lecture periods assigned'
                            : `${slotSummary.remaining} periods remaining`,
                        icon: 'mdi:calendar-check-outline',
                      },
                      {
                        label: 'Subjects complete',
                        value: `${subjectProgress.completed}/${subjectProgress.total}`,
                        helper: 'Required subject load is balanced',
                        icon: 'mdi:book-check-outline',
                      },
                      {
                        label: 'Conflicts found',
                        value: '0',
                        helper: 'Teacher and room checks are clear',
                        icon: 'mdi:shield-check-outline',
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            height: '100%',
                            borderRadius: 1,
                            bgcolor: (theme) =>
                              varAlpha(theme.vars.palette.background.neutralChannel, 0.8),
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Iconify
                                icon={item.icon}
                                width={18}
                                sx={{ color: 'success.main', flexShrink: 0 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {item.label}
                              </Typography>
                            </Stack>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                              {item.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.helper}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Alert
                    severity="success"
                    icon={<Iconify icon="mdi:check-circle-outline" width={22} />}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Validation passed
                    </Typography>
                    <Typography variant="body2">
                      Publish now to make this timetable visible to teachers, students, and parents.
                    </Typography>
                  </Alert>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Please fix the following issues before publishing:
                  </Typography>
                  <Stack spacing={1}>
                    {validationResult.conflicts.map((err, idx) => (
                      <Card
                        key={`${err.title}-${idx}`}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderColor: 'error.light',
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.03),
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Iconify
                            icon="lucide:x-circle"
                            color="error.main"
                            sx={{ mt: 0.25, flexShrink: 0 }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2">{err.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                              {err.description}
                            </Typography>
                            {err.details && Object.keys(err.details).length > 0 && (
                              <Stack
                                direction="row"
                                spacing={0.75}
                                useFlexGap
                                flexWrap="wrap"
                                sx={{ mt: 1 }}
                              >
                                {Object.entries(err.details).map(([label, value]) => (
                                  <Chip
                                    key={`${label}-${value}`}
                                    size="small"
                                    variant="soft"
                                    color="error"
                                    label={`${label}: ${value}`}
                                  />
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Card>
                    ))}
                    {validationResult.incompleteSubjects.map((err, idx) => (
                      <Card
                        key={`${err.title}-${idx}`}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderColor: 'error.light',
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.03),
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Iconify
                            icon="lucide:x-circle"
                            color="error.main"
                            sx={{ mt: 0.25, flexShrink: 0 }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2">{err.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                              {err.description}
                            </Typography>
                            {err.details && Object.keys(err.details).length > 0 && (
                              <Stack
                                direction="row"
                                spacing={0.75}
                                useFlexGap
                                flexWrap="wrap"
                                sx={{ mt: 1 }}
                              >
                                {Object.entries(err.details).map(([label, value]) => (
                                  <Chip
                                    key={`${label}-${value}`}
                                    size="small"
                                    variant="soft"
                                    color="error"
                                    label={`${label}: ${value}`}
                                  />
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setValidationResult(null)}
            variant={validationResult?.passed ? 'outlined' : 'contained'}
            color={validationResult?.passed ? 'inherit' : 'primary'}
          >
            Close
          </Button>
          {validationResult?.passed && (
            <LoadingButton
              onClick={handlePublishFromValidation}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              loading={isSubmitting}
            >
              Publish Now
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishConfirmOpen}
        onClose={() => {
          if (!isSubmitting) setPublishConfirmOpen(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:cloud-upload-outline" color="primary.main" />
          <Typography variant="h6">Publish Timetable</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Ready to publish Class {selectedClass} Division {selectedDivision}
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            Validation is complete. Publishing will make this timetable visible to teachers,
            students, and parents.
          </Alert>
          <Stack spacing={1} sx={{ mb: 2.5, display: 'none' }}>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'success.main', fontWeight: 600 }}
            >
              ✓ {slotSummary.filled}/{slotSummary.total} slots filled
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'success.main', fontWeight: 600 }}
            >
              ✓ All subjects complete
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'success.main', fontWeight: 600 }}
            >
              ✓ All teachers & rooms assigned
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'success.main', fontWeight: 600 }}
            >
              ✓ 0 conflicts found
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            This action updates the timetable status to Published. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPublishConfirmOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={async () => {
              const published = await handleSubmit(formik.values.slots, 2);
              if (published) setPublishConfirmOpen(false);
            }}
            variant="contained"
            color="primary"
            loading={isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.publish} />}
          >
            Publish
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
        >
          <Typography variant="h6">Timetable Preview (Read Only)</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Iconify icon="lucide:x" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ height: '70vh', p: 0 }}>
          <TimetableBoard
            slots={formik.values.slots}
            onChange={() => {}}
            subjects={subjects}
            readOnly
            selectedClass={selectedClass}
            selectedDivision={selectedDivision}
            standardId={standardId}
            divisionId={divisionId}
            timetableStatus={timetableStatus}
          />
        </DialogContent>
      </Dialog>
    </DialogScrollContent>
  );
};
