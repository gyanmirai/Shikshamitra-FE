'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type {
  ApiLookupOption,
  ApiAffectedLecture,
  ApiSubstitutionRow,
  ApiSuggestedTeacher,
  ApiSubstitutionLecture,
  ApiTeacherAvailabilityRow,
  ApiSubstitutionCreateMetadata,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Add,
  Send,
  FactCheck,
  PersonOff,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  type ITimetableSummaryCard,
  TimetableSettingsSummaryCards,
} from 'src/screens/academic/components/AcademicSummaryInsights';
import {
  Box,
  Tab,
  Grid,
  Card,
  Chip,
  Menu,
  Alert,
  Stack,
  Drawer,
  Switch,
  Button,
  Tooltip,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  Accordion,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@mui/material';

import { DutyActionDialog } from './components/DutyActionDialog';
import { TeacherDutyActions } from './components/TeacherDutyActions';
import { resolveDutyActionErrorMessage } from './services/duty-actions';
import { useTeacherDutyActions } from './hooks/use-teacher-duty-actions';
import { AffectedLecturePicker } from './components/AffectedLecturePicker';
import { getAvailabilityCoverageState } from './services/availability-coverage';
import { TeacherFirstOriginFields } from './components/TeacherFirstOriginFields';
import { CreateSubstitutionModeTabs } from './components/CreateSubstitutionModeTabs';
import { SubstitutionCreationOverlay } from './components/SubstitutionCreationOverlay';
import {
  createSubstitutionSegments,
  resolveAvailabilityTeacherSelection,
} from './services/create-substitution-action';
import {
  getActiveFilters,
  SubstitutionActiveFilters,
  DEFAULT_SUBSTITUTION_FILTERS,
  SubstitutionFilters as FiltersBar,
} from './components/SubstitutionFilters';
import {
  resolveTeacherShift,
  type CreateTeacherOrigin,
  createDefaultTeacherOrigin,
  hasValidTeacherOriginRange,
  type CreateSubstitutionOriginMode,
  createTeacherOriginFromAvailability,
} from './services/create-substitution-origin';
import {
  todayIso,
  roomOptions,
  statusOptions,
  reasonOptions,
  periodTimeMap,
  teacherOptions,
  subjectOptions,
  conflictOptions,
  priorityOptions,
  sourceTypeOptions,
  suggestedTeachers,
  lectureSlotOptions,
  acknowledgementOptions,
  affectedLectureTemplates,
  availabilityStatusOptions,
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
  useCompleteSubstitutionAction,
  useSuggestedTeachersDataQuery,
  type SubstitutionManagementTab,
  getSubstitutionTabQueryOptions,
  useTeacherAvailabilityDataQuery,
  useAcknowledgeSubstitutionAction,
  useMySubstitutionDutiesDataQuery,
  useSubstitutionLecturesDataQuery,
  useSendSubstitutionReminderAction,
  useSubstitutionDashboardDataQuery,
  useCreateTeacherAvailabilityAction,
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

const cardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  border: '1px solid rgba(145, 158, 171, 0.08)',
};

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

const getAvailabilityStatusColor = (
  status?: string
): 'error' | 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'default' => {
  const norm = (status || '').toLowerCase();
  if (norm.includes('unavail')) return 'error';
  if (norm.includes('leave')) return 'warning';
  if (norm.includes('train')) return 'info';
  if (norm.includes('meet')) return 'secondary';
  if (norm.includes('exam')) return 'primary';
  if (norm.includes('avail')) return 'success';
  return 'default';
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
  return 'Manual';
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
  isResponseWindowOpen: item.isResponseWindowOpen ?? true,
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
  coveredLectureCount: item.coveredLectureCount,
  uncoveredLectureCount: item.uncoveredLectureCount,
  canCreateSubstitution: item.canCreateSubstitution === true,
  notifyLeadership: item.notifyLeadership,
  activeSubstitutionStatuses: (item.activeSubstitutionStatuses ?? [])
    .map(toSubstitutionStatus)
    .filter((status, index, statuses) => statuses.indexOf(status) === index),
  activeSubstitutionIds: item.activeSubstitutionIds ?? [],
  pendingSubstitutionIds: item.pendingSubstitutionIds ?? [],
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
  existingSubstitutionStatus: item.existingSubstitutionStatus,
  canCreateSubstitution: item.canCreateSubstitution,
  createSubstitutionBlockReason: item.createSubstitutionBlockReason,
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
  shiftName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
};

type EmployeeShiftSearchRow = {
  id: string;
  fullName?: string;
  employeeName?: string;
  department?: string;
  departmentName?: string;
  shift?: {
    name?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null;
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
  notifyLeadership: boolean;
  attachmentName: string;
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
  notifyLeadership: true,
  attachmentName: '',
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
  const [activeTab, setActiveTab] = useState<SubstitutionManagementTab>('board');
  const isViewportTab = ['board', 'availability'].includes(activeTab);
  const [boardView, setBoardView] = useState<SubstitutionViewType>('table');
  const [filters, setFilters] = useState(DEFAULT_SUBSTITUTION_FILTERS);
  const [availabilityDate, setAvailabilityDate] = useState(() => dayjs(todayIso));
  const [substitutions, setSubstitutions] = useState<SubstitutionRow[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailabilityRow[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [cameFromAvailability, setCameFromAvailability] = useState(false);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [createSubmitType, setCreateSubmitType] = useState<'assign' | null>(null);
  const [substitutionForm, setSubstitutionForm] = useState(defaultSubstitutionForm);
  const [createOriginMode, setCreateOriginMode] = useState<CreateSubstitutionOriginMode>('teacher');
  const [createTeacherOrigin, setCreateTeacherOrigin] = useState(createDefaultTeacherOrigin);
  const [availabilityForm, setAvailabilityForm] = useState(defaultAvailabilityForm);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  const availabilityStartTimeStr = useMemo(() => {
    if (availabilityForm.isFullDay) return '09:00';
    if (!availabilityForm.startTime) return '';
    return typeof availabilityForm.startTime === 'string'
      ? availabilityForm.startTime
      : dayjs(availabilityForm.startTime).format('HH:mm');
  }, [availabilityForm.isFullDay, availabilityForm.startTime]);

  const availabilityEndTimeStr = useMemo(() => {
    if (availabilityForm.isFullDay) return '14:15';
    if (!availabilityForm.endTime) return '';
    return typeof availabilityForm.endTime === 'string'
      ? availabilityForm.endTime
      : dayjs(availabilityForm.endTime).format('HH:mm');
  }, [availabilityForm.isFullDay, availabilityForm.endTime]);

  const getTeacherAvailabilityConflict = (option: EmployeeOption) => {
    if (
      !availabilityForm.availabilityDate ||
      !availabilityStartTimeStr ||
      !availabilityEndTimeStr
    ) {
      return undefined;
    }

    const date = availabilityForm.availabilityDate.format('YYYY-MM-DD');
    return teacherAvailability.find(
      (item) =>
        item.availabilityDate === date &&
        ((item.teacherId && item.teacherId === option.id) ||
          (!item.teacherId && item.teacherName === option.label)) &&
        isOverlap(availabilityStartTimeStr, availabilityEndTimeStr, item.startTime, item.endTime)
    );
  };

  const unavailableTeacherCount = teacherAvailability.filter((item) => {
    if (
      !availabilityForm.availabilityDate ||
      !availabilityStartTimeStr ||
      !availabilityEndTimeStr
    ) {
      return false;
    }

    return (
      item.availabilityDate === availabilityForm.availabilityDate.format('YYYY-MM-DD') &&
      isOverlap(availabilityStartTimeStr, availabilityEndTimeStr, item.startTime, item.endTime)
    );
  }).length;

  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionRowId, setActionRowId] = useState('');
  const [createFormDirty, setCreateFormDirty] = useState(false);
  const [createUnsavedConfirmOpen, setCreateUnsavedConfirmOpen] = useState(false);
  const [availabilityFormDirty, setAvailabilityFormDirty] = useState(false);
  const [availabilityUnsavedConfirmOpen, setAvailabilityUnsavedConfirmOpen] = useState(false);
  const [availabilitySubmitted, setAvailabilitySubmitted] = useState(false);
  const [createSubmitted, setCreateSubmitted] = useState(false);
  const createFormSnapshotRef = useRef<string>(JSON.stringify(defaultSubstitutionForm));
  const availabilityFormSnapshotRef = useRef<string>(JSON.stringify(defaultAvailabilityForm));
  const { employee: currentEmployee, permissions } = useSelector((state: RootState) => state.auth);
  const canManageSubstitutions = hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.substitutionManagement}.Add`
  );

  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicContextParams = {
    academicYearId: currentYear?.id || undefined,
    academicMediumId: medium?.id || undefined,
  };
  const { data: selectedTeacherSearchResult, isFetching: isCreateTeacherShiftFetching } =
    useGetEmployeeQuery(
      {
        page: 1,
        pageSize: 25,
        search: createTeacherOrigin.teacherName,
        isTeaching: true,
      },
      {
        skip:
          !createDialogOpen ||
          createOriginMode !== 'teacher' ||
          !createTeacherOrigin.teacherId ||
          !createTeacherOrigin.teacherName,
      }
    );
  const selectedTeacherShift = useMemo(() => {
    const employee = (
      selectedTeacherSearchResult?.items as EmployeeShiftSearchRow[] | undefined
    )?.find((item) => item.id === createTeacherOrigin.teacherId);
    return resolveTeacherShift(employee?.shift);
  }, [createTeacherOrigin.teacherId, selectedTeacherSearchResult?.items]);
  const selectedFilterDate = filters.filterDate || dayjs(todayIso);
  const tabQueryOptions = getSubstitutionTabQueryOptions(activeTab, availabilityDialogOpen);
  const {
    data: substitutionResult,
    isLoading: isSubstitutionsLoading,
    isFetching: isSubstitutionsFetching,
  } = useSubstitutionsDataQuery(
    {
      ...academicContextParams,
      fromDate: toDateTimeOffset(selectedFilterDate.startOf('day')),
      toDate: toDateTimeOffset(selectedFilterDate.endOf('day')),
      maxResultCount: 200,
    },
    tabQueryOptions.board
  );
  const {
    data: dashboardResult,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
  } = useSubstitutionDashboardDataQuery({
    ...academicContextParams,
    date: toDateTimeOffset(selectedFilterDate.startOf('day')),
  });
  const {
    data: myDutiesResult,
    isLoading: isMyDutiesLoading,
    isFetching: isMyDutiesFetching,
  } = useMySubstitutionDutiesDataQuery(
    {
      ...academicContextParams,
      fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
      toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
      maxResultCount: 200,
    },
    tabQueryOptions.myDuties
  );
  const {
    data: availabilityResult,
    isLoading: isAvailabilityLoading,
    isFetching: isAvailabilityFetching,
  } = useTeacherAvailabilityDataQuery(
    {
      ...academicContextParams,
      fromDate: toDateTimeOffset(availabilityDate.startOf('day')),
      toDate: toDateTimeOffset(availabilityDate.endOf('day')),
      maxResultCount: 200,
    },
    tabQueryOptions.availability
  );
  const {
    data: rawCreateMetadata,
    isLoading: isCreateMetadataLoading,
    isFetching: isFetchingCreateMetadata,
  } = useSubstitutionCreateMetadataDataQuery(academicContextParams, { skip: !medium?.id });
  const createMetadata = rawCreateMetadata as ApiSubstitutionCreateMetadata | undefined;
  const {
    data: rawCreateLectureResult,
    isLoading: isLecturesLoading,
    isFetching: isFetchingLectures,
  } = useSubstitutionLecturesDataQuery(
    {
      ...academicContextParams,
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
  const createLectureResult = useMemo(
    () => (rawCreateLectureResult ?? []) as ApiSubstitutionLecture[],
    [rawCreateLectureResult]
  );
  const {
    data: suggestedTeacherResult,
    isLoading: isSuggestedTeachersLoading,
    isFetching: isFetchingSuggestedTeachersList,
  } = useSuggestedTeachersDataQuery(selectedSubstitutionId, {
    skip: !selectedSubstitutionId || !assignDialogOpen,
  });
  const {
    data: affectedLectureResult,
    isLoading: isAffectedLecturesLoading,
    isFetching: isAffectedLecturesFetching,
  } = useAffectedLecturesDataQuery(
    {
      ...academicContextParams,
      teacherId: availabilityForm.teacherId || undefined,
      teacherName: availabilityForm.teacherName || undefined,
      availabilityDate: toDateTimeOffset(availabilityForm.availabilityDate?.startOf('day')),
      startTime: availabilityForm.isFullDay ? '09:00' : availabilityStartTimeStr,
      endTime: availabilityForm.isFullDay ? '14:15' : availabilityEndTimeStr,
      isFullDay: availabilityForm.isFullDay,
      maxResultCount: 100,
    },
    {
      skip:
        !availabilityDialogOpen || (!availabilityForm.teacherId && !availabilityForm.teacherName),
    }
  );
  const createOriginStartTime = createTeacherOrigin.startTime;
  const createOriginEndTime = createTeacherOrigin.endTime;
  const isCreateOriginRangeValid = hasValidTeacherOriginRange(createTeacherOrigin);
  const {
    data: createAffectedLectureResult,
    isLoading: isCreateAffectedLecturesLoading,
    isFetching: isCreateAffectedLecturesFetching,
    isError: isCreateAffectedLecturesError,
  } = useAffectedLecturesDataQuery(
    {
      ...academicContextParams,
      teacherId: createTeacherOrigin.teacherId || undefined,
      teacherName: createTeacherOrigin.teacherName || undefined,
      availabilityDate: toDateTimeOffset(createTeacherOrigin.date?.startOf('day')),
      startTime: createOriginStartTime,
      endTime: createOriginEndTime,
      isFullDay: createTeacherOrigin.isFullDay,
      reason: createTeacherOrigin.reason,
      maxResultCount: 100,
    },
    {
      skip:
        !createDialogOpen ||
        createOriginMode !== 'teacher' ||
        !medium?.id ||
        (!createTeacherOrigin.teacherId && !createTeacherOrigin.teacherName) ||
        !createTeacherOrigin.date ||
        !isCreateOriginRangeValid,
    }
  );
  const createAffectedLectures = useMemo(
    () => createAffectedLectureResult?.items.map(mapApiAffectedLecture) ?? [],
    [createAffectedLectureResult]
  );
  const selectedCreateLecture = createLectureResult.find(
    (lecture) => lecture.slotSubjectId === substitutionForm.timetableSlotSubjectId
  );
  const hasCreateLectureSelection = Boolean(
    (substitutionForm.timetableSlotSubjectId || substitutionForm.period) &&
    substitutionForm.startTime &&
    substitutionForm.endTime &&
    substitutionForm.className &&
    substitutionForm.divisionName
  );
  const {
    data: createSuggestedTeacherResult,
    isLoading: isCreateSuggestedTeachersLoading,
    isFetching: isFetchingSuggestedTeachers,
  } = useSuggestedTeachersByContextDataQuery(
    {
      ...academicContextParams,
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
        !hasCreateLectureSelection ||
        !substitutionForm.originalTeacherName,
    }
  );

  const {
    data: dailySheetResult,
    isLoading: isDailySheetLoading,
    isFetching: isDailySheetFetching,
  } = useDailySheetDataQuery({
    date: toDateTimeOffset((filters.filterDate || dayjs(todayIso)).startOf('day')),
    maxResultCount: 500,
  });
  const [
    createSubstitution,
    { isLoading: isCreatingSubstitution, reset: resetCreateSubstitution },
  ] = useCreateSubstitutionAction();
  const [assignSubstitute, { isLoading: isAssigning }] = useAssignSubstituteAction();
  const [sendSubstitutionReminder, { isLoading: isSendingReminder }] =
    useSendSubstitutionReminderAction();
  const [completeSubstitution, { isLoading: isCompletingSubstitution }] =
    useCompleteSubstitutionAction();
  const [cancelSubstitution, { isLoading: isCancellingSubstitution }] =
    useCancelSubstitutionAction();
  const [
    acknowledgeSubstitution,
    { isLoading: isAcknowledging, originalArgs: acknowledgementArgs },
  ] = useAcknowledgeSubstitutionAction();
  const dutyActions = useTeacherDutyActions(
    isAcknowledging && acknowledgementArgs ? { id: acknowledgementArgs.id, action: 'accept' } : null
  );
  const [createTeacherAvailability, { isLoading: isCreatingAvailability }] =
    useCreateTeacherAvailabilityAction();
  const [downloadDailyPdf, { isLoading: isDownloadingPdf }] = useDailySheetPdfLazyQuery();
  const [downloadDailyExcel, { isLoading: isDownloadingExcel }] = useDailySheetExcelLazyQuery();
  const [getEmployeeOptions, { isLoading: isFetchingEmployeeOptions }] =
    useEmployeeOptionsLazyQuery();
  const seenAvailabilityTeacherIdsRef = useRef<Set<string>>(new Set());

  const isCreateDialogLoading =
    isCreateMetadataLoading ||
    isFetchingCreateMetadata ||
    isLecturesLoading ||
    isFetchingLectures ||
    isCreateAffectedLecturesLoading ||
    isCreateAffectedLecturesFetching ||
    isCreateSuggestedTeachersLoading ||
    isFetchingSuggestedTeachers;

  const fetchAvailabilityTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenAvailabilityTeacherIdsRef.current = new Set();
      const res = await getEmployeeOptions({
        search: query,
        page,
        isTeaching: true,
        academicYearId: currentYear?.id || undefined,
        academicMediumId: medium?.id || undefined,
      }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = ((res?.items ?? []) as EmployeeShiftSearchRow[])
        .map((item) => {
          const shift = resolveTeacherShift(item.shift);
          return {
            id: item.id,
            label: item.fullName || item.employeeName || '',
            departmentName: item.departmentName || item.department || '',
            shiftName: shift.name,
            shiftStartTime: shift.isValid ? shift.startTime : '',
            shiftEndTime: shift.isValid ? shift.endTime : '',
          };
        })
        .filter((item: EmployeeOption) => {
          if (!item.id || !item.label || seenAvailabilityTeacherIdsRef.current.has(item.id)) {
            return false;
          }
          seenAvailabilityTeacherIdsRef.current.add(item.id);
          return true;
        });

      return { data, hasMore };
    },
    [currentYear?.id, getEmployeeOptions, medium?.id]
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
    if (!selectedTeacherShift.isValid || !createTeacherOrigin.teacherId) return;

    setCreateTeacherOrigin((current) => {
      if (current.teacherId !== createTeacherOrigin.teacherId) return current;

      const startTime = current.isFullDay ? selectedTeacherShift.startTime : current.startTime;
      const endTime = current.isFullDay ? selectedTeacherShift.endTime : current.endTime;
      if (
        current.shiftName === selectedTeacherShift.name &&
        current.shiftStartTime === selectedTeacherShift.startTime &&
        current.shiftEndTime === selectedTeacherShift.endTime &&
        current.startTime === startTime &&
        current.endTime === endTime
      ) {
        return current;
      }

      return {
        ...current,
        shiftName: selectedTeacherShift.name,
        shiftStartTime: selectedTeacherShift.startTime,
        shiftEndTime: selectedTeacherShift.endTime,
        startTime,
        endTime,
      };
    });

    if (createTeacherOrigin.isFullDay && !hasCreateLectureSelection) {
      setSubstitutionForm((current) => ({
        ...current,
        startTime: selectedTeacherShift.startTime,
        endTime: selectedTeacherShift.endTime,
      }));
    }
  }, [
    createTeacherOrigin.isFullDay,
    createTeacherOrigin.teacherId,
    hasCreateLectureSelection,
    selectedTeacherShift.endTime,
    selectedTeacherShift.isValid,
    selectedTeacherShift.name,
    selectedTeacherShift.startTime,
  ]);

  const metadataStandards = useMemo(() => createMetadata?.standards ?? [], [createMetadata]);
  const metadataDivisions = useMemo(() => createMetadata?.divisions ?? [], [createMetadata]);
  const metadataSubjects = useMemo(() => createMetadata?.subjects ?? [], [createMetadata]);
  const metadataTeachers = useMemo(() => createMetadata?.teachers ?? [], [createMetadata]);
  const metadataRooms = useMemo(() => createMetadata?.rooms ?? [], [createMetadata]);
  const academicStandards: Standards[] = useMemo(
    () =>
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage?.standards || []) || [],
    [medium?.educationMediumStages]
  );
  const selectedAcademicStandard = academicStandards.find(
    (item: Standards) => item.id === substitutionForm.standardId
  );
  const classSelectOptions: SelectOption[] = useMemo(() => {
    const options = academicStandards.length
      ? academicStandards.map((item: Standards) => ({ value: item.id, label: item.name }))
      : uniqueLookupOptions(metadataStandards).map((item) => ({
          value: item.id,
          label: item.name,
        }));
    const currentVal = substitutionForm.standardId || substitutionForm.className;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      options.unshift({
        value: currentVal,
        label: substitutionForm.className || currentVal,
      });
    }
    return options;
  }, [
    academicStandards,
    metadataStandards,
    substitutionForm.standardId,
    substitutionForm.className,
  ]);

  const divisionSelectOptions: SelectOption[] = useMemo(() => {
    const options = selectedAcademicStandard?.divisions?.length
      ? selectedAcademicStandard.divisions.map((item: Standards['divisions'][number]) => ({
          value: item.id,
          label: item.name,
        }))
      : metadataDivisions.length > 0
        ? uniqueLookupOptions(metadataDivisions)
            .filter(
              (item) =>
                !substitutionForm.standardId || item.standardId === substitutionForm.standardId
            )
            .map((item) => ({ value: item.id, label: item.name }))
        : [];
    const currentVal = substitutionForm.divisionId || substitutionForm.divisionName;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      options.unshift({
        value: currentVal,
        label: substitutionForm.divisionName || currentVal,
      });
    }
    return options;
  }, [
    selectedAcademicStandard,
    metadataDivisions,
    substitutionForm.standardId,
    substitutionForm.divisionId,
    substitutionForm.divisionName,
  ]);

  const subjectSelectOptions: SelectOption[] = useMemo(() => {
    const options =
      metadataSubjects.length > 0
        ? metadataSubjects
            .filter(
              (item) =>
                !substitutionForm.standardId || item.standardId === substitutionForm.standardId
            )
            .map((item) => ({ value: item.id, label: item.name }))
        : subjectOptions;
    const currentVal = substitutionForm.subjectId || substitutionForm.subjectName;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      options.unshift({
        value: currentVal,
        label: substitutionForm.subjectName || currentVal,
      });
    }
    return options;
  }, [
    metadataSubjects,
    substitutionForm.standardId,
    substitutionForm.subjectId,
    substitutionForm.subjectName,
  ]);

  const teacherSelectOptions: SelectOption[] = useMemo(() => {
    const options =
      metadataTeachers.length > 0
        ? metadataTeachers.map((item: ApiLookupOption) => ({ value: item.id, label: item.name }))
        : teacherOptions;
    const currentVal = substitutionForm.originalTeacherId || substitutionForm.originalTeacherName;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      options.unshift({
        value: currentVal,
        label: substitutionForm.originalTeacherName || currentVal,
      });
    }
    return options;
  }, [metadataTeachers, substitutionForm.originalTeacherId, substitutionForm.originalTeacherName]);

  const roomSelectOptions: SelectOption[] = useMemo(() => {
    const options =
      metadataRooms.length > 0
        ? metadataRooms.map((item: ApiLookupOption) => ({ value: item.id, label: item.name }))
        : roomOptions;
    const currentVal = substitutionForm.originalRoomId || substitutionForm.roomName;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      options.unshift({
        value: currentVal,
        label: substitutionForm.roomName || currentVal,
      });
    }
    return options;
  }, [metadataRooms, substitutionForm.originalRoomId, substitutionForm.roomName]);

  const lectureSelectOptions: SelectOption[] = useMemo(() => {
    const options =
      createLectureResult.length > 0
        ? createLectureResult.map((item) => ({
            value: item.slotSubjectId,
            label: formatLectureLabel(item),
          }))
        : lectureSlotOptions;
    const currentVal = substitutionForm.timetableSlotSubjectId || substitutionForm.period;
    if (currentVal && !options.some((o) => o.value === currentVal)) {
      const labelText = substitutionForm.period
        ? `${substitutionForm.period}${substitutionForm.startTime ? ` (${substitutionForm.startTime} - ${substitutionForm.endTime})` : ''}`
        : currentVal;
      options.unshift({
        value: currentVal,
        label: labelText,
      });
    }
    return options;
  }, [
    createLectureResult,
    substitutionForm.timetableSlotSubjectId,
    substitutionForm.period,
    substitutionForm.startTime,
    substitutionForm.endTime,
  ]);

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

  const selectedDateIso = useMemo(
    () => (filters.filterDate ? filters.filterDate.format('YYYY-MM-DD') : todayIso),
    [filters.filterDate]
  );

  const todayRows = useMemo(
    () => substitutions.filter((item) => item.date === selectedDateIso),
    [selectedDateIso, substitutions]
  );

  const myDutyRows = useMemo<SubstitutionRow[]>(
    () => myDutiesResult?.items.map(mapApiSubstitution) ?? [],
    [myDutiesResult]
  );

  const suggestedTeacherRows = useMemo<AvailableTeacherRow[]>(
    () =>
      createDialogOpen
        ? hasCreateLectureSelection
          ? (createSuggestedTeacherResult?.map(mapApiSuggestedTeacher) ?? [])
          : []
        : (suggestedTeacherResult?.map(mapApiSuggestedTeacher) ?? suggestedTeachers),
    [
      createDialogOpen,
      createSuggestedTeacherResult,
      hasCreateLectureSelection,
      suggestedTeacherResult,
    ]
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
    if (!availabilityForm.teacherId && !availabilityForm.teacherName) {
      return [];
    }
    if (affectedLectureResult?.items) return affectedLectureResult.items.map(mapApiAffectedLecture);

    return affectedLectureTemplates.filter((lecture) => {
      const period = periodTimeMap[lecture.period];
      const matchesTeacher = lecture.teacherName === availabilityForm.teacherName;
      const matchesTime =
        availabilityForm.isFullDay ||
        isOverlap(
          availabilityStartTimeStr,
          availabilityEndTimeStr,
          period.startTime,
          period.endTime
        );
      return matchesTeacher && matchesTime;
    });
  }, [
    availabilityEndTimeStr,
    availabilityForm.isFullDay,
    availabilityForm.teacherId,
    availabilityForm.teacherName,
    availabilityStartTimeStr,
    affectedLectureResult,
  ]);

  const summaryCards = useMemo<ITimetableSummaryCard[]>(() => {
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
    const changeRequested =
      dashboardResult?.changeRequested ??
      todayRows.filter((item) => item.acknowledgementStatus === 'Change Requested').length;
    const nextRisk =
      (dashboardResult?.nextRisk ? mapApiSubstitution(dashboardResult.nextRisk) : undefined) ??
      todayRows.find((item) => ['Pending', 'Conflict'].includes(item.status));

    return [
      {
        label: 'Pending Substitutions',
        value: pending,
        icon: 'mdi:clock-alert-outline',
        color: pending ? 'warning' : 'success',
      },
      {
        label: 'Assigned Today',
        value: `${assigned}/${todayRows.length || 0}`,
        icon: 'mdi:account-check-outline',
        color: 'info',
      },
      {
        label: 'Acknowledged',
        value: `${acknowledged}/${todayRows.length || 0}`,
        icon: 'mdi:checkbox-marked-circle-outline',
        color: acknowledged === todayRows.length && todayRows.length > 0 ? 'success' : 'warning',
      },
      {
        label: 'Change Requested',
        value: changeRequested,
        icon: 'mdi:swap-horizontal-bold',
        color: changeRequested ? 'error' : 'success',
      },
      {
        label: 'Teachers Unavailable',
        value: unavailable,
        icon: 'mdi:account-off-outline',
        color: unavailable ? 'error' : 'success',
      },
      {
        label: 'Uncovered Classes',
        value: uncovered,
        icon: 'mdi:shield-alert-outline',
        color: uncovered ? 'warning' : 'success',
      },
      {
        label: 'Next Risk',
        value: nextRisk?.period || 'None',
        icon: 'mdi:alert-decagram-outline',
        color: nextRisk ? 'warning' : 'success',
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
          const updated = await acknowledgeSubstitution({ id }).unwrap();
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
        const message = resolveDutyActionErrorMessage(error, `Unable to mark as ${status}.`);
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

  const createFieldErrors = useMemo(
    () => ({
      date: (() => {
        if (!substitutionForm.date) return 'Date is required';
        const dateVal = substitutionForm.date;
        if (!dayjs(dateVal).isValid()) return 'Date must be a valid date';
        if (dayjs(dateVal).isBefore(dayjs(), 'day')) return 'Date cannot be in the past';
        if (
          currentYear?.startDate &&
          dayjs(dateVal).isBefore(dayjs(currentYear.startDate), 'day')
        ) {
          return `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`;
        }
        if (currentYear?.endDate && dayjs(dateVal).isAfter(dayjs(currentYear.endDate), 'day')) {
          return `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`;
        }
        return '';
      })(),
      class: !substitutionForm.standardId && !substitutionForm.className ? 'Class is required' : '',
      division:
        !substitutionForm.divisionId && !substitutionForm.divisionName
          ? 'Division is required'
          : '',
      slot:
        !substitutionForm.timetableSlotSubjectId && !substitutionForm.period
          ? 'Lecture slot is required'
          : '',
      subject:
        !substitutionForm.subjectId && !substitutionForm.subjectName ? 'Subject is required' : '',
      originalTeacher:
        !substitutionForm.originalTeacherId && !substitutionForm.originalTeacherName
          ? 'Original teacher is required'
          : '',
      originalRoom:
        !substitutionForm.originalRoomId && !substitutionForm.roomName
          ? 'Original room is required'
          : '',
      reason: !substitutionForm.reason.trim() ? 'Reason is required' : '',
      substituteTeacher:
        substitutionForm.selectedSubstitutes.length === 0 ? 'Substitute teacher is required' : '',
    }),
    [substitutionForm, currentYear]
  );

  const handleCreateSubstitution = useCallback(async () => {
    setCreateSubmitType('assign');
    setCreateSubmitted(true);

    const hasBasicError =
      !!createFieldErrors.date ||
      !!createFieldErrors.class ||
      !!createFieldErrors.division ||
      !!createFieldErrors.slot ||
      !!createFieldErrors.subject ||
      !!createFieldErrors.originalTeacher ||
      !!createFieldErrors.originalRoom ||
      !!createFieldErrors.reason;

    if (hasBasicError) {
      return;
    }

    if (createFieldErrors.substituteTeacher) {
      return;
    }

    if (!substitutionForm.date) {
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
      shikshaMitraToast.error({
        message: 'This slot already has an active substitution assignment.',
      });
      return;
    }

    const selectedTeachers = substitutionForm.selectedSubstitutes
      .map((selection) =>
        suggestedTeacherRows.find((teacher) => teacher.teacherId === selection.teacherId)
      )
      .filter(Boolean) as AvailableTeacherRow[];

    if (selectedTeachers.some((teacher) => teacher.hasConflict)) {
      shikshaMitraToast.error({
        message: 'One selected teacher has a hard conflict. Remove that teacher first.',
      });
      return;
    }

    try {
      const assignmentSegments = substitutionForm.selectedSubstitutes;
      const createdRows = await createSubstitutionSegments({
        segments: assignmentSegments,
        resetMutation: resetCreateSubstitution,
        create: (segment) =>
          createSubstitution({
            academicYearId: currentYear?.id || null,
            academicMediumId: medium?.id || null,
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
            substituteTeacherId: segment.teacherId,
            substituteTeacherName: segment.teacherName,
            assignedRoomId:
              substitutionForm.assignedRoomId || substitutionForm.originalRoomId || null,
            assignedRoomName: substitutionForm.assignedRoomName || substitutionForm.roomName,
            remarks: segment.isPartialCoverage
              ? `${substitutionForm.remarks || ''} Partial coverage ${segment.startTime}-${segment.endTime}.`.trim()
              : substitutionForm.remarks,
          }).unwrap(),
      });
      setSubstitutions((current) => [...createdRows.map(mapApiSubstitution), ...current]);
      setCreateDialogOpen(false);
      if (cameFromAvailability) {
        setAvailabilityDialogOpen(true);
        setCameFromAvailability(false);
      }
      shikshaMitraToast.success({
        message: 'Substitution coverage assigned and notification queued.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create substitution.';
      shikshaMitraToast.error({ message });
    } finally {
      setCreateSubmitType(null);
    }
  }, [
    createSubstitution,
    resetCreateSubstitution,
    createFieldErrors,
    selectedCreateLecture,
    substitutionForm,
    substitutions,
    suggestedTeacherRows,
    currentYear,
    medium,
    cameFromAvailability,
  ]);

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
        substituteTeacherId: selectedTeacher.teacherId || null,
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
      departmentName?: string;
      shiftName?: string;
      shiftStartTime?: string;
      shiftEndTime?: string;
      isFullDay?: boolean;
      availabilityStartTime?: string;
      availabilityEndTime?: string;
      openAsDrawer?: boolean;
    }
  ) => {
    const unavailableTeacher = resolveAvailabilityTeacherSelection(
      { teacherId: context.teacherId, teacherName: context.teacherName },
      { teacherId: lecture.teacherId, teacherName: lecture.teacherName }
    );

    setFormError('');
    setCreateOriginMode('teacher');
    setCreateTeacherOrigin({
      teacherId: unavailableTeacher.originalTeacherId,
      teacherName: unavailableTeacher.originalTeacherName,
      departmentName: context.departmentName || '',
      shiftName: context.shiftName || '',
      shiftStartTime: context.shiftStartTime || context.availabilityStartTime || lecture.startTime,
      shiftEndTime: context.shiftEndTime || context.availabilityEndTime || lecture.endTime,
      date: context.availabilityDate,
      startTime: context.availabilityStartTime || lecture.startTime,
      endTime: context.availabilityEndTime || lecture.endTime,
      isFullDay: context.isFullDay ?? false,
      reason: context.reason || 'Teacher Unavailable',
      remarks: context.remarks || '',
      sourceType: context.sourceType,
    });
    setSubstitutionForm({
      ...defaultSubstitutionForm,
      date: context.availabilityDate,
      standardId: lecture.standardId || '',
      divisionId: lecture.divisionId || '',
      timetableId: lecture.timetableId || '',
      timetableSlotId: lecture.timetableSlotId || '',
      timetableSlotSubjectId: lecture.slotSubjectId || '',
      subjectId: lecture.subjectId || '',
      originalTeacherId: unavailableTeacher.originalTeacherId,
      originalRoomId: lecture.roomId || '',
      assignedRoomId: lecture.roomId || '',
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      className: lecture.className,
      divisionName: lecture.divisionName,
      period: lecture.period,
      subjectName: lecture.subjectName,
      originalTeacherName: unavailableTeacher.originalTeacherName,
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
    if (context.openAsDrawer) {
      setCameFromAvailability(true);
    } else {
      setCameFromAvailability(false);
    }
    setCreateDialogOpen(true);
  };

  const handleCreateSubstitutionFromAvailability = (row: TeacherAvailabilityRow) => {
    if (row.affectedLectureCount <= 0) {
      shikshaMitraToast.error({
        message: 'No affected lecture is available for this teacher.',
      });
      return;
    }

    const origin = createTeacherOriginFromAvailability(row);
    setFormError('');
    setCreateOriginMode('teacher');
    setCreateTeacherOrigin(origin);
    setSubstitutionForm({
      ...defaultSubstitutionForm,
      date: origin.date,
      originalTeacherId: origin.teacherId,
      originalTeacherName: origin.teacherName,
      reason: origin.reason,
      startTime: origin.startTime,
      endTime: origin.endTime,
      remarks: origin.remarks,
      assignmentSource: toAssignmentSourceFromAvailability(origin.sourceType),
    });
    setCameFromAvailability(false);
    setCreateDialogOpen(true);
  };

  const handleCreateOriginModeChange = (mode: CreateSubstitutionOriginMode) => {
    setCreateOriginMode(mode);
    setCreateSubmitted(false);
    setEmployeeSearchTerm('');
    setSubstitutionForm({
      ...defaultSubstitutionForm,
      date: mode === 'teacher' ? createTeacherOrigin.date : defaultSubstitutionForm.date,
      originalTeacherId: mode === 'teacher' ? createTeacherOrigin.teacherId : '',
      originalTeacherName: mode === 'teacher' ? createTeacherOrigin.teacherName : '',
      reason: mode === 'teacher' ? createTeacherOrigin.reason : defaultSubstitutionForm.reason,
      startTime: mode === 'teacher' ? createOriginStartTime : '',
      endTime: mode === 'teacher' ? createOriginEndTime : '',
      remarks: mode === 'teacher' ? createTeacherOrigin.remarks : '',
      assignmentSource:
        mode === 'teacher'
          ? toAssignmentSourceFromAvailability(createTeacherOrigin.sourceType)
          : defaultSubstitutionForm.assignmentSource,
    });
  };

  const handleCreateTeacherOriginChange = (patch: Partial<CreateTeacherOrigin>) => {
    const nextOrigin = { ...createTeacherOrigin, ...patch };
    const lectureContextChanged = [
      'teacherId',
      'teacherName',
      'date',
      'startTime',
      'endTime',
      'isFullDay',
    ].some((key) => key in patch);

    setCreateTeacherOrigin(nextOrigin);
    setSubstitutionForm((current) => ({
      ...(lectureContextChanged ? defaultSubstitutionForm : current),
      date: nextOrigin.date,
      originalTeacherId: nextOrigin.teacherId,
      originalTeacherName: nextOrigin.teacherName,
      reason: nextOrigin.reason,
      startTime: nextOrigin.startTime,
      endTime: nextOrigin.endTime,
      remarks: nextOrigin.remarks,
      assignmentSource: toAssignmentSourceFromAvailability(nextOrigin.sourceType),
    }));
    if (lectureContextChanged) setEmployeeSearchTerm('');
  };

  const handleCreateAffectedLectureSelect = (lecture: AffectedLectureRow) => {
    openSubstitutionForLecture(lecture, {
      availabilityDate: createTeacherOrigin.date || dayjs(),
      teacherId: createTeacherOrigin.teacherId,
      teacherName: createTeacherOrigin.teacherName,
      departmentName: createTeacherOrigin.departmentName,
      shiftName: createTeacherOrigin.shiftName,
      shiftStartTime: createTeacherOrigin.shiftStartTime,
      shiftEndTime: createTeacherOrigin.shiftEndTime,
      reason: createTeacherOrigin.reason,
      remarks: createTeacherOrigin.remarks,
      sourceType: createTeacherOrigin.sourceType,
      isFullDay: createTeacherOrigin.isFullDay,
      availabilityStartTime: createTeacherOrigin.startTime,
      availabilityEndTime: createTeacherOrigin.endTime,
    });
  };

  const availabilityStartTime = availabilityStartTimeStr;
  const availabilityEndTime = availabilityEndTimeStr;

  const availabilityFieldErrors = useMemo(
    () => ({
      teacherName: !availabilityForm.teacherName ? 'Select a teacher.' : '',
      availabilityDate: (() => {
        if (!availabilityForm.availabilityDate) return 'Select a date.';
        const dateVal = availabilityForm.availabilityDate;
        if (!dayjs(dateVal).isValid()) return 'Date must be a valid date.';
        if (dayjs(dateVal).isBefore(dayjs(), 'day')) return 'Date cannot be in the past.';
        if (
          currentYear?.startDate &&
          dayjs(dateVal).isBefore(dayjs(currentYear.startDate), 'day')
        ) {
          return `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`;
        }
        if (currentYear?.endDate && dayjs(dateVal).isAfter(dayjs(currentYear.endDate), 'day')) {
          return `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`;
        }
        return '';
      })(),
      reason: !availabilityForm.reason.trim() ? 'Reason is required.' : '',
      time:
        !availabilityForm.isFullDay &&
        toMinutes(availabilityEndTime) <= toMinutes(availabilityStartTime)
          ? 'End time must be later than start time.'
          : '',
    }),
    [availabilityForm, availabilityEndTime, availabilityStartTime, currentYear]
  );

  const hasAvailabilityFieldErrors = Object.values(availabilityFieldErrors).some(Boolean);

  const handleMarkUnavailable = useCallback(async () => {
    setAvailabilitySubmitted(true);
    if (hasAvailabilityFieldErrors || !availabilityForm.availabilityDate) {
      setAvailabilityError('Please fix the highlighted fields before saving.');
      return;
    }

    const startTime = availabilityStartTime;
    const endTime = availabilityEndTime;

    const date = availabilityForm.availabilityDate.format('YYYY-MM-DD');
    const payloadDate = toDateTimeOffset(availabilityForm.availabilityDate.startOf('day'));
    const overlapsExisting = teacherAvailability.some(
      (item) =>
        (item.teacherId && availabilityForm.teacherId
          ? item.teacherId === availabilityForm.teacherId
          : item.teacherName === availabilityForm.teacherName) &&
        item.availabilityDate === date &&
        isOverlap(startTime, endTime, item.startTime, item.endTime)
    );

    if (overlapsExisting) {
      setAvailabilityError(
        'Teacher is already marked unavailable for the selected date and time. Please choose a different time slot.'
      );
      return;
    }

    try {
      const created = await createTeacherAvailability({
        academicYearId: currentYear?.id || undefined,
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
      const message = resolveDutyActionErrorMessage(error, 'Unable to save teacher availability.');
      setAvailabilityError(message);
    }
  }, [
    availabilityForm,
    availabilityStartTime,
    availabilityEndTime,
    hasAvailabilityFieldErrors,
    createTeacherAvailability,
    teacherAvailability,
    currentYear?.id,
  ]);

  const handleCloseCreateDialog = useCallback(() => {
    if (createFormDirty) {
      setCreateUnsavedConfirmOpen(true);
    } else {
      setCreateDialogOpen(false);
      if (cameFromAvailability) {
        setAvailabilityDialogOpen(true);
        setCameFromAvailability(false);
      }
    }
  }, [createFormDirty, cameFromAvailability]);

  const handleDiscardCreateDialog = useCallback(() => {
    setCreateUnsavedConfirmOpen(false);
    setCreateDialogOpen(false);
    if (cameFromAvailability) {
      setAvailabilityDialogOpen(true);
      setCameFromAvailability(false);
    }
  }, [cameFromAvailability]);

  const handleCloseAvailabilityDialog = useCallback(() => {
    if (availabilityFormDirty) {
      setAvailabilityUnsavedConfirmOpen(true);
    } else {
      setAvailabilityDialogOpen(false);
    }
  }, [availabilityFormDirty]);

  const handleDiscardAvailabilityDialog = useCallback(() => {
    setAvailabilityUnsavedConfirmOpen(false);
    setAvailabilityDialogOpen(false);
  }, []);

  useEffect(() => {
    if (createDialogOpen) {
      createFormSnapshotRef.current = JSON.stringify(substitutionForm);
      setCreateFormDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDialogOpen]);

  useEffect(() => {
    if (!createDialogOpen) return;
    setCreateFormDirty(JSON.stringify(substitutionForm) !== createFormSnapshotRef.current);
  }, [substitutionForm, createDialogOpen]);

  useEffect(() => {
    if (availabilityDialogOpen) {
      availabilityFormSnapshotRef.current = JSON.stringify(availabilityForm);
      setAvailabilityFormDirty(false);
      setAvailabilitySubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityDialogOpen]);

  useEffect(() => {
    if (!availabilityDialogOpen) return;
    setAvailabilityFormDirty(
      JSON.stringify(availabilityForm) !== availabilityFormSnapshotRef.current
    );
  }, [availabilityForm, availabilityDialogOpen]);

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

  const renderStatus = (status: SubstitutionStatus) => (
    <Label color={statusColor[status]} variant="soft">
      {status}
    </Label>
  );

  const renderAck = (status: AcknowledgementStatus) => (
    <Label color={acknowledgementColor[status]} variant="soft">
      {status}
    </Label>
  );

  const renderConflict = (status: ConflictStatus, reason?: string) => (
    <Tooltip title={reason || status}>
      <Label color={conflictColor[status]} variant="soft">
        {status}
      </Label>
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
      render: (value: any) => formatViewDate(value),
    },
    { id: 'period', label: 'Period', filterType: 'string' as const, minWidth: 100 },
    { id: 'time', label: 'Time', filterType: 'string' as const, minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      filterType: 'string' as const,
      minWidth: 120,
      render: (_value: any, row: any) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', filterType: 'string' as const, minWidth: 130 },
    {
      id: 'originalTeacherName',
      label: 'Original Teacher',
      filterType: 'string' as const,
      minWidth: 160,
    },
    {
      id: 'substituteTeacherName',
      label: 'Substitute Teacher',
      filterType: 'string' as const,
      minWidth: 170,
      render: (value: any) => value || 'Unassigned',
    },
    {
      id: 'assignedRoomName',
      label: 'Room',
      filterType: 'string' as const,
      minWidth: 120,
      render: (value: any, row: any) => value || row.roomName,
    },
    { id: 'reason', label: 'Reason', filterType: 'string' as const, minWidth: 130 },
    {
      id: 'priority',
      label: 'Priority',
      filterType: 'enum' as const,
      enumOptions: priorityOptions,
      minWidth: 110,
      render: (value: SubstitutionPriority) => (
        <Label color={priorityColor[value]} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'acknowledgementStatus',
      label: 'Acknowledgement',
      filterType: 'enum' as const,
      enumOptions: acknowledgementOptions.filter((o) => o.value !== 'all'),
      minWidth: 170,
      render: (value: AcknowledgementStatus) => renderAck(value),
    },
    { id: 'source', label: 'Source', filterType: 'string' as const, minWidth: 120 },
    {
      id: 'conflictStatus',
      label: 'Conflict',
      filterType: 'enum' as const,
      enumOptions: conflictOptions.filter((o) => o.value !== 'all'),
      minWidth: 140,
      render: (value: ConflictStatus, row: any) => renderConflict(value, row.conflictReason),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum' as const,
      enumOptions: statusOptions.filter((o) => o.value !== 'all'),
      sticky: true,
      minWidth: 140,
      render: (value: SubstitutionStatus) => renderStatus(value),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 160,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: any, row: any) => {
        const isClosed = ['Completed', 'Cancelled'].includes(row.status);
        const isAssignedTeacher = row.substituteTeacherName === currentEmployee?.employeeName;
        const actions = [
          ...(canManageSubstitutions
            ? [
                {
                  id: 'assign',
                  label: row.substituteTeacherName ? 'Reassign' : 'Assign',
                  icon: row.substituteTeacherName
                    ? 'mdi:swap-horizontal'
                    : 'mdi:account-plus-outline',
                  disabled: isClosed,
                  onClick: () => openAssignDialog(row.id),
                },
              ]
            : []),
          {
            id: 'audit',
            label: 'View audit log',
            icon: 'mdi:history',
            onClick: () => {
              setSelectedSubstitutionId(row.id);
              setAuditDialogOpen(true);
            },
          },
          {
            id: 'acknowledge',
            label: 'Mark acknowledged',
            icon: GlobalIcons.tick,
            disabled:
              !row.isResponseWindowOpen ||
              !['Waiting Ack', 'Assigned'].includes(row.status) ||
              (!canManageSubstitutions && !isAssignedTeacher),
            onClick: () => updateSubstitutionStatus(row.id, 'Acknowledged'),
          },
          {
            id: 'complete',
            label: 'Mark completed',
            icon: 'mdi:check-decagram-outline',
            disabled:
              !['Assigned', 'Waiting Ack', 'Acknowledged'].includes(row.status) ||
              (!canManageSubstitutions && !isAssignedTeacher),
            onClick: () => updateSubstitutionStatus(row.id, 'Completed'),
          },
          {
            id: 'reminder',
            label: 'Send reminder',
            icon: 'mdi:bell-ring-outline',
            disabled: isClosed || !canManageSubstitutions,
            onClick: async () => {
              try {
                const updated = await sendSubstitutionReminder(row.id).unwrap();
                updateSubstitution(row.id, () => mapApiSubstitution(updated));
                shikshaMitraToast.info({ message: 'Reminder sent to substitute teacher.' });
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to send reminder.';
                shikshaMitraToast.error({ message });
              }
            },
          },
          {
            id: 'change',
            label: 'Request change',
            icon: 'mdi:swap-horizontal',
            disabled: isClosed || !canManageSubstitutions,
            onClick: () => openAssignDialog(row.id),
          },
          {
            id: 'cancel',
            label: 'Cancel substitution',
            icon: 'mdi:cancel',
            color: 'error.main',
            disabled: isClosed || !canManageSubstitutions,
            onClick: () => updateSubstitutionStatus(row.id, 'Cancelled'),
          },
        ];

        return <AdaptiveThreeDotsActions actions={actions} placement="right-center" />;
      },
    },
  ];

  const availabilityColumns = [
    {
      id: 'teacherName',
      label: 'Teacher',
      filterType: 'string' as const,
      minWidth: 170,
      sticky: true,
      align: 'left' as const,
    },
    {
      id: 'departmentName',
      label: 'Department',
      filterType: 'string' as const,
      minWidth: 140,
      align: 'left' as const,
      render: (value: any) => value || '-',
    },
    {
      id: 'availabilityDate',
      label: 'Date',
      filterType: 'date' as const,
      minWidth: 120,
      align: 'left' as const,
      render: (value: any) => formatViewDate(value),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      filterType: 'string' as const,
      minWidth: 100,
      align: 'center' as const,
      render: (value: any) => value || '-',
    },
    {
      id: 'endTime',
      label: 'End Time',
      filterType: 'string' as const,
      minWidth: 100,
      align: 'center' as const,
      render: (value: any) => value || '-',
    },
    {
      id: 'sourceType',
      label: 'Source',
      filterType: 'enum' as const,
      enumOptions: sourceTypeOptions,
      minWidth: 130,
      align: 'center' as const,
      render: (value: any) =>
        value ? (
          <Label color="default" variant="soft">
            {value}
          </Label>
        ) : (
          '-'
        ),
    },
    {
      id: 'reason',
      label: 'Reason',
      filterType: 'string' as const,
      minWidth: 180,
      align: 'left' as const,
      render: (value: any) => value || '-',
    },
    {
      id: 'affectedLectureCount',
      label: 'Affected Lectures',
      filterType: 'number' as const,
      minWidth: 140,
      align: 'center' as const,
      render: (_value: any, row: any) => {
        const coverage = getAvailabilityCoverageState(row);
        const color =
          coverage.total <= 0 ? 'default' : coverage.uncovered <= 0 ? 'success' : 'warning';

        return (
          <Label color={color} variant="soft">
            {coverage.coverageLabel}
          </Label>
        );
      },
    },
    {
      id: 'attachmentName',
      label: 'Attachment',
      filterType: 'string' as const,
      minWidth: 140,
      align: 'left' as const,
      render: (value: any) =>
        value ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify
              icon="solar:paperclip-bold"
              width={14}
              height={14}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            />
            <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
              {value}
            </Typography>
          </Stack>
        ) : (
          '-'
        ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      filterType: 'string' as const,
      minWidth: 160,
      align: 'left' as const,
      render: (value: any) => value || '-',
    },
    {
      id: 'availabilityStatus',
      label: 'Status',
      filterType: 'enum' as const,
      sticky: true,
      stickyPosition: 'right' as const,
      enumOptions: availabilityStatusOptions,
      minWidth: 140,
      render: (value: any) => (
        <Label color={getAvailabilityStatusColor(value)} variant="soft">
          {value || 'Unavailable'}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 200,
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: any, row: any) => {
        const coverage = getAvailabilityCoverageState(row);

        if (coverage.canCreate && canManageSubstitutions) {
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus-circle-outline" width={16} />}
              onClick={() => handleCreateSubstitutionFromAvailability(row)}
            >
              Create Substitution
            </Button>
          );
        }

        return (
          <Label color={coverage.actionColor} variant="soft">
            {coverage.actionLabel}
          </Label>
        );
      },
    },
  ];

  const myDutyColumns = [
    {
      id: 'date',
      label: 'Date',
      filterType: 'date' as const,
      minWidth: 130,
      sticky: true,
      render: (value: any) => formatViewDate(value),
    },
    { id: 'period', label: 'Period', filterType: 'string' as const, minWidth: 100 },
    { id: 'time', label: 'Time', filterType: 'string' as const, minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      filterType: 'string' as const,
      minWidth: 120,
      render: (_value: any, row: any) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', filterType: 'string' as const, minWidth: 140 },
    {
      id: 'originalTeacherName',
      label: 'Covering For',
      filterType: 'string' as const,
      minWidth: 170,
    },
    {
      id: 'assignedRoomName',
      label: 'Room',
      filterType: 'string' as const,
      minWidth: 120,
      render: (value: any, row: any) => value || row.roomName,
    },
    { id: 'reason', label: 'Reason', filterType: 'string' as const, minWidth: 140 },
    {
      id: 'priority',
      label: 'Priority',
      filterType: 'enum' as const,
      enumOptions: priorityOptions,
      minWidth: 110,
      render: (value: SubstitutionPriority) => (
        <Label color={priorityColor[value]} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'acknowledgementStatus',
      label: 'Acknowledgement',
      filterType: 'enum' as const,
      enumOptions: acknowledgementOptions.filter((o) => o.value !== 'all'),
      minWidth: 160,
      render: (value: AcknowledgementStatus) => renderAck(value),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum' as const,
      enumOptions: statusOptions.filter((o) => o.value !== 'all'),
      sticky: true,
      stickyPosition: 'right' as const,
      minWidth: 140,
      render: (value: SubstitutionStatus) => renderStatus(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 240,
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, item: unknown) => (
        <TeacherDutyActions
          item={item as SubstitutionRow}
          pendingAction={dutyActions.pendingAction}
          onAction={dutyActions.open}
        />
      ),
    },
  ];

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
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            color: 'primary.main',
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

  const renderTimeline = (isBoardView = false) => (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={isBoardView ? { flexShrink: 0 } : undefined}>
        {renderSectionHeader(
          'mdi:clock-time-four-outline',
          'Today Timeline',
          <Chip size="small" label={`${todayRows.length} periods`} variant="outlined" />
        )}
      </Box>
      <Stack
        spacing={1}
        sx={isBoardView ? { flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 } : undefined}
      >
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
                flexShrink: 0,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.time}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      • {item.period} • {item.className}-{item.divisionName} • {item.subjectName}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      {item.originalTeacherName}
                    </Box>{' '}
                    →{' '}
                    <Box
                      component="span"
                      sx={{
                        color: item.substituteTeacherName ? 'text.primary' : 'warning.main',
                        fontWeight: item.substituteTeacherName ? 600 : 500,
                      }}
                    >
                      {item.substituteTeacherName || 'Not assigned'}
                    </Box>
                    {' · '}
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      Room {item.assignedRoomName || item.roomName}
                    </Box>
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  flexShrink={0}
                  flexWrap="wrap"
                >
                  <Label
                    color={statusColor[item.status]}
                    variant="soft"
                    sx={{ minWidth: 92, justifyContent: 'center', textAlign: 'center' }}
                  >
                    {item.status}
                  </Label>
                  {item.acknowledgementStatus && (
                    <Label
                      color={acknowledgementColor[item.acknowledgementStatus]}
                      variant="soft"
                      sx={{ minWidth: 92, justifyContent: 'center', textAlign: 'center' }}
                    >
                      {item.acknowledgementStatus}
                    </Label>
                  )}
                  {item.priority && (
                    <Label
                      color={priorityColor[item.priority]}
                      variant="outlined"
                      sx={{ minWidth: 72, justifyContent: 'center', textAlign: 'center' }}
                    >
                      {item.priority}
                    </Label>
                  )}
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
                  <Button
                    size="small"
                    startIcon={<Iconify icon="carbon:view" width={14} />}
                    sx={{ flexShrink: 0 }}
                  >
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
                  variant="soft"
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
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1}
        alignItems="stretch"
        sx={{ flex: 1, minHeight: 0, overflowX: 'auto', pb: 1 }}
      >
        {columns.map((column) => {
          const rows = filteredSubstitutions.filter((item) => item.status === column.key);
          return (
            <Card
              key={column.key}
              sx={{
                p: 1.5,
                borderRadius: 1,
                flex: 1,
                minWidth: 220,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5, flexShrink: 0 }}
              >
                <Typography variant="subtitle1">{column.label}</Typography>
                <Chip size="small" label={rows.length} variant="outlined" />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
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
                      flexShrink: 0,
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
                    {canManageSubstitutions && (
                      <Button
                        size="small"
                        fullWidth
                        variant="outlined"
                        startIcon={
                          <Iconify
                            icon={
                              item.substituteTeacherName
                                ? 'mdi:swap-horizontal'
                                : 'mdi:account-plus-outline'
                            }
                            width={16}
                          />
                        }
                        sx={{ mt: 1 }}
                        onClick={() => openAssignDialog(item.id)}
                      >
                        {item.substituteTeacherName ? 'Reassign' : 'Assign Teacher'}
                      </Button>
                    )}
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
    <Card
      sx={{
        p: 2,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1.5, flexShrink: 0 }}>
        Calendar View
      </Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}
      >
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
    if (boardView === 'timeline') return renderTimeline(true);
    if (boardView === 'calendar') return renderCalendarView();

    return (
      <CustomizableTable
        tableId="substitution-board-table"
        tableTitle="Substitution Board"
        data={filteredSubstitutions}
        columns={substitutionColumns}
        isLoading={isSubstitutionsLoading || isSubstitutionsFetching}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        sx={{ flexShrink: 0 }}
        heading="Substitution Management"
        description="Manage teacher unavailability, substitution duties and daily coverage."
        links={[
          { name: 'Dashboard', href: academicPaths.dashboard },
          { name: 'Timetable', href: academicPaths.timetable.management },
          { name: 'Substitution Management' },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TimetableSettingsSummaryCards cards={summaryCards} buttonSx={{ mb: 0 }} />
            {canManageSubstitutions && (
              <>
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
                    setCreateOriginMode('teacher');
                    setCreateTeacherOrigin(createDefaultTeacherOrigin());
                    setCameFromAvailability(false);
                    setCreateDialogOpen(true);
                  }}
                >
                  Create Substitution
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {/* ── Sticky Tabs Card ─────────────────────────────── */}
      <Card
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderRadius: 1,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <CustomTabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
          >
            <Tab
              value="board"
              label="Substitution Board"
              icon={<Iconify icon="mdi:view-dashboard-outline" width={20} />}
              iconPosition="start"
            />
            <Tab
              value="availability"
              label="Teacher Availability"
              icon={<Iconify icon="mdi:account-off-outline" width={20} />}
              iconPosition="start"
            />
            <Tab value="myDuties" label="My Duties" icon={<FactCheck />} iconPosition="start" />
          </CustomTabs>

          {/* Date Picker & Filters Button aligned on the right side of the Tabs row */}
          {(activeTab === 'board' || activeTab === 'availability') && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Tooltip title="Previous Day">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        activeTab === 'board'
                          ? setFilters((current) => ({
                              ...current,
                              filterDate: (current.filterDate || dayjs(todayIso)).subtract(
                                1,
                                'day'
                              ),
                            }))
                          : setAvailabilityDate((current) => current.subtract(1, 'day'))
                      }
                    >
                      <Iconify icon="solar:alt-arrow-left-bold" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <DatePicker
                  label=""
                  showCalendarMarkers={false}
                  value={activeTab === 'board' ? filters.filterDate : availabilityDate}
                  onChange={(newValue) =>
                    activeTab === 'board'
                      ? setFilters((current) => ({ ...current, filterDate: newValue }))
                      : newValue && setAvailabilityDate(newValue.startOf('day'))
                  }
                  slotProps={{
                    textField: {
                      size: 'small',
                      placeholder: 'Select Date',
                      sx: { width: 145 },
                    },
                  }}
                />
                <Tooltip title="Next Day">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        activeTab === 'board'
                          ? setFilters((current) => ({
                              ...current,
                              filterDate: (current.filterDate || dayjs(todayIso)).add(1, 'day'),
                            }))
                          : setAvailabilityDate((current) => current.add(1, 'day'))
                      }
                    >
                      <Iconify icon="solar:alt-arrow-right-bold" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Button
                size="small"
                variant={
                  (activeTab === 'board' ? filters.filterDate : availabilityDate) &&
                  dayjs(activeTab === 'board' ? filters.filterDate : availabilityDate).isSame(
                    dayjs(todayIso),
                    'day'
                  )
                    ? 'soft'
                    : 'outlined'
                }
                color="primary"
                startIcon={<Iconify icon="mdi:calendar-today" width={16} />}
                onClick={() =>
                  activeTab === 'board'
                    ? setFilters((current) => ({ ...current, filterDate: dayjs(todayIso) }))
                    : setAvailabilityDate(dayjs(todayIso))
                }
                sx={{
                  flexShrink: 0,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Today
              </Button>
              {activeTab === 'board' && (
                <FiltersBar
                  filters={filters}
                  onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
                  onReset={clearFilters}
                />
              )}
            </Stack>
          )}
        </Stack>

        {activeTab === 'board' && getActiveFilters(filters).length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
            }}
          >
            <SubstitutionActiveFilters
              filters={filters}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onReset={clearFilters}
            />
          </Box>
        )}
      </Card>

      {/* ── Scrollable Tab Content ───────────────────────── */}
      <Scrollbar
        fillContent
        sx={{ flex: 1, minHeight: 0 }}
        slotProps={{
          content: { display: 'flex', flexDirection: 'column', gap: '12px' } as any,
        }}
      >
        {activeTab === 'board' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {renderBoardContent()}
          </Box>
        )}

        {activeTab === 'availability' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <CustomizableTable
              tableId="teacher-availability-table"
              tableTitle="Teacher Availability"
              isLoading={isAvailabilityLoading || isAvailabilityFetching}
              data={teacherAvailability}
              columns={availabilityColumns}
            />
          </Box>
        )}

        {activeTab === 'myDuties' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <CustomizableTable
              tableId="my-duties-table"
              tableTitle="My Substitution Duties"
              data={myDutyRows}
              isLoading={isMyDutiesLoading || isMyDutiesFetching}
              columns={myDutyColumns}
            />
          </Box>
        )}

        {/* ── Action Menu ───────────────────────────── */}
        <Menu
          anchorEl={actionAnchor}
          open={Boolean(actionAnchor)}
          onClose={closeActionMenu}
          PaperProps={{ sx: { maxWidth: 300 } }}
        >
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
            disabled={
              !actionRow ||
              !actionRow.isResponseWindowOpen ||
              !['Waiting Ack', 'Assigned'].includes(actionRow.status) ||
              (!canManageSubstitutions &&
                actionRow.substituteTeacherName !== currentEmployee?.employeeName)
            }
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
              !actionRow ||
              !['Assigned', 'Waiting Ack', 'Acknowledged'].includes(actionRow.status) ||
              (!canManageSubstitutions &&
                actionRow.substituteTeacherName !== currentEmployee?.employeeName)
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
            disabled={
              !actionRow ||
              ['Completed', 'Cancelled'].includes(actionRow.status) ||
              !canManageSubstitutions
            }
            onClick={async () => {
              if (actionRow) {
                try {
                  const updated = await sendSubstitutionReminder(actionRow.id).unwrap();
                  updateSubstitution(actionRow.id, () => mapApiSubstitution(updated));
                  shikshaMitraToast.info({ message: 'Reminder sent to substitute teacher.' });
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : 'Unable to send reminder.';
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
            disabled={
              !actionRow ||
              ['Completed', 'Cancelled'].includes(actionRow.status) ||
              !canManageSubstitutions
            }
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

        <SubstitutionCreationOverlay
          open={createDialogOpen}
          displayAsDrawer={cameFromAvailability}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Create Substitution</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Select the affected lecture, review the auto-filled details, add one or more free substitute teachers from the list, then save as draft or assign and notify immediately."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
          onClose={handleCloseCreateDialog}
        >
          <DialogScrollContent>
            {isCreateDialogLoading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
              </Box>
            )}
            <Stack spacing={2}>
              <CreateSubstitutionModeTabs
                value={createOriginMode}
                onChange={handleCreateOriginModeChange}
              />
              {createOriginMode === 'teacher' ? (
                <SectionCard
                  title="Unavailable Teacher & Affected Lectures"
                  paperProps={{ sx: cardStyle }}
                  gridProps={{ spacing: 1 }}
                >
                  <TeacherFirstOriginFields
                    value={createTeacherOrigin}
                    reasonOptions={reasonOptions}
                    minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                    maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                    dateFormat={viewDateFormat}
                    loadingTeachers={isFetchingEmployeeOptions}
                    loadingShift={isCreateTeacherShiftFetching}
                    reasonError={createSubmitted && !!createFieldErrors.reason}
                    reasonHelperText={createSubmitted ? createFieldErrors.reason : ''}
                    fetchTeachers={fetchAvailabilityTeacherOptions}
                    onChange={handleCreateTeacherOriginChange}
                  />
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Affected lectures ({createAffectedLectures.length})
                    </Typography>
                    <AffectedLecturePicker
                      lectures={createAffectedLectures}
                      selectedLectureId={
                        substitutionForm.timetableSlotSubjectId || substitutionForm.period
                      }
                      hasTeacher={Boolean(
                        createTeacherOrigin.teacherId || createTeacherOrigin.teacherName
                      )}
                      hasAcademicMedium={Boolean(medium?.id)}
                      hasValidRange={isCreateOriginRangeValid}
                      invalidRangeMessage={
                        createTeacherOrigin.isFullDay
                          ? 'This teacher does not have a valid assigned shift. Assign a shift before selecting an affected lecture.'
                          : undefined
                      }
                      loading={isCreateAffectedLecturesLoading || isCreateAffectedLecturesFetching}
                      loadError={isCreateAffectedLecturesError}
                      onSelect={handleCreateAffectedLectureSelect}
                    />
                  </Grid>
                </SectionCard>
              ) : (
                <SectionCard
                  title="Lecture & Timetable Details"
                  paperProps={{ sx: cardStyle }}
                  gridProps={{ sx: { spacing: 0 } }}
                  headerContent={
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Select date, class, division and lecture slot for substitution.
                    </Typography>
                  }
                >
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker
                      label="Date *"
                      value={substitutionForm.date}
                      format={viewDateFormat}
                      disablePast
                      minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                      maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                      onChange={(value) => {
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
                        }));
                        setEmployeeSearchTerm('');
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: createSubmitted && !!createFieldErrors.date,
                          helperText: createSubmitted ? createFieldErrors.date : '',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CustomSelect
                      label="Class *"
                      options={classSelectOptions}
                      value={substitutionForm.standardId || substitutionForm.className}
                      error={createSubmitted && !!createFieldErrors.class}
                      helperText={createSubmitted ? createFieldErrors.class : ''}
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CustomSelect
                      label="Division *"
                      options={divisionSelectOptions}
                      value={substitutionForm.divisionId || substitutionForm.divisionName}
                      error={createSubmitted && !!createFieldErrors.division}
                      helperText={createSubmitted ? createFieldErrors.division : ''}
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Lecture Slot *"
                      options={lectureSelectOptions}
                      value={substitutionForm.timetableSlotSubjectId || substitutionForm.period}
                      error={createSubmitted && !!createFieldErrors.slot}
                      helperText={createSubmitted ? createFieldErrors.slot : ''}
                      disabled={
                        !substitutionForm.date ||
                        !substitutionForm.standardId ||
                        !substitutionForm.divisionId
                      }
                      noOptionsMessage="No lecture slots found for the selected date, class and division"
                      onChange={(value) => {
                        const lecture = createLectureResult.find(
                          (item) => item.slotSubjectId === value
                        );
                        const template = affectedLectureTemplates.find(
                          (item) => item.period === value
                        );
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Subject *"
                      options={subjectSelectOptions}
                      value={substitutionForm.subjectId || substitutionForm.subjectName}
                      error={createSubmitted && !!createFieldErrors.subject}
                      helperText={createSubmitted ? createFieldErrors.subject : ''}
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
                          originalTeacherId:
                            selected?.primaryTeacherId || current.originalTeacherId,
                          originalTeacherName:
                            selected?.primaryTeacherName || current.originalTeacherName,
                          substituteTeacherId: '',
                          substituteTeacherName: '',
                          selectedSubstitutes: [],
                        }));
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Original Teacher"
                      options={teacherSelectOptions}
                      value={
                        substitutionForm.originalTeacherId || substitutionForm.originalTeacherName
                      }
                      error={createSubmitted && !!createFieldErrors.originalTeacher}
                      helperText={createSubmitted ? createFieldErrors.originalTeacher : ''}
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Original Room"
                      options={roomSelectOptions}
                      value={substitutionForm.originalRoomId || substitutionForm.roomName}
                      error={createSubmitted && !!createFieldErrors.originalRoom}
                      helperText={createSubmitted ? createFieldErrors.originalRoom : ''}
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
                  </Grid>
                </SectionCard>
              )}

              <SectionCard
                title="Substitute Assignment"
                paperProps={{ sx: cardStyle }}
                gridProps={{ spacing: 1 }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    View free substitute teachers matching the slot criteria and assign coverage.
                  </Typography>
                }
              >
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1.5}
                      sx={{ mb: 1.5 }}
                    >
                      <Typography variant="subtitle2">Available Substitute Employees</Typography>
                      <TextField
                        size="small"
                        placeholder="Search employee..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: { xs: '100%', sm: 280 },
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                    <Scrollbar sx={{ maxHeight: 340, pr: 0.5 }}>
                      <Stack spacing={1}>
                        {!hasCreateLectureSelection && (
                          <Alert severity="info">
                            Select an affected lecture to load free employees.
                          </Alert>
                        )}
                        {hasCreateLectureSelection &&
                          suggestedTeacherRows.filter((teacher) =>
                            teacher.teacherName
                              .toLowerCase()
                              .includes(employeeSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <Alert severity="warning">
                              No employee is free for the selected slot. Try split coverage or
                              review timetable conflicts.
                            </Alert>
                          )}
                        {suggestedTeacherRows
                          .filter((teacher) =>
                            teacher.teacherName
                              .toLowerCase()
                              .includes(employeeSearchTerm.toLowerCase())
                          )
                          .map((teacher, index) => {
                            const isSelected = substitutionForm.selectedSubstitutes.some(
                              (item) => item.teacherId === teacher.teacherId
                            );
                            return (
                              <Box
                                key={teacher.teacherId}
                                sx={{
                                  p: 1.25,
                                  borderRadius: 1,
                                  bgcolor: 'background.paper',
                                  border: (theme) =>
                                    `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                                }}
                              >
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  justifyContent="space-between"
                                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                                  spacing={1}
                                >
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box
                                      sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.main',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        flexShrink: 0,
                                      }}
                                    >
                                      #{index + 1}
                                    </Box>
                                    <Box>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        flexWrap="wrap"
                                      >
                                        <Typography variant="subtitle2" fontWeight={700}>
                                          {teacher.teacherName}
                                        </Typography>
                                        <Label
                                          color={
                                            teacher.score >= 80
                                              ? 'success'
                                              : teacher.score >= 60
                                                ? 'info'
                                                : 'warning'
                                          }
                                          variant="soft"
                                        >
                                          {teacher.score}% Match
                                        </Label>
                                        <Label
                                          color={teacher.isPartialCoverage ? 'warning' : 'success'}
                                          variant="soft"
                                        >
                                          {teacher.isPartialCoverage
                                            ? `Partial ${getTeacherCoverageLabel(teacher)}`
                                            : `Free ${getTeacherCoverageLabel(teacher)}`}
                                        </Label>
                                      </Stack>
                                      <Typography
                                        variant="caption"
                                        color={
                                          teacher.hasConflict ? 'error.main' : 'text.secondary'
                                        }
                                        sx={{ mt: 0.25, display: 'block' }}
                                      >
                                        {teacher.hasConflict
                                          ? teacher.conflictReason
                                          : teacher.recommendationReason}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Button
                                    size="small"
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    color={isSelected ? 'error' : 'success'}
                                    startIcon={
                                      isSelected ? (
                                        <CloseIcon fontSize="small" />
                                      ) : (
                                        <Add fontSize="small" />
                                      )
                                    }
                                    disabled={
                                      !isSelected && teacher.conflictSeverity === 'Hard Block'
                                    }
                                    onClick={() => {
                                      setSubstitutionForm((current) => {
                                        const exists = current.selectedSubstitutes.some(
                                          (item) => item.teacherId === teacher.teacherId
                                        );
                                        if (exists) {
                                          return {
                                            ...current,
                                            selectedSubstitutes: current.selectedSubstitutes.filter(
                                              (item) => item.teacherId !== teacher.teacherId
                                            ),
                                            substituteTeacherId:
                                              current.substituteTeacherId === teacher.teacherId
                                                ? ''
                                                : current.substituteTeacherId,
                                            substituteTeacherName:
                                              current.substituteTeacherId === teacher.teacherId
                                                ? ''
                                                : current.substituteTeacherName,
                                          };
                                        }
                                        return {
                                          ...current,
                                          substituteTeacherId:
                                            current.selectedSubstitutes.length === 0
                                              ? teacher.teacherId
                                              : current.substituteTeacherId,
                                          substituteTeacherName:
                                            current.selectedSubstitutes.length === 0
                                              ? teacher.teacherName
                                              : current.substituteTeacherName,
                                          selectedSubstitutes: [
                                            ...current.selectedSubstitutes,
                                            {
                                              teacherId: teacher.teacherId,
                                              teacherName: teacher.teacherName,
                                              startTime: teacher.coverageStartTime || '',
                                              endTime: teacher.coverageEndTime || '',
                                              score: teacher.score,
                                              isPartialCoverage: teacher.isPartialCoverage || false,
                                            },
                                          ],
                                        };
                                      });
                                    }}
                                  >
                                    {isSelected ? 'Remove' : 'Add'}
                                  </Button>
                                </Stack>
                              </Box>
                            );
                          })}
                      </Stack>
                    </Scrollbar>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Substitute Teacher *"
                    options={availableTeacherSelectOptions}
                    value={
                      substitutionForm.substituteTeacherId || substitutionForm.substituteTeacherName
                    }
                    error={
                      createSubmitted &&
                      createSubmitType === 'assign' &&
                      !!createFieldErrors.substituteTeacher
                    }
                    helperText={
                      createSubmitted && createSubmitType === 'assign'
                        ? createFieldErrors.substituteTeacher
                        : ''
                    }
                    disabled={!hasCreateLectureSelection}
                    noOptionsMessage="No free employees found for this slot"
                    onChange={(value) => {
                      const selected = suggestedTeacherRows.find(
                        (item) => item.teacherId === value
                      );
                      if (selected) addSubstituteCoverage(selected);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
                </Grid>
              </SectionCard>
            </Stack>
          </DialogScrollContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={handleCloseCreateDialog}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              startIcon={<Send />}
              loading={isCreatingSubstitution && createSubmitType === 'assign'}
              disabled={isCreatingSubstitution}
              onClick={() => {
                setCreateSubmitType('assign');
                handleCreateSubstitution();
              }}
            >
              Assign & Notify
            </LoadingButton>
          </Stack>
        </SubstitutionCreationOverlay>

        <ConfirmDialog
          open={createUnsavedConfirmOpen}
          onClose={() => setCreateUnsavedConfirmOpen(false)}
          sx={cameFromAvailability ? { zIndex: (theme) => theme.zIndex.modal + 2 } : undefined}
          icon="warning"
          title="Unsaved Changes"
          content="You have unsaved substitution details. Closing now will discard them. Do you want to continue?"
          action={
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
              onClick={handleDiscardCreateDialog}
            >
              Discard and Close
            </Button>
          }
        />

        <Drawer
          anchor="right"
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 540, md: 620 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            },
          }}
        >
          {/* Drawer Header */}
          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Assign Substitute Teacher
              </Typography>
              <CustomTooltip
                arrow
                placement="bottom-start"
                title={
                  <Box sx={{ p: 1, maxWidth: 320 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                      How Substitute Recommendations Work
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                      • <strong>Match Score:</strong> Calculated based on subject expertise, period
                      availability, and current daily/weekly workload.
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                      • <strong>Same Subject:</strong> Highlights teachers with subject
                      specialization for this class.
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                      • <strong>Free This Period:</strong> Confirms the teacher has no conflicting
                      class, meeting, or leave.
                    </Typography>
                    <Typography variant="caption" display="block">
                      • <strong>Assign &amp; Notify:</strong> Saves the substitution duty and
                      dispatches an instant notification to the teacher.
                    </Typography>
                  </Box>
                }
              >
                <IconButton size="small" color="info">
                  <Iconify icon="lucide:info" width={18} />
                </IconButton>
              </CustomTooltip>
            </Stack>
            <IconButton size="small" onClick={() => setAssignDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Selected Period Info Banner */}
          {selectedSubstitution && (
            <Box
              sx={{
                px: 2.5,
                py: 1.75,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                    color: 'info.main',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:clock-time-four-outline" width={20} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {selectedSubstitution.period} • Class {selectedSubstitution.className}-
                    {selectedSubstitution.divisionName} • {selectedSubstitution.subjectName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    Original Teacher: {selectedSubstitution.originalTeacherName} • Room{' '}
                    {selectedSubstitution.roomName}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Suggested Candidates Scrollable Area */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 2.5,
              pb: 3.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              sx={{ flexShrink: 0 }}
            >
              Available Candidates ({suggestedTeacherRows.length})
            </Typography>

            {suggestedTeacherRows.map((teacher, index) => {
              const selected = selectedTeacherId === teacher.teacherId;
              return (
                <Box
                  key={teacher.teacherId}
                  onClick={() => {
                    if (!teacher.hasConflict) {
                      setSelectedTeacherId((prev) =>
                        prev === teacher.teacherId ? '' : teacher.teacherId
                      );
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    flexShrink: 0,
                    cursor: teacher.hasConflict ? 'not-allowed' : 'pointer',
                    border: (theme) =>
                      `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: (theme) =>
                      selected
                        ? alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.18 : 0.04
                          )
                        : 'background.paper',
                    boxShadow: selected
                      ? (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.14)}`
                      : (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
                    transition: 'all 0.15s ease-in-out',
                    opacity: teacher.hasConflict ? 0.6 : 1,
                    '&:hover': !teacher.hasConflict
                      ? {
                          borderColor: (theme) =>
                            selected ? theme.palette.primary.main : theme.palette.primary.light,
                          boxShadow: (theme) =>
                            `0 3px 10px ${alpha(theme.palette.common.black, 0.08)}`,
                        }
                      : undefined,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          bgcolor: (theme) =>
                            selected ? 'primary.main' : alpha(theme.palette.primary.main, 0.08),
                          color: selected ? 'primary.contrastText' : 'primary.main',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        #{index + 1}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700}>
                            {teacher.teacherName}
                          </Typography>
                          <Label
                            color={
                              teacher.score >= 80
                                ? 'success'
                                : teacher.score >= 60
                                  ? 'info'
                                  : 'warning'
                            }
                            variant="soft"
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          >
                            {teacher.score}% Match
                          </Label>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {teacher.departmentName} • Load: {teacher.loadStatus}
                        </Typography>
                      </Box>
                    </Stack>

                    <Iconify
                      icon={selected ? 'solar:check-circle-bold' : 'solar:circle-linear'}
                      width={22}
                      color={selected ? 'primary.main' : 'text.disabled'}
                      sx={{ mt: 0.5, flexShrink: 0 }}
                    />
                  </Stack>

                  {/* Badges Stack */}
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                    {teacher.canTeachSubject && (
                      <Label color="success" variant="soft">
                        Same Subject
                      </Label>
                    )}
                    {!teacher.hasConflict && (
                      <Label color="info" variant="soft">
                        Free This Period
                      </Label>
                    )}
                    <Label
                      color="default"
                      variant="outlined"
                      sx={{ borderColor: 'divider', color: 'text.secondary', fontWeight: 500 }}
                    >
                      Today: {teacher.todaySubstitutionCount}
                    </Label>
                    <Label
                      color="default"
                      variant="outlined"
                      sx={{ borderColor: 'divider', color: 'text.secondary', fontWeight: 500 }}
                    >
                      Week: {teacher.weekSubstitutionCount}
                    </Label>
                    {renderConflict(teacher.conflictSeverity, teacher.conflictReason)}
                  </Stack>

                  <Typography
                    variant="caption"
                    color={teacher.hasConflict ? 'error.main' : 'text.secondary'}
                    sx={{ mt: 1.25, display: 'block', lineHeight: 1.3 }}
                  >
                    {teacher.hasConflict ? teacher.conflictReason : teacher.recommendationReason}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Sticky Assignment Options Panel (Always visible above footer with solid background) */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              boxShadow: (theme) => `0 -4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            <Accordion
              defaultExpanded={Boolean(assignRoom || assignRemarks)}
              disableGutters
              sx={{
                bgcolor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  p: 0,
                  minHeight: 'auto',
                  '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center' },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:settings-bold" color="primary.main" width={18} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Assignment Options (Room &amp; Remarks)
                    </Typography>
                  </Stack>
                  {(assignRoom || assignRemarks) && (
                    <Label color="primary" variant="soft" sx={{ mr: 1, fontSize: 10 }}>
                      Configured
                    </Label>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 1.5, pb: 0 }}>
                <Stack spacing={1.5}>
                  <CustomSelect
                    label="Room Change (Optional)"
                    options={[{ value: '', label: 'Keep current room' }, ...roomOptions]}
                    value={assignRoom}
                    onChange={(value) => setAssignRoom(value as string)}
                  />
                  <TextField
                    size="small"
                    label="Remarks / Instruction for Teacher"
                    placeholder="Add notes or specific instructions..."
                    value={assignRemarks}
                    onChange={(event) => setAssignRemarks(event.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Drawer Footer Actions */}
          <Divider sx={{ flexShrink: 0 }} />
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ p: 2.5, bgcolor: 'background.paper', flexShrink: 0 }}
          >
            <Button
              size="small"
              variant="outlined"
              disabled={isAssigning}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={isAssigning}
              startIcon={<Send />}
              size="small"
              onClick={handleAssignTeacher}
            >
              Assign &amp; Notify
            </LoadingButton>
          </Stack>
        </Drawer>

        <CustomDialog
          open={availabilityDialogOpen}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Mark Teacher Unavailable</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Mark a teacher unavailable for a date and time range. Affected lectures are detected for manual substitution assignment."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
          maxWidth="md"
          handleClose={handleCloseAvailabilityDialog}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              <SectionCard
                title="Teacher & Schedule Details"
                paperProps={{ sx: cardStyle }}
                gridProps={{ spacing: 1 }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select teacher and date/time duration for marking unavailability.
                  </Typography>
                }
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <PaginatedSearchSelect<EmployeeOption>
                    label="Teacher *"
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
                    getOptionDisabled={(option) => Boolean(getTeacherAvailabilityConflict(option))}
                    renderOption={(optionProps, option) => {
                      const conflict = getTeacherAvailabilityConflict(option);
                      return (
                        <li {...optionProps}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ width: '100%' }}
                          >
                            <Typography variant="body2">{option.label}</Typography>
                            {conflict && (
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                label={`Unavailable ${conflict.startTime}-${conflict.endTime}`}
                              />
                            )}
                          </Stack>
                        </li>
                      );
                    }}
                    minChars={0}
                    debounceMs={1500}
                    size="small"
                    fullWidth
                    error={availabilitySubmitted && !!availabilityFieldErrors.teacherName}
                    helperText={
                      availabilitySubmitted
                        ? availabilityFieldErrors.teacherName
                        : unavailableTeacherCount > 0
                          ? `${unavailableTeacherCount} employee(s) already unavailable during this time. They are disabled.`
                          : ''
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Date *"
                    value={availabilityForm.availabilityDate}
                    format={viewDateFormat}
                    disablePast
                    minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                    maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                    onChange={(value) =>
                      setAvailabilityForm((current) => ({ ...current, availabilityDate: value }))
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: availabilitySubmitted && !!availabilityFieldErrors.availabilityDate,
                        helperText: availabilitySubmitted
                          ? availabilityFieldErrors.availabilityDate
                          : '',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={availabilityForm.isFullDay}
                        onChange={(event) =>
                          setAvailabilityForm((current) => ({
                            ...current,
                            isFullDay: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Full Day Unavailability"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TimePicker
                    label="Start Time *"
                    value={
                      availabilityForm.isFullDay
                        ? dayjs('2000-01-01T09:00')
                        : availabilityForm.startTime
                          ? dayjs(`2000-01-01T${availabilityForm.startTime}`)
                          : null
                    }
                    disabled={availabilityForm.isFullDay}
                    onChange={(newValue: Dayjs | null) => {
                      setAvailabilityForm((current) => ({
                        ...current,
                        startTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                      }));
                    }}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          availabilitySubmitted &&
                          !availabilityForm.isFullDay &&
                          !!availabilityFieldErrors.time,
                        helperText:
                          availabilitySubmitted && !availabilityForm.isFullDay
                            ? availabilityFieldErrors.time
                            : '',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TimePicker
                    label="End Time *"
                    value={
                      availabilityForm.isFullDay
                        ? dayjs('2000-01-01T14:15')
                        : availabilityForm.endTime
                          ? dayjs(`2000-01-01T${availabilityForm.endTime}`)
                          : null
                    }
                    disabled={availabilityForm.isFullDay}
                    onChange={(newValue: Dayjs | null) => {
                      setAvailabilityForm((current) => ({
                        ...current,
                        endTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                      }));
                    }}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          availabilitySubmitted &&
                          !availabilityForm.isFullDay &&
                          !!availabilityFieldErrors.time,
                        helperText:
                          availabilitySubmitted && !availabilityForm.isFullDay
                            ? availabilityFieldErrors.time
                            : '',
                      },
                    }}
                  />
                </Grid>
              </SectionCard>

              <SectionCard
                title={
                  isAffectedLecturesLoading || isAffectedLecturesFetching
                    ? 'Affected Lectures'
                    : !availabilityForm.teacherId && !availabilityForm.teacherName
                      ? 'Affected Lectures'
                      : `Affected Lectures (${affectedLectures.length})`
                }
                paperProps={{ sx: cardStyle }}
                gridProps={{ spacing: 1 }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Lectures affected by teacher unavailability for the selected date and period.
                  </Typography>
                }
              >
                <Grid size={{ xs: 12 }}>
                  {isAffectedLecturesLoading || isAffectedLecturesFetching ? (
                    <Stack spacing={1}>
                      {[1, 2, 3].map((index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={1}
                          >
                            <Box sx={{ width: '60%' }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Skeleton variant="text" width={140} height={24} />
                                <Skeleton variant="rounded" width={80} height={22} />
                                <Skeleton variant="rounded" width={70} height={22} />
                              </Stack>
                              <Skeleton variant="text" width={240} height={18} sx={{ mt: 0.5 }} />
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Skeleton variant="rounded" width={110} height={24} />
                              <Skeleton variant="rounded" width={130} height={32} />
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : !availabilityForm.teacherId && !availabilityForm.teacherName ? (
                    <Alert severity="info">
                      Please select a teacher to view affected lectures.
                    </Alert>
                  ) : affectedLectures.length === 0 ? (
                    <Alert severity="info">
                      No affected lectures found for the selected teacher and time range.
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      {affectedLectures.map((lecture) => (
                        <Box
                          key={lecture.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={1}
                          >
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {lecture.period} (
                                  {lecture.time || `${lecture.startTime}-${lecture.endTime}`})
                                </Typography>
                                <Chip
                                  size="small"
                                  label={`Class ${lecture.className}-${lecture.divisionName}`}
                                  color="primary"
                                  variant="soft"
                                />
                                <Chip
                                  size="small"
                                  label={lecture.subjectName}
                                  color="info"
                                  variant="soft"
                                />
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.5, display: 'block' }}
                              >
                                Room: {lecture.roomName || 'Not assigned'} • Original Teacher:{' '}
                                {lecture.teacherName}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Label
                                color={
                                  lecture.canCreateSubstitution !== false ? 'warning' : 'success'
                                }
                                variant="soft"
                              >
                                {lecture.canCreateSubstitution !== false
                                  ? 'Needs Substitution'
                                  : 'Substitution Exists'}
                              </Label>
                              {lecture.canCreateSubstitution !== false && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Add fontSize="small" />}
                                  onClick={() =>
                                    openSubstitutionForLecture(lecture, {
                                      availabilityDate:
                                        availabilityForm.availabilityDate || dayjs(),
                                      teacherId: availabilityForm.teacherId,
                                      teacherName: availabilityForm.teacherName,
                                      departmentName: availabilityForm.departmentName,
                                      reason: availabilityForm.reason || 'Teacher Unavailable',
                                      remarks: availabilityForm.remarks,
                                      sourceType: availabilityForm.sourceType,
                                      isFullDay: availabilityForm.isFullDay,
                                      availabilityStartTime: availabilityForm.startTime,
                                      availabilityEndTime: availabilityForm.endTime,
                                      openAsDrawer: true,
                                    })
                                  }
                                >
                                  Create Substitution
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Grid>
              </SectionCard>

              <SectionCard
                title="Status & Automation Settings"
                paperProps={{ sx: cardStyle }}
                gridProps={{ spacing: 1 }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Configure unavailability type and automated workflow actions.
                  </Typography>
                }
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Availability Status *"
                    options={availabilityStatusOptions}
                    value={availabilityForm.availabilityStatus}
                    onChange={(value) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        availabilityStatus: value as string,
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Source"
                    options={sourceTypeOptions}
                    value={availabilityForm.sourceType}
                    onChange={(value) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        sourceType: value as string,
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                </Grid>
              </SectionCard>

              <SectionCard
                title="Reason & Additional Notes"
                paperProps={{ sx: cardStyle }}
                gridProps={{ spacing: 1 }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Provide mandatory reason and any attachments or additional remarks.
                  </Typography>
                }
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    size="small"
                    label="Reason *"
                    value={availabilityForm.reason}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({ ...current, reason: event.target.value }))
                    }
                    error={availabilitySubmitted && !!availabilityFieldErrors.reason}
                    helperText={availabilitySubmitted ? availabilityFieldErrors.reason : ''}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    label="Remarks"
                    value={availabilityForm.remarks}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        remarks: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Grid>
              </SectionCard>
            </Stack>
          </DialogScrollContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={handleCloseAvailabilityDialog}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              startIcon={<Send />}
              loading={isCreatingAvailability}
              onClick={handleMarkUnavailable}
            >
              Save and Notify
            </LoadingButton>
          </Stack>
        </CustomDialog>

        <ConfirmDialog
          open={availabilityUnsavedConfirmOpen}
          onClose={() => setAvailabilityUnsavedConfirmOpen(false)}
          icon="warning"
          title="Unsaved Changes"
          content="You have unsaved teacher unavailability details. Closing now will discard them. Do you want to continue?"
          action={
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
              onClick={handleDiscardAvailabilityDialog}
            >
              Discard and Close
            </Button>
          }
        />

        <CustomDialog
          open={auditDialogOpen}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Audit &amp; Activity Log
              </Typography>
              <CustomTooltip
                arrow
                title="Track all historical changes, status transitions, and user actions for this substitution duty."
              >
                <IconButton size="small" color="info">
                  <Iconify icon="lucide:info" width={18} />
                </IconButton>
              </CustomTooltip>
            </Box>
          }
          maxWidth="sm"
          handleClose={() => setAuditDialogOpen(false)}
        >
          <DialogScrollContent>
            {selectedSubstitution && (
              <Box
                sx={{
                  p: 1.75,
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.18)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {selectedSubstitution.period} • Class {selectedSubstitution.className}-
                  {selectedSubstitution.divisionName} • {selectedSubstitution.subjectName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Original Teacher: {selectedSubstitution.originalTeacherName} | Room{' '}
                  {selectedSubstitution.roomName}
                </Typography>
              </Box>
            )}

            <Stack spacing={2} sx={{ position: 'relative', px: 1, py: 0.5 }}>
              {(!selectedSubstitution?.auditLog || selectedSubstitution.auditLog.length === 0) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 3 }}
                >
                  No audit log entries available for this duty.
                </Typography>
              )}

              {selectedSubstitution?.auditLog.map((entry, index, array) => {
                const actionLower = entry.action.toLowerCase();
                let icon = 'solar:history-bold';
                let color: 'error' | 'warning' | 'success' | 'info' | 'primary' = 'primary';

                if (actionLower.includes('rejected') || actionLower.includes('cancelled')) {
                  icon = 'solar:close-circle-bold';
                  color = 'error';
                } else if (
                  actionLower.includes('change requested') ||
                  actionLower.includes('conflict')
                ) {
                  icon = 'solar:swap-horizontal-bold';
                  color = 'warning';
                } else if (
                  actionLower.includes('assigned') ||
                  actionLower.includes('accepted') ||
                  actionLower.includes('completed')
                ) {
                  icon = 'solar:user-check-bold';
                  color = 'success';
                } else if (
                  actionLower.includes('created') ||
                  actionLower.includes('notification')
                ) {
                  icon = 'solar:add-circle-bold';
                  color = 'info';
                }

                const isLast = index === array.length - 1;

                return (
                  <Stack
                    key={`${entry.at}-${index}`}
                    direction="row"
                    spacing={2}
                    sx={{ position: 'relative' }}
                  >
                    {/* Connecting Vertical Line */}
                    {!isLast && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 17,
                          top: 36,
                          bottom: -16,
                          width: 2,
                          bgcolor: 'divider',
                        }}
                      />
                    )}

                    {/* Status Node Icon */}
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
                        color: `${color}.main`,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      <Iconify icon={icon} width={18} />
                    </Box>

                    {/* Entry Card */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.75,
                        borderRadius: 1.5,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        boxShadow: (theme) =>
                          `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.75 }}
                      >
                        <Label
                          color="default"
                          variant="soft"
                          sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                        >
                          {entry.actor}
                        </Label>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {entry.at}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.8125rem',
                          color: 'text.primary',
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {entry.action}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </DialogScrollContent>
          <Divider />
          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ p: 2, bgcolor: 'background.paper' }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
              onClick={() => setAuditDialogOpen(false)}
            >
              Close
            </Button>
          </Stack>
        </CustomDialog>

        <DutyActionDialog controller={dutyActions} />
      </Scrollbar>
    </Box>
  );
};

export default SubstitutionManagementScreen;
