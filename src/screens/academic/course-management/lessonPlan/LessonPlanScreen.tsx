'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DateTimePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetHomeworkTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Stack,
  Alert,
  Button,
  Divider,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  useGetLessonPlansQuery,
  useGetTeacherDiariesQuery,
  useCreateLessonPlanMutation,
  useUpdateLessonPlanMutation,
  useSubmitLessonPlanMutation,
  useRejectLessonPlanMutation,
  useApproveLessonPlanMutation,
  useGetLessonPlanTimelineQuery,
  useCreateTeacherDiaryMutation,
  useUpdateTeacherDiaryMutation,
  useRequestPlanChangesMutation,
  useCreateHomeworkFromLessonPlanMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import ReviewQueueTab from './components/ReviewQueueTab';
import DailyTimelineTab from './components/DailyTimelineTab';
import TeachingKpiCards from './components/TeachingKpiCards';
import WeeklyPlannerTab from './components/WeeklyPlannerTab';
import SubmitDiaryModal from './components/SubmitDiaryModal';
import AddLessonPlanModal from './components/AddLessonPlanModal';
import AiLessonBuilderDrawer from './components/AiLessonBuilderDrawer';
import LessonDiaryDetailsDrawer from './components/LessonDiaryDetailsDrawer';
import {
  todayIso,
  weekStartIso,
  classOptions,
  teacherOptions,
  chapterOptions,
  subjectOptions,
  divisionOptions,
  initialHealthScore,
} from './lessonPlanData';

import type { DiaryFormState } from './components/SubmitDiaryModal';
import type { LessonFormState } from './components/AddLessonPlanModal';
import type {
  PlanStatus,
  DiaryStatus,
  LessonPlanRow,
  TeacherDiaryRow,
  TeachingHealthScore,
} from './lessonPlanData';

type ReviewTarget = { type: 'plan' | 'diary'; id: string };

type HomeworkFromPlanForm = {
  homeworkTypeId: string;
  title: string;
  description: string;
  submissionType: number;
  publishAt: Dayjs | null;
  dueAt: Dayjs | null;
};

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

const PLAN_STATUS_BY_VALUE: PlanStatus[] = [
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
  'NeedsChanges',
];
const DIARY_STATUS_BY_VALUE: DiaryStatus[] = ['Draft', 'Submitted'];

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isGuidLike = (value: unknown) => typeof value === 'string' && GUID_PATTERN.test(value);

const normalizeSlotTime = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
  if (!match) return trimmed;

  const hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3]?.toUpperCase();

  if (meridiem) {
    return `${hour.toString().padStart(2, '0')}:${minute} ${meridiem}`;
  }

  const displayHour = hour % 12 || 12;
  const displayMeridiem = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour.toString().padStart(2, '0')}:${minute} ${displayMeridiem}`;
};

const getPlannedSlotTime = (plan: any) => {
  const start = normalizeSlotTime(
    plan.startTime ||
      plan.slotStartTime ||
      plan.timetableSlot?.startTime ||
      plan.timetableSlot?.slotStartTime
  );
  const end = normalizeSlotTime(
    plan.endTime ||
      plan.slotEndTime ||
      plan.timetableSlot?.endTime ||
      plan.timetableSlot?.slotEndTime
  );

  return start && end ? `${start} - ${end}` : '';
};

const getCurrentEmployeeName = (employee: any, user: any) =>
  employee?.employeeName ||
  employee?.fullName ||
  [employee?.firstName, employee?.lastName].filter(Boolean).join(' ').trim() ||
  [user?.given_name, user?.family_name].filter(Boolean).join(' ').trim() ||
  user?.name ||
  user?.preferred_username ||
  user?.unique_name ||
  user?.email ||
  '';

const readRoleNames = (employee: any, user: any): string[] => {
  const roleValues = [
    employee?.role?.name,
    employee?.roleName,
    employee?.designation,
    user?.role,
    user?.roles,
    user?.roleNames,
  ];

  return roleValues
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map((value) => value.trim().toLowerCase());
};

const canRoleReviewLessonPlans = (role: string) =>
  role === 'admin' || role === 'administrator' || role.includes('coordinator');

const toPlanStatus = (value: unknown): PlanStatus =>
  typeof value === 'number'
    ? (PLAN_STATUS_BY_VALUE[value] ?? 'Draft')
    : (value as PlanStatus) || 'Draft';

const toDiaryStatus = (value: unknown, hasDiary = true): DiaryStatus => {
  if (!hasDiary) return 'NotSubmitted';
  return typeof value === 'number'
    ? (DIARY_STATUS_BY_VALUE[value] ?? 'Draft')
    : (value as DiaryStatus) || 'Draft';
};

const allClassOptions = [{ value: 'all', label: 'All Classes' }, ...classOptions];
const allDivisionOptions = [{ value: 'all', label: 'All Divisions' }, ...divisionOptions];
const allSubjectOptions = [{ value: 'all', label: 'All Subjects' }, ...subjectOptions];
const allChapterOptions = [{ value: 'all', label: 'All Chapters' }, ...chapterOptions];
const allTeacherOptions = [{ value: 'all', label: 'All Teachers' }, ...teacherOptions];

const TABS = [
  { value: 'dailyTimeline', label: 'Daily Timeline', icon: 'mdi:clock-outline' },
  { value: 'weeklyPlanner', label: 'Weekly Planner', icon: 'mdi:calendar-week-outline' },
  { value: 'lessonList', label: 'Lesson Plans', icon: 'mdi:book-open-outline' },
  { value: 'teacherDiary', label: 'Teacher Diary', icon: 'mdi:notebook-edit-outline' },
  { value: 'reviewQueue', label: 'Review Queue', icon: 'mdi:clipboard-check-outline' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

const LessonPlanScreen = () => {
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const { employee, user } = useSelector((state: RootState) => state.auth);
  const canReviewSubmissions = readRoleNames(employee, user).some(canRoleReviewLessonPlans);
  const [activeTab, setActiveTab] = useState<TabValue>('dailyTimeline');
  const [healthScore] = useState<TeachingHealthScore>(initialHealthScore);

  // ─── RTK Queries & Mutations ──────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useGetLessonPlanTimelineQuery({
    date: dateConvertor(selectedDate.format(dateFormat)),
  });

  const { data: lessonPlanList, refetch: refetchLessonPlans } = useGetLessonPlansQuery({
    academicYearId: currentYear?.id,
    maxResultCount: 1000,
  });

  const { data: teacherDiaryList, refetch: refetchTeacherDiaries } = useGetTeacherDiariesQuery({
    academicYearId: currentYear?.id,
    maxResultCount: 1000,
  });
  const { data: homeworkTypeData } = useGetHomeworkTypesQuery(
    { academicMediumId: currentMedium?.id },
    { skip: !currentMedium?.id }
  );

  const [createLessonPlan, { isLoading: isCreatingLesson }] = useCreateLessonPlanMutation();
  const [updateLessonPlan, { isLoading: isUpdatingLesson }] = useUpdateLessonPlanMutation();
  const [submitLessonPlan, { isLoading: isSubmittingLesson }] = useSubmitLessonPlanMutation();
  const isSavingLesson = isCreatingLesson || isUpdatingLesson || isSubmittingLesson;
  const [approveLessonPlan] = useApproveLessonPlanMutation();
  const [rejectLessonPlan] = useRejectLessonPlanMutation();
  const [requestChanges] = useRequestPlanChangesMutation();
  const [createHomeworkFromLessonPlan, { isLoading: isCreatingHomeworkFromPlan }] =
    useCreateHomeworkFromLessonPlanMutation();
  const [createTeacherDiary, { isLoading: isCreatingDiary }] = useCreateTeacherDiaryMutation();
  const [updateTeacherDiary, { isLoading: isUpdatingDiary }] = useUpdateTeacherDiaryMutation();
  const isSavingDiary = isCreatingDiary || isUpdatingDiary;

  const lessonPlans = useMemo<LessonPlanRow[]>(() => {
    if (!lessonPlanList) return [];
    return (
      (lessonPlanList as any).items?.map((p: any) => ({
        id: p.id,
        academicYear: p.academicYear || '2026-27',
        teacherName: p.teacherName || '',
        teacherId: p.teacherId,
        standardId: p.standardId,
        classId: p.standardId,
        className: p.standardName || '',
        divisionId: p.divisionId,
        divisionName: p.divisionName || '',
        subjectId: p.subjectId,
        subjectName: p.subjectName || '',
        chapterId: p.chapterId,
        chapterName: p.chapterName || '',
        plannedDate: p.plannedDate ? dayjs(p.plannedDate).format('YYYY-MM-DD') : todayIso,
        periodId: p.timetableSlotId || 'Manual',
        period: (() => {
          const rawPeriodName =
            p.periodName ||
            p.slotName ||
            p.timeSlotName ||
            p.timetableSlot?.periodName ||
            p.timetableSlot?.slotName;
          if (rawPeriodName && !isGuidLike(rawPeriodName)) return rawPeriodName;
          return p.timetableSlotId ? 'Scheduled' : 'Manual';
        })(),
        plannedTime: getPlannedSlotTime(p),
        topic: p.topic || '',
        learningObjective: p.learningObjective || '',
        teachingMethod: p.teachingMethod || 'ExplanationBoardWork',
        resourcesRequired: p.resourcesRequired || '',
        planStatus: toPlanStatus(p.status),
        diaryStatus: toDiaryStatus(p.diaryStatus, Boolean(p.teacherDiaryId)),
        status: toPlanStatus(p.status),
        approvalStatus: toPlanStatus(p.status) === 'Approved' ? 'Approved' : 'Pending',
        plannedCompletionPercentage: p.plannedCompletionPercentage || 0,
        actualCompletionPercentage: p.actualCompletionPercentage || 0,
        existingChapterProgress: p.existingChapterProgress || 0,
        source: p.isAiGenerated ? 'AiGenerated' : 'Manual',
        isAiGenerated: !!p.isAiGenerated,
        executionStatus: 'OnTrack',
        reviewStatus: p.status === 'Approved' ? 'Plan Approved' : 'Draft',
        reviewRemarks: p.reviewRemarks,
        timetableSlotId: p.timetableSlotId,
        teacherDiaryId: p.teacherDiaryId,
        insightType: p.insightType,
        insightSeverity: p.insightSeverity,
        insightMessage: p.insightMessage,
        isPlanCreationBlocked: Boolean(p.isPlanCreationBlocked),
      })) || []
    );
  }, [lessonPlanList]);

  const diaryEntries = useMemo<TeacherDiaryRow[]>(() => {
    if (!teacherDiaryList) return [];
    return (
      (teacherDiaryList as any).items?.map((d: any) => {
        const diaryStatus = toDiaryStatus(d.diaryStatus ?? d.status);

        return {
          id: d.id,
          lessonPlanId: d.lessonPlanId,
          teacherId: d.teacherId,
          actualDate: d.actualDate ? dayjs(d.actualDate).format('YYYY-MM-DD') : todayIso,
          actualCompletionPercentage: d.actualCompletionPercentage || 0,
          actualTopicCovered: d.actualTopicCovered || '',
          teachingMethodUsed: d.teachingMethodUsed || 'ExplanationBoardWork',
          studentResponse: d.studentResponse || '',
          classUnderstandingLevel: d.classUnderstandingLevel || 'Medium',
          studentEngagementLevel: d.studentEngagementLevel || 'Medium',
          needRevision: Boolean(d.needRevision),
          reflection: d.reflection || '',
          whatWentWell: d.whatWentWell || '',
          whatWasDifficult: d.whatWasDifficult || '',
          studentsNeedingSupport: d.studentsNeedingSupport || '',
          nextClassFollowUp: d.nextClassFollowUp || '',
          remedialActionRequired: d.remedialActionRequired || '',
          homeworkAssigned: d.homeworkAssigned || '',
          diaryStatus,
          isBackdated: Boolean(d.isBackdated),
          backdatedReason: d.backdatedReason,
          isSubstituteDiary: Boolean(d.isSubstituteDiary),
          submittedAt: d.submittedAt,
          classConducted: Boolean(d.classConducted),
          actualTopicTaught: d.actualTopicTaught || d.actualTopicCovered || '',
          actualContentSummary: d.actualContentSummary || '',
          completionPercentage: d.completionPercentage || d.actualCompletionPercentage || 0,
          resourcesUsed: d.resourcesUsed || '',
          missedReason: d.missedReason,
          rescheduledToDate: d.rescheduledToDate
            ? dayjs(d.rescheduledToDate).format('YYYY-MM-DD')
            : undefined,
          teacherRemarks: d.teacherRemarks || '',
          status: diaryStatus as Exclude<DiaryStatus, 'NotSubmitted'>,
        };
      }) || []
    );
  }, [teacherDiaryList]);

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
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
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
    setFromDate(null);
    setToDate(null);
    setQuickFilter(null);
  }, []);

  // Dialog / drawer state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [diaryModalOpen, setDiaryModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<LessonPlanRow | null>(null);
  const [prefillDate, setPrefillDate] = useState<Dayjs | null>(null);
  const [timelinePrefill, setTimelinePrefill] = useState<Partial<LessonFormState> | null>(null);
  const [activePlanForDiary, setActivePlanForDiary] = useState<LessonPlanRow | null>(null);
  const [detailPlan, setDetailPlan] = useState<LessonPlanRow | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [homeworkPlan, setHomeworkPlan] = useState<LessonPlanRow | null>(null);
  const [homeworkForm, setHomeworkForm] = useState<HomeworkFromPlanForm>({
    homeworkTypeId: '',
    title: '',
    description: '',
    submissionType: 0,
    publishAt: dayjs(),
    dueAt: dayjs().add(1, 'day'),
  });
  const [homeworkError, setHomeworkError] = useState('');

  /**
   * Memoization Justification:
   * - Keeps the current teacher option stable while the modal is open.
   * - Prevents the modal effect from resetting form fields during topic/objective typing.
   * - The value depends on Redux auth objects that change independently of local form edits.
   */
  const currentTeacherOption = useMemo(() => {
    const teacherId =
      employee?.id || employee?.employeeId || employee?.userId || user?.sub || user?.id || '';
    const teacherName = getCurrentEmployeeName(employee, user);

    if (!teacherId || !teacherName) {
      return null;
    }

    return {
      value: String(teacherId),
      label: teacherName,
    };
  }, [employee, user]);

  /**
   * Memoization Justification:
   * - Homework type options are passed into a controlled select inside the homework dialog.
   * - Keeping the options stable prevents select reprocessing while teachers edit title/description/date fields.
   * - The list only changes when the homework type API response changes.
   */
  const homeworkTypeOptions = useMemo(
    () =>
      ((homeworkTypeData as any)?.data || []).map((item: any) => ({
        value: item.id,
        label: item.homeworkTypeName || item.name,
      })),
    [homeworkTypeData]
  );

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
        if (quickFilter === 'pending_approval' && plan.planStatus !== 'Submitted') return false;
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
    setTimelinePrefill(null);
    setPrefillDate(date ?? null);
    setLessonModalOpen(true);
  }, []);

  const openEditLesson = useCallback((plan: LessonPlanRow) => {
    if (plan.planStatus === 'Approved') {
      setDetailPlan(plan);
      setDetailDrawerOpen(true);
      return;
    }
    setEditPlan(plan);
    setTimelinePrefill(null);
    setPrefillDate(null);
    setLessonModalOpen(true);
  }, []);

  /**
   * Memoization Justification:
   * - This handler is passed to timeline/weekly/table action renderers.
   * - Keeping it stable avoids unnecessary child action re-renders when filter state changes.
   * - It only mutates drawer state and does not depend on changing row data.
   */
  const openDetails = useCallback((plan: LessonPlanRow) => {
    setDetailPlan(plan);
    setDetailDrawerOpen(true);
  }, []);

  /**
   * Memoization Justification:
   * - This handler is passed to timeline, weekly, and table action renderers.
   * - Keeping it stable avoids rebuilding action menus while unrelated filters change.
   * - It only initializes local dialog state from the selected approved plan.
   */
  const openHomeworkFromPlan = useCallback((plan: LessonPlanRow) => {
    const planStatus = toPlanStatus(plan.planStatus ?? plan.status);
    if (planStatus !== 'Approved') {
      shikshaMitraToast.warning({ message: 'Homework can be created only from an approved plan.' });
      return;
    }

    const normalizedPlan = {
      ...plan,
      planStatus,
      status: planStatus,
      className: plan.className || (plan as any).standardName || '',
      divisionName: plan.divisionName || '',
      subjectName: plan.subjectName || '',
    };

    setHomeworkPlan(normalizedPlan);
    setHomeworkForm({
      homeworkTypeId: '',
      title: normalizedPlan.topic || `${normalizedPlan.subjectName} Homework`,
      description: [
        normalizedPlan.learningObjective
          ? `Learning objective: ${normalizedPlan.learningObjective}`
          : '',
        normalizedPlan.resourcesRequired
          ? `Reference resources: ${normalizedPlan.resourcesRequired}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      submissionType: 0,
      publishAt: dayjs(),
      dueAt: dayjs().add(1, 'day'),
    });
    setHomeworkError('');
  }, []);

  const closeHomeworkFromPlan = () => {
    setHomeworkPlan(null);
    setHomeworkError('');
  };

  const saveHomeworkFromPlan = async () => {
    if (!homeworkPlan) return;
    if (!currentMedium?.id) {
      setHomeworkError('Academic medium is required before creating homework.');
      return;
    }
    if (!homeworkForm.homeworkTypeId) {
      setHomeworkError('Homework type is required.');
      return;
    }
    if (!homeworkForm.title.trim()) {
      setHomeworkError('Homework title is required.');
      return;
    }
    if (!homeworkForm.description.trim()) {
      setHomeworkError('Homework description is required.');
      return;
    }
    if (!homeworkForm.publishAt || !homeworkForm.dueAt) {
      setHomeworkError('Publish date and due date are required.');
      return;
    }
    if (homeworkForm.dueAt.isBefore(homeworkForm.publishAt)) {
      setHomeworkError('Due date must be after publish date.');
      return;
    }

    try {
      await createHomeworkFromLessonPlan({
        id: homeworkPlan.id,
        body: {
          academicMediumId: currentMedium.id,
          homeworkTypeId: homeworkForm.homeworkTypeId,
          title: homeworkForm.title.trim(),
          description: homeworkForm.description.trim(),
          submissionType: homeworkForm.submissionType,
          publishAt: homeworkForm.publishAt.toISOString(),
          dueAt: homeworkForm.dueAt.toISOString(),
        },
      }).unwrap();

      closeHomeworkFromPlan();
      shikshaMitraToast.success({ message: 'Homework created from lesson plan.' });
    } catch (err: any) {
      setHomeworkError(err?.data?.error?.message || 'Failed to create homework from lesson plan.');
    }
  };

  const handleSaveLesson = useCallback(
    async (form: LessonFormState, submitAfterSave: boolean) => {
      try {
        const missingFields = [
          !currentYear?.id && 'academic year',
          !form.teacherId && 'teacher',
          !form.standardId && 'class',
          !form.divisionId && 'division',
          !form.subjectId && 'subject',
          !form.chapterId && 'chapter',
        ].filter(Boolean);

        if (missingFields.length > 0) {
          shikshaMitraToast.warning({
            message: `Please select a valid ${missingFields.join(', ')} before saving.`,
          });
          return;
        }

        const plannedDate = form.plannedDate
          ? dateConvertor(form.plannedDate.format(dateFormat))
          : dateConvertor(dayjs(todayIso).format(dateFormat));

        const planDetailsPayload = {
          chapterId: form.chapterId,
          topic: form.topic.trim(),
          learningObjective: form.learningObjective.trim(),
          teachingMethod: form.teachingMethod,
          resourcesRequired: form.resourcesRequired.trim(),
          plannedCompletionPercentage: form.plannedCompletionPercentage,
        };

        const createPayload = {
          academicYearId: currentYear.id,
          teacherId: form.teacherId,
          standardId: form.standardId,
          divisionId: form.divisionId,
          subjectId: form.subjectId,
          plannedDate,
          timetableSlotId: form.timetableSlotId || null,
          isAiGenerated: form.source === 'AiGenerated',
          ...planDetailsPayload,
        };

        let result;
        if (form.id) {
          result = await updateLessonPlan({ id: form.id, body: planDetailsPayload }).unwrap();
        } else {
          result = await createLessonPlan(createPayload).unwrap();
        }

        const resultId =
          result?.id || result?.result?.id || (result as any)?.result?.Id || (result as any)?.Id;
        if (submitAfterSave && resultId) {
          await submitLessonPlan({ id: resultId }).unwrap();
        }

        setLessonModalOpen(false);
        refetchTimeline();
        refetchLessonPlans();

        shikshaMitraToast.success({
          message: submitAfterSave
            ? 'Lesson plan submitted for review.'
            : 'Lesson plan saved as draft.',
        });
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to save lesson plan.',
        });
      }
    },
    [
      createLessonPlan,
      currentYear?.id,
      updateLessonPlan,
      submitLessonPlan,
      refetchTimeline,
      refetchLessonPlans,
    ]
  );

  const submitPlan = useCallback(
    async (planId: string) => {
      try {
        await submitLessonPlan({ id: planId }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Lesson plan submitted for review.' });
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to submit lesson plan.',
        });
      }
    },
    [submitLessonPlan, refetchTimeline, refetchLessonPlans]
  );

  // ─── Diary Handlers ──────────────────────────────────────────────────────────

  const openDiary = useCallback((plan: LessonPlanRow) => {
    setActivePlanForDiary(plan);
    setDiaryModalOpen(true);
  }, []);

  const handleSaveDiary = useCallback(
    async (form: DiaryFormState) => {
      try {
        const existingDiary = getDiaryForLesson(form.lessonPlanId);
        const body = {
          lessonPlanId: form.lessonPlanId,
          actualDate: form.actualDate
            ? dateConvertor(form.actualDate.format(dateFormat))
            : dateConvertor(dayjs(todayIso).format(dateFormat)),
          classConducted: form.classConducted,
          actualTopicCovered: form.classConducted ? form.actualTopicCovered : '',
          actualContentSummary: form.actualContentSummary,
          actualCompletionPercentage: form.classConducted ? form.actualCompletionPercentage : 0,
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
          missedReason: form.missedReason || null,
          rescheduledToDate: form.rescheduledToDate
            ? dateConvertor(form.rescheduledToDate.format(dateFormat))
            : null,
          isBackdated: form.isBackdated,
          backdatedReason: form.backdatedReason,
          teacherRemarks: form.teacherRemarks,
        };

        if (existingDiary) {
          await updateTeacherDiary({ id: existingDiary.id, body }).unwrap();
        } else {
          await createTeacherDiary(body).unwrap();
        }

        await refetchTeacherDiaries();
        await refetchLessonPlans();
        await refetchTimeline();
        setDiaryModalOpen(false);
        shikshaMitraToast.success({
          message: 'Teacher diary notes saved.',
        });
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to save teacher diary.',
        });
      }
    },
    [
      createTeacherDiary,
      getDiaryForLesson,
      refetchLessonPlans,
      refetchTeacherDiaries,
      refetchTimeline,
      updateTeacherDiary,
    ]
  );

  // ─── Review Handlers ─────────────────────────────────────────────────────────

  const handleApprove = useCallback(
    async (target: ReviewTarget, comment: string, updateProgress = true) => {
      try {
        if (target.type === 'diary') {
          shikshaMitraToast.info({
            message: updateProgress
              ? 'Diary approval with progress update is not wired yet.'
              : 'Diary approval is not wired yet.',
          });
          return;
        }
        await approveLessonPlan({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Approved successfully.' });
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.error?.message || 'Failed to approve.' });
      }
    },
    [approveLessonPlan, refetchTimeline, refetchLessonPlans]
  );

  const handleReject = useCallback(
    async (target: ReviewTarget, comment: string) => {
      try {
        if (target.type === 'diary') {
          shikshaMitraToast.info({ message: 'Diary rejection is not wired yet.' });
          return;
        }
        if (!comment) {
          shikshaMitraToast.warning({ message: 'Please provide a reason.' });
          return;
        }
        await rejectLessonPlan({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Rejected and returned for correction.' });
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.error?.message || 'Failed to reject.' });
      }
    },
    [rejectLessonPlan, refetchTimeline, refetchLessonPlans]
  );

  const handleRequestChanges = useCallback(
    async (target: ReviewTarget, comment: string) => {
      try {
        if (target.type === 'diary') {
          shikshaMitraToast.info({ message: 'Diary change request is not wired yet.' });
          return;
        }
        if (!comment) {
          shikshaMitraToast.warning({ message: 'Please provide comments.' });
          return;
        }
        await requestChanges({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Changes requested successfully.' });
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to request changes.',
        });
      }
    },
    [requestChanges, refetchTimeline, refetchLessonPlans]
  );

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
    {
      id: 'plannedDate',
      label: 'Date',
      filterType: 'date' as const,
      minWidth: 120,
      sticky: true,
      render: (v: string) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
    },
    { id: 'period', label: 'Period', minWidth: 110 },
    {
      id: 'plannedTime',
      label: 'Time',
      minWidth: 120,
      render: (v: string) => v || '—',
    },
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
      id: 'insightMessage',
      label: 'Insight',
      minWidth: 220,
      isFilter: false,
      render: (v: string, row: any) =>
        v ? (
          <Stack direction="row" spacing={0.75} alignItems="flex-start">
            <Iconify
              icon="mdi:information-outline"
              width={16}
              sx={{
                mt: 0.25,
                color: row.insightSeverity === 'error' ? 'error.main' : 'warning.main',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {v}
            </Typography>
          </Stack>
        ) : (
          '-'
        ),
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
      id: 'actions',
      label: 'Actions',
      minWidth: 180,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_v: unknown, row: any) => {
        const plan = row as LessonPlanRow;
        const diary = getDiaryForLesson(plan.id);
        return (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={plan.planStatus === 'Cancelled'}
              startIcon={<Iconify icon="mdi:notebook-edit-outline" width={16} />}
              onClick={() => openDiary(plan)}
              sx={{
                fontSize: '0.8125rem',
                py: 0.5,
                px: 1,
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {diary ? 'Edit diary notes' : 'Add diary notes'}
            </Button>
            <IconButton
              size="small"
              onClick={() => openDetails(plan)}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify icon="carbon:view-filled" width={18} />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const diaryColumns = [
    {
      id: 'plannedDate',
      label: 'Date',
      filterType: 'date' as const,
      minWidth: 120,
      sticky: true,
      render: (v: string) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
    },
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
      minWidth: 120,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_v: unknown, row: any) => {
        const plan = row as LessonPlanRow;
        const diary = getDiaryForLesson(plan.id);
        return (
          <ThreeDotsActions
            showViewIcon
            handleViewClick={() => openDetails(plan)}
            placement="right-center"
            actions={({ popover: pop }) => (
              <MenuList>
                <MenuItem
                  disabled={plan.planStatus === 'Cancelled'}
                  onClick={() => {
                    pop.onClose();
                    openDiary(plan);
                  }}
                >
                  <Iconify icon="mdi:notebook-edit-outline" sx={{ mr: 1, width: 16, height: 16 }} />
                  {diary ? 'Edit diary notes' : 'Add diary notes'}
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const reportTeacherData = teacherOptions.map((t) => {
    const plans = lessonPlans.filter((p) => p.teacherName === t.value);
    const completed = plans.filter((p) => p.diaryStatus === 'Submitted').length;
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
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => openAddLesson()}
            >
              Lesson Plan
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
        </Stack>
      </Card>

      {/* Tab Content */}
      {activeTab === 'dailyTimeline' && (
        <DailyTimelineTab
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          slots={timelineData?.slots || []}
          isLoading={isTimelineLoading}
          onAddLesson={(date, prefill) => {
            setEditPlan(null);
            setPrefillDate(date ?? null);
            setTimelinePrefill({
              ...(prefill ?? {}),
              plannedDate: date ?? dayjs(todayIso),
              teacherId: currentTeacherOption?.value || '',
              teacherName: currentTeacherOption?.label || '',
            });
            setLessonModalOpen(true);
          }}
          onViewDetails={openDetails}
          onEditLesson={(plan) => {
            openEditLesson({
              id: plan.id || plan.Id,
              academicYear: plan.academicYear || '2026-27',
              teacherId: plan.teacherId || '',
              teacherName: plan.teacherName || '',
              classId: plan.standardId || '',
              className: plan.standardName || '',
              divisionId: plan.divisionId || '',
              divisionName: plan.divisionName || '',
              subjectId: plan.subjectId || '',
              subjectName: plan.subjectName || '',
              chapterId: plan.chapterId || '',
              chapterName: plan.chapterName || '',
              plannedDate: plan.plannedDate || todayIso,
              timetableSlotId: plan.timetableSlotId,
              periodId: plan.timetableSlotId || 'Manual',
              period: plan.timetableSlotId ? 'Period 1' : 'Manual',
              plannedTime: getPlannedSlotTime(plan),
              topic: plan.topic || '',
              learningObjective: plan.learningObjective || '',
              teachingMethod: plan.teachingMethod || 'ExplanationBoardWork',
              resourcesRequired: plan.resourcesRequired || '',
              plannedCompletionPercentage: plan.plannedCompletionPercentage || 0,
              planStatus: plan.status || 'Draft',
              status: plan.status || 'Draft',
              diaryStatus: plan.diaryStatus || 'NotSubmitted',
              approvalStatus: plan.status === 'Approved' ? 'Approved' : 'Pending',
              reviewStatus: plan.status === 'Approved' ? 'Plan Approved' : 'Draft',
              reviewRemarks: plan.reviewRemarks,
              actualCompletionPercentage: plan.plannedCompletionPercentage || 0,
              existingChapterProgress: 0,
              source: plan.source || 'Manual',
              isAiGenerated: plan.source === 'AiGenerated',
              executionStatus: 'OnTrack',
              standardId: plan.standardId,
            });
          }}
          onSubmitDiary={openDiary}
          onSubmitPlan={submitPlan}
          onCreateHomework={openHomeworkFromPlan}
        />
      )}

      {activeTab === 'lessonList' && (
        <CustomizableTable
          tableId="lesson-plan-list-table"
          tableTitle={`Lesson Plans (${filteredPlans.length})`}
          data={filteredPlans}
          columns={lessonColumns}
          noDataText="No lesson plans match the current filters. Try adjusting or clearing filters, or add a new lesson plan."
        />
      )}

      {activeTab === 'weeklyPlanner' && (
        <WeeklyPlannerTab
          lessonPlans={lessonPlans}
          onAddLesson={openAddLesson}
          onEditLesson={openEditLesson}
          onViewDetails={openDetails}
          onSubmitDiary={openDiary}
          onCreateHomework={openHomeworkFromPlan}
          onMarkMissed={(plan) => {
            shikshaMitraToast.info({ message: `Mark missed for ${plan.topic} is not wired yet.` });
          }}
          onCreateFromTimetable={(date) =>
            shikshaMitraToast.info({
              message: `Timetable sync for ${date.format('DD MMM')} coming soon.`,
            })
          }
          onCopyPreviousWeek={() =>
            shikshaMitraToast.info({ message: 'Previous week lessons copied as draft.' })
          }
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
          canReviewSubmissions={canReviewSubmissions}
          currentTeacherId={currentTeacherOption?.value}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      )}

      {/* Modals */}
      <AddLessonPlanModal
        key={
          editPlan?.id ??
          timelinePrefill?.timetableSlotId ??
          prefillDate?.format('YYYY-MM-DD') ??
          'new-lesson-plan'
        }
        open={lessonModalOpen}
        editData={editPlan}
        prefillDate={prefillDate}
        timelinePrefill={timelinePrefill}
        currentTeacher={currentTeacherOption}
        lessonPlans={lessonPlans}
        onClose={() => setLessonModalOpen(false)}
        onSave={handleSaveLesson}
        onAiGenerate={() => {
          setLessonModalOpen(false);
          setAiDrawerOpen(true);
        }}
        isLoading={isSavingLesson}
      />

      <SubmitDiaryModal
        key={activePlanForDiary?.id ?? 'new-teacher-diary'}
        open={diaryModalOpen}
        plan={activePlanForDiary}
        existingDiary={activePlanForDiary ? getDiaryForLesson(activePlanForDiary.id) : null}
        allowBackdated
        maxBackdateDays={3}
        loading={isSavingDiary}
        onClose={() => setDiaryModalOpen(false)}
        onSave={handleSaveDiary}
      />

      <LessonDiaryDetailsDrawer
        open={detailDrawerOpen}
        plan={detailPlan}
        diary={detailPlan ? getDiaryForLesson(detailPlan.id) : null}
        onClose={() => setDetailDrawerOpen(false)}
      />

      <CustomDialog
        open={Boolean(homeworkPlan)}
        title="Create Homework From Lesson Plan"
        maxWidth="sm"
        handleClose={closeHomeworkFromPlan}
      >
        <DialogScrollContent sx={{ bgcolor: 'background.neutral', pb: 2 }}>
          <Stack spacing={2}>
            {homeworkError && (
              <Alert severity="error" icon={<Iconify icon="mdi:alert-circle-outline" />}>
                {homeworkError}
              </Alert>
            )}

            {homeworkPlan && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{homeworkPlan.topic}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {homeworkPlan.className}-{homeworkPlan.divisionName} /{' '}
                    {homeworkPlan.subjectName} / {homeworkPlan.chapterName}
                  </Typography>
                  {homeworkPlan.insightMessage && (
                    <Alert
                      severity={homeworkPlan.insightSeverity === 'error' ? 'error' : 'warning'}
                      icon={<Iconify icon="mdi:information-outline" />}
                      sx={{ mt: 1, py: 0.25, px: 1 }}
                    >
                      {homeworkPlan.insightMessage}
                    </Alert>
                  )}
                </Stack>
              </Box>
            )}

            <CustomSelect
              label="Homework Type *"
              options={homeworkTypeOptions}
              value={homeworkForm.homeworkTypeId}
              onChange={(value) =>
                setHomeworkForm((current) => ({
                  ...current,
                  homeworkTypeId: value as string,
                }))
              }
              formControlProps={{ fullWidth: true }}
            />

            <TextField
              size="small"
              label="Homework Title *"
              value={homeworkForm.title}
              onChange={(event) =>
                setHomeworkForm((current) => ({ ...current, title: event.target.value }))
              }
              fullWidth
            />

            <TextField
              size="small"
              label="Description *"
              value={homeworkForm.description}
              onChange={(event) =>
                setHomeworkForm((current) => ({ ...current, description: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />

            <CustomSelect
              label="Submission Type *"
              options={[
                { value: 0, label: 'Online Text' },
                { value: 1, label: 'File Upload' },
                { value: 2, label: 'In-Person' },
              ]}
              value={homeworkForm.submissionType}
              onChange={(value) =>
                setHomeworkForm((current) => ({
                  ...current,
                  submissionType: Number(value),
                }))
              }
              formControlProps={{ fullWidth: true }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DateTimePicker
                label="Publish Date *"
                value={homeworkForm.publishAt}
                onChange={(value) =>
                  setHomeworkForm((current) => ({ ...current, publishAt: value }))
                }
                format="DD/MM/YYYY HH:mm"
                ampm={false}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DateTimePicker
                label="Due Date *"
                value={homeworkForm.dueAt}
                onChange={(value) => setHomeworkForm((current) => ({ ...current, dueAt: value }))}
                format="DD/MM/YYYY HH:mm"
                ampm={false}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
          </Stack>
        </DialogScrollContent>

        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={closeHomeworkFromPlan}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:book-plus-outline" />}
            disabled={isCreatingHomeworkFromPlan}
            onClick={saveHomeworkFromPlan}
          >
            Create Homework
          </Button>
        </Stack>
      </CustomDialog>

      <AiLessonBuilderDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        contextPlan={editPlan}
      />
    </Box>
  );
};

export default LessonPlanScreen;
