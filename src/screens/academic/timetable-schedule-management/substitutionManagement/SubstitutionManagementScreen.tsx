'use client';

import type { Dayjs } from 'dayjs';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
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
  riskAlerts,
  roomOptions,
  classOptions,
  reasonOptions,
  periodTimeMap,
  teacherOptions,
  subjectOptions,
  analyticsCards,
  priorityOptions,
  divisionOptions,
  sourceTypeOptions,
  suggestedTeachers,
  lectureSlotOptions,
  initialSubstitutions,
  substitutionSettings,
  affectedLectureTemplates,
  availabilityStatusOptions,
  initialTeacherAvailability,
} from './substitutionData';

import type {
  ConflictStatus,
  SubstitutionRow,
  AffectedLectureRow,
  SubstitutionStatus,
  SubstitutionPriority,
  SubstitutionViewType,
  AcknowledgementStatus,
} from './substitutionData';

type SubstitutionFormState = {
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
};

type AvailabilityFormState = {
  teacherName: string;
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
};

const defaultAvailabilityForm: AvailabilityFormState = {
  teacherName: '',
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

const SubstitutionManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [boardView, setBoardView] = useState<SubstitutionViewType>('table');
  const [filters, setFilters] = useState(DEFAULT_SUBSTITUTION_FILTERS);
  const [substitutions, setSubstitutions] = useState(initialSubstitutions);
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
  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionRowId, setActionRowId] = useState('');

  const patchFilters = useCallback((patch: Partial<typeof DEFAULT_SUBSTITUTION_FILTERS>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

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

  const affectedLectures = useMemo<AffectedLectureRow[]>(() => {
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
  ]);

  const metrics = useMemo<MetricCard[]>(() => {
    const pending = todayRows.filter((item) => item.status === 'Pending').length;
    const assigned = todayRows.filter((item) =>
      ['Assigned', 'Waiting Ack', 'Acknowledged', 'Completed'].includes(item.status)
    ).length;
    const acknowledged = todayRows.filter(
      (item) => item.acknowledgementStatus === 'Accepted'
    ).length;
    const uncovered = todayRows.filter((item) => item.status === 'Pending').length;
    const unavailable = teacherAvailability.filter(
      (item) => item.availabilityDate === todayIso
    ).length;
    const nextRisk = todayRows.find((item) => ['Pending', 'Conflict'].includes(item.status));

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
  }, [teacherAvailability, todayRows]);

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
    (id: string, status: SubstitutionStatus) => {
      updateSubstitution(id, (item) => ({
        ...item,
        status,
        acknowledgementStatus:
          status === 'Acknowledged' || status === 'Completed'
            ? 'Accepted'
            : item.acknowledgementStatus,
        acknowledgedAt:
          status === 'Acknowledged' || status === 'Completed'
            ? item.acknowledgedAt || dayjs().format('HH:mm')
            : item.acknowledgedAt,
        completedAt: status === 'Completed' ? dayjs().format('HH:mm') : item.completedAt,
        auditLog: [buildAudit(`Substitution marked as ${status}.`, 'Admin'), ...item.auditLog],
      }));
      shikshaMitraToast.success({ message: `Substitution marked as ${status}.` });
    },
    [updateSubstitution]
  );

  const openAssignDialog = useCallback((id: string) => {
    setSelectedSubstitutionId(id);
    setSelectedTeacherId('');
    setAssignRoom('');
    setAssignRemarks('');
    setAssignDialogOpen(true);
  }, []);

  const handleCreateSubstitution = useCallback(
    (assignNow: boolean) => {
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

      if (assignNow && !substitutionForm.substituteTeacherName) {
        setFormError('Select a substitute teacher before Assign & Notify.');
        return;
      }

      const date = substitutionForm.date.format('YYYY-MM-DD');
      const hasActiveSlot = substitutions.some(
        (item) =>
          item.date === date &&
          item.className === substitutionForm.className &&
          item.divisionName === substitutionForm.divisionName &&
          item.period === substitutionForm.period &&
          !['Cancelled', 'Rejected'].includes(item.status)
      );

      if (hasActiveSlot) {
        setFormError('This slot already has an active substitution assignment.');
        return;
      }

      const selectedTeacher = suggestedTeachers.find(
        (teacher) => teacher.teacherName === substitutionForm.substituteTeacherName
      );

      if (assignNow && selectedTeacher?.hasConflict) {
        setFormError(selectedTeacher.conflictReason || 'The selected teacher has a hard conflict.');
        return;
      }

      const slot = periodTimeMap[substitutionForm.period];
      const nextRow: SubstitutionRow = {
        id: `sub-${Date.now()}`,
        date,
        day: substitutionForm.date.format('dddd'),
        period: substitutionForm.period,
        startTime: slot?.startTime || '',
        endTime: slot?.endTime || '',
        time: slot?.time || 'Manual slot',
        className: substitutionForm.className,
        divisionName: substitutionForm.divisionName,
        departmentName: substitutionForm.subjectName,
        subjectName: substitutionForm.subjectName,
        originalTeacherName: substitutionForm.originalTeacherName,
        substituteTeacherName: assignNow ? substitutionForm.substituteTeacherName : undefined,
        roomName: substitutionForm.roomName,
        assignedRoomName: substitutionForm.assignedRoomName || substitutionForm.roomName,
        reason: substitutionForm.reason,
        status: assignNow
          ? substitutionForm.acknowledgementRequired
            ? 'Waiting Ack'
            : 'Assigned'
          : 'Pending',
        priority: substitutionForm.priority,
        acknowledgementStatus: assignNow
          ? substitutionForm.sendNotification
            ? 'Sent'
            : 'Not Sent'
          : 'Not Sent',
        notificationStatus: assignNow
          ? substitutionForm.sendNotification
            ? 'Queued'
            : 'Not Sent'
          : 'Not Sent',
        source: substitutionForm.assignmentSource,
        conflictStatus: selectedTeacher?.conflictSeverity || 'Clear',
        conflictReason: selectedTeacher?.conflictReason,
        aiScore: selectedTeacher?.score,
        isAiSuggested: substitutionForm.assignmentSource === 'AI Suggested',
        workloadStatus: selectedTeacher?.loadStatus || 'Low',
        acknowledgementRequired: substitutionForm.acknowledgementRequired,
        createdAt: dayjs().toISOString(),
        remarks: substitutionForm.remarks,
        auditLog: [
          buildAudit(
            assignNow
              ? 'Substitution assigned and notification queued.'
              : 'Draft substitution request saved.',
            'Admin'
          ),
        ],
      };

      setSubstitutions((current) => [nextRow, ...current]);
      setCreateDialogOpen(false);
      shikshaMitraToast.success({
        message: assignNow
          ? 'Substitution assigned and notification queued.'
          : 'Substitution draft created.',
      });
    },
    [substitutionForm, substitutions]
  );

  const handleAssignTeacher = useCallback(() => {
    const selectedTeacher = suggestedTeachers.find(
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

    updateSubstitution(selectedSubstitutionId, (item) => ({
      ...item,
      substituteTeacherName: selectedTeacher.teacherName,
      assignedRoomName: assignRoom || item.assignedRoomName || item.roomName,
      status: 'Waiting Ack',
      acknowledgementStatus: 'Sent',
      notificationStatus: 'Queued',
      conflictStatus: selectedTeacher.conflictSeverity,
      aiScore: selectedTeacher.score,
      isAiSuggested: true,
      workloadStatus: selectedTeacher.loadStatus,
      remarks: assignRemarks || item.remarks,
      auditLog: [
        buildAudit(`Assigned ${selectedTeacher.teacherName} and queued notification.`, 'Admin'),
        ...item.auditLog,
      ],
    }));
    setAssignDialogOpen(false);
    shikshaMitraToast.success({ message: 'Substitute teacher assigned and notification queued.' });
  }, [assignRemarks, assignRoom, selectedSubstitutionId, selectedTeacherId, updateSubstitution]);

  const handleMarkUnavailable = useCallback(() => {
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

    setTeacherAvailability((current) => [
      {
        id: `av-${Date.now()}`,
        teacherName: availabilityForm.teacherName,
        departmentName: 'Academic',
        availabilityDate: date,
        startTime,
        endTime,
        availabilityStatus: availabilityForm.availabilityStatus,
        sourceType: availabilityForm.sourceType,
        reason: availabilityForm.reason,
        isFullDay: availabilityForm.isFullDay,
        affectedLectureCount: affectedLectures.length,
        autoCreateSubstitutions: availabilityForm.autoCreateSubstitutions,
        notifyLeadership: availabilityForm.notifyLeadership,
        attachmentName: availabilityForm.attachmentName,
        remarks: availabilityForm.remarks,
      },
      ...current,
    ]);

    if (availabilityForm.autoCreateSubstitutions) {
      const nextRows = affectedLectures.map((lecture, index): SubstitutionRow => {
        const slot = periodTimeMap[lecture.period];
        return {
          id: `sub-auto-${Date.now()}-${index}`,
          date,
          day: availabilityForm.availabilityDate?.format('dddd') || dayjs(date).format('dddd'),
          period: lecture.period,
          startTime: slot.startTime,
          endTime: slot.endTime,
          time: lecture.time,
          className: lecture.className,
          divisionName: lecture.divisionName,
          departmentName: lecture.subjectName,
          subjectName: lecture.subjectName,
          originalTeacherName: lecture.teacherName,
          roomName: lecture.roomName,
          reason: availabilityForm.reason,
          status: 'Pending',
          priority: availabilityForm.availabilityStatus === 'Emergency' ? 'Urgent' : 'High',
          acknowledgementStatus: 'Not Sent',
          notificationStatus: 'Not Sent',
          source: 'Auto Created',
          conflictStatus: 'Clear',
          isAiSuggested: false,
          workloadStatus: 'Low',
          acknowledgementRequired: true,
          createdAt: dayjs().toISOString(),
          remarks: 'Auto-created from teacher unavailable flow.',
          auditLog: [
            buildAudit('Substitution request auto-created from affected lecture detection.'),
          ],
        };
      });
      setSubstitutions((current) => [...nextRows, ...current]);
    }

    setAvailabilityDialogOpen(false);
    shikshaMitraToast.success({
      message: `Teacher unavailability saved. ${affectedLectures.length} affected lecture(s) detected.`,
    });
  }, [affectedLectures, availabilityForm, teacherAvailability]);

  const generateAiPlan = useCallback(() => {
    const bestTeacher = suggestedTeachers.find((teacher) => !teacher.hasConflict);

    if (!bestTeacher) {
      shikshaMitraToast.error({ message: 'No conflict-free AI recommendation is available.' });
      return;
    }

    setSubstitutions((current) =>
      current.map((item) =>
        item.date === todayIso && item.status === 'Pending'
          ? {
              ...item,
              substituteTeacherName: bestTeacher.teacherName,
              status: 'Waiting Ack',
              acknowledgementStatus: 'Sent',
              notificationStatus: 'Queued',
              source: 'AI Suggested',
              isAiSuggested: true,
              aiScore: bestTeacher.score,
              workloadStatus: bestTeacher.loadStatus,
              auditLog: [
                buildAudit(`AI coverage plan assigned ${bestTeacher.teacherName}.`, 'AI Planner'),
                ...item.auditLog,
              ],
            }
          : item
      )
    );
    shikshaMitraToast.success({
      message: 'AI coverage plan generated and queued for acknowledgement.',
    });
  }, []);

  const handleTeacherDutyAction = useCallback(
    (id: string, action: 'accept' | 'reject' | 'change') => {
      updateSubstitution(id, (item) => ({
        ...item,
        status:
          action === 'accept' ? 'Acknowledged' : action === 'reject' ? 'Rejected' : item.status,
        acknowledgementStatus:
          action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : 'Change Requested',
        acknowledgedAt: action === 'accept' ? dayjs().format('HH:mm') : item.acknowledgedAt,
        auditLog: [
          buildAudit(
            action === 'accept'
              ? 'Teacher accepted duty.'
              : action === 'reject'
                ? 'Teacher rejected duty with reason.'
                : 'Teacher requested duty change.',
            item.substituteTeacherName || 'Teacher'
          ),
          ...item.auditLog,
        ],
      }));

      shikshaMitraToast.success({
        message:
          action === 'accept'
            ? 'Duty accepted.'
            : action === 'reject'
              ? 'Duty rejected and admin alert created.'
              : 'Change request sent to admin.',
      });
    },
    [updateSubstitution]
  );

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

  const substitutionColumns: IColumn[] = [
    { id: 'date', label: 'Date', filterType: 'date' as const, minWidth: 120, sticky: true },
    { id: 'period', label: 'Period', minWidth: 110 },
    { id: 'time', label: 'Time', minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      minWidth: 120,
      render: (_value, row: IData) => {
        const substitution = row as SubstitutionRow;
        return `${substitution.className}-${substitution.divisionName}`;
      },
    },
    { id: 'subjectName', label: 'Subject', minWidth: 130 },
    { id: 'originalTeacherName', label: 'Original Teacher', minWidth: 170 },
    {
      id: 'substituteTeacherName',
      label: 'Substitute Teacher',
      minWidth: 180,
      render: (value: string) => value || 'Unassigned',
    },
    {
      id: 'assignedRoomName',
      label: 'Room',
      minWidth: 130,
      render: (value, row: IData) => value || (row as SubstitutionRow).roomName,
    },
    { id: 'reason', label: 'Reason', minWidth: 120 },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 110,
      render: (value: SubstitutionPriority) => (
        <Chip label={value} size="small" color={priorityColor[value]} variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 170,
      render: (value: SubstitutionStatus) => renderStatus(value),
    },
    {
      id: 'acknowledgementStatus',
      label: 'Acknowledgement',
      minWidth: 170,
      render: (value: AcknowledgementStatus) => renderAck(value),
    },
    { id: 'source', label: 'Source', minWidth: 130 },
    {
      id: 'conflictStatus',
      label: 'Conflict',
      minWidth: 140,
      render: (value: ConflictStatus, row: IData) =>
        renderConflict(value, (row as SubstitutionRow).conflictReason),
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
      render: (_value, row: IData) => {
        const substitution = row as SubstitutionRow;
        return (
          <Stack direction="row" spacing={0.75} justifyContent="center">
            <Button
              size="small"
              variant={substitution.substituteTeacherName ? 'outlined' : 'contained'}
              disabled={['Completed', 'Cancelled'].includes(substitution.status)}
              onClick={() => openAssignDialog(substitution.id)}
            >
              {substitution.substituteTeacherName ? 'Reassign' : 'Assign'}
            </Button>
            <Tooltip title="More actions">
              <IconButton size="small" onClick={(event) => openActionMenu(event, substitution.id)}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const renderMetricCards = () => (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(6, 1fr)',
      }}
      gap={2}
    >
      {metrics.map((item) => (
        <Card
          key={item.label}
          sx={{
            height: '100%',
            borderRadius: 1,
            cursor: item.filterStatus ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (item.filterStatus) {
              setFilters((prev) => ({ ...prev, statusFilter: item.filterStatus as any }));
              setActiveTab('board');
            }
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'grid',
                  borderRadius: 1,
                  placeItems: 'center',
                  color: `${item.color}.main`,
                  bgcolor: `${item.color}.lighter`,
                }}
              >
                <Iconify icon={item.icon} width={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
                  {item.value}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {item.label}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
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

  const renderTimeline = () => (
    <Card sx={{ p: 2, borderRadius: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6">Today Timeline</Typography>
        <Chip size="small" label={`${todayRows.length} periods tracked`} variant="outlined" />
      </Stack>
      <Stack spacing={1.25}>
        {[...todayRows]
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: item.status === 'Pending' ? 'warning.lighter' : 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2">
                    {item.time} - {item.period} | {item.className}-{item.divisionName}{' '}
                    {item.subjectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Original: {item.originalTeacherName} | Substitute:{' '}
                    {item.substituteTeacherName || 'Not assigned'} | Room:{' '}
                    {item.assignedRoomName || item.roomName}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
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

  const renderRiskPanel = () => (
    <Card sx={{ p: 2, borderRadius: 1, height: '100%' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">AI Risk Panel</Typography>
          <Chip size="small" color="warning" label="Live rules" variant="outlined" />
        </Stack>
        <Alert severity="info" icon={<AutoAwesome />}>
          2 teachers unavailable, 5 affected lectures found, 1 acknowledgement is pending.
        </Alert>
        {riskAlerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.severity}
            action={<Button size="small">{alert.action}</Button>}
          >
            <Typography variant="subtitle2">{alert.type}</Typography>
            <Typography variant="body2">{alert.message}</Typography>
          </Alert>
        ))}
      </Stack>
    </Card>
  );

  const renderWorkloadSnapshot = () => (
    <Card sx={{ p: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Teacher Load Snapshot
      </Typography>
      <Stack spacing={1.25}>
        {suggestedTeachers.slice(0, 3).map((teacher) => (
          <Box key={teacher.teacherId}>
            <Stack direction="row" justifyContent="space-between">
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
              Today {teacher.todayTeachingLoad} lectures, {teacher.todaySubstitutionCount}{' '}
              substitutions, {teacher.freePeriods} free periods
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
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
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
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
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
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
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
              <Stack spacing={0.75} sx={{ mt: 1 }}>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
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
              color="warning"
              startIcon={<AutoAwesome />}
              onClick={generateAiPlan}
            >
              Generate AI Plan
            </Button>
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
              label="Analytics"
              icon={<Iconify icon={GlobalIcons.report} />}
              iconPosition="start"
            />
          </Tabs>

          {/* Filters Button aligned on the right side of the Tabs row */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2 }}>
            <FiltersBar filters={filters} onChange={patchFilters} onReset={clearFilters} />
          </Stack>
        </Stack>

        {/* Active Chips Row (under the borderBottom divider, inside the Card) */}
        {getActiveFilters(filters).length > 0 && (
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'background.neutral' }}>
            <SubstitutionActiveFilters
              filters={filters}
              onChange={patchFilters}
              onReset={clearFilters}
            />
          </Box>
        )}
      </Card>

      {activeTab === 'overview' && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
            <Box sx={{ flex: 1.4 }}>{renderTimeline()}</Box>
            <Box sx={{ flex: 1 }}>{renderRiskPanel()}</Box>
          </Stack>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <Card sx={{ p: 2, borderRadius: 1, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Pending Acknowledgement
              </Typography>
              <Stack spacing={1}>
                {todayRows
                  .filter((item) =>
                    ['Sent', 'Seen', 'Escalated'].includes(item.acknowledgementStatus)
                  )
                  .map((item) => (
                    <Alert
                      key={item.id}
                      severity={item.acknowledgementStatus === 'Escalated' ? 'error' : 'warning'}
                      action={
                        <Button
                          size="small"
                          onClick={() => updateSubstitutionStatus(item.id, 'Acknowledged')}
                        >
                          Mark Accepted
                        </Button>
                      }
                    >
                      {item.substituteTeacherName || 'Teacher'} - {item.period} {item.className}-
                      {item.divisionName}
                    </Alert>
                  ))}
              </Stack>
            </Card>
            <Box sx={{ flex: 1 }}>{renderWorkloadSnapshot()}</Box>
          </Stack>
        </Stack>
      )}

      {activeTab === 'board' && (
        <Stack spacing={2}>
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
            { id: 'teacherName', label: 'Teacher', minWidth: 170, sticky: true },
            { id: 'departmentName', label: 'Department', minWidth: 140 },
            { id: 'availabilityDate', label: 'Date', filterType: 'date', minWidth: 120 },
            { id: 'startTime', label: 'Start', minWidth: 90 },
            { id: 'endTime', label: 'End', minWidth: 90 },
            { id: 'availabilityStatus', label: 'Status', minWidth: 130 },
            { id: 'sourceType', label: 'Source', minWidth: 130 },
            { id: 'reason', label: 'Reason', minWidth: 220 },
            {
              id: 'affectedLectureCount',
              label: 'Affected Lectures',
              filterType: 'number',
              minWidth: 150,
            },
            {
              id: 'autoCreateSubstitutions',
              label: 'Auto Create',
              minWidth: 130,
              render: (value: boolean) => (value ? 'Yes' : 'No'),
            },
            {
              id: 'attachmentName',
              label: 'Attachment',
              minWidth: 150,
              render: (value: string) => value || '-',
            },
            {
              id: 'remarks',
              label: 'Remarks',
              minWidth: 180,
              render: (value: string) => value || '-',
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
                onClick={() => shikshaMitraToast.info({ message: 'PDF export queued.' })}
              >
                Download PDF
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:microsoft-excel" />}
                onClick={() => shikshaMitraToast.info({ message: 'Excel export queued.' })}
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
            data={filteredSubstitutions}
            columns={[
              ...substitutionColumns.filter((column) => column.id !== 'actions'),
              {
                id: 'signature',
                label: 'Signature',
                minWidth: 150,
                isSort: false,
                render: () => '____________',
              },
            ]}
          />
        </Card>
      )}

      {activeTab === 'myDuties' && (
        <Stack spacing={2}>
          {substitutions
            .filter((item) => item.substituteTeacherName === 'Nisha Rao')
            .map((item) => (
              <Card key={item.id} sx={{ p: 2, borderRadius: 1 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">
                      {item.period} - Class {item.className}-{item.divisionName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.subjectName} | {item.time} | {item.assignedRoomName || item.roomName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Original Teacher: {item.originalTeacherName}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    {renderStatus(item.status)}
                    {renderAck(item.acknowledgementStatus)}
                    <Button
                      size="small"
                      variant="contained"
                      disabled={item.acknowledgementStatus === 'Accepted'}
                      onClick={() => handleTeacherDutyAction(item.id, 'accept')}
                    >
                      Accept Duty
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => handleTeacherDutyAction(item.id, 'change')}
                    >
                      Request Change
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleTeacherDutyAction(item.id, 'reject')}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
        </Stack>
      )}

      {activeTab === 'analytics' && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            {analyticsCards.map((card) => (
              <Card key={card.label} sx={{ p: 2, borderRadius: 1, flex: '1 1 210px' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: `${card.color}.lighter`,
                      color: `${card.color}.main`,
                    }}
                  >
                    <Iconify icon={card.icon} width={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6">{card.value}</Typography>
                    <Typography variant="subtitle2">{card.label}</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {card.helper}
                </Typography>
              </Card>
            ))}
          </Stack>
          <CustomizableTable
            tableId="substitution-settings-table"
            tableTitle="Settings and Control Rules"
            data={substitutionSettings}
            columns={[
              { id: 'setting', label: 'Setting', minWidth: 320, sticky: true },
              { id: 'value', label: 'Value', minWidth: 260 },
              { id: 'status', label: 'Status', minWidth: 120 },
            ]}
          />
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <CustomizableTable
              tableId="teacher-wise-substitution-report-table"
              tableTitle="Teacher-wise Report"
              data={teacherOptions.map((teacher, index) => ({
                teacher: teacher.label,
                total: index + 3,
                sameSubject: index % 3,
                otherSubject: index + 1,
                avgAck: `${8 + index} min`,
                cancelledRejected: index === 2 ? 1 : 0,
              }))}
              columns={[
                { id: 'teacher', label: 'Teacher', minWidth: 170 },
                { id: 'total', label: 'Total', filterType: 'number', minWidth: 100 },
                { id: 'sameSubject', label: 'Same Subject', filterType: 'number', minWidth: 130 },
                { id: 'otherSubject', label: 'Other Subject', filterType: 'number', minWidth: 130 },
                { id: 'avgAck', label: 'Avg Ack', minWidth: 110 },
                {
                  id: 'cancelledRejected',
                  label: 'Cancelled / Rejected',
                  filterType: 'number',
                  minWidth: 170,
                },
              ]}
            />
            <CustomizableTable
              tableId="class-subject-impact-report-table"
              tableTitle="Class and Subject Impact"
              data={subjectOptions.map((subject, index) => ({
                subject: subject.label,
                affectedClass: `${7 + (index % 4)}-${['A', 'B', 'C'][index % 3]}`,
                periodsLost: index + 2,
                coverageRate: `${92 - index * 4}%`,
                pattern: index === 1 ? 'Repeated Friday shortage' : 'Normal',
              }))}
              columns={[
                { id: 'subject', label: 'Subject', minWidth: 150 },
                { id: 'affectedClass', label: 'Most Affected Class', minWidth: 180 },
                { id: 'periodsLost', label: 'Periods', filterType: 'number', minWidth: 110 },
                { id: 'coverageRate', label: 'Coverage Rate', minWidth: 130 },
                { id: 'pattern', label: 'AI Pattern', minWidth: 200 },
              ]}
            />
          </Stack>
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
          onClick={() => {
            if (actionRow) {
              updateSubstitution(actionRow.id, (item) => ({
                ...item,
                notificationStatus: 'Reminder Sent',
                auditLog: [
                  buildAudit('Reminder sent to substitute teacher.', 'Admin'),
                  ...item.auditLog,
                ],
              }));
              shikshaMitraToast.info({ message: 'Reminder sent to substitute teacher.' });
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
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Alert severity="info" icon={<AutoAwesome />}>
              Select the affected lecture, review auto-filled details, choose a substitute teacher,
              then save draft or assign and notify.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Date"
                value={substitutionForm.date}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, date: value }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <CustomSelect
                label="Class"
                options={classOptions}
                value={substitutionForm.className}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, className: value as string }))
                }
              />
              <CustomSelect
                label="Division"
                options={divisionOptions}
                value={substitutionForm.divisionName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, divisionName: value as string }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Lecture Slot"
                options={lectureSlotOptions}
                value={substitutionForm.period}
                onChange={(value) => {
                  const template = affectedLectureTemplates.find((item) => item.period === value);
                  setSubstitutionForm((current) => ({
                    ...current,
                    period: value as string,
                    subjectName: template?.subjectName || current.subjectName,
                    originalTeacherName: template?.teacherName || current.originalTeacherName,
                    roomName: template?.roomName || current.roomName,
                    className: template?.className || current.className,
                    divisionName: template?.divisionName || current.divisionName,
                  }));
                }}
              />
              <CustomSelect
                label="Subject"
                options={subjectOptions}
                value={substitutionForm.subjectName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, subjectName: value as string }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Original Teacher"
                options={teacherOptions}
                value={substitutionForm.originalTeacherName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    originalTeacherName: value as string,
                  }))
                }
              />
              <CustomSelect
                label="Original Room"
                options={roomOptions}
                value={substitutionForm.roomName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, roomName: value as string }))
                }
              />
            </Stack>
            <Card sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                AI Substitute Ranking
              </Typography>
              <Stack spacing={1}>
                {suggestedTeachers.map((teacher, index) => (
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
                        <Typography variant="subtitle2">
                          #{index + 1} {teacher.teacherName} - {teacher.score}%
                        </Typography>
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
                        variant={
                          substitutionForm.substituteTeacherName === teacher.teacherName
                            ? 'contained'
                            : 'outlined'
                        }
                        disabled={teacher.conflictSeverity === 'Hard Block'}
                        onClick={() =>
                          setSubstitutionForm((current) => ({
                            ...current,
                            substituteTeacherName: teacher.teacherName,
                            assignmentSource: 'AI Suggested',
                          }))
                        }
                      >
                        Assign
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Card>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Substitute Teacher"
                options={teacherOptions}
                value={substitutionForm.substituteTeacherName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    substituteTeacherName: value as string,
                  }))
                }
              />
              <CustomSelect
                label="Assigned Room"
                options={[{ value: '', label: 'Keep original room' }, ...roomOptions]}
                value={substitutionForm.assignedRoomName}
                onChange={(value) =>
                  setSubstitutionForm((current) => ({
                    ...current,
                    assignedRoomName: value as string,
                  }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              {substitutionForm.substituteTeacherName
                ? `You are assigning ${substitutionForm.substituteTeacherName} to Class ${substitutionForm.className}-${substitutionForm.divisionName} ${substitutionForm.subjectName || 'lecture'} during ${substitutionForm.period || 'selected period'}.`
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
          <Stack spacing={2}>
            {selectedSubstitution && (
              <Alert severity="info">
                {selectedSubstitution.period} | Class {selectedSubstitution.className}-
                {selectedSubstitution.divisionName} {selectedSubstitution.subjectName} | Original:{' '}
                {selectedSubstitution.originalTeacherName}
              </Alert>
            )}
            {suggestedTeachers.map((teacher, index) => {
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
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
          <Stack spacing={2}>
            {availabilityError && <Alert severity="error">{availabilityError}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Teacher"
                options={teacherOptions}
                value={availabilityForm.teacherName}
                onChange={(value) =>
                  setAvailabilityForm((current) => ({ ...current, teacherName: value as string }))
                }
              />
              <DatePicker
                label="Date"
                value={availabilityForm.availabilityDate}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                    <Chip
                      size="small"
                      label="Create substitution"
                      color="primary"
                      variant="outlined"
                    />
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
          <Stack spacing={1.25}>
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
