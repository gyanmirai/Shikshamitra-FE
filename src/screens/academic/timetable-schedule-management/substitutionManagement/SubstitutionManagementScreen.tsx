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
  ApiSubstitutionSettings,
  ApiTeacherAvailabilityRow,
  ApiSubstitutionCreateMetadata,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Add,
  Save,
  Send,
  Print,
  MoreVert,
  FactCheck,
  PersonOff,
  AutoAwesome,
  AssignmentInd,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
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
  Drawer,
  Switch,
  Button,
  Tooltip,
  Divider,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  IconButton,
  CardContent,
  ToggleButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
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

const DUTY_ACTION_REASON_MIN_LENGTH = 5;

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

// Build a user-friendly message for a failed teacher duty action.
// RTK Query rejects with a plain SerializedError/FetchBaseQueryError object
// (never a real `Error`), so `error instanceof Error` never matches. Detect
// network/CORS failures (status FETCH_ERROR or a raw fetch message) and
// otherwise fall back to the backend ProblemDetails detail.
const NETWORK_ERROR_PATTERN = /failed to fetch|networkerror|network error/i;
const resolveDutyActionErrorMessage = (error: unknown, fallback = 'Unable to update duty.') => {
  const anyError = error as { status?: unknown; message?: unknown };
  const status = anyError?.status;
  const message = typeof anyError?.message === 'string' ? anyError.message : '';
  const isNetworkError = status === 'FETCH_ERROR' || NETWORK_ERROR_PATTERN.test(message);
  if (isNetworkError) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  return parseApiProblemDetail(error).detail || fallback;
};

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
  const isViewportTab = ['board', 'availability', 'dailySheet'].includes(activeTab);
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
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createSubmitType, setCreateSubmitType] = useState<'draft' | 'assign' | null>(null);
  const [substitutionForm, setSubstitutionForm] = useState(defaultSubstitutionForm);
  const [availabilityForm, setAvailabilityForm] = useState(defaultAvailabilityForm);

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

  const [settingsForm, setSettingsForm] = useState(settingsResultDefaults);
  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionRowId, setActionRowId] = useState('');
  const [dutyAction, setDutyAction] = useState<{
    id: string;
    action: 'accept' | 'reject' | 'change';
  } | null>(null);
  const [dutyConfirmOpen, setDutyConfirmOpen] = useState(false);
  const [dutyConfirmPayload, setDutyConfirmPayload] = useState<{
    id: string;
    action: 'accept' | 'reject' | 'change';
  } | null>(null);
  const [dutyConfirmNote, setDutyConfirmNote] = useState('');
  const [createFormDirty, setCreateFormDirty] = useState(false);
  const [createUnsavedConfirmOpen, setCreateUnsavedConfirmOpen] = useState(false);
  const [availabilityFormDirty, setAvailabilityFormDirty] = useState(false);
  const [availabilityUnsavedConfirmOpen, setAvailabilityUnsavedConfirmOpen] = useState(false);
  const [availabilitySubmitted, setAvailabilitySubmitted] = useState(false);
  const [dutyLoadingId, setDutyLoadingId] = useState<string | null>(null);
  const [dutyLoadingAction, setDutyLoadingAction] = useState<'accept' | 'reject' | 'change' | null>(
    null
  );
  const createFormSnapshotRef = useRef<string>(JSON.stringify(defaultSubstitutionForm));
  const availabilityFormSnapshotRef = useRef<string>(JSON.stringify(defaultAvailabilityForm));
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicContextParams = {
    academicYearId: currentYear?.id || undefined,
    academicMediumId: medium?.id || undefined,
  };
  const { data: substitutionResult, refetch: refetchSubstitutions } = useSubstitutionsDataQuery({
    ...academicContextParams,
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: dashboardResult, refetch: refetchDashboard } = useSubstitutionDashboardDataQuery({
    ...academicContextParams,
    date: toDateTimeOffset(dayjs(todayIso).startOf('day')),
  });
  const { data: myDutiesResult, refetch: refetchMyDuties } = useMySubstitutionDutiesDataQuery({
    ...academicContextParams,
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: availabilityResult } = useTeacherAvailabilityDataQuery({
    fromDate: toDateTimeOffset(dayjs().subtract(30, 'day').startOf('day')),
    toDate: toDateTimeOffset(dayjs().add(30, 'day').endOf('day')),
    maxResultCount: 200,
  });
  const { data: rawCreateMetadata } = useSubstitutionCreateMetadataDataQuery(
    academicContextParams,
    { skip: !medium?.id }
  );
  const createMetadata = rawCreateMetadata as ApiSubstitutionCreateMetadata | undefined;
  const { data: rawCreateLectureResult } = useSubstitutionLecturesDataQuery(
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
  const createLectureResult = (rawCreateLectureResult ?? []) as ApiSubstitutionLecture[];
  const { data: suggestedTeacherResult } = useSuggestedTeachersDataQuery(selectedSubstitutionId, {
    skip: !selectedSubstitutionId || !assignDialogOpen,
  });
  const selectedCreateLecture = createLectureResult.find(
    (lecture) => lecture.slotSubjectId === substitutionForm.timetableSlotSubjectId
  );
  const { data: createSuggestedTeacherResult } = useSuggestedTeachersByContextDataQuery(
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
        !(selectedCreateLecture || (substitutionForm.startTime && substitutionForm.endTime)) ||
        !substitutionForm.originalTeacherName,
    }
  );
  const { data: affectedLectureResult } = useAffectedLecturesDataQuery(
    {
      teacherId: availabilityForm.teacherId || undefined,
      teacherName: availabilityForm.teacherName || undefined,
      availabilityDate: toDateTimeOffset(availabilityForm.availabilityDate?.startOf('day')),
      startTime: availabilityForm.isFullDay ? '09:00' : availabilityStartTimeStr,
      endTime: availabilityForm.isFullDay ? '14:15' : availabilityEndTimeStr,
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
  const [assignSubstitute, { isLoading: isAssigning }] = useAssignSubstituteAction();
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
        academicYearId: currentYear?.id || undefined,
        academicMediumId: medium?.id || undefined,
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
    if (settingsResult) {
      setSettingsForm(settingsResult);
    }
  }, [settingsResult]);

  const metadataStandards = createMetadata?.standards ?? [];
  const metadataDivisions = createMetadata?.divisions ?? [];
  const metadataSubjects = createMetadata?.subjects ?? [];
  const metadataTeachers = createMetadata?.teachers ?? [];
  const metadataRooms = createMetadata?.rooms ?? [];
  const academicStandards: Standards[] =
    medium?.educationMediumStages?.flatMap((stage: Organization) => stage?.standards || []) || [];
  const selectedAcademicStandard = academicStandards.find(
    (item: Standards) => item.id === substitutionForm.standardId
  );
  const classSelectOptions: SelectOption[] = academicStandards.length
    ? academicStandards.map((item: Standards) => ({ value: item.id, label: item.name }))
    : uniqueLookupOptions(metadataStandards).map((item) => ({
        value: item.id,
        label: item.name,
      }));
  const divisionSelectOptions: SelectOption[] = selectedAcademicStandard?.divisions?.length
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
    availabilityStartTimeStr,
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
        label: 'Change Requested',
        value: changeRequested,
        helper: changeRequested
          ? 'Teachers requested reassignment — action needed'
          : 'No change requests',
        icon: 'mdi:swap-horizontal-bold',
        color: changeRequested ? 'error' : 'success',
        progress: changeRequested ? 50 : 100,
        filterStatus: 'Pending',
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

  const handleCreateSubstitution = useCallback(
    async (assignNow: boolean) => {
      if (
        !substitutionForm.date ||
        !substitutionForm.standardId ||
        !substitutionForm.divisionId ||
        !substitutionForm.timetableSlotSubjectId ||
        !substitutionForm.subjectId ||
        !substitutionForm.originalTeacherName ||
        !substitutionForm.roomName ||
        !substitutionForm.reason
      ) {
        setFormError(
          'Date, class, division, slot, subject, original teacher, room and reason are required.'
        );
        return;
      }

      if (substitutionForm.date) {
        const dateVal = substitutionForm.date;
        if (!dayjs(dateVal).isValid()) {
          setFormError('Date must be a valid date.');
          return;
        }
        if (dayjs(dateVal).isBefore(dayjs(), 'day')) {
          setFormError('Date cannot be in the past.');
          return;
        }
        if (
          currentYear?.startDate &&
          dayjs(dateVal).isBefore(dayjs(currentYear.startDate), 'day')
        ) {
          setFormError(
            `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`
          );
          return;
        }
        if (currentYear?.endDate && dayjs(dateVal).isAfter(dayjs(currentYear.endDate), 'day')) {
          setFormError(
            `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
          );
          return;
        }
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
        setIsCreateSubmitting(true);
        setCreateSubmitType(assignNow ? 'assign' : 'draft');
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
      } finally {
        setIsCreateSubmitting(false);
        setCreateSubmitType(null);
      }
    },
    [
      createSubstitution,
      selectedCreateLecture,
      substitutionForm,
      substitutions,
      suggestedTeacherRows,
      currentYear,
      medium?.id,
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
  }, [
    availabilityForm,
    availabilityStartTime,
    availabilityEndTime,
    hasAvailabilityFieldErrors,
    createTeacherAvailability,
    teacherAvailability,
  ]);

  const handleCloseCreateDialog = useCallback(() => {
    if (createFormDirty) {
      setCreateUnsavedConfirmOpen(true);
    } else {
      setCreateDialogOpen(false);
    }
  }, [createFormDirty]);

  const handleDiscardCreateDialog = useCallback(() => {
    setCreateUnsavedConfirmOpen(false);
    setCreateDialogOpen(false);
  }, []);

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

  const openDutyConfirmModal = useCallback((id: string, action: 'accept' | 'reject' | 'change') => {
    setDutyConfirmPayload({ id, action });
    setDutyConfirmNote('');
    setDutyConfirmOpen(true);
  }, []);

  const closeDutyConfirmModal = useCallback(() => {
    setDutyConfirmOpen(false);
    setDutyConfirmPayload(null);
    setDutyConfirmNote('');
  }, []);

  const handleTeacherDutyAction = useCallback(
    async (id: string, action: 'accept' | 'reject' | 'change', reason: string) => {
      if (dutyAction) return;
      setDutyAction({ id, action });
      try {
        const updated =
          action === 'accept'
            ? await acknowledgeSubstitution({
                id,
                reason: reason || undefined,
              }).unwrap()
            : action === 'reject'
              ? await rejectSubstitutionDuty({
                  id,
                  reason,
                }).unwrap()
              : await requestSubstitutionChange({
                  id,
                  reason,
                }).unwrap();
        if (updated) {
          updateSubstitution(id, () => mapApiSubstitution(updated));
        }
        await Promise.all([refetchMyDuties?.(), refetchSubstitutions?.(), refetchDashboard?.()]);
        shikshaMitraToast.success({
          message:
            action === 'accept'
              ? 'Substitution duty accepted successfully.'
              : action === 'reject'
                ? 'Substitution duty rejected and admin notified.'
                : 'Substitution change request sent to admin successfully.',
        });
      } catch (error) {
        const message = resolveDutyActionErrorMessage(
          error,
          'Failed to update substitution duty status.'
        );
        shikshaMitraToast.error({ message });
      } finally {
        setDutyAction(null);
      }
    },
    [
      dutyAction,
      acknowledgeSubstitution,
      rejectSubstitutionDuty,
      requestSubstitutionChange,
      updateSubstitution,
      refetchMyDuties,
      refetchSubstitutions,
      refetchDashboard,
    ]
  );

  const handleDutyConfirmSubmit = useCallback(async () => {
    if (!dutyConfirmPayload) return;
    closeDutyConfirmModal();
    await handleTeacherDutyAction(
      dutyConfirmPayload.id,
      dutyConfirmPayload.action,
      dutyConfirmNote.trim()
    );
  }, [dutyConfirmPayload, dutyConfirmNote, closeDutyConfirmModal, handleTeacherDutyAction]);

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
        <Chip label={value} size="small" color={priorityColor[value]} variant="soft" />
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
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(4, 1fr)',
        md: 'repeat(7, 1fr)',
      }}
      gap={1}
    >
      {metrics.map((item) => (
        <Card
          key={item.label}
          sx={{
            height: '100%',
            borderRadius: 1.5,
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) =>
              varAlpha(
                theme.vars.palette[item.color as 'success']?.mainChannel ||
                  theme.vars.palette.text.primaryChannel,
                theme.palette.mode === 'dark' ? 0.12 : 0.04
              ),
            cursor: item.filterStatus ? 'pointer' : 'default',
            transition: 'all 0.15s ease-in-out',
            '&:hover': item.filterStatus
              ? {
                  borderColor: `${item.color}.main`,
                  bgcolor: (theme) =>
                    varAlpha(
                      theme.vars.palette[item.color as 'success']?.mainChannel ||
                        theme.vars.palette.text.primaryChannel,
                      theme.palette.mode === 'dark' ? 0.18 : 0.08
                    ),
                  boxShadow: (theme) =>
                    `0 4px 12px ${varAlpha(theme.vars.palette[item.color as 'success']?.mainChannel ?? theme.vars.palette.common.blackChannel, 0.12)}`,
                }
              : undefined,
          }}
          onClick={() => {
            if (item.filterStatus) {
              setFilters((prev) => ({ ...prev, statusFilter: item.filterStatus as any }));
              setActiveTab('board');
            }
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: 'text.primary', lineHeight: 1.1 }}
              >
                {item.value}
              </Typography>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) =>
                    varAlpha(
                      theme.vars.palette[item.color as 'success']?.mainChannel ||
                        theme.vars.palette.primary.mainChannel,
                      0.08
                    ),
                  color: `${item.color}.main`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={15} />
              </Box>
            </Stack>

            <Tooltip title={item.label}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            </Tooltip>

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 11,
                mt: 0.5,
                lineHeight: 1.2,
                minHeight: '1.2em',
              }}
            >
              {item.helper}
            </Typography>
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
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        sx={{ flexShrink: 0 }}
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

      <Accordion
        defaultExpanded
        disableGutters
        sx={{
          borderRadius: '8px !important',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          flexShrink: 0,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 44,
            '& .MuiAccordionSummary-content': { my: 0.75, alignItems: 'center' },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              Substitution Overview & Metrics
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>{renderMetricCards()}</AccordionDetails>
      </Accordion>

      {/* ── Sticky Tabs Card ─────────────────────────────── */}
      <Card
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
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

          {/* Date Picker & Filters Button aligned on the right side of the Tabs row */}
          {activeTab === 'board' && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Tooltip title="Previous Day">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          filterDate: (current.filterDate || dayjs(todayIso)).subtract(1, 'day'),
                        }))
                      }
                    >
                      <Iconify icon="solar:alt-arrow-left-bold" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <DatePicker
                  label=""
                  showCalendarMarkers={false}
                  value={filters.filterDate}
                  onChange={(newValue) =>
                    setFilters((current) => ({ ...current, filterDate: newValue }))
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
                        setFilters((current) => ({
                          ...current,
                          filterDate: (current.filterDate || dayjs(todayIso)).add(1, 'day'),
                        }))
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
                  filters.filterDate && dayjs(filters.filterDate).isSame(dayjs(todayIso), 'day')
                    ? 'soft'
                    : 'outlined'
                }
                color="primary"
                onClick={() =>
                  setFilters((current) => ({ ...current, filterDate: dayjs(todayIso) }))
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
          <Box
            sx={{
              px: 2,
              py: 1,
              borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
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
        sx={{ flex: 1, minHeight: 0 }}
        slotProps={{
          content: { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        }}
      >
        {activeTab === 'overview' && (
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', lg: '7fr 5fr' }}
            gap={1.5}
            alignItems="stretch"
            sx={{ flexShrink: 0 }}
          >
            {/* Top Left: Today Timeline (Wider 7fr / 58% column) */}
            <Box sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {renderTimeline()}
            </Box>

            {/* Top Right: Teacher Load Snapshot (Placed beside Today Timeline) */}
            <Box sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {renderWorkloadSnapshot()}
            </Box>

            {/* Bottom Left: AI Risk Panel */}
            <Box sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {renderRiskPanel()}
            </Box>

            {/* Bottom Right: Pending Acknowledgement */}
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
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
                      <Chip size="small" label={pendingAckRows.length} variant="soft" />
                    )}
                    <Stack
                      spacing={1}
                      sx={{
                        flex: 1,
                        justifyContent: pendingAckRows.length === 0 ? 'center' : 'flex-start',
                      }}
                    >
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
          </Box>
        )}

        {activeTab === 'board' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <CustomizableTable
              tableId="substitution-board-table"
              tableTitle="Substitution Board"
              data={filteredSubstitutions}
              columns={substitutionColumns}
            />
          </Box>
        )}

        {activeTab === 'availability' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
          </Box>
        )}

        {activeTab === 'dailySheet' && (
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 2, flexShrink: 0 }}
            >
              <Box>
                <Typography variant="h6">Daily Substitution Sheet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Class-wise, teacher-wise, period-wise and room-wise printable coverage sheet.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() =>
                    shikshaMitraToast.info({
                      message: 'Daily substitution sheet is ready to print.',
                    })
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
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
            </Box>
          </Card>
        )}

        {activeTab === 'myDuties' && (
          <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
            {myDutyRows.length === 0 && (
              <Card
                sx={{
                  p: 4,
                  py: 6,
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Iconify
                  icon="mdi:clipboard-check-outline"
                  width={40}
                  color="text.disabled"
                  sx={{ mb: 1.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No substitution duties are assigned to you.
                </Typography>
              </Card>
            )}

            {myDutyRows.map((item) => {
              const isTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(item.status);
              const isAccepted = item.acknowledgementStatus === 'Accepted';
              const cardAction = dutyAction?.id === item.id ? dutyAction.action : null;
              const isAccepting = cardAction === 'accept';
              const isChanging = cardAction === 'change';
              const isRejecting = cardAction === 'reject';
              const isCardBusy = Boolean(cardAction);
              const isChangeRequested = item.acknowledgementStatus === 'Change Requested';
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
                  {/* ── Card Header ───────────────────────────────── */}
                  <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                    {/* Row 1 – date chip + status badges */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.75 }}
                    >
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
                          />
                        );
                      })()}

                      {/* Status badges – right side */}
                      {isAccepted ? (
                        <Chip
                          size="small"
                          color="success"
                          variant="soft"
                          icon={<Iconify icon="mdi:check-circle" width={14} />}
                          label="Accepted"
                        />
                      ) : isChangeRequested ? (
                        <Chip
                          size="small"
                          color="warning"
                          variant="soft"
                          icon={<Iconify icon="mdi:swap-horizontal" width={14} />}
                          label="Change Requested"
                        />
                      ) : (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
                          {renderStatus(item.status)}
                          {item.acknowledgementStatus !== 'Not Sent' &&
                            renderAck(item.acknowledgementStatus)}
                        </Stack>
                      )}
                    </Stack>

                    {/* Row 2 – class / period / subject title */}
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.period} · Class {item.className}-{item.divisionName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                      {item.subjectName} · {item.time} · Room{' '}
                      {item.assignedRoomName || item.roomName}
                    </Typography>
                  </Box>

                  {/* ── Card Body – detail metadata ────────────────── */}
                  <Box
                    sx={{
                      mx: 2,
                      mb: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.04),
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      display="grid"
                      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}
                      gap={0.75}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Iconify icon="mdi:account-outline" width={14} color="text.disabled" />
                        <Typography variant="caption" color="text.secondary">
                          Covering for{' '}
                          <Box component="span" fontWeight={600} color="text.primary">
                            {item.originalTeacherName}
                          </Box>
                        </Typography>
                      </Stack>

                      {item.reason && (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Iconify
                            icon="mdi:information-outline"
                            width={14}
                            color="text.disabled"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Reason:{' '}
                            <Box component="span" fontWeight={600} color="text.primary">
                              {item.reason}
                            </Box>
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Iconify icon="mdi:tag-outline" width={14} color="text.disabled" />
                        <Typography variant="caption" color="text.secondary">
                          Source:{' '}
                          <Box component="span" fontWeight={600} color="text.primary">
                            {item.source}
                          </Box>
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Iconify icon="mdi:flag-outline" width={14} color="text.disabled" />
                        <Typography variant="caption" color="text.secondary">
                          Priority:{' '}
                          <Box
                            component="span"
                            fontWeight={600}
                            color={
                              item.priority === 'Urgent'
                                ? 'error.main'
                                : item.priority === 'High'
                                  ? 'warning.main'
                                  : 'text.primary'
                            }
                          >
                            {item.priority}
                          </Box>
                        </Typography>
                      </Stack>

                      {item.remarks && (
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="flex-start"
                          sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
                        >
                          <Iconify icon="mdi:note-text-outline" width={14} color="text.disabled" />
                          <Typography variant="caption" color="text.secondary">
                            Action note:{' '}
                            <Box component="span" fontWeight={600} color="text.primary">
                              {item.remarks}
                            </Box>
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  {/* ── Card Footer – actions ──────────────────────── */}
                  {isTerminal ? (
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
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
                      alignItems="center"
                      justifyContent="flex-end"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <LoadingButton
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={isAccepted || isChangeRequested || isCardBusy}
                        loading={isAccepting}
                        startIcon={<Iconify icon="mdi:check" width={16} />}
                        onClick={() => openDutyConfirmModal(item.id, 'accept')}
                      >
                        {isAccepting ? 'Accepting…' : isAccepted ? 'Accepted' : 'Accept Duty'}
                      </LoadingButton>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color="warning"
                        disabled={isCardBusy || isChangeRequested}
                        loading={isChanging}
                        startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
                        onClick={() => openDutyConfirmModal(item.id, 'change')}
                      >
                        {isChanging
                          ? 'Sending…'
                          : isChangeRequested
                            ? 'Change Requested'
                            : 'Request Change'}
                      </LoadingButton>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={isCardBusy || isChangeRequested}
                        loading={isRejecting}
                        startIcon={<Iconify icon="mdi:close" width={16} />}
                        onClick={() => openDutyConfirmModal(item.id, 'reject')}
                      >
                        {isRejecting ? 'Rejecting…' : 'Reject'}
                      </LoadingButton>
                    </Stack>
                  )}
                </Card>
              );
            })}
          </Stack>
        )}

        {activeTab === 'analytics' && (
          <Stack spacing={1} sx={{ flexShrink: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6">Substitution Rules</Typography>
                <Typography variant="body2" color="text.secondary">
                  Set limits and default behaviour applied whenever a substitution duty is created
                  or assigned.
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
          maxWidth="md"
          handleClose={handleCloseCreateDialog}
        >
          <DialogScrollContent>
            <Stack spacing={1}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Alert severity="info" icon={<AutoAwesome />}>
                Select the affected lecture, review auto-filled details, choose a substitute
                teacher, then save draft or assign and notify.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <DatePicker
                  label="Date"
                  value={substitutionForm.date}
                  format={viewDateFormat}
                  disablePast
                  minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                  maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
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
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        !!formError &&
                        (!substitutionForm.date ||
                          !dayjs(substitutionForm.date).isValid() ||
                          dayjs(substitutionForm.date).isBefore(dayjs(), 'day') ||
                          (!!currentYear?.startDate &&
                            dayjs(substitutionForm.date).isBefore(
                              dayjs(currentYear.startDate),
                              'day'
                            )) ||
                          (!!currentYear?.endDate &&
                            dayjs(substitutionForm.date).isAfter(
                              dayjs(currentYear.endDate),
                              'day'
                            ))),
                    },
                  }}
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
                    const lecture = createLectureResult.find(
                      (item) => item.slotSubjectId === value
                    );
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
                            color={isSelected ? 'error' : 'primary'}
                            startIcon={
                              isSelected ? <CloseIcon fontSize="small" /> : <Add fontSize="small" />
                            }
                            disabled={!isSelected && teacher.conflictSeverity === 'Hard Block'}
                            onClick={() =>
                              isSelected
                                ? removeSubstituteCoverage(teacher.teacherId)
                                : addSubstituteCoverage(teacher)
                            }
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </Button>
                        </Stack>
                      </Box>
                    );
                  })}
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
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleCloseCreateDialog}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="outlined"
              startIcon={<Save />}
              loading={isCreateSubmitting && createSubmitType === 'draft'}
              disabled={isCreateSubmitting}
              onClick={() => handleCreateSubstitution(false)}
            >
              Save Draft
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="contained"
              startIcon={<Send />}
              loading={isCreateSubmitting && createSubmitType === 'assign'}
              disabled={isCreateSubmitting}
              onClick={() => handleCreateSubstitution(true)}
            >
              Assign & Notify
            </LoadingButton>
          </Stack>
        </CustomDialog>

        <ConfirmDialog
          open={createUnsavedConfirmOpen}
          onClose={() => setCreateUnsavedConfirmOpen(false)}
          icon="warning"
          title="Unsaved Changes"
          content="You have unsaved substitution details. Closing now will discard them. Do you want to continue?"
          action={
            <Button variant="contained" color="warning" onClick={handleDiscardCreateDialog}>
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
              variant="outlined"
              disabled={isAssigning}
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={isAssigning}
              startIcon={<Send />}
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
                title="Mark a teacher unavailable for a date and time range. Affected lectures are detected automatically and, if enabled, substitutions are auto-created and admins are notified."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
          maxWidth="md"
          handleClose={handleCloseAvailabilityDialog}
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
                  error={availabilitySubmitted && !!availabilityFieldErrors.teacherName}
                  helperText={availabilitySubmitted ? availabilityFieldErrors.teacherName : ''}
                />
                <DatePicker
                  label="Date"
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
                <TimePicker
                  label="Start Time"
                  disabled={availabilityForm.isFullDay}
                  value={
                    availabilityForm.startTime
                      ? dayjs(`2000-01-01T${availabilityForm.startTime}`)
                      : null
                  }
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
                      error: availabilitySubmitted && !!availabilityFieldErrors.time,
                    },
                  }}
                />
                <TimePicker
                  label="End Time"
                  disabled={availabilityForm.isFullDay}
                  value={
                    availabilityForm.endTime
                      ? dayjs(`2000-01-01T${availabilityForm.endTime}`)
                      : null
                  }
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
                      error: availabilitySubmitted && !!availabilityFieldErrors.time,
                      helperText: availabilitySubmitted ? availabilityFieldErrors.time : '',
                    },
                  }}
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
                error={availabilitySubmitted && !!availabilityFieldErrors.reason}
                helperText={availabilitySubmitted ? availabilityFieldErrors.reason : ''}
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
                    {availabilityForm.isFullDay ? '09:00' : availabilityStartTimeStr} to{' '}
                    {availabilityForm.isFullDay ? '14:15' : availabilityEndTimeStr}.
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
                        {lecture.period} | {lecture.time} | {lecture.className}-
                        {lecture.divisionName} {lecture.subjectName} | {lecture.roomName}
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
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleCloseAvailabilityDialog}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Send />}
              onClick={handleMarkUnavailable}
            >
              Save and Notify
            </Button>
          </Stack>
        </CustomDialog>

        <ConfirmDialog
          open={availabilityUnsavedConfirmOpen}
          onClose={() => setAvailabilityUnsavedConfirmOpen(false)}
          icon="warning"
          title="Unsaved Changes"
          content="You have unsaved teacher unavailability details. Closing now will discard them. Do you want to continue?"
          action={
            <Button variant="contained" color="warning" onClick={handleDiscardAvailabilityDialog}>
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
            <Button variant="outlined" size="small" onClick={() => setAuditDialogOpen(false)}>
              Close
            </Button>
          </Stack>
        </CustomDialog>

        {/* ── Duty Action Confirmation Modal ─────────────────── */}
        <ConfirmDialog
          open={dutyConfirmOpen}
          onClose={closeDutyConfirmModal}
          title={
            dutyConfirmPayload?.action === 'accept'
              ? 'Accept Duty'
              : dutyConfirmPayload?.action === 'reject'
                ? 'Reject Duty'
                : 'Request Change / Transfer'
          }
          icon={
            dutyConfirmPayload?.action === 'accept'
              ? 'success'
              : dutyConfirmPayload?.action === 'reject'
                ? 'error'
                : 'warning'
          }
          content={
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {dutyConfirmPayload?.action === 'accept'
                  ? 'You are about to accept this substitution duty. Add an optional note below.'
                  : dutyConfirmPayload?.action === 'reject'
                    ? 'Please provide a reason for rejecting this substitution duty.'
                    : 'Please provide a reason for requesting a change or transfer for this duty.'}
              </Typography>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                placeholder={
                  dutyConfirmPayload?.action === 'accept'
                    ? 'Add a note (optional)…'
                    : 'Enter your reason…'
                }
                value={dutyConfirmNote}
                onChange={(e) => setDutyConfirmNote(e.target.value)}
                helperText={
                  dutyConfirmPayload?.action === 'accept'
                    ? 'Optional'
                    : `Minimum ${DUTY_ACTION_REASON_MIN_LENGTH} characters required`
                }
              />
            </Stack>
          }
          action={
            <LoadingButton
              variant="contained"
              color={
                dutyConfirmPayload?.action === 'accept'
                  ? 'success'
                  : dutyConfirmPayload?.action === 'reject'
                    ? 'error'
                    : 'warning'
              }
              disabled={
                dutyConfirmPayload?.action !== 'accept' &&
                dutyConfirmNote.trim().length < DUTY_ACTION_REASON_MIN_LENGTH
              }
              loading={Boolean(dutyAction)}
              onClick={handleDutyConfirmSubmit}
              startIcon={
                <Iconify
                  icon={
                    dutyConfirmPayload?.action === 'accept'
                      ? 'mdi:check'
                      : dutyConfirmPayload?.action === 'reject'
                        ? 'mdi:close'
                        : 'mdi:swap-horizontal'
                  }
                  width={16}
                />
              }
            >
              {dutyConfirmPayload?.action === 'accept'
                ? 'Accept Duty'
                : dutyConfirmPayload?.action === 'reject'
                  ? 'Reject Duty'
                  : 'Request Change'}
            </LoadingButton>
          }
        />
      </Scrollbar>
    </Box>
  );
};

export default SubstitutionManagementScreen;
