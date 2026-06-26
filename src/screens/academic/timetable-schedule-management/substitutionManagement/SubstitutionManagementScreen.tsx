'use client';

import type { Dayjs } from 'dayjs';

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
import { Add, Print, FactCheck, PersonOff, AssignmentInd } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import {
  todayIso,
  roomOptions,
  classOptions,
  statusOptions,
  reasonOptions,
  teacherOptions,
  subjectOptions,
  priorityOptions,
  divisionOptions,
  sourceTypeOptions,
  suggestedTeachers,
  lectureSlotOptions,
  initialSubstitutions,
  availabilityStatusOptions,
  initialTeacherAvailability,
} from './substitutionData';

import type { SubstitutionRow, SubstitutionStatus } from './substitutionData';

type SubstitutionFormState = {
  date: Dayjs | null;
  className: string;
  divisionName: string;
  period: string;
  subjectName: string;
  originalTeacherName: string;
  roomName: string;
  reason: string;
  priority: string;
  remarks: string;
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
};

const defaultSubstitutionForm: SubstitutionFormState = {
  date: dayjs(todayIso),
  className: '',
  divisionName: '',
  period: '',
  subjectName: '',
  originalTeacherName: '',
  roomName: '',
  reason: 'Teacher Absent',
  priority: 'Normal',
  remarks: '',
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
};

const statusColor: Record<
  SubstitutionStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  Pending: 'warning',
  Assigned: 'info',
  Acknowledged: 'primary',
  Completed: 'success',
  Cancelled: 'default',
  Rejected: 'error',
};

const priorityColor: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  Low: 'default',
  Normal: 'primary',
  High: 'warning',
  Urgent: 'error',
};

const periodTimeMap: Record<string, string> = {
  'Period 1': '09:00 - 09:45',
  'Period 2': '10:00 - 10:45',
  'Period 3': '11:00 - 11:45',
  'Period 4': '12:00 - 12:45',
  'Period 5': '13:30 - 14:15',
};

const SubstitutionManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs(todayIso));
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [substitutions, setSubstitutions] = useState(initialSubstitutions);
  const [teacherAvailability, setTeacherAvailability] = useState(initialTeacherAvailability);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [substitutionForm, setSubstitutionForm] = useState(defaultSubstitutionForm);
  const [availabilityForm, setAvailabilityForm] = useState(defaultAvailabilityForm);

  const teacherFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Teachers' }, ...teacherOptions],
    []
  );
  const classFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Classes' }, ...classOptions],
    []
  );
  const divisionFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Divisions' }, ...divisionOptions],
    []
  );
  const subjectFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Subjects' }, ...subjectOptions],
    []
  );
  const reasonFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Reasons' }, ...reasonOptions],
    []
  );

  const filteredSubstitutions = useMemo(() => {
    const dateValue = filterDate?.format('YYYY-MM-DD');
    return substitutions.filter((item) => {
      const matchesDate = !dateValue || item.date === dateValue;
      const matchesTeacher =
        teacherFilter === 'all' ||
        item.originalTeacherName === teacherFilter ||
        item.substituteTeacherName === teacherFilter;
      const matchesClass = classFilter === 'all' || item.className === classFilter;
      const matchesDivision = divisionFilter === 'all' || item.divisionName === divisionFilter;
      const matchesSubject = subjectFilter === 'all' || item.subjectName === subjectFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesReason = reasonFilter === 'all' || item.reason === reasonFilter;

      return (
        matchesDate &&
        matchesTeacher &&
        matchesClass &&
        matchesDivision &&
        matchesSubject &&
        matchesStatus &&
        matchesReason
      );
    });
  }, [
    classFilter,
    divisionFilter,
    filterDate,
    reasonFilter,
    statusFilter,
    substitutions,
    subjectFilter,
    teacherFilter,
  ]);

  const metrics = useMemo(() => {
    const todayRows = substitutions.filter((item) => item.date === todayIso);
    return [
      {
        label: 'Pending substitutions',
        value: todayRows.filter((item) => item.status === 'Pending').length,
        icon: 'mdi:clock-alert-outline',
        color: 'warning.main',
      },
      {
        label: 'Assigned today',
        value: todayRows.filter((item) => item.status === 'Assigned').length,
        icon: 'mdi:account-check-outline',
        color: 'info.main',
      },
      {
        label: 'Acknowledged',
        value: todayRows.filter((item) => item.status === 'Acknowledged').length,
        icon: 'mdi:checkbox-marked-circle-outline',
        color: 'primary.main',
      },
      {
        label: 'Teachers unavailable',
        value: teacherAvailability.filter((item) => item.availabilityDate === todayIso).length,
        icon: 'mdi:account-off-outline',
        color: 'error.main',
      },
    ];
  }, [substitutions, teacherAvailability]);

  const updateSubstitutionStatus = useCallback((id: string, status: SubstitutionStatus) => {
    setSubstitutions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              acknowledgedAt:
                status === 'Acknowledged' ? dayjs().format('HH:mm') : item.acknowledgedAt,
            }
          : item
      )
    );
    shikshaMitraToast.success({ message: `Substitution marked as ${status}.` });
  }, []);

  const openAssignDialog = useCallback((id: string) => {
    setSelectedSubstitutionId(id);
    setSelectedTeacherId('');
    setAssignRoom('');
    setAssignRemarks('');
    setAssignDialogOpen(true);
  }, []);

  const handleCreateSubstitution = useCallback(() => {
    if (
      !substitutionForm.date ||
      !substitutionForm.className ||
      !substitutionForm.divisionName ||
      !substitutionForm.period ||
      !substitutionForm.subjectName ||
      !substitutionForm.originalTeacherName ||
      !substitutionForm.roomName
    ) {
      setFormError('Date, class, division, slot, subject, original teacher and room are required.');
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

    const nextRow: SubstitutionRow = {
      id: `sub-${Date.now()}`,
      date,
      day: substitutionForm.date.format('dddd'),
      period: substitutionForm.period,
      time: periodTimeMap[substitutionForm.period] || 'Manual slot',
      className: substitutionForm.className,
      divisionName: substitutionForm.divisionName,
      subjectName: substitutionForm.subjectName,
      originalTeacherName: substitutionForm.originalTeacherName,
      roomName: substitutionForm.roomName,
      reason: substitutionForm.reason,
      status: 'Pending',
      priority: substitutionForm.priority as SubstitutionRow['priority'],
      createdAt: dayjs().toISOString(),
      remarks: substitutionForm.remarks,
    };

    setSubstitutions((current) => [nextRow, ...current]);
    setCreateDialogOpen(false);
    shikshaMitraToast.success({ message: 'Substitution request created from timetable slot.' });
  }, [substitutionForm, substitutions]);

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

    setSubstitutions((current) =>
      current.map((item) =>
        item.id === selectedSubstitutionId
          ? {
              ...item,
              substituteTeacherName: selectedTeacher.teacherName,
              roomName: assignRoom || item.roomName,
              status: 'Assigned',
              remarks: assignRemarks || item.remarks,
            }
          : item
      )
    );
    setAssignDialogOpen(false);
    shikshaMitraToast.success({ message: 'Substitute teacher assigned and notification queued.' });
  }, [assignRemarks, assignRoom, selectedSubstitutionId, selectedTeacherId]);

  const handleMarkUnavailable = useCallback(() => {
    if (
      !availabilityForm.teacherName ||
      !availabilityForm.availabilityDate ||
      !availabilityForm.reason
    ) {
      setAvailabilityError('Teacher, date and reason are required.');
      return;
    }

    setTeacherAvailability((current) => [
      {
        id: `av-${Date.now()}`,
        teacherName: availabilityForm.teacherName,
        departmentName: 'Academic',
        availabilityDate: availabilityForm.availabilityDate?.format('YYYY-MM-DD') || todayIso,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        availabilityStatus: availabilityForm.availabilityStatus,
        sourceType: availabilityForm.sourceType,
        reason: availabilityForm.reason,
        remarks: availabilityForm.remarks,
      },
      ...current,
    ]);
    setAvailabilityDialogOpen(false);
    shikshaMitraToast.success({
      message: 'Teacher unavailability recorded for substitution checks.',
    });
  }, [availabilityForm]);

  const renderStatus = (status: SubstitutionStatus) => (
    <Chip label={status} size="small" color={statusColor[status]} variant="soft" />
  );

  const substitutionColumns = [
    { id: 'date', label: 'Date', filterType: 'date' as const, minWidth: 120, sticky: true },
    { id: 'period', label: 'Period', minWidth: 110 },
    { id: 'time', label: 'Time', minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      minWidth: 120,
      render: (_value: string, row: any) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', minWidth: 130 },
    { id: 'originalTeacherName', label: 'Original Teacher', minWidth: 170 },
    {
      id: 'substituteTeacherName',
      label: 'Substitute Teacher',
      minWidth: 170,
      render: (value: string) => value || 'Unassigned',
    },
    { id: 'roomName', label: 'Room', minWidth: 120 },
    { id: 'reason', label: 'Reason', minWidth: 120 },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 110,
      render: (value: string) => (
        <Chip label={value} size="small" color={priorityColor[value]} variant="soft" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      render: (value: SubstitutionStatus) => renderStatus(value),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 180,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, row: any) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton
            size="small"
            title={row.substituteTeacherName ? 'Reassign substitute' : 'Assign substitute'}
            disabled={['Completed', 'Cancelled'].includes(row.status)}
            onClick={() => openAssignDialog(row.id)}
          >
            <Iconify icon={GlobalIcons.assigned} />
          </IconButton>
          <IconButton
            size="small"
            title="Acknowledge"
            disabled={row.status !== 'Assigned'}
            onClick={() => updateSubstitutionStatus(row.id, 'Acknowledged')}
          >
            <Iconify icon={GlobalIcons.tick} />
          </IconButton>
          <IconButton
            size="small"
            title="Complete"
            disabled={!['Assigned', 'Acknowledged'].includes(row.status)}
            onClick={() => updateSubstitutionStatus(row.id, 'Completed')}
          >
            <Iconify icon="mdi:check-decagram-outline" />
          </IconButton>
          <IconButton
            size="small"
            title="Cancel"
            disabled={['Completed', 'Cancelled'].includes(row.status)}
            onClick={() => updateSubstitutionStatus(row.id, 'Cancelled')}
          >
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Substitution Management"
        description="Create substitution needs, assign available teachers, track acknowledgements, and print the daily sheet."
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Timetable' },
          { name: 'Substitution Management' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {metrics.map((item) => (
          <Card key={item.label} sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'grid',
                  borderRadius: 1.5,
                  placeItems: 'center',
                  color: item.color,
                  bgcolor: 'action.hover',
                }}
              >
                <Iconify icon={item.icon} width={24} />
              </Box>
              <Box>
                <Typography variant="h4">{item.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
          <DatePicker
            label="Date"
            value={filterDate}
            onChange={setFilterDate}
            slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
          />
          <CustomSelect
            label="Teacher"
            options={teacherFilterOptions}
            value={teacherFilter}
            onChange={(value) => setTeacherFilter(value as string)}
            formControlProps={{ sx: { minWidth: 180 } }}
          />
          <CustomSelect
            label="Class"
            options={classFilterOptions}
            value={classFilter}
            onChange={(value) => setClassFilter(value as string)}
            formControlProps={{ sx: { minWidth: 130 } }}
          />
          <CustomSelect
            label="Division"
            options={divisionFilterOptions}
            value={divisionFilter}
            onChange={(value) => setDivisionFilter(value as string)}
            formControlProps={{ sx: { minWidth: 130 } }}
          />
          <CustomSelect
            label="Subject"
            options={subjectFilterOptions}
            value={subjectFilter}
            onChange={(value) => setSubjectFilter(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Reason"
            options={reasonFilterOptions}
            value={reasonFilter}
            onChange={(value) => setReasonFilter(value as string)}
            formControlProps={{ sx: { minWidth: 160 } }}
          />
        </Stack>
      </Card>

      <Card>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ px: 2 }}>
          <Tab value="dashboard" label="Dashboard" icon={<AssignmentInd />} iconPosition="start" />
          <Tab
            value="availability"
            label="Teacher Availability"
            icon={<PersonOff />}
            iconPosition="start"
          />
          <Tab value="dailySheet" label="Daily Sheet" icon={<Print />} iconPosition="start" />
          <Tab value="myDuties" label="My Duties" icon={<FactCheck />} iconPosition="start" />
          <Tab
            value="reports"
            label="Reports"
            icon={<Iconify icon={GlobalIcons.report} />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {activeTab === 'dashboard' && (
        <CustomizableTable
          tableId="substitution-management-table"
          tableTitle="Substitution Management"
          data={filteredSubstitutions}
          columns={substitutionColumns}
        />
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
            { id: 'remarks', label: 'Remarks', minWidth: 180, render: (value) => value || '-' },
          ]}
        />
      )}

      {activeTab === 'dailySheet' && (
        <Card sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Daily Substitution Sheet</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Print />}
              onClick={() =>
                shikshaMitraToast.info({
                  message: 'Daily substitution sheet is ready to print/export.',
                })
              }
            >
              Print Sheet
            </Button>
          </Stack>
          <CustomizableTable
            tableId="daily-substitution-sheet-table"
            tableTitle="Daily Substitution Sheet"
            data={filteredSubstitutions}
            columns={substitutionColumns.filter((column) => column.id !== 'actions')}
          />
        </Card>
      )}

      {activeTab === 'myDuties' && (
        <CustomizableTable
          tableId="my-substitution-duties-table"
          tableTitle="My Substitution Duties"
          data={substitutions.filter((item) => item.substituteTeacherName === 'Nisha Rao')}
          columns={substitutionColumns}
          noDataText="No substitution duties assigned."
        />
      )}

      {activeTab === 'reports' && (
        <Stack spacing={2}>
          <CustomizableTable
            tableId="teacher-substitution-load-report-table"
            tableTitle="Teacher Substitution Load Report"
            data={teacherOptions.map((teacher, index) => ({
              teacher: teacher.label,
              dateRange: `${dayjs(todayIso).startOf('week').format('DD MMM')} - ${dayjs(todayIso).format('DD MMM')}`,
              total: index + 1,
              sameSubject: index % 2,
              otherSubject: index + 1 - (index % 2),
              pendingAcknowledgement: index === 0 ? 1 : 0,
              completed: index,
              cancelledRejected: index === 2 ? 1 : 0,
            }))}
            columns={[
              { id: 'teacher', label: 'Teacher', minWidth: 170 },
              { id: 'dateRange', label: 'Date Range', minWidth: 160 },
              { id: 'total', label: 'Total Substitutions', filterType: 'number', minWidth: 160 },
              { id: 'sameSubject', label: 'Same Subject', filterType: 'number', minWidth: 130 },
              { id: 'otherSubject', label: 'Other Subject', filterType: 'number', minWidth: 130 },
              {
                id: 'pendingAcknowledgement',
                label: 'Pending Ack',
                filterType: 'number',
                minWidth: 130,
              },
              { id: 'completed', label: 'Completed', filterType: 'number', minWidth: 120 },
              {
                id: 'cancelledRejected',
                label: 'Cancelled / Rejected',
                filterType: 'number',
                minWidth: 170,
              },
            ]}
          />
          <CustomizableTable
            tableId="teacher-absence-impact-report-table"
            tableTitle="Teacher Absence Impact Report"
            data={teacherAvailability.map((item) => ({
              teacher: item.teacherName,
              absenceDate: item.availabilityDate,
              affectedPeriods: 3,
              substitutedPeriods: substitutions.filter(
                (sub) => sub.originalTeacherName === item.teacherName
              ).length,
              uncoveredPeriods: substitutions.filter(
                (sub) => sub.originalTeacherName === item.teacherName && sub.status === 'Pending'
              ).length,
              subjectsAffected:
                substitutions
                  .filter((sub) => sub.originalTeacherName === item.teacherName)
                  .map((sub) => sub.subjectName)
                  .join(', ') || '-',
              classesAffected:
                substitutions
                  .filter((sub) => sub.originalTeacherName === item.teacherName)
                  .map((sub) => `${sub.className}-${sub.divisionName}`)
                  .join(', ') || '-',
            }))}
            columns={[
              { id: 'teacher', label: 'Teacher', minWidth: 170 },
              { id: 'absenceDate', label: 'Absence Date', filterType: 'date', minWidth: 130 },
              {
                id: 'affectedPeriods',
                label: 'Affected Periods',
                filterType: 'number',
                minWidth: 150,
              },
              {
                id: 'substitutedPeriods',
                label: 'Substituted',
                filterType: 'number',
                minWidth: 130,
              },
              { id: 'uncoveredPeriods', label: 'Uncovered', filterType: 'number', minWidth: 120 },
              { id: 'subjectsAffected', label: 'Subjects Affected', minWidth: 200 },
              { id: 'classesAffected', label: 'Classes Affected', minWidth: 180 },
            ]}
          />
        </Stack>
      )}

      <CustomDialog
        open={createDialogOpen}
        title="Create Substitution"
        maxWidth="md"
        handleClose={() => setCreateDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {formError && (
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                <Typography variant="body2">{formError}</Typography>
              </Box>
            )}
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
                onChange={(value) =>
                  setSubstitutionForm((current) => ({ ...current, period: value as string }))
                }
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
                  setSubstitutionForm((current) => ({ ...current, priority: value as string }))
                }
              />
            </Stack>
            <TextField
              size="small"
              label="Remarks"
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
          <Button variant="contained" onClick={handleCreateSubstitution}>
            Create Request
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
            {suggestedTeachers.map((teacher) => {
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
                      <Typography variant="subtitle2">{teacher.teacherName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.departmentName} - Score {teacher.score}
                      </Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {teacher.canTeachSubject && (
                        <Chip size="small" label="Same Subject" color="success" variant="soft" />
                      )}
                      {!teacher.hasConflict && (
                        <Chip size="small" label="Free This Period" color="info" variant="soft" />
                      )}
                      <Chip
                        size="small"
                        label={`Today ${teacher.todaySubstitutionCount}`}
                        variant="soft"
                      />
                      <Chip
                        size="small"
                        label={`Week ${teacher.weekSubstitutionCount}`}
                        variant="soft"
                      />
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
            Assign Teacher
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
            {availabilityError && (
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                <Typography variant="body2">{availabilityError}</Typography>
              </Box>
            )}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                type="time"
                label="Start Time"
                value={availabilityForm.startTime}
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
            Save Availability
          </Button>
        </Stack>
      </CustomDialog>
    </Box>
  );
};

export default SubstitutionManagementScreen;
