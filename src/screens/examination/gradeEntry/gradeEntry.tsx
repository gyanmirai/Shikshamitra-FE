'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
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
  Stack,
  Divider,
  Skeleton,
  Collapse,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  useVerifyMarksMutation,
  useSaveDraftMarksMutation,
  useGetExamMarksSummaryQuery,
  usePublishAndLockMarksMutation,
  useSubmitMarksForVerificationMutation,
} from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';

import type { TabComponentType } from '../../hr/leave-request';
import type { IExamAnalyticsStats, IStudentExamGradeEntry, IExamMarksWorkflowFlags } from './type';

const GradeEntry = (props: TabComponentType) => {
  // Dialog control for showing/hiding modal
  const dialog = useBoolean();
  // Search parameters from URL and function to update them
  const { searchParams } = props;

  // Selected subject for grade entry
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  // Type of assignment (quiz, test, homework etc)
  const [assignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  // Title of the selected assignment
  const [examId, setExamId] = useState(searchParams?.examId ? searchParams?.examId : '');
  // Query to fetch class data
  // const { data: classData, isLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetClassQuery,
  // });

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Reset subject and examId when class or division changes
  useEffect(() => {
    setSubject('');
    setExamId('');
  }, [classes, division]);

  // Reset examId when subject changes
  useEffect(() => {
    setExamId('');
  }, [subject]);

  // Fetch subjects dynamically based on selected class and division
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

  // Map API response to { id, name } options for the Subject dropdown
  const subjectOptions = useMemo<{ id: string; name: string }[]>(() => {
    const raw: any[] = Array.isArray(subjectData)
      ? subjectData
      : (subjectData?.data?.items ?? subjectData?.items ?? subjectData?.records ?? []);
    return raw.map((s: any) => ({
      id: s.subjectId ?? s.id ?? '',
      name: s.subjectName ?? s.name ?? '',
    }));
  }, [subjectData]);

  // Fetch exams dynamically based on selected class, division, and subject
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

  // Map API exam items to a stable options array for the Exam Title Autocomplete
  const examOptions = useMemo<{ examId: string; examName: string }[]>(() => {
    const raw: any[] = examData?.data?.items ?? examData?.items ?? [];
    return raw.map((e: any) => ({
      examId: e.examId ?? e.id ?? '',
      examName: e.examName ?? e.name ?? '',
    }));
  }, [examData]);

  // Currently selected student for grade entry
  const [selectedStudent, setSelectedStudent] = useState<IStudentExamGradeEntry | null>(null);
  // Array of selected student IDs for bulk grade assignment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  // True when every student row has status === 1 (marks assigned)
  const [allMarksAssigned, setAllMarksAssigned] = useState(false);
  // Analytics stats computed by GradeEntryTable
  const [analyticsStats, setAnalyticsStats] = useState<IExamAnalyticsStats | null>(null);
  // Current workflow status of the marks entry for this exam/division/subject
  // Initialised from the API response by handleWorkflowFlagsChange
  const [workflowStatus, setWorkflowStatus] = useState<GradeEntryWorkflowStatus>(
    GradeEntryWorkflowStatus.Draft
  );

  // Reset stats whenever the user selects a different exam
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

  // Called by GradeEntryTable when GET /marks returns – syncs local state with DB
  const handleWorkflowFlagsChange = useCallback((flags: IExamMarksWorkflowFlags) => {
    setWorkflowStatus(flags.workflowStatus as GradeEntryWorkflowStatus);
  }, []);

  // Dialog control for viewing student submission
  const viewSubmissionDialog = useBoolean();
  // Dialog control for viewing student submission
  const publishMarksDialog = useBoolean();
  // Dialog control for bulk grade assignment
  const bulkGradeDialog = useBoolean();

  /**
   * Handles selection/deselection of a student for bulk grade assignment
   * @param studentId - The ID of the student to toggle selection
   */
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

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

  const handleWorkflowAction = async (action: 'draft' | 'submit' | 'verify') => {
    if (!examId || !division || !subject) return;
    const params = { examId, divisionId: division, subjectId: subject };
    const actionMap = {
      draft: {
        fn: saveDraftMarks,
        next: GradeEntryWorkflowStatus.Draft,
        msg: 'Draft saved successfully.',
      },
      submit: {
        fn: submitMarksForVerification,
        next: GradeEntryWorkflowStatus.Submitted,
        msg: 'Marks submitted for verification.',
      },
      verify: {
        fn: verifyMarks,
        next: GradeEntryWorkflowStatus.Verified,
        msg: 'Marks verified successfully.',
      },
    };
    const { fn, next, msg } = actionMap[action];
    try {
      await fn(params).unwrap();
      setWorkflowStatus(next);
      shikshaMitraToast.success({ message: msg });
    } catch (error) {
      console.error(`[GradeEntry] Failed to ${action}:`, error);
    }
  };

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();

  /**
   * Closes all dialogs and resets selected student state
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
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
          <CustomTooltip title="Marks Locked" placement="left">
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
              sx={{ color: row.status === 1 ? 'primary.main' : 'success.main' }}
            />
          </IconButton>
        </CustomTooltip>
      );
    },
    [viewSubmissionDialog, subject, examId]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CustomBreadcrumbs
          heading="Grade Entry"
          description="Enter and manage student examination marks and grades"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/scheduleExam' },
            { name: 'Grade Entry' },
          ]}
          action={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {examId && workflowStatus === GradeEntryWorkflowStatus.Draft && (
                <LoadingButton
                  variant="outlined"
                  size="small"
                  color="inherit"
                  loading={isSaveDraftLoading}
                  startIcon={<Iconify icon="solar:diskette-bold" />}
                  onClick={() => handleWorkflowAction('draft')}
                >
                  Save Draft
                </LoadingButton>
              )}
              {examId && workflowStatus === GradeEntryWorkflowStatus.Draft && (
                <LoadingButton
                  variant="outlined"
                  size="small"
                  color="info"
                  loading={isSubmitLoading}
                  disabled={!allMarksAssigned}
                  startIcon={<Iconify icon="solar:plain-bold" />}
                  onClick={() => handleWorkflowAction('submit')}
                >
                  Submit
                </LoadingButton>
              )}
              {examId && workflowStatus === GradeEntryWorkflowStatus.Submitted && (
                <LoadingButton
                  variant="outlined"
                  size="small"
                  color="warning"
                  loading={isVerifyLoading}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={() => handleWorkflowAction('verify')}
                >
                  Verify
                </LoadingButton>
              )}
              {examId && workflowStatus === GradeEntryWorkflowStatus.Verified && (
                <LoadingButton
                  variant="contained"
                  size="small"
                  loading={isPublishLoading}
                  disabled={!allMarksAssigned}
                  startIcon={<Iconify icon={GlobalIcons.publish} />}
                  onClick={() => publishMarksDialog.onTrue()}
                  sx={{ px: '24px' }}
                >
                  Publish Marks
                </LoadingButton>
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
              gap: 2,
              mb: 1,
            }}
          >
            {' '}
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClass(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
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
              onChange={(val) => {
                setSubject(val as string);
              }}
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
                  setExamId(newValue?.examId || '');
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
              {/* Accent bar */}
              <Box
                sx={{
                  height: 4,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                }}
              />
              {/* Card header */}
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
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
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
                    <Stack key={info.value} direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon={info.icon} width={14} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {info.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto' }}>
                  <Label
                    color={GradeEntryWorkflowStatusColor[workflowStatus] as any}
                    variant="soft"
                  >
                    {GradeEntryWorkflowStatusLabel[workflowStatus]}
                  </Label>
                  <IconButton
                    size="small"
                    sx={{
                      transition: 'transform 0.2s',
                      transform: summaryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <Iconify icon="solar:alt-arrow-down-bold" width={16} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Main content */}
              <Collapse in={summaryOpen}>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* Left: Stats KPIs + Progress bar */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Grid container spacing={1.5} sx={{ mb: analyticsStats ? 2 : 0 }}>
                        {(analyticsStats
                          ? [
                              {
                                label: 'Total Students',
                                value: analyticsStats.totalCount,
                                icon: 'solar:user-bold',
                                color: 'text.primary',
                              },
                              {
                                label: 'Graded',
                                value: analyticsStats.totalCount - analyticsStats.pendingCount,
                                icon: 'solar:check-square-bold',
                                color: 'success.main',
                              },
                              {
                                label: 'Pending',
                                value: analyticsStats.pendingCount,
                                icon: 'solar:clock-circle-bold',
                                color:
                                  analyticsStats.pendingCount > 0
                                    ? 'warning.main'
                                    : 'text.disabled',
                              },
                              {
                                label: 'Highest Marks',
                                value: analyticsStats.highestMarks,
                                icon: 'solar:arrow-up-bold',
                                color: 'success.main',
                              },
                              {
                                label: 'Lowest Marks',
                                value: analyticsStats.lowestMarks,
                                icon: 'solar:arrow-down-bold',
                                color: 'error.main',
                              },
                              {
                                label: 'Average Marks',
                                value: analyticsStats.averageMarks,
                                icon: 'solar:graph-new-bold',
                                color: 'info.main',
                              },
                              {
                                label: 'Pending Publish',
                                value: `${targetSummaryData?.pendingPublishedCount ?? 0} Subj`,
                                icon: 'solar:file-send-bold',
                                color:
                                  (targetSummaryData?.pendingPublishedCount ?? 0) > 0
                                    ? 'warning.main'
                                    : 'success.main',
                              },
                            ]
                          : Array.from({ length: 7 }, (_, i) => ({
                              _skeleton: true,
                              key: `sk-${i}`,
                            }))
                        ).map((stat: any) =>
                          stat._skeleton ? (
                            <Grid key={stat.key} size={{ xs: 6, sm: 4 }}>
                              <Skeleton variant="rounded" height={58} sx={{ borderRadius: 1.5 }} />
                            </Grid>
                          ) : (
                            <Grid key={stat.label} size={{ xs: 6, sm: 4 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                  p: 1.25,
                                  borderRadius: 1.5,
                                  bgcolor: (theme) =>
                                    `rgba(${theme.palette.grey['500Channel']} / 0.04)`,
                                  border: (theme) => `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Iconify
                                  icon={stat.icon}
                                  width={18}
                                  sx={{ color: stat.color, flexShrink: 0 }}
                                />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    lineHeight={1.2}
                                  >
                                    {stat.label}
                                  </Typography>
                                  <Typography variant="subtitle2" fontWeight={700} lineHeight={1.4}>
                                    {String(stat.value)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Grid>

                    {/* Right: Pass/Fail + Result Readiness */}
                    <Grid
                      size={{ xs: 12, md: 4 }}
                      sx={{
                        borderLeft: { md: '1px solid' },
                        borderColor: { md: 'divider' },
                        pl: { md: 2 },
                      }}
                    >
                      {analyticsStats ? (
                        <Stack spacing={1.5} height="100%">
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify
                                  icon="solar:check-circle-bold"
                                  width={15}
                                  sx={{ color: 'success.main' }}
                                />
                                <Typography variant="caption" color="success.main" fontWeight={600}>
                                  Pass
                                </Typography>
                              </Stack>
                              <Typography variant="caption" fontWeight={700} color="success.main">
                                {analyticsStats.passCount} ({analyticsStats.passPercentage}%)
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify
                                  icon="solar:close-circle-bold"
                                  width={15}
                                  sx={{ color: 'error.main' }}
                                />
                                <Typography variant="caption" color="error.main" fontWeight={600}>
                                  Fail
                                </Typography>
                              </Stack>
                              <Typography variant="caption" fontWeight={700} color="error.main">
                                {analyticsStats.failCount} ({analyticsStats.failPercentage}%)
                              </Typography>
                            </Stack>
                          </Stack>
                          <Divider />
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
                            <Grid container spacing={0.75}>
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
                                <Grid key={check.label} size={{ xs: 6 }}>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <Iconify
                                      icon={
                                        check.done
                                          ? 'solar:check-circle-bold'
                                          : 'solar:close-circle-bold'
                                      }
                                      width={16}
                                      sx={{
                                        color: check.done ? 'success.main' : 'text.disabled',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color={check.done ? 'text.primary' : 'text.disabled'}
                                      lineHeight={1.3}
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
                        <Stack spacing={1.5} height="100%">
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
                  </Grid>
                </Box>
              </Collapse>
            </Card>
          </motion.div>
        )}

        {examId ? (
          <GradeEntryTable
            selectedStudents={selectedStudents}
            handleSelectStudent={handleSelectStudent}
            actions={actions}
            classId={classes}
            divisionId={division}
            subjectId={subject}
            examId={examId}
            isLocked={workflowStatus === GradeEntryWorkflowStatus.Published}
            onAllAssignedChange={setAllMarksAssigned}
            onStatsChange={setAnalyticsStats}
            onWorkflowFlagsChange={handleWorkflowFlagsChange}
          />
        ) : (
          <Card
            sx={{
              minHeight: 420,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.03)`,
              boxShadow: 'var(--shadows-2)',
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ px: 3, maxWidth: 460 }}>
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
              <Stack spacing={0.75}>
                <Typography variant="h6">Please select an exam</Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose an exam title from the filters above to view students and start entering
                  marks.
                </Typography>
              </Stack>
            </Stack>
          </Card>
        )}

        <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={() => {
            viewSubmissionDialog.onFalse();
            setTimeout(() => {
              setSelectedStudent(null);
            }, 200); // Adjust timing based on dialog animation if needed
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {selectedStudent?.status === 1 ? 'Update Marks' : 'Assign Marks'}
              </Typography>
              <CustomTooltip
                sx={{ textAlign: 'justify' }}
                arrow
                placement="right"
                title={
                  selectedStudent?.status === 1
                    ? 'You can modify the existing marks, grades and feedback for this student.'
                    : 'Input marks, assign grades, and give feedback for the student.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <AssignGrade data={selectedStudent} onClose={handleClose} />
        </CustomDialog>

        <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
        >
          <AssignGrade />
        </CustomDialog>

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
              This will make the marks visible to students and cannot be undone.
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
              Publish
            </LoadingButton>
          }
        />
      </Box>
    </Box>
  );
};

export default GradeEntry;
