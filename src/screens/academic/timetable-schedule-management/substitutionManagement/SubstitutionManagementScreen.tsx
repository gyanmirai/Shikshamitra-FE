'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type {
  ApiLookupOption,
  ApiAffectedLecture,
  ApiSubstitutionRow,
  ApiSuggestedTeacher,
  ApiSubstitutionLecture,
  ApiSubstitutionSettings,
  ApiTeacherAvailabilityRow,
  ApiSubstitutionCreateMetadata,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Add,
  Print,
  MoreVert,
  FactCheck,
  PersonOff,
  AutoAwesome,
  AssignmentInd,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Menu,
  Tabs,
  Alert,
  Stack,
  Switch,
  Button,
  Tooltip,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CardContent,
  ToggleButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import {
  getActiveFilters,
  SubstitutionActiveFilters,
  DEFAULT_SUBSTITUTION_FILTERS,
  SubstitutionFilters as FiltersBar,
} from './components/SubstitutionFilters';
import {
  todayIso,
  roomOptions,
  reasonOptions,
  periodTimeMap,
  teacherOptions,
  subjectOptions,
  priorityOptions,
  sourceTypeOptions,
  suggestedTeachers,
  lectureSlotOptions,
  affectedLectureTemplates,
  availabilityStatusOptions,
  initialTeacherAvailability,
} from './substitutionData';
import {
  useDailySheetDataQuery,
  useAssignSubstituteAction,
  useDailySheetPdfLazyQuery,
  useSubstitutionsDataQuery,
  useCancelSubstitutionAction,
  useCreateSubstitutionAction,
  useDailySheetExcelLazyQuery,
  useEmployeeOptionsLazyQuery,
  useAffectedLecturesDataQuery,
  useAffectedLecturesLazyQuery,
  useCompleteSubstitutionAction,
  useSuggestedTeachersDataQuery,
  useRejectSubstitutionDutyAction,
  useTeacherAvailabilityDataQuery,
  useAcknowledgeSubstitutionAction,
  useMySubstitutionDutiesDataQuery,
  useSubstitutionLecturesDataQuery,
  useSubstitutionSettingsDataQuery,
  useSendSubstitutionReminderAction,
  useSubstitutionDashboardDataQuery,
  useCreateTeacherAvailabilityAction,
  useRequestSubstitutionChangeAction,
  useUpdateSubstitutionSettingsAction,
  useSubstitutionCreateMetadataDataQuery,
  useSuggestedTeachersByContextDataQuery,
} from './substitutionManagement.hooks';

import type {
  ConflictStatus,
  SubstitutionRow,
  AffectedLectureRow,
  SubstitutionStatus,
  AvailableTeacherRow,
  SubstitutionPriority,
  SubstitutionViewType,
  AcknowledgementStatus,
  TeacherAvailabilityRow,
} from './substitutionData';

const priorityValueMap: Record<SubstitutionPriority, number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Urgent: 3,
};

const sourceValueMap: Record<SubstitutionRow['source'], number> = {
  Manual: 0,
  'AI Suggested': 1,
  'Auto Created': 2,
  'HR Leave': 3,
  Calendar: 4,
  Attendance: 5,
};

const availabilityStatusValueMap: Record<string, number> = {
  Unavailable: 0,
  Leave: 1,
  Training: 2,
  Meeting: 3,
  'Exam Duty': 4,
  'Other Duty': 5,
};

const sourceTypeValueMap: Record<string, number> = {
  Manual: 0,
  'HR Leave': 1,
  Attendance: 2,
  Calendar: 3,
  'Exam Duty': 4,
  Event: 5,
};

const statusLabelMap: Record<number, SubstitutionStatus> = {
  0: 'Pending',
  1: 'Assigned',
  2: 'Waiting Ack',
  3: 'Acknowledged',
  4: 'Completed',
  5: 'Rejected',
  6: 'Cancelled',
  7: 'Conflict',
  8: 'Expired',
};

const acknowledgementLabelMap: Record<number, AcknowledgementStatus> = {
  0: 'Not Sent',
  1: 'Sent',
  2: 'Seen',
  3: 'Accepted',
  4: 'Rejected',
  5: 'Change Requested',
  6: 'Escalated',
};

const conflictLabelMap: Record<number, ConflictStatus> = {
  0: 'Clear',
  1: 'Info',
  2: 'Warning',
  3: 'Hard Block',
};

const sourceLabelMap: Record<number, SubstitutionRow['source']> = {
  0: 'Manual',
  1: 'AI Suggested',
  2: 'Auto Created',
  3: 'HR Leave',
  4: 'Calendar',
  5: 'Attendance',
  6: 'Auto Created',
};

const availabilityStatusLabelMap: Record<number, string> = {
  0: 'Unavailable',
  1: 'Leave',
  2: 'Training',
  3: 'Meeting',
  4: 'Exam Duty',
  5: 'Other Duty',
};

const sourceTypeLabelMap: Record<number, string> = {
  0: 'Manual',
  1: 'HR Leave',
  2: 'Attendance',
  3: 'Calendar',
  4: 'Exam Duty',
  5: 'Event',
};

const viewDateFormat = 'DD-MM-YYYY';

const formatViewDate = (value?: string | null) =>
  value && dayjs(value).isValid() ? dayjs(value).format(viewDateFormat) : '-';

const toDateTimeOffset = (value?: Dayjs | null) =>
  value?.isValid() ? dateConvertor(value.format(dateFormat)) : '';

type SelectOption = {
  value: string;
  label: string;
};

const normalizeEnumText = (value: string | number | undefined | null): string =>
  typeof value === 'number' ? '' : (value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');

const toSubstitutionStatus = (value: string | number): SubstitutionStatus => {
  if (typeof value === 'number') return statusLabelMap[value] ?? 'Pending';
  const normalized = normalizeEnumText(value);
  return statusColor[normalized as SubstitutionStatus]
    ? (normalized as SubstitutionStatus)
    : 'Pending';
};

const toAcknowledgementStatus = (value: string | number): AcknowledgementStatus => {
  if (typeof value === 'number') return acknowledgementLabelMap[value] ?? 'Not Sent';
  const normalized = normalizeEnumText(value);
  return acknowledgementColor[normalized as AcknowledgementStatus]
    ? (normalized as AcknowledgementStatus)
    : 'Not Sent';
};

const toConflictStatus = (value: string | number): ConflictStatus => {
  if (typeof value === 'number') return conflictLabelMap[value] ?? 'Clear';
  const normalized = normalizeEnumText(value);
  return conflictColor[normalized as ConflictStatus] ? (normalized as ConflictStatus) : 'Clear';
};

const toSubstitutionSource = (value: string | number): SubstitutionRow['source'] => {
  if (typeof value === 'number') return sourceLabelMap[value] ?? 'Manual';
  const normalized = normalizeEnumText(value);
  const allowed: SubstitutionRow['source'][] = [
    'Manual',
    'AI Suggested',
    'Auto Created',
    'HR Leave',
    'Calendar',
    'Attendance',
  ];
  return allowed.includes(normalized as SubstitutionRow['source'])
    ? (normalized as SubstitutionRow['source'])
    : 'Manual';
};

const toAssignmentSourceFromAvailability = (value: string): SubstitutionRow['source'] => {
  const normalized = normalizeEnumText(value);
  if (normalized === 'HR Leave') return 'HR Leave';
  if (normalized === 'Attendance') return 'Attendance';
  if (normalized === 'Calendar' || normalized === 'Academic Calendar') return 'Calendar';
  return 'Auto Created';
};

const toPriority = (value: string | number): SubstitutionPriority => {
  if (typeof value === 'number') {
    return (Object.entries(priorityValueMap).find(([, enumValue]) => enumValue === value)?.[0] ??
      'Normal') as SubstitutionPriority;
  }

  return value in priorityValueMap ? (value as SubstitutionPriority) : 'Normal';
};

const mapApiSubstitution = (item: ApiSubstitutionRow): SubstitutionRow => ({
  id: item.id,
  date: dayjs(item.date).format('YYYY-MM-DD'),
  day: item.day,
  period: item.period,
  startTime: item.startTime,
  endTime: item.endTime,
  time: item.time,
  className: item.className,
  divisionName: item.divisionName,
  departmentName: item.departmentName,
  subjectName: item.subjectName,
  originalTeacherName: item.originalTeacherName,
  substituteTeacherName: item.substituteTeacherName || undefined,
  roomName: item.roomName,
  assignedRoomName: item.assignedRoomName || undefined,
  reason: item.reason,
  status: toSubstitutionStatus(item.status),
  priority: toPriority(item.priority),
  acknowledgementStatus: toAcknowledgementStatus(item.acknowledgementStatus),
  notificationStatus: item.notificationStatus as SubstitutionRow['notificationStatus'],
  source: toSubstitutionSource(item.source),
  conflictStatus: toConflictStatus(item.conflictStatus),
  conflictReason: item.conflictReason || undefined,
  aiScore: item.aiScore || undefined,
  isAiSuggested: item.isAiSuggested,
  workloadStatus: item.workloadStatus as SubstitutionRow['workloadStatus'],
  acknowledgementRequired: item.acknowledgementRequired,
  createdAt: item.createdAt,
  acknowledgedAt: item.acknowledgedAt || undefined,
  completedAt: item.completedAt || undefined,
  remarks: item.remarks || undefined,
  auditLog: item.auditLog.map((entry) => ({
    at: entry.at,
    actor: entry.actor,
    action: entry.action,
  })),
});

const mapApiTeacherAvailability = (item: ApiTeacherAvailabilityRow) => ({
  id: item.id,
  teacherId: item.teacherId,
  teacherName: item.teacherName,
  departmentName: item.departmentName,
  availabilityDate: dayjs(item.availabilityDate).format('YYYY-MM-DD'),
  startTime: item.startTime,
  endTime: item.endTime,
  availabilityStatus:
    typeof item.availabilityStatus === 'number'
      ? (availabilityStatusLabelMap[item.availabilityStatus] ?? 'Unavailable')
      : normalizeEnumText(item.availabilityStatus),
  sourceType:
    typeof item.sourceType === 'number'
      ? (sourceTypeLabelMap[item.sourceType] ?? 'Manual')
      : normalizeEnumText(item.sourceType),
  reason: item.reason,
  isFullDay: item.isFullDay,
  affectedLectureCount: item.affectedLectureCount,
  canCreateSubstitution: item.canCreateSubstitution,
  autoCreateSubstitutions: item.autoCreateSubstitutions,
  notifyLeadership: item.notifyLeadership,
  attachmentName: item.attachmentName || undefined,
  remarks: item.remarks || undefined,
});

const mapApiSuggestedTeacher = (item: ApiSuggestedTeacher): AvailableTeacherRow => ({
  teacherId: item.teacherId || item.teacherName,
  teacherName: item.teacherName,
  departmentName: item.departmentName,
  canTeachSubject: item.canTeachSubject,
  hasConflict: item.hasConflict,
  conflictSeverity: toConflictStatus(item.conflictSeverity),
  conflictReason: item.conflictReason || undefined,
  todaySubstitutionCount: item.todaySubstitutionCount,
  weekSubstitutionCount: item.weekSubstitutionCount,
  monthSubstitutionCount: item.monthSubstitutionCount,
  todayTeachingLoad: item.todayTeachingLoad,
  freePeriods: item.freePeriods,
  lastDutyDate: item.lastDutyDate || '-',
  loadStatus: item.loadStatus as AvailableTeacherRow['loadStatus'],
  score: item.score,
  coverageStartTime: item.coverageStartTime || undefined,
  coverageEndTime: item.coverageEndTime || undefined,
  coverageMinutes: item.coverageMinutes,
  isFullSlotCoverage: item.isFullSlotCoverage,
  isPartialCoverage: item.isPartialCoverage,
  recommendationReason: item.recommendationReason,
});

const mapApiAffectedLecture = (item: ApiAffectedLecture): AffectedLectureRow => ({
  id: item.slotSubjectId || `${item.period}-${item.className}-${item.divisionName}`,
  timetableId: item.timetableId,
  timetableSlotId: item.timetableSlotId,
  slotSubjectId: item.slotSubjectId,
  standardId: item.standardId,
  divisionId: item.divisionId,
  subjectId: item.subjectId,
  roomId: item.roomId,
  teacherId: item.teacherId,
  existingSubstitutionId: item.existingSubstitutionId,
  canCreateSubstitution: item.canCreateSubstitution,
  period: item.period,
  time: item.time,
  startTime: item.startTime,
  endTime: item.endTime,
  className: item.className,
  divisionName: item.divisionName,
  subjectName: item.subjectName,
  roomName: item.roomName,
  teacherName: item.teacherName,
});

const formatLectureLabel = (item: ApiSubstitutionLecture) =>
  `${item.period} | ${item.startTime}-${item.endTime} | ${item.subjectName} | ${
    item.originalTeacherName || 'Teacher not assigned'
  }`;

const getTeacherCoverageLabel = (teacher: AvailableTeacherRow) =>
  teacher.coverageStartTime && teacher.coverageEndTime
    ? `${teacher.coverageStartTime}-${teacher.coverageEndTime}`
    : 'Selected slot';

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

type SubstitutionFormState = {
  standardId: string;
  divisionId: string;
  timetableId: string;
  timetableSlotId: string;
  timetableSlotSubjectId: string;
  subjectId: string;
  originalTeacherId: string;
  originalRoomId: string;
  substituteTeacherId: string;
  assignedRoomId: string;
  startTime: string;
  endTime: string;
  date: Dayjs | null;
  className: string;
  divisionName: string;
  period: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName: string;
  roomName: string;
  assignedRoomName: string;
  reason: string;
  priority: SubstitutionPriority;
  remarks: string;
  acknowledgementRequired: boolean;
  sendNotification: boolean;
  notificationMethod: string;
  autoReminderRule: string;
  assignmentSource: SubstitutionRow['source'];
  selectedSubstitutes: SubstituteCoverageSelection[];
};

type SubstituteCoverageSelection = {
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  score: number;
  isPartialCoverage: boolean;
};

type EmployeeOption = {
  id: string;
  label: string;
  departmentName?: string;
};

type AvailabilityFormState = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
  availabilityDate: Dayjs | null;
  startTime: string;
  endTime: string;
  availabilityStatus: string;
  sourceType: string;
  reason: string;
  remarks: string;
  isFullDay: boolean;
  autoCreateSubstitutions: boolean;
  notifyLeadership: boolean;
  attachmentName: string;
};

type MetricCard = {
  label: string;
  value: string | number;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  progress: number;
  filterStatus?: SubstitutionStatus;
};

const defaultSubstitutionForm: SubstitutionFormState = {
  standardId: '',
  divisionId: '',
  timetableId: '',
  timetableSlotId: '',
  timetableSlotSubjectId: '',
  subjectId: '',
  originalTeacherId: '',
  originalRoomId: '',
  substituteTeacherId: '',
  assignedRoomId: '',
  startTime: '',
  endTime: '',
  date: dayjs(todayIso),
  className: '',
  divisionName: '',
  period: '',
  subjectName: '',
  originalTeacherName: '',
  substituteTeacherName: '',
  roomName: '',
  assignedRoomName: '',
  reason: 'Teacher Absent',
  priority: 'Normal',
  remarks: '',
  acknowledgementRequired: true,
  sendNotification: true,
  notificationMethod: 'In-app, Email, SMS',
  autoReminderRule: '10 / 20 / 30 minutes',
  assignmentSource: 'Manual',
  selectedSubstitutes: [],
};

const defaultAvailabilityForm: AvailabilityFormState = {
  teacherId: '',
  teacherName: '',
  departmentName: '',
  availabilityDate: dayjs(todayIso),
  startTime: '09:00',
  endTime: '10:45',
  availabilityStatus: 'Unavailable',
  sourceType: 'Manual',
  reason: '',
  remarks: '',
  isFullDay: false,
  autoCreateSubstitutions: true,
  notifyLeadership: true,
  attachmentName: '',
};

const settingsResultDefaults: ApiSubstitutionSettings = {
  academicYearId: null,
  maxSubstitutionsPerTeacherPerDay: 3,
  maxSubstitutionsPerTeacherPerWeek: 8,
  acknowledgementRequiredByDefault: true,
  autoReminderEnabled: true,
  reminderBeforeMinutes: 15,
  notifyLeadershipForUrgent: true,
  allowTeacherReject: true,
  studentVisibleDailySheet: false,
};

const statusColor: Record<
  SubstitutionStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  Pending: 'warning',
  Assigned: 'info',
  'Waiting Ack': 'warning',
  Acknowledged: 'primary',
  Completed: 'success',
  Rejected: 'error',
  Cancelled: 'default',
  Conflict: 'error',
  Expired: 'default',
};

const acknowledgementColor: Record<
  AcknowledgementStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  'Not Sent': 'default',
  Sent: 'info',
  Seen: 'primary',
  Accepted: 'success',
  Rejected: 'error',
  'Change Requested': 'warning',
  Escalated: 'error',
};

const conflictColor: Record<ConflictStatus, 'default' | 'success' | 'error' | 'warning' | 'info'> =
  {
    Clear: 'success',
    'Hard Block': 'error',
    Warning: 'warning',
    Info: 'info',
  };

const priorityColor: Record<SubstitutionPriority, 'default' | 'primary' | 'error' | 'warning'> = {
  Low: 'default',
  Normal: 'primary',
  High: 'warning',
  Urgent: 'error',
};

const notificationMethods = [
  { value: 'In-app', label: 'In-app' },
  { value: 'In-app, Email', label: 'In-app + Email' },
  { value: 'In-app, Email, SMS', label: 'In-app + Email + SMS' },
  { value: 'In-app, Email, SMS, WhatsApp', label: 'All channels' },
];

const autoReminderOptions = [
  { value: '10 / 20 / 30 minutes', label: '10 / 20 / 30 minutes' },
  { value: '5 / 10 / 15 minutes', label: 'Urgent: 5 / 10 / 15 minutes' },
  { value: 'Manual reminder only', label: 'Manual reminder only' },
];

const sourceCreateOptions = [
  { value: 'Manual', label: 'Manual' },
  { value: 'AI Suggested', label: 'AI Suggested' },
  { value: 'Auto Created', label: 'Auto Created' },
];

const quickFilters = [
  { label: 'Today', status: 'all', source: 'all', conflict: 'all' },
  { label: 'Uncovered', status: 'Pending', source: 'all', conflict: 'all' },
  { label: 'Pending Ack', status: 'Waiting Ack', source: 'all', conflict: 'all' },
  { label: 'Urgent', status: 'all', source: 'all', conflict: 'all', priority: 'Urgent' },
  { label: 'AI Suggested', status: 'all', source: 'AI Suggested', conflict: 'all' },
  { label: 'Conflicts', status: 'all', source: 'all', conflict: 'Hard Block' },
];

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const isOverlap = (startA: string, endA: string, startB: string, endB: string) =>
  toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);

const buildAudit = (action: string, actor = 'System') => ({
  at: dayjs().format('HH:mm'),
  actor,
  action,
});

const uniqueLookupOptions = <T extends ApiLookupOption>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const SubstitutionManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [boardView, setBoardView] = useState<SubstitutionViewType>('table');
  const [filters, setFilters] = useState(DEFAULT_SUBSTITUTION_FILTERS);
  const [substitutions, setSubstitutions] = useState<SubstitutionRow[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState(initialTeacherAvailability);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [substitutionForm, setSubstitutionForm] = useState(defaultSubstitutionForm);
  const [availabilityForm, setAvailabilityForm] = useState(defaultAvailabilityForm);
  const [settingsForm, setSettingsForm] = useState(settingsResultDefaults);
  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionRowId, setActionRowId] = useState('');
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data: substitutionResult } = useSubstitutionsDataQuery({
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: dashboardResult } = useSubstitutionDashboardDataQuery({
    date: toDateTimeOffset(dayjs(todayIso).startOf('day')),
  });
  const { data: myDutiesResult } = useMySubstitutionDutiesDataQuery({
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: availabilityResult } = useTeacherAvailabilityDataQuery({
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: rawCreateMetadata } = useSubstitutionCreateMetadataDataQuery();
  const createMetadata = rawCreateMetadata as ApiSubstitutionCreateMetadata | undefined;
  const { data: rawCreateLectureResult } = useSubstitutionLecturesDataQuery(
    {
      date: toDateTimeOffset(substitutionForm.date?.startOf('day')),
      standardId: substitutionForm.standardId,
      divisionId: substitutionForm.divisionId,
    },
    {
      skip:
        !createDialogOpen ||
        !substitutionForm.date ||
        !substitutionForm.standardId ||
        !substitutionForm.divisionId,
    }
  );
  const createLectureResult = (rawCreateLectureResult ?? []) as ApiSubstitutionLecture[];
  const { data: suggestedTeacherResult } = useSuggestedTeachersDataQuery(selectedSubstitutionId, {
    skip: !selectedSubstitutionId || !assignDialogOpen,
  });
  const selectedCreateLecture = createLectureResult.find(
    (lecture) => lecture.slotSubjectId === substitutionForm.timetableSlotSubjectId
  );
  const { data: createSuggestedTeacherResult } = useSuggestedTeachersByContextDataQuery(
    {
      date: toDateTimeOffset(substitutionForm.date?.startOf('day')),
      originalTeacherId: substitutionForm.originalTeacherId,
      originalTeacherName: substitutionForm.originalTeacherName,
      standardId: substitutionForm.standardId,
      subjectId: substitutionForm.subjectId,
      subjectName: substitutionForm.subjectName,
      startTime: selectedCreateLecture?.startTime || substitutionForm.startTime,
      endTime: selectedCreateLecture?.endTime || substitutionForm.endTime,
    },
    {
      skip:
        !createDialogOpen ||
        !substitutionForm.date ||
        !(selectedCreateLecture || (substitutionForm.startTime && substitutionForm.endTime)) ||
        !substitutionForm.originalTeacherName,
    }
  );
  const { data: affectedLectureResult } = useAffectedLecturesDataQuery(
    {
      teacherId: availabilityForm.teacherId || undefined,
      teacherName: availabilityForm.teacherName || undefined,
      availabilityDate: toDateTimeOffset(availabilityForm.availabilityDate?.startOf('day')),
      startTime: availabilityForm.isFullDay ? '09:00' : availabilityForm.startTime,
      endTime: availabilityForm.isFullDay ? '14:15' : availabilityForm.endTime,
      isFullDay: availabilityForm.isFullDay,
      reason: availabilityForm.reason || 'Preview',
      maxResultCount: 100,
    },
    {
      skip: !availabilityForm.teacherId && !availabilityForm.teacherName,
    }
  );
  const { data: dailySheetResult } = useDailySheetDataQuery({
    date: toDateTimeOffset((filters.filterDate || dayjs(todayIso)).startOf('day')),
    maxResultCount: 500,
  });
  const { data: settingsResult } = useSubstitutionSettingsDataQuery();
  const [createSubstitution] = useCreateSubstitutionAction();
  const [assignSubstitute] = useAssignSubstituteAction();
  const [sendSubstitutionReminder] = useSendSubstitutionReminderAction();
  const [completeSubstitution] = useCompleteSubstitutionAction();
  const [cancelSubstitution] = useCancelSubstitutionAction();
  const [acknowledgeSubstitution] = useAcknowledgeSubstitutionAction();
  const [requestSubstitutionChange] = useRequestSubstitutionChangeAction();
  const [rejectSubstitutionDuty] = useRejectSubstitutionDutyAction();
  const [createTeacherAvailability] = useCreateTeacherAvailabilityAction();
  const [updateSubstitutionSettings, { isLoading: isSettingsSaving }] =
    useUpdateSubstitutionSettingsAction();
  const [downloadDailyPdf] = useDailySheetPdfLazyQuery();
  const [downloadDailyExcel] = useDailySheetExcelLazyQuery();
  const [getAffectedLectures] = useAffectedLecturesLazyQuery();
  const [getEmployeeOptions] = useEmployeeOptionsLazyQuery();
  const seenAvailabilityTeacherIdsRef = useRef<Set<string>>(new Set());

  const fetchAvailabilityTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenAvailabilityTeacherIdsRef.current = new Set();
      const res = await getEmployeeOptions({
        search: query,
        page,
        isTeaching: true,
      }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = (res?.items ?? [])
        .map(
          (item: {
            id: string;
            fullName?: string;
            employeeName?: string;
            department?: string;
            departmentName?: string;
          }) => ({
            id: item.id,
            label: item.fullName || item.employeeName || '',
            departmentName: item.departmentName || item.department || '',
          })
        )
        .filter((item: EmployeeOption) => {
          if (!item.id || !item.label || seenAvailabilityTeacherIdsRef.current.has(item.id)) {
            return false;
          }
          seenAvailabilityTeacherIdsRef.current.add(item.id);
          return true;
        });

      return { data, hasMore };
    },
    [getEmployeeOptions]
  );

  useEffect(() => {
    if (substitutionResult?.items) {
      setSubstitutions(substitutionResult.items.map(mapApiSubstitution));
    }
  }, [substitutionResult]);

  useEffect(() => {
    if (availabilityResult?.items) {
      setTeacherAvailability(availabilityResult.items.map(mapApiTeacherAvailability));
    }
  }, [availabilityResult]);

  useEffect(() => {
    if (settingsResult) {
      setSettingsForm(settingsResult);
    }
  }, [settingsResult]);

  const metadataStandards = createMetadata?.standards ?? [];
  const metadataDivisions = createMetadata?.divisions ?? [];
  const metadataSubjects = createMetadata?.subjects ?? [];
  const metadataTeachers = createMetadata?.teachers ?? [];
  const metadataRooms = createMetadata?.rooms ?? [];
  const academicStandards =
    medium?.educationMediumStages?.flatMap(
      (stage: Organization) => stage?.standards || []
    ) || [];
  const selectedAcademicStandard = academicStandards.find(
    (item) => item.id === substitutionForm.standardId
  );
  const classSelectOptions: SelectOption[] = academicStandards.length
    ? academicStandards.map((item) => ({ value: item.id, label: item.name }))
    : uniqueLookupOptions(metadataStandards).map((item) => ({
        value: item.id,
        label: item.name,
      }));
  const divisionSelectOptions: SelectOption[] =
    selectedAcademicStandard?.divisions?.length
      ? selectedAcademicStandard.divisions.map((item) => ({ value: item.id, label: item.name }))
      : metadataDivisions.length > 0
        ? uniqueLookupOptions(metadataDivisions)
            .filter(
              (item) =>
                !substitutionForm.standardId || item.standardId === substitutionForm.standardId
            )
            .map((item) => ({ value: item.id, label: item.name }))
        : [];
  const subjectSelectOptions: SelectOption[] =
    metadataSubjects.length > 0
      ? metadataSubjects
          .filter(
            (item) =>
              !substitutionForm.standardId || item.standardId === substitutionForm.standardId
          )
          .map((item) => ({ value: item.id, label: item.name }))
      : subjectOptions;
  const teacherSelectOptions: SelectOption[] =
    metadataTeachers.length > 0
      ? metadataTeachers.map((item: ApiLookupOption) => ({ value: item.id, label: item.name }))
      : teacherOptions;
  const roomSelectOptions: SelectOption[] =
    metadataRooms.length > 0
      ? metadataRooms.map((item: ApiLookupOption) => ({ value: item.id, label: item.name }))
      : roomOptions;
  const lectureSelectOptions =
    createLectureResult.length > 0
      ? createLectureResult.map((item) => ({
          value: item.slotSubjectId,
          label: formatLectureLabel(item),
        }))
      : lectureSlotOptions;

  const filteredSubstitutions = useMemo(() => {
    const dateValue = filters.filterDate?.format('YYYY-MM-DD');
    return substitutions.filter((item) => {
      const matchesDate = !dateValue || item.date === dateValue;
      const matchesTeacher =
        filters.teacherFilter === 'all' ||
        item.originalTeacherName === filters.teacherFilter ||
        item.substituteTeacherName === filters.teacherFilter;
      const matchesClass = filters.classFilter === 'all' || item.className === filters.classFilter;
      const matchesDivision =
        filters.divisionFilter === 'all' || item.divisionName === filters.divisionFilter;
      const matchesSubject =
        filters.subjectFilter === 'all' || item.subjectName === filters.subjectFilter;
      const matchesStatus = filters.statusFilter === 'all' || item.status === filters.statusFilter;
      const matchesReason = filters.reasonFilter === 'all' || item.reason === filters.reasonFilter;
      const matchesPeriod = filters.periodFilter === 'all' || item.period === filters.periodFilter;
      const matchesPriority =
        filters.priorityFilter === 'all' || item.priority === filters.priorityFilter;
      const matchesAck =
        filters.ackFilter === 'all' || item.acknowledgementStatus === filters.ackFilter;
      const matchesSource = filters.sourceFilter === 'all' || item.source === filters.sourceFilter;
      const matchesConflict =
        filters.conflictFilter === 'all' || item.conflictStatus === filters.conflictFilter;
      const matchesDepartment =
        filters.departmentFilter === 'all' || item.departmentName === filters.departmentFilter;
      const matchesRoom =
        filters.roomFilter === 'all' ||
        item.roomName === filters.roomFilter ||
        item.assignedRoomName === filters.roomFilter;

      return (
        matchesDate &&
        matchesTeacher &&
        matchesClass &&
        matchesDivision &&
        matchesSubject &&
        matchesStatus &&
        matchesReason &&
        matchesPeriod &&
        matchesPriority &&
        matchesAck &&
        matchesSource &&
        matchesConflict &&
        matchesDepartment &&
        matchesRoom
      );
    });
  }, [filters, substitutions]);

  const todayRows = useMemo(
    () => substitutions.filter((item) => item.date === todayIso),
    [substitutions]
  );

  const myDutyRows = useMemo<SubstitutionRow[]>(
    () => myDutiesResult?.items.map(mapApiSubstitution) ?? [],
    [myDutiesResult]
  );

  const suggestedTeacherRows = useMemo<AvailableTeacherRow[]>(
    () =>
      createDialogOpen
        ? selectedCreateLecture
          ? (createSuggestedTeacherResult?.map(mapApiSuggestedTeacher) ?? [])
          : []
        : (suggestedTeacherResult?.map(mapApiSuggestedTeacher) ?? suggestedTeachers),
    [createDialogOpen, createSuggestedTeacherResult, selectedCreateLecture, suggestedTeacherResult]
  );
  const availableTeacherSelectOptions =
    suggestedTeacherRows.length > 0
      ? suggestedTeacherRows
          .filter((teacher) => teacher.conflictSeverity !== 'Hard Block')
          .map((teacher) => ({
            value: teacher.teacherId,
            label: `${teacher.teacherName} (${getTeacherCoverageLabel(teacher)})`,
          }))
      : [];

  const affectedLectures = useMemo<AffectedLectureRow[]>(() => {
    if (affectedLectureResult?.items) return affectedLectureResult.items.map(mapApiAffectedLecture);
    if (!availabilityForm.teacherName) return affectedLectureTemplates;

    return affectedLectureTemplates.filter((lecture) => {
      const period = periodTimeMap[lecture.period];
      const matchesTeacher = lecture.teacherName === availabilityForm.teacherName;
      const matchesTime =
        availabilityForm.isFullDay ||
        isOverlap(
          availabilityForm.startTime,
          availabilityForm.endTime,
          period.startTime,
          period.endTime
        );
      return matchesTeacher && matchesTime;
    });
  }, [
    availabilityForm.endTime,
    availabilityForm.isFullDay,
    availabilityForm.startTime,
    availabilityForm.teacherName,
    affectedLectureResult,
  ]);

  const metrics = useMemo<MetricCard[]>(() => {
    const pending =
      dashboardResult?.pending ?? todayRows.filter((item) => item.status === 'Pending').length;
    const assigned =
      dashboardResult?.assigned ??
      todayRows.filter((item) =>
        ['Assigned', 'Waiting Ack', 'Acknowledged', 'Completed'].includes(item.status)
      ).length;
    const acknowledged =
      dashboardResult?.acknowledged ??
      todayRows.filter((item) => item.acknowledgementStatus === 'Accepted').length;
    const uncovered =
      dashboardResult?.uncovered ?? todayRows.filter((item) => item.status === 'Pending').length;
    const unavailable =
      dashboardResult?.teacherUnavailable ??
      teacherAvailability.filter((item) => item.availabilityDate === todayIso).length;
    const nextRisk =
      (dashboardResult?.nextRisk ? mapApiSubstitution(dashboardResult.nextRisk) : undefined) ??
      todayRows.find((item) => ['Pending', 'Conflict'].includes(item.status));

    return [
      {
        label: 'Pending Substitutions',
        value: pending,
        helper: pending ? 'Needs assignment before next period' : 'No pending assignment',
        icon: 'mdi:clock-alert-outline',
        color: pending ? 'warning' : 'success',
        progress: pending ? 35 : 100,
        filterStatus: 'Pending',
      },
      {
        label: 'Assigned Today',
        value: assigned,
        helper: `${assigned}/${todayRows.length || 1} duties have a substitute`,
        icon: 'mdi:account-check-outline',
        color: 'info',
        progress: todayRows.length ? Math.round((assigned / todayRows.length) * 100) : 0,
      },
      {
        label: 'Acknowledged',
        value: `${acknowledged}/${todayRows.length}`,
        helper: 'Teachers confirmed duty',
        icon: 'mdi:checkbox-marked-circle-outline',
        color: acknowledged === todayRows.length ? 'success' : 'warning',
        progress: todayRows.length ? Math.round((acknowledged / todayRows.length) * 100) : 0,
        filterStatus: 'Waiting Ack',
      },
      {
        label: 'Teachers Unavailable',
        value: unavailable,
        helper: 'Leave, meeting and calendar sources',
        icon: 'mdi:account-off-outline',
        color: unavailable ? 'error' : 'success',
        progress: unavailable ? 65 : 100,
      },
      {
        label: 'Uncovered Classes',
        value: uncovered,
        helper: uncovered ? 'Coverage action required' : 'All classes covered',
        icon: 'mdi:shield-alert-outline',
        color: uncovered ? 'warning' : 'success',
        progress: uncovered ? 40 : 100,
        filterStatus: 'Pending',
      },
      {
        label: 'Next Risk',
        value: nextRisk?.period || 'None',
        helper: nextRisk
          ? `${nextRisk.className}-${nextRisk.divisionName} ${nextRisk.subjectName}`
          : 'No immediate risk',
        icon: 'mdi:alert-decagram-outline',
        color: nextRisk ? 'warning' : 'success',
        progress: nextRisk ? 55 : 100,
        filterStatus: nextRisk?.status,
      },
    ];
  }, [dashboardResult, teacherAvailability, todayRows]);

  const selectedSubstitution = useMemo(
    () => substitutions.find((item) => item.id === selectedSubstitutionId),
    [selectedSubstitutionId, substitutions]
  );

  const actionRow = useMemo(
    () => substitutions.find((item) => item.id === actionRowId),
    [actionRowId, substitutions]
  );

  const applyQuickFilter = useCallback((filter: (typeof quickFilters)[number]) => {
    setFilters((prev) => ({
      ...prev,
      filterDate: dayjs(todayIso),
      statusFilter: filter.status || 'all',
      sourceFilter: filter.source || 'all',
      conflictFilter: filter.conflict || 'all',
      priorityFilter: filter.priority || 'all',
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_SUBSTITUTION_FILTERS);
  }, []);

  const updateSubstitution = useCallback(
    (id: string, updater: (row: SubstitutionRow) => SubstitutionRow) => {
      setSubstitutions((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    },
    []
  );

  const updateSubstitutionStatus = useCallback(
    async (id: string, status: SubstitutionStatus) => {
      try {
        if (status === 'Completed') {
          const updated = await completeSubstitution(id).unwrap();
          updateSubstitution(id, () => mapApiSubstitution(updated));
        } else if (status === 'Acknowledged') {
          const updated = await acknowledgeSubstitution(id).unwrap();
          updateSubstitution(id, () => mapApiSubstitution(updated));
        } else if (status === 'Cancelled') {
          const updated = await cancelSubstitution({
            id,
            reason: 'Cancelled from board action.',
          }).unwrap();
          updateSubstitution(id, () => mapApiSubstitution(updated));
        } else {
          updateSubstitution(id, (item) => ({
            ...item,
            status,
            acknowledgementStatus: item.acknowledgementStatus,
            acknowledgedAt: item.acknowledgedAt,
            completedAt: item.completedAt,
            auditLog: [buildAudit(`Substitution marked as ${status}.`, 'Admin'), ...item.auditLog],
          }));
        }
        shikshaMitraToast.success({ message: `Substitution marked as ${status}.` });
      } catch (error) {
        const message = error instanceof Error ? error.message : `Unable to mark as ${status}.`;
        shikshaMitraToast.error({ message });
      }
    },
    [acknowledgeSubstitution, cancelSubstitution, completeSubstitution, updateSubstitution]
  );

  const openAssignDialog = useCallback((id: string) => {
    setSelectedSubstitutionId(id);
    setSelectedTeacherId('');
    setAssignRoom('');
    setAssignRemarks('');
    setAssignDialogOpen(true);
  }, []);

  const addSubstituteCoverage = (teacher: AvailableTeacherRow) => {
    if (teacher.conflictSeverity === 'Hard Block') return;

    const startTime = teacher.coverageStartTime || selectedCreateLecture?.startTime || '';
    const endTime = teacher.coverageEndTime || selectedCreateLecture?.endTime || '';
    if (!startTime || !endTime) return;

    setSubstitutionForm((current) => {
      const nextSelection = {
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        startTime,
        endTime,
        score: teacher.score,
        isPartialCoverage: Boolean(teacher.isPartialCoverage),
      };
      const withoutSameTeacher = current.selectedSubstitutes.filter(
        (item) => item.teacherId !== teacher.teacherId
      );

      return {
        ...current,
        selectedSubstitutes: [...withoutSameTeacher, nextSelection].sort((first, second) =>
          first.startTime.localeCompare(second.startTime)
        ),
        substituteTeacherId: teacher.teacherId,
        substituteTeacherName: teacher.teacherName,
        assignmentSource: 'AI Suggested',
      };
    });
  };

  const removeSubstituteCoverage = (teacherId: string) => {
    setSubstitutionForm((current) => {
      const selectedSubstitutes = current.selectedSubstitutes.filter(
        (item) => item.teacherId !== teacherId
      );
      return {
        ...current,
        selectedSubstitutes,
        substituteTeacherId: selectedSubstitutes.at(-1)?.teacherId || '',
        substituteTeacherName: selectedSubstitutes.at(-1)?.teacherName || '',
      };
    });
  };

  const handleCreateSubstitution = useCallback(
    async (assignNow: boolean) => {
      if (
        !substitutionForm.date ||
        !substitutionForm.className ||
        !substitutionForm.divisionName ||
        !substitutionForm.period ||
        !substitutionForm.subjectName ||
        !substitutionForm.originalTeacherName ||
        !substitutionForm.roomName ||
        !substitutionForm.reason
      ) {
        setFormError(
          'Date, class, division, slot, subject, original teacher, room and reason are required.'
        );
        return;
      }

      if (assignNow && substitutionForm.selectedSubstitutes.length === 0) {
        setFormError('Select at least one available substitute teacher before Assign & Notify.');
        return;
      }

      const date = substitutionForm.date.format('YYYY-MM-DD');
      const payloadDate = toDateTimeOffset(substitutionForm.date.startOf('day'));
      const hasActiveSlot = substitutions.some(
        (item) =>
          item.date === date &&
          item.className === substitutionForm.className &&
          item.divisionName === substitutionForm.divisionName &&
          item.period === substitutionForm.period &&
          isOverlap(
            item.startTime,
            item.endTime,
            selectedCreateLecture?.startTime || substitutionForm.startTime,
            selectedCreateLecture?.endTime || substitutionForm.endTime
          ) &&
          !['Cancelled', 'Rejected'].includes(item.status)
      );

      if (hasActiveSlot) {
        setFormError('This slot already has an active substitution assignment.');
        return;
      }

      const selectedTeachers = substitutionForm.selectedSubstitutes
        .map((selection) =>
          suggestedTeacherRows.find((teacher) => teacher.teacherId === selection.teacherId)
        )
        .filter(Boolean) as AvailableTeacherRow[];

      if (assignNow && selectedTeachers.some((teacher) => teacher.hasConflict)) {
        setFormError('One selected teacher has a hard conflict. Remove that teacher first.');
        return;
      }

      try {
        const assignmentSegments = assignNow
          ? substitutionForm.selectedSubstitutes
          : [
              {
                teacherId: '',
                teacherName: '',
                startTime: selectedCreateLecture?.startTime || substitutionForm.startTime,
                endTime: selectedCreateLecture?.endTime || substitutionForm.endTime,
                score: 0,
                isPartialCoverage: false,
              },
            ];
        const createdRows = await Promise.all(
          assignmentSegments.map((segment) =>
            createSubstitution({
              date: payloadDate,
              standardId: substitutionForm.standardId || null,
              className: substitutionForm.className,
              divisionId: substitutionForm.divisionId || null,
              divisionName: substitutionForm.divisionName,
              timetableId: substitutionForm.timetableId || null,
              timetableSlotId: substitutionForm.timetableSlotId || null,
              timetableSlotSubjectId: substitutionForm.timetableSlotSubjectId || null,
              subjectId: substitutionForm.subjectId || null,
              period: substitutionForm.period,
              startTime: segment.startTime || substitutionForm.startTime,
              endTime: segment.endTime || substitutionForm.endTime,
              subjectName: substitutionForm.subjectName,
              originalTeacherId: substitutionForm.originalTeacherId || null,
              originalTeacherName: substitutionForm.originalTeacherName,
              originalRoomId: substitutionForm.originalRoomId || null,
              roomName: substitutionForm.roomName,
              reason: substitutionForm.reason,
              priority: priorityValueMap[substitutionForm.priority],
              source: sourceValueMap[substitutionForm.assignmentSource],
              acknowledgementRequired: substitutionForm.acknowledgementRequired,
              sendNotification: substitutionForm.sendNotification,
              substituteTeacherId: assignNow ? segment.teacherId || null : null,
              substituteTeacherName: assignNow ? segment.teacherName : undefined,
              assignedRoomId:
                substitutionForm.assignedRoomId || substitutionForm.originalRoomId || null,
              assignedRoomName: substitutionForm.assignedRoomName || substitutionForm.roomName,
              remarks:
                segment.isPartialCoverage && assignNow
                  ? `${substitutionForm.remarks || ''} Partial coverage ${segment.startTime}-${segment.endTime}.`.trim()
                  : substitutionForm.remarks,
            }).unwrap()
          )
        );
        setSubstitutions((current) => [...createdRows.map(mapApiSubstitution), ...current]);
        setCreateDialogOpen(false);
        shikshaMitraToast.success({
          message: assignNow
            ? 'Substitution coverage assigned and notification queued.'
            : 'Substitution draft created.',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create substitution.';
        setFormError(message);
      }
    },
    [
      createSubstitution,
      selectedCreateLecture,
      substitutionForm,
      substitutions,
      suggestedTeacherRows,
    ]
  );

  const handleAssignTeacher = useCallback(async () => {
    const selectedTeacher = suggestedTeacherRows.find(
      (teacher) => teacher.teacherId === selectedTeacherId
    );
    if (!selectedTeacher) {
      shikshaMitraToast.error({ message: 'Select an available substitute teacher.' });
      return;
    }

    if (selectedTeacher.hasConflict) {
      shikshaMitraToast.error({
        message: selectedTeacher.conflictReason || 'Teacher has a conflict.',
      });
      return;
    }

    try {
      const updated = await assignSubstitute({
        id: selectedSubstitutionId,
        substituteTeacherName: selectedTeacher.teacherName,
        assignedRoomName: assignRoom,
        remarks: assignRemarks,
        sendNotification: true,
      }).unwrap();
      updateSubstitution(selectedSubstitutionId, () => mapApiSubstitution(updated));
      setAssignDialogOpen(false);
      shikshaMitraToast.success({
        message: 'Substitute teacher assigned and notification queued.',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to assign substitute teacher.';
      shikshaMitraToast.error({ message });
    }
  }, [
    assignRemarks,
    assignRoom,
    assignSubstitute,
    selectedSubstitutionId,
    selectedTeacherId,
    suggestedTeacherRows,
    updateSubstitution,
  ]);

  const openSubstitutionForLecture = (
    lecture: AffectedLectureRow,
    context: {
      availabilityDate: Dayjs;
      teacherId?: string | null;
      teacherName: string;
      reason: string;
      remarks?: string;
      sourceType: string;
      closeAvailabilityDialog?: boolean;
    }
  ) => {
    setFormError('');
    setSubstitutionForm({
      ...defaultSubstitutionForm,
      date: context.availabilityDate,
      standardId: lecture.standardId || '',
      divisionId: lecture.divisionId || '',
      timetableId: lecture.timetableId || '',
      timetableSlotId: lecture.timetableSlotId || '',
      timetableSlotSubjectId: lecture.slotSubjectId || '',
      subjectId: lecture.subjectId || '',
      originalTeacherId: lecture.teacherId || context.teacherId || '',
      originalRoomId: lecture.roomId || '',
      assignedRoomId: lecture.roomId || '',
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      className: lecture.className,
      divisionName: lecture.divisionName,
      period: lecture.period,
      subjectName: lecture.subjectName,
      originalTeacherName: lecture.teacherName || context.teacherName,
      roomName: lecture.roomName,
      assignedRoomName: lecture.roomName,
      reason: context.reason || 'Teacher Unavailable',
      priority: 'High',
      remarks: context.remarks || '',
      acknowledgementRequired: true,
      sendNotification: true,
      notificationMethod: defaultSubstitutionForm.notificationMethod,
      autoReminderRule: defaultSubstitutionForm.autoReminderRule,
      assignmentSource: toAssignmentSourceFromAvailability(context.sourceType),
      substituteTeacherId: '',
      substituteTeacherName: '',
      selectedSubstitutes: [],
    });
    if (context.closeAvailabilityDialog) setAvailabilityDialogOpen(false);
    setCreateDialogOpen(true);
  };

  const openSubstitutionFromAffectedLecture = (lecture: AffectedLectureRow) => {
    if (!availabilityForm.availabilityDate) {
      setAvailabilityError('Select date before creating a substitution.');
      return;
    }

    if (lecture.canCreateSubstitution === false) {
      setAvailabilityError('This lecture already has an active substitution.');
      return;
    }

    openSubstitutionForLecture(lecture, {
      availabilityDate: availabilityForm.availabilityDate,
      teacherId: availabilityForm.teacherId,
      teacherName: availabilityForm.teacherName,
      reason: availabilityForm.reason,
      remarks: availabilityForm.remarks,
      sourceType: availabilityForm.sourceType,
      closeAvailabilityDialog: true,
    });
  };

  const handleCreateSubstitutionFromAvailability = async (row: TeacherAvailabilityRow) => {
    if (row.affectedLectureCount <= 0 || row.canCreateSubstitution === false) {
      shikshaMitraToast.error({
        message: 'Substitution is already created or no affected lecture is available.',
      });
      return;
    }

    try {
      const result = await getAffectedLectures({
        teacherId: row.teacherId || undefined,
        teacherName: row.teacherName,
        availabilityDate: toDateTimeOffset(dayjs(row.availabilityDate).startOf('day')),
        startTime: row.startTime,
        endTime: row.endTime,
        isFullDay: row.isFullDay,
        reason: row.reason || 'Teacher Unavailable',
        maxResultCount: 100,
      }).unwrap();
      const lecture = result.items
        .map(mapApiAffectedLecture)
        .find((item) => item.canCreateSubstitution !== false);

      if (!lecture) {
        shikshaMitraToast.error({
          message: 'Substitution is already created for all affected lectures.',
        });
        setTeacherAvailability((current) =>
          current.map((item) =>
            item.id === row.id ? { ...item, canCreateSubstitution: false } : item
          )
        );
        return;
      }

      openSubstitutionForLecture(lecture, {
        availabilityDate: dayjs(row.availabilityDate),
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        reason: row.reason || 'Teacher Unavailable',
        remarks: row.remarks,
        sourceType: row.sourceType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load affected lectures.';
      shikshaMitraToast.error({ message });
    }
  };

  const handleMarkUnavailable = useCallback(async () => {
    if (
      !availabilityForm.teacherName ||
      !availabilityForm.availabilityDate ||
      !availabilityForm.reason
    ) {
      setAvailabilityError('Teacher, date and reason are required.');
      return;
    }

    const startTime = availabilityForm.isFullDay ? '09:00' : availabilityForm.startTime;
    const endTime = availabilityForm.isFullDay ? '14:15' : availabilityForm.endTime;

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      setAvailabilityError('End time must be greater than start time.');
      return;
    }

    const date = availabilityForm.availabilityDate.format('YYYY-MM-DD');
    const payloadDate = toDateTimeOffset(availabilityForm.availabilityDate.startOf('day'));
    const overlapsExisting = teacherAvailability.some(
      (item) =>
        item.teacherName === availabilityForm.teacherName &&
        item.availabilityDate === date &&
        isOverlap(startTime, endTime, item.startTime, item.endTime)
    );

    if (overlapsExisting) {
      setAvailabilityError('This teacher already has an overlapping unavailable record.');
      return;
    }

    try {
      const created = await createTeacherAvailability({
        teacherId: availabilityForm.teacherId || undefined,
        teacherName: availabilityForm.teacherName,
        departmentName: availabilityForm.departmentName || 'Academic',
        availabilityDate: payloadDate,
        startTime,
        endTime,
        availabilityStatus: availabilityStatusValueMap[availabilityForm.availabilityStatus] ?? 0,
        sourceType: sourceTypeValueMap[availabilityForm.sourceType] ?? 0,
        reason: availabilityForm.reason,
        isFullDay: availabilityForm.isFullDay,
        autoCreateSubstitutions: availabilityForm.autoCreateSubstitutions,
        notifyLeadership: availabilityForm.notifyLeadership,
        attachmentName: availabilityForm.attachmentName,
        remarks: availabilityForm.remarks,
      }).unwrap();
      setTeacherAvailability((current) => [mapApiTeacherAvailability(created), ...current]);
      setAvailabilityDialogOpen(false);
      shikshaMitraToast.success({
        message: `Teacher unavailability saved. ${created.affectedLectureCount} affected lecture(s) detected.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save teacher availability.';
      setAvailabilityError(message);
    }
  }, [availabilityForm, createTeacherAvailability, teacherAvailability]);

  const handleTeacherDutyAction = useCallback(
    async (id: string, action: 'accept' | 'reject' | 'change') => {
      try {
        const updated =
          action === 'accept'
            ? await acknowledgeSubstitution(id).unwrap()
            : action === 'reject'
              ? await rejectSubstitutionDuty({ id, reason: 'Rejected from My Duties.' }).unwrap()
              : await requestSubstitutionChange({
                  id,
                  reason: 'Change requested from My Duties.',
                }).unwrap();
        updateSubstitution(id, () => mapApiSubstitution(updated));
        shikshaMitraToast.success({
          message:
            action === 'accept'
              ? 'Duty accepted.'
              : action === 'reject'
                ? 'Duty rejected and admin alert created.'
                : 'Change request sent to admin.',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update duty.';
        shikshaMitraToast.error({ message });
      }
    },
    [acknowledgeSubstitution, rejectSubstitutionDuty, requestSubstitutionChange, updateSubstitution]
  );

  const handleDownloadDailySheet = async (format: 'pdf' | 'excel') => {
    const params = {
      date: toDateTimeOffset((filters.filterDate || dayjs(todayIso)).startOf('day')),
      maxResultCount: 500,
    };
    try {
      const blob =
        format === 'pdf'
          ? await downloadDailyPdf(params).unwrap()
          : await downloadDailyExcel(params).unwrap();
      downloadBlob(
        blob,
        format === 'pdf' ? 'daily-substitution-sheet.pdf' : 'daily-substitution-sheet.csv'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to download daily sheet.';
      shikshaMitraToast.error({ message });
    }
  };

  const handleSaveSettings = useCallback(async () => {
    try {
      await updateSubstitutionSettings(settingsForm).unwrap();
      shikshaMitraToast.success({ message: 'Substitution settings saved.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save settings.';
      shikshaMitraToast.error({ message });
    }
  }, [settingsForm, updateSubstitutionSettings]);

  const renderStatus = (status: SubstitutionStatus) => (
    <Chip
      label={status === 'Pending' ? 'Pending Assignment' : status}
      size="small"
      color={statusColor[status]}
      variant="outlined"
    />
  );

  const renderAck = (status: AcknowledgementStatus) => (
    <Chip label={status} size="small" color={acknowledgementColor[status]} variant="outlined" />
  );

  const renderConflict = (status: ConflictStatus, reason?: string) => (
    <Tooltip title={reason || status}>
      <Chip label={status} size="small" color={conflictColor[status]} variant="outlined" />
    </Tooltip>
  );

  const openActionMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    setActionAnchor(event.currentTarget);
    setActionRowId(rowId);
  };

  const closeActionMenu = () => {
    setActionAnchor(null);
  };

  const substitutionColumns = [
    {
      id: 'date',
      label: 'Date',
      filterType: 'date' as const,
      minWidth: 120,
      sticky: true,
      render: (value: string) => formatViewDate(value),
    },
    { id: 'period', label: 'Period', filterType: 'string' as const, minWidth: 110 },
    { id: 'time', label: 'Time', filterType: 'string' as const, minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      filterType: 'string' as const,
      minWidth: 120,
      render: (_value: string, row: SubstitutionRow) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', filterType: 'string' as const, minWidth: 130 },
    {
      id: 'originalTeacherName',
      label: 'Original Teacher',
      filterType: 'string' as const,
      minWidth: 170,
    },
    {
      id: 'substituteTeacherName',
      label: 'Substitute Teacher',
      filterType: 'string' as const,
      minWidth: 180,
      render: (value: string) => value || 'Unassigned',
    },
    {
      id: 'assignedRoomName',
      label: 'Room',
      filterType: 'string' as const,
      minWidth: 130,
      render: (value: string, row: SubstitutionRow) => value || row.roomName,
    },
    { id: 'reason', label: 'Reason', filterType: 'string' as const, minWidth: 120 },
    {
      id: 'priority',
      label: 'Priority',
      filterType: 'string' as const,
      minWidth: 110,
      render: (value: SubstitutionPriority) => (
        <Chip label={value} size="small" color={priorityColor[value]} variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'string' as const,
      minWidth: 170,
      render: (value: SubstitutionStatus) => renderStatus(value),
    },
    {
      id: 'acknowledgementStatus',
      label: 'Acknowledgement',
      filterType: 'string' as const,
      minWidth: 170,
      render: (value: AcknowledgementStatus) => renderAck(value),
    },
    { id: 'source', label: 'Source', filterType: 'string' as const, minWidth: 130 },
    {
      id: 'conflictStatus',
      label: 'Conflict',
      filterType: 'string' as const,
      minWidth: 140,
      render: (value: ConflictStatus, row: SubstitutionRow) =>
        renderConflict(value, row.conflictReason),
    },
    {
      id: 'aiScore',
      label: 'AI Score',
      filterType: 'number' as const,
      minWidth: 110,
      render: (value: number) => (value ? `${value}%` : '-'),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 160,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, row: SubstitutionRow) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            size="small"
            variant={row.substituteTeacherName ? 'outlined' : 'contained'}
            disabled={['Completed', 'Cancelled'].includes(row.status)}
            onClick={() => openAssignDialog(row.id)}
          >
            {row.substituteTeacherName ? 'Reassign' : 'Assign'}
          </Button>
          <Tooltip title="More actions">
            <IconButton size="small" onClick={(event) => openActionMenu(event, row.id)}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ] as any[];

  const renderMetricCards = () => (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(6, 1fr)',
      }}
      gap={1}
    >
      {metrics.map((item) => (
        <Card
          key={item.label}
          sx={{
            height: '100%',
            borderRadius: 2,
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            cursor: item.filterStatus ? 'pointer' : 'default',
            transition: 'border-color 0.15s ease',
            '&:hover': item.filterStatus ? { borderColor: `${item.color}.main` } : undefined,
          }}
          onClick={() => {
            if (item.filterStatus) {
              setFilters((prev) => ({ ...prev, statusFilter: item.filterStatus as any }));
              setActiveTab('board');
            }
          }}
        >
          <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  display: 'grid',
                  borderRadius: 1.5,
                  placeItems: 'center',
                  color: `${item.color}.main`,
                  bgcolor: `${item.color}.lighter`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={18} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                  {item.value}
                </Typography>
                <Tooltip title={item.label}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontWeight: 600,
                      lineHeight: 1.25,
                      mt: 0.25,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.75,
                fontSize: 11,
                lineHeight: 1.3,
                minHeight: '2.6em',
              }}
            >
              {item.helper}
            </Typography>
            <LinearProgress
              variant="determinate"
              color={item.color}
              value={item.progress}
              sx={{ mt: 1.25, height: 5, borderRadius: 1 }}
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderSectionHeader = (icon: string, title: string, trailing?: React.ReactNode) => (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ pb: 1.5, mb: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={17} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      {trailing}
    </Stack>
  );

  const renderTimeline = () => (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {renderSectionHeader(
        'mdi:clock-time-four-outline',
        'Today Timeline',
        <Chip size="small" label={`${todayRows.length} periods`} variant="outlined" />
      )}
      <Stack spacing={1}>
        {todayRows.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No periods scheduled for today.
          </Typography>
        )}
        {[...todayRows]
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                borderLeftWidth: 3,
                borderLeftStyle: 'solid',
                borderColor:
                  statusColor[item.status] === 'default'
                    ? 'divider'
                    : `${statusColor[item.status]}.main`,
                bgcolor: 'background.paper',
                boxShadow: (theme) => `0 0 0 1px ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2">
                    {item.time} · {item.period} · {item.className}-{item.divisionName} ·{' '}
                    {item.subjectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.originalTeacherName} → {item.substituteTeacherName || 'Not assigned'}
                    {' · '}
                    Room {item.assignedRoomName || item.roomName}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {renderStatus(item.status)}
                  {renderAck(item.acknowledgementStatus)}
                  <Chip
                    size="small"
                    label={item.priority}
                    color={priorityColor[item.priority]}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Box>
          ))}
      </Stack>
    </Card>
  );

  const renderRiskPanel = () => {
    const riskStats = [
      {
        label: 'Unavailable',
        value: dashboardResult?.teacherUnavailable ?? 0,
        icon: 'mdi:account-off-outline',
      },
      {
        label: 'Uncovered',
        value: dashboardResult?.uncovered ?? 0,
        icon: 'mdi:shield-alert-outline',
      },
      {
        label: 'Pending Ack',
        value: dashboardResult?.waitingAck ?? 0,
        icon: 'mdi:clock-alert-outline',
      },
    ];
    const riskMessages: string[] = dashboardResult?.riskAlerts?.length
      ? dashboardResult.riskAlerts
      : ['No active substitution risks for the selected day.'];

    return (
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2,
          boxShadow: 'none',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          height: '100%',
        }}
      >
        {renderSectionHeader('mdi:radar', 'AI Risk Panel')}
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 2 }}>
          {riskStats.map((stat) => (
            <Stack key={stat.label} spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <Iconify icon={stat.icon} width={18} sx={{ opacity: 0.6 }} />
              <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack spacing={1}>
          {riskMessages.map((message, index) => {
            const isClear = message.startsWith('No active');
            return (
              <Stack
                key={`${message}-${index}`}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Iconify
                    icon={isClear ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'}
                    width={18}
                    color={isClear ? 'success.main' : 'warning.main'}
                  />
                  <Typography variant="body2" noWrap={false}>
                    {message}
                  </Typography>
                </Stack>
                {!isClear && (
                  <Button size="small" sx={{ flexShrink: 0 }}>
                    Review
                  </Button>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Card>
    );
  };

  const renderWorkloadSnapshot = () => (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {renderSectionHeader('mdi:account-group-outline', 'Teacher Load Snapshot')}
      <Stack spacing={1}>
        {(
          dashboardResult?.workloadSnapshot?.map((teacher: ApiSuggestedTeacher) =>
            mapApiSuggestedTeacher(teacher)
          ) ?? suggestedTeacherRows
        )
          .slice(0, 3)
          .map((teacher: AvailableTeacherRow) => (
            <Box key={teacher.teacherId}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">{teacher.teacherName}</Typography>
                <Chip
                  size="small"
                  label={teacher.loadStatus}
                  color={
                    teacher.loadStatus === 'Low'
                      ? 'success'
                      : teacher.loadStatus === 'Medium'
                        ? 'warning'
                        : 'error'
                  }
                  variant="outlined"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {teacher.todayTeachingLoad} lectures · {teacher.todaySubstitutionCount}{' '}
                substitutions · {teacher.freePeriods} free periods
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, teacher.todayTeachingLoad * 14)}
                sx={{ mt: 0.75, height: 5, borderRadius: 1 }}
              />
            </Box>
          ))}
      </Stack>
    </Card>
  );

  const renderKanban = () => {
    const columns: { key: SubstitutionStatus; label: string }[] = [
      { key: 'Pending', label: 'Uncovered' },
      { key: 'Waiting Ack', label: 'Waiting Ack' },
      { key: 'Acknowledged', label: 'Acknowledged' },
      { key: 'Completed', label: 'Completed' },
      { key: 'Rejected', label: 'Rejected' },
    ];

    return (
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="stretch">
        {columns.map((column) => {
          const rows = filteredSubstitutions.filter((item) => item.status === column.key);
          return (
            <Card key={column.key} sx={{ p: 1.5, borderRadius: 1, flex: 1, minWidth: 220 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1">{column.label}</Typography>
                <Chip size="small" label={rows.length} variant="outlined" />
              </Stack>
              <Stack spacing={1}>
                {rows.length === 0 && (
                  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">No duties here</Typography>
                  </Box>
                )}
                {rows.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {item.period} | {item.className}-{item.divisionName} | {item.subjectName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Original: {item.originalTeacherName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Substitute: {item.substituteTeacherName || 'Not Assigned'}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={item.priority}
                        color={priorityColor[item.priority]}
                        variant="outlined"
                      />
                      {renderConflict(item.conflictStatus, item.conflictReason)}
                    </Stack>
                    <Button
                      size="small"
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={() => openAssignDialog(item.id)}
                    >
                      {item.substituteTeacherName ? 'Reassign' : 'Assign Teacher'}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Card>
          );
        })}
      </Stack>
    );
  };

  const renderCalendarView = () => (
    <Card sx={{ p: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Calendar View
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
        {lectureSlotOptions.map((slot) => {
          const rows = filteredSubstitutions.filter((item) => item.period === slot.value);
          return (
            <Box
              key={slot.value}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                flex: '1 1 180px',
              }}
            >
              <Typography variant="subtitle2">{slot.label}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {rows.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No substitution
                  </Typography>
                ) : (
                  rows.map((row) => (
                    <Chip
                      key={row.id}
                      label={`${row.className}-${row.divisionName} ${row.subjectName}`}
                      size="small"
                      color={statusColor[row.status]}
                      variant="outlined"
                    />
                  ))
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );

  const renderBoardContent = () => {
    if (boardView === 'kanban') return renderKanban();
    if (boardView === 'timeline') return renderTimeline();
    if (boardView === 'calendar') return renderCalendarView();

    return (
      <CustomizableTable
        tableId="substitution-board-table"
        tableTitle="Substitution Board"
        data={filteredSubstitutions}
        columns={substitutionColumns}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Substitution Management"
        description="Manage teacher unavailability, substitution duties and daily coverage."
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Timetable' },
          { name: 'Substitution Management' },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PersonOff />}
              onClick={() => {
                setAvailabilityError('');
                setAvailabilityForm(defaultAvailabilityForm);
                setAvailabilityDialogOpen(true);
              }}
            >
              Mark Unavailable
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setFormError('');
                setSubstitutionForm(defaultSubstitutionForm);
                setCreateDialogOpen(true);
              }}
            >
              Create Substitution
            </Button>
          </Stack>
        }
      />

      {renderMetricCards()}

      {/* ── Tabs & Filters ──────────────────────────────── */}
      <Card sx={{ borderRadius: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab value="overview" label="Overview" icon={<AssignmentInd />} iconPosition="start" />
            <Tab
              value="board"
              label="Substitution Board"
              icon={<Iconify icon="mdi:view-dashboard-outline" />}
              iconPosition="start"
            />
            <Tab
              value="availability"
              label="Teacher Availability"
              icon={<PersonOff />}
              iconPosition="start"
            />
            <Tab value="dailySheet" label="Daily Sheet" icon={<Print />} iconPosition="start" />
            <Tab value="myDuties" label="My Duties" icon={<FactCheck />} iconPosition="start" />
            <Tab
              value="analytics"
              label="Settings"
              icon={<Iconify icon="mdi:cog-outline" />}
              iconPosition="start"
            />
          </Tabs>

          {/* Filters Button aligned on the right side of the Tabs row (only where filtering applies) */}
          {activeTab === 'board' && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
              <FiltersBar
                filters={filters}
                onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
                onReset={clearFilters}
              />
            </Stack>
          )}
        </Stack>

        {/* Active Chips Row (under the borderBottom divider, inside the Card) */}
        {activeTab === 'board' && getActiveFilters(filters).length > 0 && (
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'background.neutral' }}>
            <SubstitutionActiveFilters
              filters={filters}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onReset={clearFilters}
            />
          </Box>
        )}
      </Card>

      {activeTab === 'overview' && (
        <Stack spacing={1}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="stretch">
            <Box sx={{ flex: 1.4 }}>{renderTimeline()}</Box>
            <Box sx={{ flex: 1 }}>{renderRiskPanel()}</Box>
          </Stack>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="stretch">
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                flex: 1,
              }}
            >
              {(() => {
                const pendingAckRows = todayRows.filter((item) =>
                  ['Sent', 'Seen', 'Escalated'].includes(item.acknowledgementStatus)
                );
                return (
                  <>
                    {renderSectionHeader(
                      'mdi:clipboard-clock-outline',
                      'Pending Acknowledgement',
                      <Chip size="small" label={pendingAckRows.length} variant="outlined" />
                    )}
                    <Stack spacing={1}>
                      {pendingAckRows.length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: 'center', py: 3 }}
                        >
                          Everything has been acknowledged.
                        </Typography>
                      )}
                      {pendingAckRows.map((item) => (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                          >
                            <Iconify
                              icon={
                                item.acknowledgementStatus === 'Escalated'
                                  ? 'mdi:alert-circle-outline'
                                  : 'mdi:clock-alert-outline'
                              }
                              width={18}
                              color={
                                item.acknowledgementStatus === 'Escalated'
                                  ? 'error.main'
                                  : 'warning.main'
                              }
                            />
                            <Typography variant="body2" noWrap>
                              {item.substituteTeacherName || 'Teacher'} · {item.period} ·{' '}
                              {item.className}-{item.divisionName}
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            sx={{ flexShrink: 0 }}
                            onClick={() => updateSubstitutionStatus(item.id, 'Acknowledged')}
                          >
                            Mark Accepted
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                );
              })()}
            </Card>
            <Box sx={{ flex: 1 }}>{renderWorkloadSnapshot()}</Box>
          </Stack>
        </Stack>
      )}

      {activeTab === 'board' && (
        <Stack spacing={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="h6">Substitution Board</Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={boardView}
              onChange={(_, value) => {
                if (value) setBoardView(value);
              }}
            >
              <ToggleButton value="table">Table</ToggleButton>
              <ToggleButton value="kanban">Kanban</ToggleButton>
              <ToggleButton value="timeline">Timeline</ToggleButton>
              <ToggleButton value="calendar">Calendar</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          {renderBoardContent()}
        </Stack>
      )}

      {activeTab === 'availability' && (
        <CustomizableTable
          tableId="teacher-availability-table"
          tableTitle="Teacher Availability"
          data={teacherAvailability}
          columns={[
            {
              id: 'teacherName',
              label: 'Teacher',
              filterType: 'string',
              minWidth: 170,
              sticky: true,
            },
            { id: 'departmentName', label: 'Department', filterType: 'string', minWidth: 140 },
            {
              id: 'availabilityDate',
              label: 'Date',
              filterType: 'date',
              minWidth: 120,
              render: (value: string) => formatViewDate(value),
            },
            { id: 'startTime', label: 'Start', filterType: 'string', minWidth: 90 },
            { id: 'endTime', label: 'End', filterType: 'string', minWidth: 90 },
            {
              id: 'availabilityStatus',
              label: 'Status',
              filterType: 'string',
              minWidth: 130,
            },
            { id: 'sourceType', label: 'Source', filterType: 'string', minWidth: 130 },
            { id: 'reason', label: 'Reason', filterType: 'string', minWidth: 220 },
            {
              id: 'affectedLectureCount',
              label: 'Affected Lectures',
              filterType: 'number',
              minWidth: 150,
            },
            {
              id: 'autoCreateSubstitutions',
              label: 'Auto Create',
              filterType: 'string',
              minWidth: 130,
              render: (value: boolean) => (value ? 'Yes' : 'No'),
            },
            {
              id: 'attachmentName',
              label: 'Attachment',
              filterType: 'string',
              minWidth: 150,
              render: (value: string) => value || '-',
            },
            {
              id: 'remarks',
              label: 'Remarks',
              filterType: 'string',
              minWidth: 180,
              render: (value: string) => value || '-',
            },
            {
              id: 'actions',
              label: 'Action',
              minWidth: 180,
              isFilter: false,
              sticky: true,
              stickyPosition: 'right',
              render: (_value, row) => {
                const availability = row as TeacherAvailabilityRow;
                const isDisabled =
                  availability.affectedLectureCount <= 0 ||
                  availability.canCreateSubstitution === false;

                return (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isDisabled}
                    onClick={() => handleCreateSubstitutionFromAvailability(availability)}
                  >
                    {isDisabled ? 'Already created' : 'Create substitution'}
                  </Button>
                );
              },
            },
          ]}
        />
      )}

      {activeTab === 'dailySheet' && (
        <Card sx={{ p: 2, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">Daily Substitution Sheet</Typography>
              <Typography variant="body2" color="text.secondary">
                Class-wise, teacher-wise, period-wise and room-wise printable coverage sheet.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Print />}
                onClick={() =>
                  shikshaMitraToast.info({ message: 'Daily substitution sheet is ready to print.' })
                }
              >
                Print Sheet
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-pdf-box" />}
                onClick={() => handleDownloadDailySheet('pdf')}
              >
                Download PDF
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:microsoft-excel" />}
                onClick={() => handleDownloadDailySheet('excel')}
              >
                Export Excel
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:whatsapp" />}
                onClick={() => shikshaMitraToast.info({ message: 'Staff group share queued.' })}
              >
                Staff Group
              </Button>
            </Stack>
          </Stack>
          <CustomizableTable
            tableId="daily-substitution-sheet-table"
            tableTitle="Daily Substitution Sheet"
            data={dailySheetResult?.items.map(mapApiSubstitution) ?? filteredSubstitutions}
            columns={[
              ...substitutionColumns.filter((column) => column.id !== 'actions'),
              {
                id: 'signature',
                label: 'Signature',
                minWidth: 150,
                isSort: false,
                isFilter: false,
                render: () => '____________',
              },
            ]}
          />
        </Card>
      )}

      {activeTab === 'myDuties' && (
        <Stack spacing={1}>
          {(() => {
            const terminalStatuses: SubstitutionStatus[] = ['Completed', 'Cancelled', 'Rejected'];
            const needsActionCount = myDutyRows.filter(
              (item) =>
                !terminalStatuses.includes(item.status) && item.acknowledgementStatus !== 'Accepted'
            ).length;
            const acceptedCount = myDutyRows.filter(
              (item) => item.acknowledgementStatus === 'Accepted' && item.status !== 'Completed'
            ).length;
            const completedCount = myDutyRows.filter((item) => item.status === 'Completed').length;
            const dutyStats = [
              {
                label: 'Total Duties',
                value: myDutyRows.length,
                icon: 'mdi:clipboard-list-outline',
              },
              { label: 'Needs Action', value: needsActionCount, icon: 'mdi:clock-alert-outline' },
              { label: 'Accepted', value: acceptedCount, icon: 'mdi:check-circle-outline' },
              { label: 'Completed', value: completedCount, icon: 'mdi:check-decagram-outline' },
            ];

            return (
              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
                gap={1}
              >
                {dutyStats.map((stat) => (
                  <Card
                    key={stat.label}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={stat.icon} width={18} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Box>
            );
          })()}

          {myDutyRows.length === 0 && (
            <Card
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                textAlign: 'center',
              }}
            >
              <Iconify
                icon="mdi:clipboard-check-outline"
                width={32}
                color="text.disabled"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No substitution duties are assigned to you.
              </Typography>
            </Card>
          )}

          {myDutyRows.map((item) => {
            const isTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(item.status);
            const isAccepted = item.acknowledgementStatus === 'Accepted';

            return (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor:
                    statusColor[item.status] === 'default'
                      ? 'divider'
                      : `${statusColor[item.status]}.main`,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ md: 'flex-start' }}
                    spacing={1}
                  >
                    <Box>
                      {(() => {
                        const dutyDate = dayjs(item.date);
                        const isToday = item.date === todayIso;
                        const isTomorrow = dutyDate.isSame(dayjs(todayIso).add(1, 'day'), 'day');
                        const dateLabel = isToday
                          ? 'Today'
                          : isTomorrow
                            ? 'Tomorrow'
                            : dutyDate.format('ddd, DD MMM YYYY');
                        return (
                          <Chip
                            size="small"
                            icon={<Iconify icon="mdi:calendar-blank-outline" width={14} />}
                            label={
                              isToday || isTomorrow
                                ? `${dateLabel} · ${dutyDate.format('DD MMM')}`
                                : dateLabel
                            }
                            color={isToday ? 'primary' : 'default'}
                            variant={isToday ? 'filled' : 'outlined'}
                            sx={{ mb: 0.75 }}
                          />
                        );
                      })()}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.period} · Class {item.className}-{item.divisionName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {item.subjectName} · {item.time} · Room{' '}
                        {item.assignedRoomName || item.roomName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Iconify icon="mdi:account-outline" width={15} color="text.disabled" />
                        <Typography variant="caption" color="text.secondary">
                          Covering for {item.originalTeacherName}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {renderStatus(item.status)}
                      {renderAck(item.acknowledgementStatus)}
                    </Stack>
                  </Stack>
                </Box>

                {isTerminal ? (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon={
                          item.status === 'Completed'
                            ? 'mdi:check-circle-outline'
                            : 'mdi:information-outline'
                        }
                        width={16}
                        color="text.disabled"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.status === 'Completed'
                          ? 'Duty completed - no further action needed.'
                          : `Duty ${item.status.toLowerCase()} - no further action needed.`}
                      </Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      disabled={isAccepted}
                      startIcon={<Iconify icon="mdi:check" width={16} />}
                      onClick={() => handleTeacherDutyAction(item.id, 'accept')}
                    >
                      {isAccepted ? 'Accepted' : 'Accept Duty'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
                      onClick={() => handleTeacherDutyAction(item.id, 'change')}
                    >
                      Request Change
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Iconify icon="mdi:close" width={16} />}
                      onClick={() => handleTeacherDutyAction(item.id, 'reject')}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {activeTab === 'analytics' && (
        <Stack spacing={1}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6">Substitution Rules</Typography>
              <Typography variant="body2" color="text.secondary">
                Set limits and default behaviour applied whenever a substitution duty is created or
                assigned.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={isSettingsSaving}
              startIcon={<Iconify icon="mdi:content-save-check-outline" width={18} />}
              sx={{ borderRadius: 2, px: 3, alignSelf: { xs: 'stretch', sm: 'center' } }}
            >
              {isSettingsSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </Stack>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
            gap={1}
            alignItems="stretch"
          >
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:scale-balance" width={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Workload Limits
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Keep duties fairly spread across teachers
                  </Typography>
                </Box>
              </Stack>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    type="number"
                    label="Max duties per teacher / day"
                    helperText="Stops a teacher being assigned more than this many duties in one day"
                    value={settingsForm.maxSubstitutionsPerTeacherPerDay}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        maxSubstitutionsPerTeacherPerDay: Number(event.target.value),
                      }))
                    }
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Max duties per teacher / week"
                    helperText="Weekly cap used when suggesting or auto-assigning substitutes"
                    value={settingsForm.maxSubstitutionsPerTeacherPerWeek}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        maxSubstitutionsPerTeacherPerWeek: Number(event.target.value),
                      }))
                    }
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:bell-check-outline" width={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Acknowledgement & Reminders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confirm duties reach the right teacher on time
                  </Typography>
                </Box>
              </Stack>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Acknowledgement required by default
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Substitute teacher must confirm the duty
                      </Typography>
                    </Box>
                    <Switch
                      checked={settingsForm.acknowledgementRequiredByDefault}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          acknowledgementRequiredByDefault: event.target.checked,
                        }))
                      }
                    />
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Send automatic reminder
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nudges the substitute teacher before the period starts
                      </Typography>
                    </Box>
                    <Switch
                      checked={settingsForm.autoReminderEnabled}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          autoReminderEnabled: event.target.checked,
                        }))
                      }
                    />
                  </Stack>
                  <TextField
                    size="small"
                    type="number"
                    label="Minutes before period"
                    disabled={!settingsForm.autoReminderEnabled}
                    value={settingsForm.reminderBeforeMinutes}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        reminderBeforeMinutes: Number(event.target.value),
                      }))
                    }
                    fullWidth
                    inputProps={{ min: 0, max: 240 }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:account-alert-outline" width={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Escalation & Teacher Response
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Decide how urgent gaps and pushback are handled
                  </Typography>
                </Box>
              </Stack>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Notify leadership for urgent duties
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Alerts admins/principal when a high priority duty stays unassigned
                      </Typography>
                    </Box>
                    <Switch
                      checked={settingsForm.notifyLeadershipForUrgent}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          notifyLeadershipForUrgent: event.target.checked,
                        }))
                      }
                    />
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Allow teachers to reject / request change
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Substitutes can reject a duty or ask for a change from My Duties
                      </Typography>
                    </Box>
                    <Switch
                      checked={settingsForm.allowTeacherReject}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          allowTeacherReject: event.target.checked,
                        }))
                      }
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}

      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={closeActionMenu}>
        <MenuItem
          onClick={() => {
            if (actionRow) {
              setSelectedSubstitutionId(actionRow.id);
              setAuditDialogOpen(true);
            }
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:history" />
          </ListItemIcon>
          <ListItemText>View audit log</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!actionRow || !['Waiting Ack', 'Assigned'].includes(actionRow.status)}
          onClick={() => {
            if (actionRow) updateSubstitutionStatus(actionRow.id, 'Acknowledged');
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon={GlobalIcons.tick} />
          </ListItemIcon>
          <ListItemText>Mark acknowledged</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={
            !actionRow || !['Assigned', 'Waiting Ack', 'Acknowledged'].includes(actionRow.status)
          }
          onClick={() => {
            if (actionRow) updateSubstitutionStatus(actionRow.id, 'Completed');
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:check-decagram-outline" />
          </ListItemIcon>
          <ListItemText>Mark completed</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!actionRow || ['Completed', 'Cancelled'].includes(actionRow.status)}
          onClick={async () => {
            if (actionRow) {
              try {
                const updated = await sendSubstitutionReminder(actionRow.id).unwrap();
                updateSubstitution(actionRow.id, () => mapApiSubstitution(updated));
                shikshaMitraToast.info({ message: 'Reminder sent to substitute teacher.' });
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to send reminder.';
                shikshaMitraToast.error({ message });
              }
            }
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:bell-ring-outline" />
          </ListItemIcon>
          <ListItemText>Send reminder</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!actionRow || ['Completed', 'Cancelled'].includes(actionRow.status)}
          onClick={() => {
            if (actionRow) updateSubstitutionStatus(actionRow.id, 'Cancelled');
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon={GlobalIcons.cancel} />
          </ListItemIcon>
          <ListItemText>Cancel substitution</ListItemText>
        </MenuItem>
      </Menu>

      <CustomDialog
        open={createDialogOpen}
        title="Create Substitution"
        maxWidth="md"
        handleClose={() => setCreateDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Alert severity="info" icon={<AutoAwesome />}>
              Select the affected lecture, review auto-filled details, choose a substitute teacher,
              then save draft or assign and notify.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <DatePicker
                label="Date"
                value={substitutionForm.date}
                format={viewDateFormat}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    date: value,
                    timetableId: '',
                    timetableSlotId: '',
                    timetableSlotSubjectId: '',
                    period: '',
                    startTime: '',
                    endTime: '',
                    subjectId: '',
                    subjectName: '',
                    originalTeacherId: '',
                    originalTeacherName: '',
                    originalRoomId: '',
                    roomName: '',
                    substituteTeacherId: '',
                    substituteTeacherName: '',
                    selectedSubstitutes: [],
                  }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <CustomSelect
                label="Class"
                options={classSelectOptions}
                value={substitutionForm.standardId || substitutionForm.className}
                onChange={(value) => {
                  const selected =
                    academicStandards.find((item) => item.id === value) ||
                    createMetadata?.standards.find((item) => item.id === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    standardId: selected?.id || '',
                    className: selected?.name || (value as string),
                    divisionId: '',
                    divisionName: '',
                    timetableId: '',
                    timetableSlotId: '',
                    timetableSlotSubjectId: '',
                    period: '',
                    startTime: '',
                    endTime: '',
                    subjectId: '',
                    subjectName: '',
                    originalTeacherId: '',
                    originalTeacherName: '',
                    originalRoomId: '',
                    roomName: '',
                    substituteTeacherId: '',
                    substituteTeacherName: '',
                    selectedSubstitutes: [],
                  }));
                }}
              />
              <CustomSelect
                label="Division"
                options={divisionSelectOptions}
                value={substitutionForm.divisionId || substitutionForm.divisionName}
                onChange={(value) => {
                  const selected =
                    selectedAcademicStandard?.divisions?.find((item) => item.id === value) ||
                    createMetadata?.divisions.find((item) => item.id === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    divisionId: selected?.id || '',
                    divisionName: selected?.name || (value as string),
                    timetableId: '',
                    timetableSlotId: '',
                    timetableSlotSubjectId: '',
                    period: '',
                    startTime: '',
                    endTime: '',
                    subjectId: '',
                    subjectName: '',
                    originalTeacherId: '',
                    originalTeacherName: '',
                    originalRoomId: '',
                    roomName: '',
                    substituteTeacherId: '',
                    substituteTeacherName: '',
                    selectedSubstitutes: [],
                  }));
                }}
                disabled={!substitutionForm.standardId}
                noOptionsMessage={
                  substitutionForm.standardId ? 'No divisions found' : 'Select class first'
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Lecture Slot"
                options={lectureSelectOptions}
                value={substitutionForm.timetableSlotSubjectId || substitutionForm.period}
                disabled={
                  !substitutionForm.date ||
                  !substitutionForm.standardId ||
                  !substitutionForm.divisionId
                }
                noOptionsMessage="No lecture slots found for the selected date, class and division"
                onChange={(value) => {
                  const lecture = createLectureResult.find((item) => item.slotSubjectId === value);
                  const template = affectedLectureTemplates.find((item) => item.period === value);
                  const assignedSubject = createMetadata?.subjects.find(
                    (item) =>
                      item.id === lecture?.subjectId &&
                      item.standardId === (lecture?.standardId || substitutionForm.standardId)
                  );
                  setSubstitutionForm((current) => ({
                    ...current,
                    timetableId: lecture?.timetableId || current.timetableId,
                    timetableSlotId: lecture?.timetableSlotId || current.timetableSlotId,
                    timetableSlotSubjectId: lecture?.slotSubjectId || '',
                    period: lecture?.period || (value as string),
                    startTime: lecture?.startTime || current.startTime,
                    endTime: lecture?.endTime || current.endTime,
                    subjectId: lecture?.subjectId || current.subjectId,
                    subjectName:
                      lecture?.subjectName || template?.subjectName || current.subjectName,
                    originalTeacherId:
                      lecture?.originalTeacherId ||
                      assignedSubject?.primaryTeacherId ||
                      current.originalTeacherId,
                    originalTeacherName:
                      lecture?.originalTeacherName ||
                      assignedSubject?.primaryTeacherName ||
                      template?.teacherName ||
                      current.originalTeacherName,
                    originalRoomId: lecture?.originalRoomId || current.originalRoomId,
                    roomName: lecture?.roomName || template?.roomName || current.roomName,
                    assignedRoomId: lecture?.originalRoomId || current.assignedRoomId,
                    assignedRoomName: lecture?.roomName || current.assignedRoomName,
                    substituteTeacherId: '',
                    substituteTeacherName: '',
                    selectedSubstitutes: [],
                    standardId: lecture?.standardId || current.standardId,
                    className: lecture?.className || template?.className || current.className,
                    divisionId: lecture?.divisionId || current.divisionId,
                    divisionName:
                      lecture?.divisionName || template?.divisionName || current.divisionName,
                  }));
                }}
              />
              <CustomSelect
                label="Subject"
                options={subjectSelectOptions}
                value={substitutionForm.subjectId || substitutionForm.subjectName}
                disabled={!substitutionForm.timetableSlotSubjectId}
                onChange={(value) => {
                  const selected = createMetadata?.subjects.find(
                    (item) =>
                      item.id === value &&
                      (!substitutionForm.standardId ||
                        item.standardId === substitutionForm.standardId)
                  );
                  setSubstitutionForm((current) => ({
                    ...current,
                    subjectId: selected?.id || '',
                    subjectName: selected?.name || (value as string),
                    originalTeacherId: selected?.primaryTeacherId || current.originalTeacherId,
                    originalTeacherName:
                      selected?.primaryTeacherName || current.originalTeacherName,
                    substituteTeacherId: '',
                    substituteTeacherName: '',
                    selectedSubstitutes: [],
                  }));
                }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Original Teacher"
                options={teacherSelectOptions}
                value={substitutionForm.originalTeacherId || substitutionForm.originalTeacherName}
                disabled={!substitutionForm.timetableSlotSubjectId}
                onChange={(value) => {
                  const selected = createMetadata?.teachers.find((item) => item.id === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    originalTeacherId: selected?.id || '',
                    originalTeacherName: selected?.name || (value as string),
                  }));
                }}
              />
              <CustomSelect
                label="Original Room"
                options={roomSelectOptions}
                value={substitutionForm.originalRoomId || substitutionForm.roomName}
                disabled={!substitutionForm.timetableSlotSubjectId}
                onChange={(value) => {
                  const selected = createMetadata?.rooms.find((item) => item.id === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    originalRoomId: selected?.id || '',
                    roomName: selected?.name || (value as string),
                  }));
                }}
              />
            </Stack>
            <Card sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Available Substitute Employees
              </Typography>
              <Stack spacing={1}>
                {!selectedCreateLecture && (
                  <Alert severity="info">
                    Select date, class, division and lecture slot to load free employees.
                  </Alert>
                )}
                {selectedCreateLecture && suggestedTeacherRows.length === 0 && (
                  <Alert severity="warning">
                    No employee is free for the selected slot. Try split coverage or review
                    timetable conflicts.
                  </Alert>
                )}
                {suggestedTeacherRows.map((teacher, index) => {
                  const isSelected = substitutionForm.selectedSubstitutes.some(
                    (item) => item.teacherId === teacher.teacherId
                  );
                  return (
                    <Box
                      key={teacher.teacherId}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle2">
                              #{index + 1} {teacher.teacherName} - {teacher.score}%
                            </Typography>
                            <Chip
                              size="small"
                              color={teacher.isPartialCoverage ? 'warning' : 'success'}
                              label={
                                teacher.isPartialCoverage
                                  ? `Partial ${getTeacherCoverageLabel(teacher)}`
                                  : `Free ${getTeacherCoverageLabel(teacher)}`
                              }
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            color={teacher.hasConflict ? 'error.main' : 'text.secondary'}
                          >
                            {teacher.hasConflict
                              ? teacher.conflictReason
                              : teacher.recommendationReason}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={isSelected ? 'contained' : 'outlined'}
                          disabled={teacher.conflictSeverity === 'Hard Block'}
                          onClick={() => addSubstituteCoverage(teacher)}
                        >
                          {isSelected ? 'Added' : 'Add'}
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
                {substitutionForm.selectedSubstitutes.length > 0 && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Selected coverage
                    </Typography>
                    {substitutionForm.selectedSubstitutes.map((selection) => (
                      <Stack
                        key={selection.teacherId}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="body2">
                          {selection.teacherName} | {selection.startTime}-{selection.endTime}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeSubstituteCoverage(selection.teacherId)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Substitute Teacher"
                options={availableTeacherSelectOptions}
                value={
                  substitutionForm.substituteTeacherId || substitutionForm.substituteTeacherName
                }
                disabled={!selectedCreateLecture}
                noOptionsMessage="No free employees found for this slot"
                onChange={(value) => {
                  const selected = suggestedTeacherRows.find((item) => item.teacherId === value);
                  if (selected) addSubstituteCoverage(selected);
                }}
              />
              <CustomSelect
                label="Assigned Room"
                options={[{ value: '', label: 'Keep original room' }, ...roomSelectOptions]}
                value={substitutionForm.assignedRoomId || ''}
                onChange={(value) => {
                  const selected = createMetadata?.rooms.find((item) => item.id === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    assignedRoomId: selected?.id || '',
                    assignedRoomName: selected?.name || '',
                  }));
                }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Reason"
                options={reasonOptions}
                value={substitutionForm.reason}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, reason: value as string }))
                }
              />
              <CustomSelect
                label="Priority"
                options={priorityOptions}
                value={substitutionForm.priority}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    priority: value as SubstitutionPriority,
                  }))
                }
              />
              <CustomSelect
                label="Assignment Source"
                options={sourceCreateOptions}
                value={substitutionForm.assignmentSource}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    assignmentSource: value as SubstitutionRow['source'],
                  }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Notification Method"
                options={notificationMethods}
                value={substitutionForm.notificationMethod}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    notificationMethod: value as string,
                  }))
                }
              />
              <CustomSelect
                label="Auto Reminder"
                options={autoReminderOptions}
                value={substitutionForm.autoReminderRule}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    autoReminderRule: value as string,
                  }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={substitutionForm.acknowledgementRequired}
                    onChange={(event) =>
                      setSubstitutionForm((current) => ({
                        ...current,
                        acknowledgementRequired: event.target.checked,
                      }))
                    }
                  />
                }
                label="Acknowledgement required"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={substitutionForm.sendNotification}
                    onChange={(event) =>
                      setSubstitutionForm((current) => ({
                        ...current,
                        sendNotification: event.target.checked,
                      }))
                    }
                  />
                }
                label="Send notification"
              />
            </Stack>
            <Alert severity="success">
              {substitutionForm.selectedSubstitutes.length > 0
                ? `You are assigning ${substitutionForm.selectedSubstitutes
                    .map((item) => `${item.teacherName} ${item.startTime}-${item.endTime}`)
                    .join(
                      ', '
                    )} to Class ${substitutionForm.className}-${substitutionForm.divisionName} ${substitutionForm.subjectName || 'lecture'}.`
                : 'Select a substitute teacher to preview the final notification.'}
            </Alert>
            <TextField
              size="small"
              label="Attachment / Note"
              value={substitutionForm.remarks}
              onChange={(event) =>
                setSubstitutionForm((current) => ({ ...current, remarks: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => handleCreateSubstitution(false)}>
            Save Draft
          </Button>
          <Button variant="contained" onClick={() => handleCreateSubstitution(true)}>
            Assign & Notify
          </Button>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={assignDialogOpen}
        title="Assign Substitute Teacher"
        maxWidth="md"
        handleClose={() => setAssignDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {selectedSubstitution && (
              <Alert severity="info">
                {selectedSubstitution.period} | Class {selectedSubstitution.className}-
                {selectedSubstitution.divisionName} {selectedSubstitution.subjectName} | Original:{' '}
                {selectedSubstitution.originalTeacherName}
              </Alert>
            )}
            {suggestedTeacherRows.map((teacher, index) => {
              const selected = selectedTeacherId === teacher.teacherId;
              return (
                <Box
                  key={teacher.teacherId}
                  onClick={() => {
                    if (!teacher.hasConflict) setSelectedTeacherId(teacher.teacherId);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    cursor: teacher.hasConflict ? 'not-allowed' : 'pointer',
                    border: (theme) =>
                      `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: selected ? 'primary.lighter' : 'background.paper',
                    opacity: teacher.hasConflict ? 0.55 : 1,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        #{index + 1} {teacher.teacherName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.departmentName} - Match score {teacher.score}% - Load{' '}
                        {teacher.loadStatus}
                      </Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {teacher.canTeachSubject && (
                        <Chip
                          size="small"
                          label="Same Subject"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {!teacher.hasConflict && (
                        <Chip
                          size="small"
                          label="Free This Period"
                          color="info"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        size="small"
                        label={`Today ${teacher.todaySubstitutionCount}`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`Week ${teacher.weekSubstitutionCount}`}
                        variant="outlined"
                      />
                      {renderConflict(teacher.conflictSeverity, teacher.conflictReason)}
                    </Stack>
                  </Stack>
                  <Typography
                    variant="body2"
                    color={teacher.hasConflict ? 'error.main' : 'text.secondary'}
                    sx={{ mt: 1 }}
                  >
                    {teacher.hasConflict ? teacher.conflictReason : teacher.recommendationReason}
                  </Typography>
                </Box>
              );
            })}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Room Change (Optional)"
                options={[{ value: '', label: 'Keep current room' }, ...roomOptions]}
                value={assignRoom}
                onChange={(value) => setAssignRoom(value as string)}
              />
              <TextField
                size="small"
                label="Remarks"
                value={assignRemarks}
                onChange={(event) => setAssignRemarks(event.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setAssignDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAssignTeacher}>
            Assign & Notify
          </Button>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={availabilityDialogOpen}
        title="Mark Teacher Unavailable"
        maxWidth="md"
        handleClose={() => setAvailabilityDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {availabilityError && <Alert severity="error">{availabilityError}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <PaginatedSearchSelect<EmployeeOption>
                label="Teacher"
                fetchOptions={fetchAvailabilityTeacherOptions}
                value={
                  availabilityForm.teacherId
                    ? {
                        id: availabilityForm.teacherId,
                        label: availabilityForm.teacherName,
                        departmentName: availabilityForm.departmentName,
                      }
                    : null
                }
                onChange={(_, value) =>
                  setAvailabilityForm((current) => ({
                    ...current,
                    teacherId: value?.id || '',
                    teacherName: value?.label || '',
                    departmentName: value?.departmentName || '',
                  }))
                }
                getOptionLabel={(option) => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                minChars={0}
                debounceMs={1500}
                size="small"
                fullWidth
              />
              <DatePicker
                label="Date"
                value={availabilityForm.availabilityDate}
                format={viewDateFormat}
                onChange={(value) =>
                  setAvailabilityForm((current) => ({ ...current, availabilityDate: value }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={availabilityForm.isFullDay}
                  onChange={(event) =>
                    setAvailabilityForm((current) => ({
                      ...current,
                      isFullDay: event.target.checked,
                      startTime: event.target.checked ? '09:00' : current.startTime,
                      endTime: event.target.checked ? '14:15' : current.endTime,
                    }))
                  }
                />
              }
              label="Full day unavailable"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                size="small"
                type="time"
                label="Start Time"
                value={availabilityForm.startTime}
                disabled={availabilityForm.isFullDay}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({ ...current, startTime: event.target.value }))
                }
                fullWidth
              />
              <TextField
                size="small"
                type="time"
                label="End Time"
                value={availabilityForm.endTime}
                disabled={availabilityForm.isFullDay}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({ ...current, endTime: event.target.value }))
                }
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <CustomSelect
                label="Availability Status"
                options={availabilityStatusOptions}
                value={availabilityForm.availabilityStatus}
                onChange={(value) =>
                  setAvailabilityForm((current) => ({
                    ...current,
                    availabilityStatus: value as string,
                  }))
                }
              />
              <CustomSelect
                label="Source"
                options={sourceTypeOptions}
                value={availabilityForm.sourceType}
                onChange={(value) =>
                  setAvailabilityForm((current) => ({ ...current, sourceType: value as string }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={availabilityForm.autoCreateSubstitutions}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        autoCreateSubstitutions: event.target.checked,
                      }))
                    }
                  />
                }
                label="Auto-create substitutions"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={availabilityForm.notifyLeadership}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        notifyLeadership: event.target.checked,
                      }))
                    }
                  />
                }
                label="Notify admin/principal"
              />
            </Stack>
            <TextField
              size="small"
              label="Reason"
              value={availabilityForm.reason}
              onChange={(event) =>
                setAvailabilityForm((current) => ({ ...current, reason: event.target.value }))
              }
              fullWidth
            />
            <TextField
              size="small"
              label="Attachment file name"
              value={availabilityForm.attachmentName}
              onChange={(event) =>
                setAvailabilityForm((current) => ({
                  ...current,
                  attachmentName: event.target.value,
                }))
              }
              fullWidth
            />
            <Card sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Affected Lecture Preview ({affectedLectures.length})
              </Typography>
              {availabilityForm.teacherName && availabilityForm.availabilityDate && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  {availabilityForm.teacherName} unavailable on{' '}
                  {availabilityForm.availabilityDate.format('DD/MM/YYYY')} from{' '}
                  {availabilityForm.isFullDay ? '09:00' : availabilityForm.startTime} to{' '}
                  {availabilityForm.isFullDay ? '14:15' : availabilityForm.endTime}.
                </Alert>
              )}
              <Stack spacing={1}>
                {affectedLectures.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No affected lectures found for the selected teacher and time.
                  </Typography>
                )}
                {affectedLectures.map((lecture) => (
                  <Stack
                    key={lecture.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}
                  >
                    <Typography variant="body2">
                      {lecture.period} | {lecture.time} | {lecture.className}-{lecture.divisionName}{' '}
                      {lecture.subjectName} | {lecture.roomName}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={lecture.canCreateSubstitution === false}
                      onClick={() => openSubstitutionFromAffectedLecture(lecture)}
                    >
                      {lecture.canCreateSubstitution === false
                        ? 'Already created'
                        : 'Create substitution'}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Card>
            <TextField
              size="small"
              label="Remarks"
              value={availabilityForm.remarks}
              onChange={(event) =>
                setAvailabilityForm((current) => ({ ...current, remarks: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setAvailabilityDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMarkUnavailable}>
            Save and Notify
          </Button>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={auditDialogOpen}
        title="Audit Log"
        maxWidth="sm"
        handleClose={() => setAuditDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {selectedSubstitution?.auditLog.map((entry, index) => (
              <Box
                key={`${entry.at}-${index}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2">
                  {entry.at} - {entry.actor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {entry.action}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogScrollContent>
      </CustomDialog>
    </Box>
  );
};

export default SubstitutionManagementScreen;
