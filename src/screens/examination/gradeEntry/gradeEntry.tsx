'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetSubjectsQuery } from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';
import {
  GradeEntryWorkflowStatus,
  GradeEntryWorkflowStatusColor,
  GradeEntryWorkflowStatusLabel,
} from 'src/enums/grade-entry-status';
import {
  Box,
  Card,
  Grid,
  List,
  Chip,
  Stack,
  Dialog,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  Collapse,
  ListItem,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  Autocomplete,
  ListItemText,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  useGetExamMarksAuditLogsQuery,
  useVerifyMarksMutation,
  useUnlockMarksMutation,
  useBulkSaveMarksMutation,
  useValidateMarksMutation,
  useSaveDraftMarksMutation,
  useRequestChangesMutation,
  useGetExamMarksSummaryQuery,
  usePublishAndLockMarksMutation,
  useSubmitMarksForVerificationMutation,
} from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';
import { BulkGradeEntryToolbar } from './components/BulkGradeEntryToolbar';
import { GradeEntryReviewDialog } from './components/GradeEntryReviewDialog';
import { ImportMarksPreviewDialog } from './components/ImportMarksPreviewDialog';

import { TimetableSettingsSummaryCards, type ITimetableSummaryCard } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import type { TabComponentType } from '../../hr/leave-request';
import type {
  IExamMarkItem,
  IExamAnalyticsStats,
  IStudentExamGradeEntry,
  IExamMarksWorkflowFlags,
} from './type';
import { Scrollbar } from 'src/components/scrollbar';

const GradeEntry = (props: TabComponentType) => {
  const dialog = useBoolean();
  const { searchParams } = props;

  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  const [assignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  const [examId, setExamId] = useState(searchParams?.examId ? searchParams?.examId : '');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // States for changes protection
  const [isDirty, setIsDirty] = useState(false);
  const [pendingFilterSwitch, setPendingFilterSwitch] = useState<{
    type: 'class' | 'division' | 'subject' | 'exam';
    value: any;
  } | null>(null);

  // Autosave State
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Rows state for bulk operations
  const [tableRows, setTableRows] = useState<IExamMarkItem[]>([]);
  const [bulkEditRequest, setBulkEditRequest] = useState<{
    id: number;
    studentIds: string[];
    action: 'attendance' | 'marks' | 'remark' | 'clear';
    value?: number | string;
  } | null>(null);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Dependent dropdown loading
  const handleFilterChange = (type: 'class' | 'division' | 'subject' | 'exam', value: any) => {
    if (isDirty) {
      setPendingFilterSwitch({ type, value });
      return;
    }
    applyFilter(type, value);
  };

  const applyFilter = (type: 'class' | 'division' | 'subject' | 'exam', value: any) => {
    if (type === 'class') {
      setClass(value);
      setDivision('');
      setSubject('');
      setExamId('');
    } else if (type === 'division') {
      setDivision(value);
      setSubject('');
      setExamId('');
    } else if (type === 'subject') {
      setSubject(value);
      setExamId('');
    } else if (type === 'exam') {
      setExamId(value);
    }
    setIsDirty(false);
  };

  const {
    data: subjectData,
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectsQuery,
    params: {
      academicMediumId: medium?.id,
      classId: classes,
      divisionId: division,
    },
    options: {
      skip: !(medium?.id && classes && division),
    },
  });

  const subjectOptions = useMemo<{ id: string; name: string }[]>(() => {
    const raw: any[] = Array.isArray(subjectData)
      ? subjectData
      : (subjectData?.data?.items ?? subjectData?.items ?? subjectData?.records ?? []);
    return raw.map((s: any) => ({
      id: s.subjectId ?? s.id ?? '',
      name: s.subjectName ?? s.name ?? '',
    }));
  }, [subjectData]);

  const {
    data: examData,
    isLoading: isExamsLoading,
    isFetching: isExamsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: medium?.id,
      StandardId: classes,
      DivisionId: division,
      SubjectId: subject,
      Status: examScheduledStatus.Completed,
      ...(assignmentType ? { ExamType: assignmentType } : {}),
    },
    options: {
      skip: !(medium?.id && classes && division && subject),
    },
  });

  const examOptions = useMemo<{ examId: string; examName: string }[]>(() => {
    const raw: any[] = examData?.data?.items ?? examData?.items ?? [];
    return raw.map((e: any) => ({
      examId: e.examId ?? e.id ?? '',
      examName: e.examName ?? e.name ?? '',
    }));
  }, [examData]);

  const [selectedStudent, setSelectedStudent] = useState<IStudentExamGradeEntry | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [allMarksAssigned, setAllMarksAssigned] = useState(false);
  const [analyticsStats, setAnalyticsStats] = useState<IExamAnalyticsStats | null>(null);

  const summaryCards = useMemo<ITimetableSummaryCard[]>(() => {
    if (!analyticsStats) return [];
    return [
      {
        label: 'Total Students',
        value: analyticsStats.totalCount ?? 0,
        icon: 'solar:user-bold',
        color: 'primary',
      },
      {
        label: 'Graded',
        value: (analyticsStats.totalCount ?? 0) - (analyticsStats.pendingCount ?? 0),
        icon: 'solar:check-square-bold',
        color: 'success',
      },
      {
        label: 'Pending',
        value: analyticsStats.pendingCount ?? 0,
        icon: 'solar:clock-circle-bold',
        color: (analyticsStats.pendingCount ?? 0) > 0 ? 'warning' : 'info',
      },
      {
        label: 'Highest Marks',
        value: analyticsStats.highestMarks ?? 0,
        icon: 'solar:arrow-up-bold',
        color: 'success',
      },
      {
        label: 'Lowest Marks',
        value: analyticsStats.lowestMarks ?? 0,
        icon: 'solar:arrow-down-bold',
        color: 'error',
      },
      {
        label: 'Average Marks',
        value: analyticsStats.averageMarks ?? 0,
        icon: 'solar:graph-new-bold',
        color: 'info',
      },
    ];
  }, [analyticsStats]);
  const [workflowStatus, setWorkflowStatus] = useState<GradeEntryWorkflowStatus>(
    GradeEntryWorkflowStatus.Draft
  );

  useEffect(() => {
    setAnalyticsStats(null);
    setSummaryOpen(false);
  }, [examId]);

  const [summaryOpen, setSummaryOpen] = useState(false);

  const { data: summaryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamMarksSummaryQuery,
    params: {
      ExamId: examId,
      SubjectId: subject,
      DivisionId: division,
    },
    options: {
      skip: !(examId && subject && division),
    },
  });

  const targetSummaryData = useMemo(() => {
    if (!summaryData) return null;
    return (summaryData as any).data ?? summaryData;
  }, [summaryData]);

  const handleWorkflowFlagsChange = useCallback((flags: IExamMarksWorkflowFlags) => {
    setWorkflowStatus(flags.workflowStatus as GradeEntryWorkflowStatus);
  }, []);

  const viewSubmissionDialog = useBoolean();
  const publishMarksDialog = useBoolean();
  const bulkGradeDialog = useBoolean();

  // Review & Verification Workflow Dialogs
  const importMarksDialog = useBoolean();
  const reviewDialog = useBoolean();
  const keyboardHelpDialog = useBoolean();
  const auditLogsDialog = useBoolean();
  const requestChangesDialog = useBoolean();
  const unlockDialog = useBoolean();

  // Audit Logs data query
  const { data: auditLogsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamMarksAuditLogsQuery,
    params: {
      examId,
      subjectId: subject,
      divisionId: division,
    },
    options: {
      skip: !auditLogsDialog.value || !(examId && subject && division),
    },
  });

  const resolvedAuditLogs = useMemo(() => {
    if (!auditLogsData) return [];
    return (auditLogsData as any).data ?? auditLogsData;
  }, [auditLogsData]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  // Mutations
  const [publishExamMarks, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishAndLockMarksMutation,
  });

  const [saveDraftMarks, { isLoading: isSaveDraftLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveDraftMarksMutation,
  });

  const [submitMarksForVerification, { isLoading: isSubmitLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitMarksForVerificationMutation,
  });

  const [verifyMarks, { isLoading: isVerifyLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useVerifyMarksMutation,
  });

  const [bulkSaveMarks, { isLoading: isBulkSaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useBulkSaveMarksMutation,
  });

  const [validateMarks, { data: validationData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useValidateMarksMutation,
  });

  const [requestChanges, { isLoading: isRequestChangesLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRequestChangesMutation,
  });

  const [unlockMarks, { isLoading: isUnlockLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnlockMarksMutation,
  });

  const resolvedValidation = useMemo(() => {
    if (!validationData) return { isValid: true, blockers: [], warnings: [] };
    const data = (validationData as any).data ?? validationData;
    return {
      isValid: data.isValid ?? true,
      blockers: data.blockers ?? [],
      warnings: data.warnings ?? [],
    };
  }, [validationData]);

  // Bulk operation actions stay local; Save Draft persists them in one API call.
  const queueBulkEdit = useCallback(
    (action: 'attendance' | 'marks' | 'remark' | 'clear', value?: number | string) => {
      if (selectedStudents.length === 0) return;
      setBulkEditRequest({
        id: Date.now(),
        studentIds: selectedStudents,
        action,
        value,
      });
      setSelectedStudents([]);
      setIsDirty(true);
      setSaveState('idle');
    },
    [selectedStudents]
  );

  const handleBulkMarkAttendance = async (attendance: number) => {
    queueBulkEdit('attendance', attendance);
    shikshaMitraToast.success({
      message: `Marked ${selectedStudents.length} students locally. Click Save Draft to save.`,
    });
  };

  const handleBulkApplyMarks = async (marks: number | string) => {
    const numMarks = Number(marks);
    const selectedIds = new Set(selectedStudents);
    const selectedRows = tableRows.filter((r) => selectedIds.has(r.studentId));
    const maxTotalMarks =
      selectedRows.length > 0
        ? Math.max(...selectedRows.map((r) => r.totalMarks ?? 100))
        : 100;

    if (numMarks > maxTotalMarks) {
      shikshaMitraToast.error({
        message: `Obtained marks (${numMarks}) cannot be greater than Total Marks (${maxTotalMarks}).`,
      });
      return;
    }

    queueBulkEdit('marks', marks);
    shikshaMitraToast.success({
      message: `Applied marks ${marks} locally. Click Save Draft to save.`,
    });
  };

  const handleBulkApplyRemark = async (remark: string) => {
    queueBulkEdit('remark', remark);
    shikshaMitraToast.success({
      message: `Applied custom remark locally. Click Save Draft to save.`,
    });
  };

  const handleBulkClearMarks = async () => {
    queueBulkEdit('clear');
    shikshaMitraToast.success({ message: `Cleared marks locally. Click Save Draft to save.` });
  };

  // CSV/Spreadsheet Template Export/Import
  const handleExportTemplate = () => {
    try {
      const headers = [
        'Roll Number',
        'Student Name',
        'Attendance (Present/Absent/MedicalLeave/Exempted)',
        'Obtained Marks',
        'Remarks',
      ];
      const csvRows = [headers.join(',')];

      tableRows.forEach((row) => {
        const attLabel =
          row.attendanceStatus === 1
            ? 'Absent'
            : row.attendanceStatus === 2
              ? 'MedicalLeave'
              : row.attendanceStatus === 3
                ? 'Exempted'
                : 'Present';
        csvRows.push(
          [
            `"${row.rollNo || ''}"`,
            `"${row.studentName}"`,
            `"${attLabel}"`,
            row.marks !== null ? row.marks : '',
            `"${row.feedback || ''}"`,
          ].join(',')
        );
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Grade_Entry_${subjectOptions.find((s) => s.id === subject)?.name || 'Template'}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      shikshaMitraToast.success({ message: 'CSV Template downloaded successfully.' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportSpreadsheet = async (importedRows: any[]) => {
    try {
      await bulkSaveMarks({
        examId,
        body: { subjectId: subject, divisionId: division, rows: importedRows },
      }).unwrap();
      importMarksDialog.onFalse();
      shikshaMitraToast.success({
        message: `Successfully imported ${importedRows.length} student records.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Review before submit validation trigger
  const handleTriggerReview = async () => {
    try {
      if (isDirty) {
        setSaveState('saving');
        await bulkSaveMarks({
          examId,
          body: { subjectId: subject, divisionId: division, rows: buildMarksPayload(tableRows) },
        }).unwrap();
        await saveDraftMarks({ examId, divisionId: division, subjectId: subject }).unwrap();
        setIsDirty(false);
        setSaveState('saved');
      }
      await validateMarks({ examId, divisionId: division, subjectId: subject }).unwrap();
      reviewDialog.onTrue();
    } catch (e) {
      console.error(e);
      if (isDirty) {
        setSaveState('failed');
      }
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await submitMarksForVerification({
        examId,
        divisionId: division,
        subjectId: subject,
      }).unwrap();
      reviewDialog.onFalse();
      setWorkflowStatus(GradeEntryWorkflowStatus.Submitted);
      shikshaMitraToast.success({ message: 'Marks successfully submitted for verification.' });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishMarks = async () => {
    if (!examId || !division || !subject) return;
    try {
      await publishExamMarks({ examId, divisionId: division, subjectId: subject }).unwrap();
      publishMarksDialog.onFalse();
      setWorkflowStatus(GradeEntryWorkflowStatus.Published);
      shikshaMitraToast.success({
        message: `Marks published successfully for ${examOptions.find((o) => o.examId === examId)?.examName ?? 'selected exam'}.`,
      });
    } catch (error) {
      console.error('[GradeEntry] Failed to publish marks:', error);
    }
  };

  const buildMarksPayload = useCallback(
    (rows: IExamMarkItem[]) =>
      rows.map((row) => {
        const hasAttendance = row.attendanceStatus !== null && row.attendanceStatus !== undefined;
        return {
          studentId: row.studentId,
          attendanceStatus: hasAttendance ? row.attendanceStatus : null,
          obtainedMarks: row.attendanceStatus === 0 ? row.marks : null,
          feedback: row.attendanceStatus === 0 ? (row.feedback ?? '') : '',
        };
      }),
    []
  );

  const handleWorkflowAction = async (action: 'draft' | 'verify') => {
    if (!examId || !division || !subject) return;
    const params = { examId, divisionId: division, subjectId: subject };
    const actionMap = {
      draft: {
        fn: saveDraftMarks,
        next: GradeEntryWorkflowStatus.Draft,
        msg: 'Draft saved successfully.',
      },
      verify: {
        fn: verifyMarks,
        next: GradeEntryWorkflowStatus.Verified,
        msg: 'Marks verified successfully.',
      },
    };
    const { fn, next, msg } = actionMap[action];
    try {
      if (action === 'draft') {
        setSaveState('saving');
        await bulkSaveMarks({
          examId,
          body: { subjectId: subject, divisionId: division, rows: buildMarksPayload(tableRows) },
        }).unwrap();
      }
      await fn(params).unwrap();
      setWorkflowStatus(next);
      setIsDirty(false);
      if (action === 'draft') setSaveState('saved');
      shikshaMitraToast.success({ message: msg });
    } catch (error) {
      if (action === 'draft') setSaveState('failed');
      console.error(`[GradeEntry] Failed to ${action}:`, error);
    }
  };

  const handleRequestChanges = async (note: string) => {
    try {
      await requestChanges({
        examId,
        body: { subjectId: subject, divisionId: division, reviewerNote: note },
      }).unwrap();
      requestChangesDialog.onFalse();
      setWorkflowStatus(GradeEntryWorkflowStatus.ChangesRequested);
      shikshaMitraToast.success({ message: 'Correction request successfully sent.' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockMarks = async (reason: string) => {
    try {
      await unlockMarks({
        examId,
        body: { subjectId: subject, divisionId: division, reason },
      }).unwrap();
      unlockDialog.onFalse();
      setWorkflowStatus(GradeEntryWorkflowStatus.Draft);
      shikshaMitraToast.success({ message: 'Marks successfully unlocked back to Draft.' });
    } catch (e) {
      console.error(e);
    }
  };

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
      setTimeout(() => {
        setSelectedStudent(null);
      }, 200);
    }
  };

  const actions = useCallback(
    ({ row, isLocked: locked }: any) => {
      if (locked) {
        return (
          <CustomTooltip
            title="Marks can be edited only in Draft or Changes Requested status."
            placement="left"
          >
            <span>
              <IconButton size="small" disabled>
                <Iconify icon="solar:lock-bold" width={18} sx={{ color: 'text.disabled' }} />
              </IconButton>
            </span>
          </CustomTooltip>
        );
      }
      return (
        <CustomTooltip title={row.status === 1 ? 'Update Marks' : 'Assign Marks'} placement="left">
          <IconButton
            size="small"
            onClick={() => {
              viewSubmissionDialog.onTrue();
              setSelectedStudent({ ...row, subjectId: subject, examId: row.examId || examId });
            }}
          >
            <Iconify
              icon={row.status === 1 ? GlobalIcons.edit : 'mdi:arrow-right-circle'}
              width={18}
            />
          </IconButton>
        </CustomTooltip>
      );
    },
    [viewSubmissionDialog, subject, examId]
  );

  const isGradeEntryEditable =
    workflowStatus === GradeEntryWorkflowStatus.Draft ||
    workflowStatus === GradeEntryWorkflowStatus.ChangesRequested;
  const isGradeEntryLocked = !isGradeEntryEditable;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Grade Entry"
          description="Enter and manage student examination marks and grades"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/scheduleExam' },
            { name: 'Grade Entry' },
          ]}
          action={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {/* Keyboard helper shortcut button */}
              <Tooltip title="Keyboard Shortcut Help">
                <IconButton size="small" color="primary" onClick={keyboardHelpDialog.onTrue}>
                  <Iconify icon="solar:keyboard-bold" width={22} />
                </IconButton>
              </Tooltip>

              {examId && (
                <Tooltip title="View Audit Logs History">
                  <IconButton size="small" color="info" onClick={auditLogsDialog.onTrue}>
                    <Iconify icon="solar:history-bold" width={22} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Box
            display="flex"
            sx={{
              borderRadius: '8px',
              bgcolor: 'background.paper',
              boxShadow: 'var(--shadows-3)',
              p: 1,
              gap: 1,
              mb: 1,
            }}
          >
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => handleFilterChange('class', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => handleFilterChange('division', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
              disabled={!classes}
            />
            <CustomSelect
              label="Subject"
              disabled={!division}
              options={subjectOptions}
              labelKey="name"
              valueKey="id"
              isLoading={isSubjectsLoading || isSubjectsFetching}
              onChange={(val) => handleFilterChange('subject', val as string)}
              value={subject}
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            />
            <CustomTooltip
              placement="top"
              title={examId && examOptions.find((o) => o.examId === examId)?.examName}
            >
              <Autocomplete
                disabled={!subject}
                loading={isExamsLoading || isExamsFetching}
                options={examOptions}
                getOptionLabel={(option: any) => option.examName || ''}
                isOptionEqualToValue={(option, value) => option.examId === value.examId}
                value={examOptions.find((opt) => opt.examId === examId) || null}
                onChange={(_event, newValue) => {
                  handleFilterChange('exam', newValue?.examId || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exam Title"
                    size="small"
                    fullWidth
                    sx={{ minWidth: '248px', width: '100%' }}
                  />
                )}
              />
            </CustomTooltip>
          </Box>
        </motion.div>

        {/* Unified Grade Entry Summary Card */}
        {examId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
          >
            <Card
              sx={{
                p: 0,
                mb: 1.5,
                boxShadow: 'var(--shadows-2)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  height: 4,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                }}
              />
              <Box
                onClick={() => setSummaryOpen((prev) => !prev)}
                sx={{
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.06)`,
                  borderBottom: (theme) =>
                    summaryOpen ? `1px solid ${theme.palette.divider}` : 'none',
                  '&:hover': {
                    bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.10)`,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: 'text.secondary',
                      letterSpacing: 0.8,
                    }}
                  >
                    <Iconify
                      icon="solar:document-text-bold"
                      width={16}
                      sx={{ color: 'primary.main' }}
                    />
                    Grade Entry Summary
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  {[
                    {
                      icon: 'solar:diploma-bold',
                      value: examOptions.find((o) => o.examId === examId)?.examName ?? '—',
                    },
                    {
                      icon: 'solar:book-2-bold',
                      value: subjectOptions.find((s) => s.id === subject)?.name ?? '—',
                    },
                    {
                      icon: 'solar:users-group-rounded-bold',
                      value: `${allClass.find((c) => c.id === classes)?.name ?? '—'} / ${allDivision.find((d) => d.id === division)?.name ?? '—'}`,
                    },
                    {
                      icon: 'solar:checklist-minimalistic-bold',
                      value: `Pending Publish: ${targetSummaryData?.pendingPublishedCount ?? 0} Subj`,
                    },
                  ].map((info) => (
                    <Stack key={info.value} direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={info.icon} width={14} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {info.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ ml: 'auto' }}
                  onClick={(e) => e.stopPropagation()} // Stop accordion collapse on button click
                >
                  {/* Autosave feedback badge */}
                  {saveState !== 'idle' && (
                    <Label
                      color={
                        saveState === 'saving'
                          ? 'warning'
                          : saveState === 'saved'
                            ? 'success'
                            : 'error'
                      }
                      variant="soft"
                      sx={{ py: 1.5, px: 2, mr: 0.5 }}
                    >
                      <Iconify
                        icon={
                          saveState === 'saving'
                            ? 'solar:diskette-bold'
                            : saveState === 'saved'
                              ? 'solar:check-circle-bold'
                              : 'solar:close-circle-bold'
                        }
                        width={16}
                        sx={{ mr: 0.5 }}
                      />
                      {saveState === 'saving'
                        ? 'Saving...'
                        : saveState === 'saved'
                          ? 'Saved'
                          : 'Save failed'}
                    </Label>
                  )}

                  {examId && workflowStatus === GradeEntryWorkflowStatus.Draft && (
                    <LoadingButton
                      variant="outlined"
                      size="small"
                      color="inherit"
                      loading={isSaveDraftLoading || isBulkSaveLoading}
                      startIcon={<Iconify icon="solar:diskette-bold" />}
                      onClick={() => handleWorkflowAction('draft')}
                    >
                      Save Draft
                    </LoadingButton>
                  )}

                  {examId &&
                    (workflowStatus === GradeEntryWorkflowStatus.Draft ||
                      workflowStatus === GradeEntryWorkflowStatus.ChangesRequested) && (
                      <LoadingButton
                        variant="contained"
                        size="small"
                        color="primary"
                        loading={isSubmitLoading}
                        disabled={!allMarksAssigned}
                        startIcon={<Iconify icon="solar:plain-bold" />}
                        onClick={handleTriggerReview}
                      >
                        Review & Submit
                      </LoadingButton>
                    )}

                  {examId && workflowStatus === GradeEntryWorkflowStatus.Submitted && (
                    <>
                      <LoadingButton
                        variant="outlined"
                        size="small"
                        color="error"
                        loading={isRequestChangesLoading}
                        startIcon={<Iconify icon="solar:close-circle-bold" />}
                        onClick={requestChangesDialog.onTrue}
                      >
                        Request Corrections
                      </LoadingButton>
                      <LoadingButton
                        variant="outlined"
                        size="small"
                        color="warning"
                        loading={isVerifyLoading}
                        startIcon={<Iconify icon="solar:check-circle-bold" />}
                        onClick={() => handleWorkflowAction('verify')}
                      >
                        Verify Marks
                      </LoadingButton>
                    </>
                  )}

                  {examId && workflowStatus === GradeEntryWorkflowStatus.Verified && (
                    <LoadingButton
                      variant="contained"
                      size="small"
                      color="primary"
                      loading={isPublishLoading}
                      disabled={!allMarksAssigned}
                      startIcon={<Iconify icon={GlobalIcons.publish} />}
                      onClick={() => publishMarksDialog.onTrue()}
                      sx={{ px: '20px' }}
                    >
                      Publish Marks
                    </LoadingButton>
                  )}

                  {examId && workflowStatus === GradeEntryWorkflowStatus.Published && (
                    <LoadingButton
                      variant="outlined"
                      size="small"
                      color="error"
                      loading={isUnlockLoading}
                      startIcon={<Iconify icon="solar:lock-open-bold" />}
                      onClick={unlockDialog.onTrue}
                    >
                      Unlock Marks
                    </LoadingButton>
                  )}

                  <Label
                    color={GradeEntryWorkflowStatusColor[workflowStatus] as any}
                    variant="soft"
                  >
                    {GradeEntryWorkflowStatusLabel[workflowStatus]}
                  </Label>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSummaryOpen((prev) => !prev);
                    }}
                    sx={{
                      transition: 'transform 0.2s',
                      transform: summaryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <Iconify icon="solar:alt-arrow-down-bold" width={16} />
                  </IconButton>
                </Stack>
              </Box>

              <Collapse in={summaryOpen}>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TimetableSettingsSummaryCards cards={summaryCards} cardsPerRow={3} />
                    </Grid>

                    <Grid
                      size={{ xs: 12, md: 4 }}
                      sx={{
                        borderLeft: { md: '1px solid' },
                        borderColor: { md: 'divider' },
                        pl: { md: 2 },
                      }}
                    >
                      {analyticsStats ? (
                        <Stack spacing={1} height="100%">
                          <Stack spacing={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  height: 8,
                                  borderRadius: 1,
                                  flex: analyticsStats.passPercentage || 1,
                                  bgcolor: 'success.main',
                                  minWidth: analyticsStats.passPercentage ? 0 : 'auto',
                                }}
                              />
                              {analyticsStats.failPercentage > 0 && (
                                <Box
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    flex: analyticsStats.failPercentage,
                                    bgcolor: 'error.main',
                                  }}
                                />
                              )}
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Pass{' '}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    fontWeight={700}
                                    color="success.main"
                                  >
                                    {analyticsStats.passCount} ({analyticsStats.passPercentage}%)
                                  </Typography>
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Fail{' '}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    fontWeight={700}
                                    color="error.main"
                                  >
                                    {analyticsStats.failCount} ({analyticsStats.failPercentage}%)
                                  </Typography>
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Divider sx={{ borderStyle: 'dashed' }} />
                          <Stack spacing={1}>
                            <Typography
                              variant="overline"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                color: 'text.secondary',
                                letterSpacing: 0.8,
                              }}
                            >
                              <Iconify
                                icon="solar:clipboard-check-bold"
                                width={14}
                                sx={{ color: 'success.main' }}
                              />
                              Result Readiness
                            </Typography>
                            <Grid container spacing={1}>
                              {[
                                { label: 'All Students Graded', done: allMarksAssigned },
                                {
                                  label: 'Verification Complete',
                                  done: workflowStatus >= GradeEntryWorkflowStatus.Verified,
                                },
                                {
                                  label: 'No Missing Marks',
                                  done: analyticsStats.pendingCount === 0,
                                },
                                {
                                  label: 'Ready For Result Generation',
                                  done:
                                    allMarksAssigned &&
                                    workflowStatus >= GradeEntryWorkflowStatus.Published,
                                },
                              ].map((check) => (
                                <Grid size={{ xs: 6 }} key={check.label}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{
                                      py: 0.4,
                                      px: 0.75,
                                      borderRadius: 1,
                                      bgcolor: (theme) =>
                                        check.done
                                          ? alpha(theme.palette.success.main, 0.1)
                                          : alpha(theme.palette.grey[500], 0.06),
                                    }}
                                  >
                                    <Iconify
                                      icon={
                                        check.done
                                          ? 'solar:check-circle-bold'
                                          : 'solar:close-circle-bold'
                                      }
                                      width={14}
                                      sx={{
                                        color: check.done ? 'success.main' : 'text.disabled',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color={check.done ? 'text.primary' : 'text.disabled'}
                                      lineHeight={1.2}
                                      noWrap
                                    >
                                      {check.label}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              ))}
                            </Grid>
                          </Stack>
                        </Stack>
                      ) : (
                        <Stack spacing={1} height="100%">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton
                              key={i}
                              variant="rounded"
                              height={22}
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                          <Divider />
                          {[...Array(4)].map((_, i) => (
                            <Skeleton
                              key={i}
                              variant="rounded"
                              height={18}
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Grid>
                  </Grid >
                </Box >
              </Collapse >
            </Card >
          </motion.div >
        )}

        {
          examId ? (
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Bulk actions toolbar */}
              {!isGradeEntryLocked && (
                <BulkGradeEntryToolbar
                  selectedCount={selectedStudents.length}
                  onClearSelection={() => setSelectedStudents([])}
                  onMarkPresent={() => handleBulkMarkAttendance(0)}
                  onMarkAbsent={() => handleBulkMarkAttendance(1)}
                  onApplyMarks={handleBulkApplyMarks}
                  onApplyRemark={handleBulkApplyRemark}
                  onClearMarks={handleBulkClearMarks}
                  onExport={handleExportTemplate}
                  onImport={importMarksDialog.onTrue}
                />
              )}

              <GradeEntryTable
                selectedStudents={selectedStudents}
                handleSelectStudent={handleSelectStudent}
                actions={actions}
                classId={classes}
                divisionId={division}
                subjectId={subject}
                examId={examId}
                isLocked={isGradeEntryLocked}
                onAllAssignedChange={(val) => {
                  setAllMarksAssigned(val);
                  setIsDirty(true);
                }}
                onStatsChange={setAnalyticsStats}
                onWorkflowFlagsChange={handleWorkflowFlagsChange}
                onRowsChange={setTableRows}
                bulkEditRequest={bulkEditRequest}
              />
            </Box>
          ) : (
            <Card
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.03)`,
                boxShadow: 'var(--shadows-2)',
              }}
            >
              <Stack spacing={1} alignItems="center" sx={{ px: 3, maxWidth: 460 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.12)`,
                  }}
                >
                  <Iconify icon="solar:clipboard-list-bold" width={36} />
                </Box>
                <Stack spacing={1}>
                  <Typography variant="h6">Please select an exam</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose an exam title from the filters above to view students and start entering
                    marks.
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          )
        }

        {/* Dialogs and drawers */}
        <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={() => {
            viewSubmissionDialog.onFalse();
            setTimeout(() => {
              setSelectedStudent(null);
            }, 200);
          }}
          title={
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              alignItems="center"
              component="span"
              sx={{ fontWeight: 'normal' }}
            >
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                {selectedStudent?.status === 1 ? 'Update Marks' : 'Assign Marks'}
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Enter or update the marks and feedback remarks for the selected student."
              >
                <Iconify
                  icon={GlobalIcons.info}
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                  height={16}
                />
              </CustomTooltip>
            </Box>
          }
        >
          <AssignGrade data={selectedStudent} onClose={handleClose} />
        </CustomDialog>

        <ImportMarksPreviewDialog
          open={importMarksDialog.value}
          onClose={importMarksDialog.onFalse}
          studentList={tableRows.map((r) => ({
            studentId: r.studentId,
            studentName: r.studentName,
            rollNo: r.rollNo || '',
            totalMarks: r.totalMarks,
          }))}
          onImport={handleImportSpreadsheet}
          isLoading={isBulkSaveLoading}
        />

        <GradeEntryReviewDialog
          open={reviewDialog.value}
          onClose={reviewDialog.onFalse}
          stats={{
            totalCount: analyticsStats?.totalCount ?? 0,
            gradedCount: (analyticsStats?.totalCount ?? 0) - (analyticsStats?.pendingCount ?? 0),
            pendingCount: analyticsStats?.pendingCount ?? 0,
            passCount: analyticsStats?.passCount ?? 0,
            failCount: analyticsStats?.failCount ?? 0,
            averageMarks: analyticsStats?.averageMarks ?? 0,
            highestMarks: analyticsStats?.highestMarks ?? 0,
            lowestMarks: analyticsStats?.lowestMarks ?? 0,
          }}
          validation={resolvedValidation}
          onFix={(studentId) => {
            reviewDialog.onFalse();
            setTimeout(() => {
              const el = document.querySelector(
                `input[data-student-id="${studentId}"][data-col-type="marks"]`
              ) as HTMLInputElement;
              el?.focus();
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
          onSubmit={handleFinalSubmit}
          submitLabel="Confirm & Submit marks"
          isSubmitLoading={isSubmitLoading}
        />

        {/* Keyboard Shortcuts Dialog */}
        <CustomDialog
          open={keyboardHelpDialog.value}
          handleClose={keyboardHelpDialog.onFalse}
          title={
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              alignItems="center"
              component="span"
              sx={{ fontWeight: 'normal' }}
            >
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                Keyboard Cell Navigation Shortcuts
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Use these keyboard shortcuts to navigate and edit grade input fields quickly."
              >
                <Iconify
                  icon={GlobalIcons.info}
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                  height={16}
                />
              </CustomTooltip>
            </Box>
          }
          maxWidth="xs"
          hasForm={false}
        >
          <Scrollbar sx={{ height: '350px' }}>
            <List>
              {[
                { key: 'Enter / ArrowDown', desc: 'Save and move to next student cell' },
                { key: 'ArrowUp', desc: 'Move to previous student cell' },
                { key: 'ArrowRight', desc: 'Move focus from marks input to remarks input' },
                { key: 'ArrowLeft', desc: 'Move focus from remarks input back to marks input' },
                { key: 'Tab', desc: 'Navigate to next control' },
                { key: 'Esc', desc: 'Revert active inline edits' },
              ].map((shortcut) => (
                <ListItem key={shortcut.key} sx={{ py: 0.75 }}>
                  <ListItemText
                    primary={
                      <Chip
                        label={shortcut.key}
                        size="small"
                        variant="soft"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    }
                    secondary={shortcut.desc}
                    secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5 } }}
                  />
                </ListItem>
              ))}
            </List>
          </Scrollbar>
          <DialogActions>
            <SubmitButton buttonText="Got it" onClick={keyboardHelpDialog.onFalse} />
          </DialogActions>
        </CustomDialog>

        {/* Audit Logs Dialog */}
        <CustomDialog
          open={auditLogsDialog.value}
          handleClose={auditLogsDialog.onFalse}
          title={
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              alignItems="center"
              component="span"
              sx={{ fontWeight: 'normal' }}
            >
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                Marks Revision Audit Logs
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Review grade change logs, workflow updates, and auditor comments."
              >
                <Iconify
                  icon={GlobalIcons.info}
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                  height={16}
                />
              </CustomTooltip>
            </Box>
          }
          maxWidth="sm"
          hasForm={false}
        >
          <DialogScrollContent>
            <List>
              {resolvedAuditLogs.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  No historical revision records found.
                </Typography>
              ) : (
                resolvedAuditLogs.map((log: any, idx: number) => (
                  <ListItem
                    key={idx}
                    sx={{
                      borderBottom: '1px solid divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemText
                      primary={log.action}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            By {log.changedBy}
                          </Typography>
                          {` — ${log.details}`}
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </DialogScrollContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CancelButton buttonText="Close" onClick={auditLogsDialog.onFalse} />
          </DialogActions>
        </CustomDialog>

        {/* Request Changes Note Dialog */}
        <CustomDialog
          open={requestChangesDialog.value}
          handleClose={requestChangesDialog.onFalse}
          title={
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              alignItems="center"
              component="span"
              sx={{ fontWeight: 'normal' }}
            >
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                Request Grade Corrections
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Send the grade entry back to the teacher with reviewer notes for corrections."
              >
                <Iconify
                  icon={GlobalIcons.info}
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                  height={16}
                />
              </CustomTooltip>
            </Box>
          }
          maxWidth="xs"
          hasForm={false}
        >
          <DialogScrollContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pt: 1 }}>
              Provide reviewer notes indicating why corrections are required:
            </Typography>
            <TextField
              id="reviewer-note-input"
              multiline
              rows={4}
              fullWidth
              placeholder="e.g. Please verify Roll #4 obtained marks, looks lower than average..."
            />
          </DialogScrollContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CancelButton onClick={requestChangesDialog.onFalse} />
            <SubmitButton
              buttonText="Request Changes"
              loading={isRequestChangesLoading}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
              onClick={() => {
                const el = document.getElementById('reviewer-note-input') as HTMLTextAreaElement;
                handleRequestChanges(el?.value || '');
              }}
            />
          </DialogActions>
        </CustomDialog>

        {/* Unlock Marks Reason Dialog */}
        <CustomDialog
          open={unlockDialog.value}
          handleClose={unlockDialog.onFalse}
          title={
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              alignItems="center"
              component="span"
              sx={{ fontWeight: 'normal' }}
            >
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                Unlock Published Marks
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Unlock the published grades to allow editing and revision."
              >
                <Iconify
                  icon={GlobalIcons.info}
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                  height={16}
                />
              </CustomTooltip>
            </Box>
          }
          maxWidth="xs"
          hasForm={false}
        >
          <DialogScrollContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pt: 1 }}>
              Are you sure you want to unlock published marks? Provide an unlock reason for audit
              trail:
            </Typography>
            <TextField
              id="unlock-reason-input"
              multiline
              rows={3}
              fullWidth
              placeholder="e.g. Correcting clerical mistake in roll #8..."
            />
          </DialogScrollContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CancelButton onClick={unlockDialog.onFalse} />
            <SubmitButton
              buttonText="Confirm Unlock"
              loading={isUnlockLoading}
              startIcon={<Iconify icon="solar:lock-open-bold" />}
              onClick={() => {
                const el = document.getElementById('unlock-reason-input') as HTMLTextAreaElement;
                handleUnlockMarks(el?.value || '');
              }}
            />
          </DialogActions>
        </CustomDialog>

        {/* Unsaved Changes switch confirmation */}
        <ConfirmDialog
          open={Boolean(pendingFilterSwitch)}
          onClose={() => setPendingFilterSwitch(null)}
          title="Unsaved Changes Detected"
          content="You have unsaved changes in this page. Switching the filter scope will discard all unsaved edits. Do you want to proceed?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (pendingFilterSwitch) {
                  applyFilter(pendingFilterSwitch.type, pendingFilterSwitch.value);
                  setPendingFilterSwitch(null);
                }
              }}
            >
              Discard & Switch
            </Button>
          }
        />

        <ConfirmDialog
          open={publishMarksDialog.value}
          onClose={() => {
            publishMarksDialog.onFalse();
          }}
          title="Publish Marks"
          content={
            <>
              Are you sure you want to publish marks for{' '}
              <strong>{examOptions.find((o) => o.examId === examId)?.examName ?? examId}</strong>?
              This will make the marks visible to students and parents and lock editing.
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              size="small"
              loading={isPublishLoading}
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={handlePublishMarks}
            >
              Publish & Lock
            </LoadingButton>
          }
        />
      </Box >
    </Box >
  );
};

export default GradeEntry;
