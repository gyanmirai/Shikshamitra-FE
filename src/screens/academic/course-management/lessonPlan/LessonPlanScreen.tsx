'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Stack,
  Button,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import SettingsTab from './components/SettingsTab';
import ReviewQueueTab from './components/ReviewQueueTab';
import TeachingKpiCards from './components/TeachingKpiCards';
import WeeklyPlannerTab from './components/WeeklyPlannerTab';
import SubmitDiaryModal from './components/SubmitDiaryModal';
import AddLessonPlanModal from './components/AddLessonPlanModal';
import AiLessonBuilderDrawer from './components/AiLessonBuilderDrawer';
import {
  getActiveFilters,
  LessonPlanFilters,
  LessonPlanActiveFilters,
} from './components/LessonPlanFilters';
import {
  todayIso,
  weekStartIso,
  classOptions,
  periodTimeMap,
  teacherOptions,
  chapterOptions,
  subjectOptions,
  initialSettings,
  divisionOptions,
  initialLessonPlans,
  initialHealthScore,
  initialDiaryEntries,
} from './lessonPlanData';

import type { DiaryFormState } from './components/SubmitDiaryModal';
import type { LessonFormState } from './components/AddLessonPlanModal';
import type {
  PlanStatus,
  DiaryStatus,
  LessonPlanRow,
  TeacherDiaryRow,
  LessonPlanSettings,
  TeachingHealthScore,
} from './lessonPlanData';

type ReviewTarget = { type: 'plan' | 'diary'; id: string };

const planStatusColor: Record<
  PlanStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  NeedsChanges: 'warning',
  Missed: 'error',
  Rescheduled: 'info',
  Cancelled: 'default',
  AutoCreated: 'info',
  AiGenerated: 'secondary' as any,
};

const diaryStatusColor: Record<
  DiaryStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  NotSubmitted: 'default',
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  NeedsChanges: 'warning',
  Backdated: 'info',
  EvidenceMissing: 'error',
};

const QUICK_FILTER_LABELS: Record<string, string> = {
  today: 'Today',
  this_week: 'This Week',
  pending_diary: 'Pending Diary',
  pending_approval: 'Pending Approval',
  missed_lessons: 'Missed Lessons',
  delayed_progress: 'Delayed Progress',
  no_evidence: 'No Evidence',
  backdated: 'Backdated',
  my_lessons: 'My Lessons',
  my_reviews: 'My Reviews',
};

const allClassOptions = [{ value: 'all', label: 'All Classes' }, ...classOptions];
const allDivisionOptions = [{ value: 'all', label: 'All Divisions' }, ...divisionOptions];
const allSubjectOptions = [{ value: 'all', label: 'All Subjects' }, ...subjectOptions];
const allChapterOptions = [{ value: 'all', label: 'All Chapters' }, ...chapterOptions];
const allTeacherOptions = [{ value: 'all', label: 'All Teachers' }, ...teacherOptions];

const TABS = [
  { value: 'lessonList', label: 'Lesson Plans', icon: 'mdi:book-open-outline' },
  { value: 'weeklyPlanner', label: 'Weekly Planner', icon: 'mdi:calendar-week-outline' },
  { value: 'teacherDiary', label: 'Teacher Diary', icon: 'mdi:notebook-edit-outline' },
  { value: 'reviewQueue', label: 'Review Queue', icon: 'mdi:clipboard-check-outline' },
  { value: 'settings', label: 'Settings', icon: 'mdi:cog-outline' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

const LessonPlanScreen = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('lessonList');
  const [lessonPlans, setLessonPlans] = useState<LessonPlanRow[]>(initialLessonPlans);
  const [diaryEntries, setDiaryEntries] = useState<TeacherDiaryRow[]>(initialDiaryEntries);
  const [healthScore] = useState<TeachingHealthScore>(initialHealthScore);
  const [settings, setSettings] = useState<LessonPlanSettings>(initialSettings);

  // Filter state
  const [academicYearFilter, setAcademicYearFilter] = useState('2026-27');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [planStatusFilter, setPlanStatusFilter] = useState('all');
  const [diaryStatusFilter, setDiaryStatusFilter] = useState('all');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs(weekStartIso));
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs(weekStartIso).add(6, 'day'));
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const activeFiltersState = useMemo(
    () => ({
      academicYear: academicYearFilter,
      teacher: teacherFilter,
      class: classFilter,
      division: divisionFilter,
      subject: subjectFilter,
      chapter: chapterFilter,
      planStatus: planStatusFilter,
      diaryStatus: diaryStatusFilter,
      approvalStatus: approvalStatusFilter,
      fromDate,
      toDate,
      quickFilter,
    }),
    [
      academicYearFilter,
      teacherFilter,
      classFilter,
      divisionFilter,
      subjectFilter,
      chapterFilter,
      planStatusFilter,
      diaryStatusFilter,
      approvalStatusFilter,
      fromDate,
      toDate,
      quickFilter,
    ]
  );

  const handleFilterChange = useCallback((patch: Partial<typeof activeFiltersState>) => {
    if (patch.academicYear !== undefined) setAcademicYearFilter(patch.academicYear);
    if (patch.teacher !== undefined) setTeacherFilter(patch.teacher);
    if (patch.class !== undefined) setClassFilter(patch.class);
    if (patch.division !== undefined) setDivisionFilter(patch.division);
    if (patch.subject !== undefined) setSubjectFilter(patch.subject);
    if (patch.chapter !== undefined) setChapterFilter(patch.chapter);
    if (patch.planStatus !== undefined) setPlanStatusFilter(patch.planStatus);
    if (patch.diaryStatus !== undefined) setDiaryStatusFilter(patch.diaryStatus);
    if (patch.approvalStatus !== undefined) setApprovalStatusFilter(patch.approvalStatus);
    if (patch.fromDate !== undefined) setFromDate(patch.fromDate);
    if (patch.toDate !== undefined) setToDate(patch.toDate);
    if (patch.quickFilter !== undefined) setQuickFilter(patch.quickFilter);
  }, []);

  const handleResetFilters = useCallback(() => {
    setAcademicYearFilter('2026-27');
    setTeacherFilter('all');
    setClassFilter('all');
    setDivisionFilter('all');
    setSubjectFilter('all');
    setChapterFilter('all');
    setPlanStatusFilter('all');
    setDiaryStatusFilter('all');
    setApprovalStatusFilter('all');
    setFromDate(dayjs(weekStartIso));
    setToDate(dayjs(weekStartIso).add(6, 'day'));
    setQuickFilter(null);
  }, []);

  // Dialog / drawer state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [diaryModalOpen, setDiaryModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<LessonPlanRow | null>(null);
  const [prefillDate, setPrefillDate] = useState<Dayjs | null>(null);
  const [activePlanForDiary, setActivePlanForDiary] = useState<LessonPlanRow | null>(null);

  const getDiaryForLesson = useCallback(
    (lessonPlanId: string) => diaryEntries.find((e) => e.lessonPlanId === lessonPlanId) ?? null,
    [diaryEntries]
  );

  // ─── Filtered Plans ──────────────────────────────────────────────────────────

  const filteredPlans = useMemo(() => {
    const from = fromDate?.format('YYYY-MM-DD');
    const to = toDate?.format('YYYY-MM-DD');
    const todayStr = todayIso;
    const weekEnd = dayjs(weekStartIso).add(6, 'day').format('YYYY-MM-DD');

    return lessonPlans.filter((plan) => {
      if (plan.academicYear !== academicYearFilter) return false;
      if (teacherFilter !== 'all' && plan.teacherName !== teacherFilter) return false;
      if (classFilter !== 'all' && plan.className !== classFilter) return false;
      if (divisionFilter !== 'all' && plan.divisionName !== divisionFilter) return false;
      if (subjectFilter !== 'all' && plan.subjectName !== subjectFilter) return false;
      if (chapterFilter !== 'all' && plan.chapterName !== chapterFilter) return false;
      if (planStatusFilter !== 'all' && plan.planStatus !== planStatusFilter) return false;
      if (diaryStatusFilter !== 'all' && plan.diaryStatus !== diaryStatusFilter) return false;
      if (approvalStatusFilter !== 'all' && plan.approvalStatus !== approvalStatusFilter)
        return false;
      if (from && plan.plannedDate < from) return false;
      if (to && plan.plannedDate > to) return false;

      if (quickFilter) {
        if (quickFilter === 'today' && plan.plannedDate !== todayStr) return false;
        if (
          quickFilter === 'this_week' &&
          (plan.plannedDate < weekStartIso || plan.plannedDate > weekEnd)
        )
          return false;
        if (quickFilter === 'pending_diary' && plan.diaryStatus !== 'NotSubmitted') return false;
        if (
          quickFilter === 'pending_approval' &&
          plan.planStatus !== 'Submitted' &&
          plan.diaryStatus !== 'Submitted'
        )
          return false;
        if (quickFilter === 'missed_lessons' && plan.planStatus !== 'Missed') return false;
        if (
          quickFilter === 'delayed_progress' &&
          plan.plannedCompletionPercentage - plan.actualCompletionPercentage <= 10
        )
          return false;
        if (quickFilter === 'backdated') {
          const diary = getDiaryForLesson(plan.id);
          if (!diary?.isBackdated) return false;
        }
      }

      return true;
    });
  }, [
    lessonPlans,
    academicYearFilter,
    teacherFilter,
    classFilter,
    divisionFilter,
    subjectFilter,
    chapterFilter,
    planStatusFilter,
    diaryStatusFilter,
    approvalStatusFilter,
    fromDate,
    toDate,
    quickFilter,
    getDiaryForLesson,
  ]);

  // ─── Lesson Plan Handlers ────────────────────────────────────────────────────

  const openAddLesson = useCallback((date?: Dayjs) => {
    setEditPlan(null);
    setPrefillDate(date ?? null);
    setLessonModalOpen(true);
  }, []);

  const openEditLesson = useCallback((plan: LessonPlanRow) => {
    if (plan.planStatus === 'Approved') {
      shikshaMitraToast.warning({ message: 'Approved lesson plans are read-only.' });
      return;
    }
    setEditPlan(plan);
    setPrefillDate(null);
    setLessonModalOpen(true);
  }, []);

  const handleSaveLesson = useCallback((form: LessonFormState, submitAfterSave: boolean) => {
    const plannedDate = form.plannedDate?.format('YYYY-MM-DD') ?? todayIso;
    const nextPlan: LessonPlanRow = {
      id: form.id ?? `lp-${Date.now()}`,
      academicYear: form.academicYear,
      teacherId: `t-${form.teacherName.replace(/\s+/g, '').toLowerCase()}`,
      teacherName: form.teacherName,
      classId: `c-${form.className}`,
      className: form.className,
      divisionId: `d-${form.divisionName.toLowerCase()}`,
      divisionName: form.divisionName,
      subjectId: `s-${form.subjectName.replace(/\s+/g, '').toLowerCase()}`,
      subjectName: form.subjectName,
      chapterId: `ch-${form.chapterName.replace(/\s+/g, '').toLowerCase()}`,
      chapterName: form.chapterName,
      plannedDate,
      periodId: form.period,
      period: form.period,
      plannedTime: periodTimeMap[form.period] ?? '',
      topic: form.topic,
      learningObjective: form.learningObjective,
      teachingMethod: form.teachingMethod,
      plannedCompletionPercentage: form.plannedCompletionPercentage,
      resourcesRequired: form.resourcesRequired,
      planStatus: submitAfterSave ? 'Submitted' : 'Draft',
      diaryStatus: 'NotSubmitted',
      approvalStatus: 'Pending',
      actualCompletionPercentage: 0,
      existingChapterProgress: 0,
      source: form.source ?? 'Manual',
      isAiGenerated: form.source === 'AiGenerated',
      executionStatus: 'OnTrack',
      status: submitAfterSave ? 'Submitted' : 'Draft',
      reviewStatus: submitAfterSave ? 'Plan Pending Approval' : 'Draft',
    };

    setLessonPlans((current) => {
      const exists = current.some((p) => p.id === nextPlan.id);
      if (exists) {
        return current.map((p) =>
          p.id === nextPlan.id
            ? {
                ...p,
                ...nextPlan,
                diaryStatus: p.diaryStatus,
                actualCompletionPercentage: p.actualCompletionPercentage,
              }
            : p
        );
      }
      return [nextPlan, ...current];
    });
    setLessonModalOpen(false);
    shikshaMitraToast.success({
      message: submitAfterSave
        ? 'Lesson plan submitted for review.'
        : 'Lesson plan saved as draft.',
    });
  }, []);

  const submitPlan = useCallback((planId: string) => {
    setLessonPlans((current) =>
      current.map((p) =>
        p.id === planId
          ? {
              ...p,
              planStatus: 'Submitted',
              status: 'Submitted',
              reviewStatus: 'Plan Pending Approval',
            }
          : p
      )
    );
    shikshaMitraToast.success({ message: 'Lesson plan submitted for review.' });
  }, []);

  // ─── Diary Handlers ──────────────────────────────────────────────────────────

  const openDiary = useCallback(
    (plan: LessonPlanRow) => {
      const diary = getDiaryForLesson(plan.id);
      if (diary?.diaryStatus === 'Approved') {
        shikshaMitraToast.warning({ message: 'Approved diary is read-only.' });
        return;
      }
      setActivePlanForDiary(plan);
      setDiaryModalOpen(true);
    },
    [getDiaryForLesson]
  );

  const handleSaveDiary = useCallback(
    (form: DiaryFormState, submit: boolean) => {
      const status: DiaryStatus = submit ? 'Submitted' : 'Draft';
      const nextDiary: TeacherDiaryRow = {
        id: getDiaryForLesson(form.lessonPlanId)?.id ?? `diary-${Date.now()}`,
        lessonPlanId: form.lessonPlanId,
        teacherId: activePlanForDiary?.teacherId ?? '',
        actualDate: form.actualDate?.format('YYYY-MM-DD') ?? todayIso,
        actualCompletionPercentage: form.classConducted ? form.actualCompletionPercentage : 0,
        actualTopicCovered: form.classConducted ? form.actualTopicCovered : '',
        teachingMethodUsed: form.teachingMethodUsed,
        studentResponse: form.studentResponse,
        classUnderstandingLevel: form.classUnderstandingLevel,
        studentEngagementLevel: form.studentEngagementLevel,
        needRevision: form.needRevision,
        reflection: form.reflection,
        whatWentWell: form.whatWentWell,
        whatWasDifficult: form.whatWasDifficult,
        studentsNeedingSupport: form.studentsNeedingSupport,
        nextClassFollowUp: form.nextClassFollowUp,
        remedialActionRequired: form.remedialActionRequired,
        homeworkAssigned: form.homeworkAssigned,
        diaryStatus: status,
        isBackdated: form.isBackdated,
        backdatedReason: form.backdatedReason,
        isSubstituteDiary: false,
        submittedAt: submit ? dayjs().toISOString() : undefined,
        // legacy
        classConducted: form.classConducted,
        actualTopicTaught: form.actualTopicCovered,
        actualContentSummary: form.actualContentSummary,
        completionPercentage: form.actualCompletionPercentage,
        resourcesUsed: '',
        missedReason: form.missedReason || undefined,
        rescheduledToDate: form.rescheduledToDate?.format('YYYY-MM-DD'),
        teacherRemarks: form.teacherRemarks,
        status: status as Exclude<DiaryStatus, 'NotSubmitted'>,
      };

      setDiaryEntries((current) => {
        const exists = current.some((e) => e.id === nextDiary.id);
        return exists
          ? current.map((e) => (e.id === nextDiary.id ? nextDiary : e))
          : [nextDiary, ...current];
      });

      setLessonPlans((current) =>
        current.map((p) =>
          p.id === form.lessonPlanId
            ? {
                ...p,
                diaryStatus: status,
                actualCompletionPercentage: nextDiary.actualCompletionPercentage,
                reviewStatus: submit ? 'Diary Pending Approval' : p.reviewStatus,
              }
            : p
        )
      );
      setDiaryModalOpen(false);
      shikshaMitraToast.success({
        message: submit ? 'Teacher diary submitted for review.' : 'Teacher diary saved as draft.',
      });
    },
    [activePlanForDiary, getDiaryForLesson]
  );

  // ─── Review Handlers ─────────────────────────────────────────────────────────

  const handleApprove = useCallback(
    (target: ReviewTarget, comment: string, updateProgress: boolean) => {
      if (target.type === 'plan') {
        setLessonPlans((current) =>
          current.map((p) =>
            p.id === target.id
              ? {
                  ...p,
                  planStatus: 'Approved',
                  status: 'Approved',
                  approvalStatus: 'Approved',
                  reviewStatus: 'Plan Approved',
                  reviewRemarks: comment,
                  reviewedBy: 'HOD / Principal',
                  reviewedAt: dayjs().toISOString(),
                }
              : p
          )
        );
      } else {
        const diary = diaryEntries.find((e) => e.id === target.id);
        setDiaryEntries((current) =>
          current.map((e) =>
            e.id === target.id
              ? {
                  ...e,
                  diaryStatus: 'Approved',
                  status: 'Approved' as any,
                  reviewRemarks: comment,
                  reviewedBy: 'HOD / Principal',
                  reviewedAt: dayjs().toISOString(),
                }
              : e
          )
        );
        if (diary && updateProgress) {
          setLessonPlans((current) =>
            current.map((p) =>
              p.id === diary.lessonPlanId
                ? {
                    ...p,
                    diaryStatus: 'Approved',
                    actualCompletionPercentage: diary.actualCompletionPercentage,
                    existingChapterProgress: diary.classConducted
                      ? diary.actualCompletionPercentage
                      : p.existingChapterProgress,
                    executionStatus: 'ProgressUpdated',
                    reviewStatus: 'Progress Synced',
                    reviewRemarks: comment,
                  }
                : p
            )
          );
        }
      }
      shikshaMitraToast.success({ message: 'Approved. Progress sync recorded.' });
    },
    [diaryEntries]
  );

  const handleReject = useCallback(
    (target: ReviewTarget, comment: string) => {
      if (!comment) {
        shikshaMitraToast.warning({ message: 'Please provide a rejection reason.' });
        return;
      }
      if (target.type === 'plan') {
        setLessonPlans((current) =>
          current.map((p) =>
            p.id === target.id
              ? {
                  ...p,
                  planStatus: 'Rejected',
                  status: 'Rejected',
                  approvalStatus: 'Rejected',
                  reviewRemarks: comment,
                  reviewedBy: 'HOD / Principal',
                  reviewedAt: dayjs().toISOString(),
                }
              : p
          )
        );
      } else {
        setDiaryEntries((current) =>
          current.map((e) =>
            e.id === target.id
              ? {
                  ...e,
                  diaryStatus: 'Rejected',
                  status: 'Rejected' as any,
                  reviewRemarks: comment,
                  reviewedBy: 'HOD / Principal',
                  reviewedAt: dayjs().toISOString(),
                }
              : e
          )
        );
        const diary = diaryEntries.find((e) => e.id === target.id);
        if (diary) {
          setLessonPlans((current) =>
            current.map((p) =>
              p.id === diary.lessonPlanId
                ? {
                    ...p,
                    diaryStatus: 'Rejected',
                    reviewStatus: 'Diary Correction Requested',
                    reviewRemarks: comment,
                  }
                : p
            )
          );
        }
      }
      shikshaMitraToast.info({ message: 'Rejected and returned for correction.' });
    },
    [diaryEntries]
  );

  const handleRequestChanges = useCallback((target: ReviewTarget, comment: string) => {
    if (target.type === 'plan') {
      setLessonPlans((current) =>
        current.map((p) =>
          p.id === target.id
            ? {
                ...p,
                planStatus: 'NeedsChanges',
                status: 'NeedsChanges',
                approvalStatus: 'ChangesRequested',
                reviewRemarks: comment,
              }
            : p
        )
      );
    } else {
      setDiaryEntries((current) =>
        current.map((e) =>
          e.id === target.id
            ? {
                ...e,
                diaryStatus: 'NeedsChanges',
                status: 'NeedsChanges' as any,
                reviewRemarks: comment,
              }
            : e
        )
      );
    }
    shikshaMitraToast.info({ message: 'Changes requested. Teacher has been notified.' });
  }, []);

  // ─── Columns ─────────────────────────────────────────────────────────────────

  const renderPlanStatus = (status: PlanStatus) => (
    <Label color={planStatusColor[status] ?? 'default'} variant="soft">
      {status}
    </Label>
  );

  const renderDiaryStatus = (status: DiaryStatus) => (
    <Label color={diaryStatusColor[status] ?? 'default'} variant="soft">
      {status === 'NotSubmitted' ? 'Pending' : status}
    </Label>
  );

  const lessonColumns = [
    { id: 'plannedDate', label: 'Date', filterType: 'date' as const, minWidth: 120, sticky: true },
    { id: 'period', label: 'Period', minWidth: 110 },
    { id: 'plannedTime', label: 'Time', minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      minWidth: 120,
      render: (_v: any, row: any) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', minWidth: 130 },
    { id: 'chapterName', label: 'Chapter', minWidth: 150 },
    { id: 'topic', label: 'Topic', minWidth: 200 },
    { id: 'teacherName', label: 'Teacher', minWidth: 160 },
    {
      id: 'planStatus',
      label: 'Plan Status',
      minWidth: 130,
      render: (v: PlanStatus) => renderPlanStatus(v),
    },
    {
      id: 'diaryStatus',
      label: 'Diary Status',
      minWidth: 130,
      render: (v: DiaryStatus) => renderDiaryStatus(v),
    },
    {
      id: 'plannedCompletionPercentage',
      label: 'Planned %',
      filterType: 'number' as const,
      minWidth: 100,
      render: (v: number) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">{v}%</Typography>
          <LinearProgress variant="determinate" value={v} sx={{ height: 4, borderRadius: 1 }} />
        </Stack>
      ),
    },
    {
      id: 'actualCompletionPercentage',
      label: 'Actual %',
      filterType: 'number' as const,
      minWidth: 100,
      render: (v: number) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">{v}%</Typography>
          <LinearProgress
            variant="determinate"
            value={v}
            color="success"
            sx={{ height: 4, borderRadius: 1 }}
          />
        </Stack>
      ),
    },
    {
      id: 'isAiGenerated',
      label: 'AI',
      minWidth: 70,
      isFilter: false,
      render: (v: boolean) =>
        v ? (
          <Label
            color="secondary"
            variant="soft"
            startIcon={<Iconify icon="mdi:robot-outline" width={12} />}
          >
            AI
          </Label>
        ) : null,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 190,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_v: unknown, row: any) => {
        const plan = row as LessonPlanRow;
        const diary = getDiaryForLesson(plan.id);
        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton size="small" title="Edit lesson plan" onClick={() => openEditLesson(plan)}>
              <Iconify icon={GlobalIcons.edit} />
            </IconButton>
            <IconButton
              size="small"
              title="Submit plan"
              disabled={!['Draft', 'Rejected', 'NeedsChanges'].includes(plan.planStatus)}
              onClick={() => submitPlan(plan.id)}
            >
              <Iconify icon={GlobalIcons.submit} />
            </IconButton>
            <IconButton
              size="small"
              title={diary ? 'View/edit diary' : 'Add diary'}
              disabled={plan.planStatus === 'Cancelled'}
              onClick={() => openDiary(plan)}
            >
              <Iconify icon="mdi:notebook-edit-outline" />
            </IconButton>
            <IconButton
              size="small"
              title="AI Builder"
              onClick={() => {
                setEditPlan(plan);
                setAiDrawerOpen(true);
              }}
            >
              <Iconify icon="mdi:robot-outline" />
            </IconButton>
            <IconButton
              size="small"
              title="Export"
              onClick={() => shikshaMitraToast.info({ message: 'Lesson plan export prepared.' })}
            >
              <Iconify icon={GlobalIcons.download} />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const diaryColumns = [
    { id: 'plannedDate', label: 'Date', filterType: 'date' as const, minWidth: 120, sticky: true },
    { id: 'period', label: 'Period', minWidth: 110 },
    {
      id: 'className',
      label: 'Class/Div',
      minWidth: 120,
      render: (_v: any, r: any) => `${r.className}-${r.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', minWidth: 130 },
    { id: 'chapterName', label: 'Chapter', minWidth: 150 },
    { id: 'topic', label: 'Topic', minWidth: 200 },
    { id: 'teacherName', label: 'Teacher', minWidth: 160 },
    {
      id: 'diaryStatus',
      label: 'Diary Status',
      minWidth: 130,
      render: (v: DiaryStatus) => renderDiaryStatus(v),
    },
    {
      id: 'actualCompletionPercentage',
      label: 'Actual %',
      filterType: 'number' as const,
      minWidth: 100,
      render: (v: number) => `${v}%`,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_v: unknown, row: any) => {
        const plan = row as LessonPlanRow;
        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton size="small" title="Open diary" onClick={() => openDiary(plan)}>
              <Iconify icon="mdi:notebook-edit-outline" />
            </IconButton>
            <IconButton
              size="small"
              title="AI Summary"
              onClick={() => {
                setEditPlan(plan);
                setAiDrawerOpen(true);
              }}
            >
              <Iconify icon="mdi:robot-outline" />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const reportTeacherData = teacherOptions.map((t) => {
    const plans = lessonPlans.filter((p) => p.teacherName === t.value);
    const completed = plans.filter((p) => p.diaryStatus === 'Approved').length;
    const missed = diaryEntries.filter((e) => {
      const p = lessonPlans.find((lp) => lp.id === e.lessonPlanId);
      return p?.teacherName === t.value && !e.classConducted;
    }).length;
    return {
      teacher: t.label,
      classDivision:
        plans
          .map((p) => `${p.className}-${p.divisionName}`)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(', ') || '-',
      subject:
        plans
          .map((p) => p.subjectName)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(', ') || '-',
      plannedLessons: plans.length,
      completedDiary: completed,
      missedLessons: missed,
      pendingDiary: plans.filter((p) => p.diaryStatus === 'NotSubmitted').length,
      completion: plans.length ? `${Math.round((completed / plans.length) * 100)}%` : '0%',
    };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Lesson Plan / Teacher Diary"
        description="Plan lessons, record daily teaching evidence, review diary submissions, and track syllabus progress in one place."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Lesson Plan / Teacher Diary' },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<Iconify icon="mdi:robot-outline" />}
              onClick={() => {
                setEditPlan(null);
                setAiDrawerOpen(true);
              }}
            >
              AI Generate Plan
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => openAddLesson()}
            >
              Add Lesson Plan
            </Button>
          </Stack>
        }
      />

      {/* Teaching KPI Cards */}
      <TeachingKpiCards
        lessonPlans={lessonPlans}
        diaryEntries={diaryEntries}
        healthScore={healthScore}
        onCardClick={(key) => {
          if (key === 'pending_approvals') setActiveTab('reviewQueue');
          else if (key === 'missed_lessons') {
            setQuickFilter('missed_lessons');
            setActiveTab('lessonList');
          } else if (key === 'syllabus_delay') setActiveTab('lessonList');
        }}
      />

      {/* Tab Navigation & Filters */}
      <Card>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as TabValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={18} />}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1 }}>
            <LessonPlanFilters
              filters={activeFiltersState}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </Stack>
        </Stack>

        {getActiveFilters(activeFiltersState).length > 0 && (
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'background.neutral' }}>
            <LessonPlanActiveFilters
              filters={activeFiltersState}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </Box>
        )}
      </Card>

      {/* Tab Content */}
      {activeTab === 'lessonList' && (
        <CustomizableTable
          tableId="lesson-plan-list-table"
          tableTitle={`Lesson Plans (${filteredPlans.length})`}
          data={filteredPlans}
          columns={lessonColumns}
        />
      )}

      {activeTab === 'weeklyPlanner' && (
        <WeeklyPlannerTab
          lessonPlans={lessonPlans}
          onAddLesson={openAddLesson}
          onEditLesson={openEditLesson}
          onSubmitDiary={openDiary}
          onMarkMissed={(plan) => {
            setLessonPlans((current) =>
              current.map((p) =>
                p.id === plan.id
                  ? {
                      ...p,
                      planStatus: 'Missed',
                      status: 'Missed',
                      executionStatus: 'Missed',
                      reviewStatus: 'Missed - Needs Reschedule',
                    }
                  : p
              )
            );
            shikshaMitraToast.info({ message: 'Lesson marked as missed.' });
          }}
          onCreateFromTimetable={(date) =>
            shikshaMitraToast.info({
              message: `Timetable sync for ${date.format('DD MMM')} coming soon.`,
            })
          }
          onCopyPreviousWeek={() =>
            shikshaMitraToast.info({ message: 'Previous week lessons copied as draft.' })
          }
          onSubmitWeekPlan={(plans) => {
            const ids = plans.map((p) => p.id);
            setLessonPlans((current) =>
              current.map((p) =>
                ids.includes(p.id) && p.planStatus === 'Draft'
                  ? {
                      ...p,
                      planStatus: 'Submitted',
                      status: 'Submitted',
                      reviewStatus: 'Week Plan Pending Approval',
                    }
                  : p
              )
            );
            shikshaMitraToast.success({
              message: `${plans.length} draft lesson(s) submitted for the week.`,
            });
          }}
        />
      )}

      {activeTab === 'teacherDiary' && (
        <CustomizableTable
          tableId="teacher-diary-tab-table"
          tableTitle="Teacher Diary"
          data={lessonPlans.filter((p) => p.plannedDate <= todayIso)}
          columns={diaryColumns}
          noDataText="No past or today lessons available for diary."
        />
      )}

      {activeTab === 'reviewQueue' && (
        <ReviewQueueTab
          lessonPlans={lessonPlans}
          diaryEntries={diaryEntries}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      )}

      {activeTab === 'settings' && <SettingsTab settings={settings} onChange={setSettings} />}

      {/* Modals */}
      <AddLessonPlanModal
        open={lessonModalOpen}
        editData={editPlan}
        prefillDate={prefillDate}
        onClose={() => setLessonModalOpen(false)}
        onSave={handleSaveLesson}
        onAiGenerate={() => {
          setLessonModalOpen(false);
          setAiDrawerOpen(true);
        }}
      />

      <SubmitDiaryModal
        open={diaryModalOpen}
        plan={activePlanForDiary}
        existingDiary={activePlanForDiary ? getDiaryForLesson(activePlanForDiary.id) : null}
        allowBackdated={settings.allowBackdatedDiary}
        maxBackdateDays={settings.maxBackdateDays}
        onClose={() => setDiaryModalOpen(false)}
        onSave={handleSaveDiary}
        onAiSummary={() => {
          setDiaryModalOpen(false);
          setAiDrawerOpen(true);
        }}
      />

      <AiLessonBuilderDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        contextPlan={editPlan}
      />
    </Box>
  );
};

export default LessonPlanScreen;
