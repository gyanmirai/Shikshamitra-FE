'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useMemo, useState, useCallback, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetMyEmployeesUnderManagerQuery } from 'src/redux/hr/employeeApi';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { AcademicDateTimePicker as DateTimePicker } from 'src/components/academic-date-picker';
import { useGetHomeworkTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';
import {
  Box,
  Tab,
  Stack,
  Alert,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  useSubmitTeacherDiaryMutation,
  useRequestPlanChangesMutation,
  useCreateHomeworkFromLessonPlanMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { ReviewQueueTab } from './components/ReviewQueueTab';
import DailyTimelineTab from './components/DailyTimelineTab';
import TeachingKpiCards from './components/TeachingKpiCards';
import SubmitDiaryModal from './components/SubmitDiaryModal';
import AddLessonPlanModal from './components/AddLessonPlanModal';
import AiLessonBuilderDrawer from './components/AiLessonBuilderDrawer';
import LessonDiaryDetailsDrawer from './components/LessonDiaryDetailsDrawer';
import { reconcileTimelineSlots } from './reconcileTimelineSlots';
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
  // { value: 'weeklyPlanner', label: 'Weekly Planner', icon: 'mdi:calendar-week-outline' },
  { value: 'lessonList', label: 'Lesson Plans', icon: 'mdi:book-open-outline' },
  { value: 'teacherDiary', label: 'Teacher Diary', icon: 'mdi:notebook-edit-outline' },
  { value: 'reviewQueue', label: 'Review Queue', icon: 'mdi:clipboard-check-outline' },
] as const;

type TabValue = (typeof TABS)[number]['value'] | 'weeklyPlanner';

const PlanStatusHeaderTooltip = (
  <Box sx={{ p: 1, minWidth: 250 }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        rowGap: 0.75,
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
      >
        Draft :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Saved internally & editable
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'info.main', fontSize: '0.75rem' }}
      >
        Submitted :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Awaiting reviewer approval
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.75rem' }}
      >
        Approved :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Ready for class execution
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem' }}
      >
        Rejected :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Returned with feedback
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}
      >
        Cancelled :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Withdrawn or cancelled
      </Typography>
    </Box>
  </Box>
);

const DiaryStatusHeaderTooltip = (
  <Box sx={{ p: 1, minWidth: 250 }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        rowGap: 0.75,
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}
      >
        Pending :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Entry not yet submitted
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
      >
        Draft :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Saved internally & editable
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'info.main', fontSize: '0.75rem' }}
      >
        Submitted :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Completed for period
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.75rem' }}
      >
        Approved :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Reviewed and approved
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem' }}
      >
        Rejected :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Returned for corrections
      </Typography>
    </Box>
  </Box>
);

const PLAN_STATUS_DESCRIPTIONS: Record<string, string> = {
  Draft: 'Draft: Saved internally and editable before submission',
  Submitted: 'Submitted: Submitted and awaiting coordinator/HOD approval',
  Approved: 'Approved: Plan approved and ready for class execution',
  Rejected: 'Rejected: Returned with feedback for revisions',
  Cancelled: 'Cancelled: Lesson plan is withdrawn or cancelled',
  Pending: 'Pending: Awaiting submission or approval action',
};

const DIARY_STATUS_DESCRIPTIONS: Record<string, string> = {
  Draft: 'Draft: Saved internally and editable',
  Submitted: 'Submitted: Completed teacher diary entry for the conducted period',
  NotSubmitted: 'Pending: Teacher diary entry has not been submitted yet',
  Pending: 'Pending: Teacher diary entry has not been submitted yet',
  Approved: 'Approved: Teacher diary entry reviewed and approved',
  Rejected: 'Rejected: Returned for corrections',
};

const renderPlanStatus = (status: PlanStatus) => {
  const tooltipText = PLAN_STATUS_DESCRIPTIONS[status] || `${status} status`;
  return (
    <CustomTooltip title={tooltipText} placement="top" arrow>
      <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
        <Label color={planStatusColor[status] ?? 'default'} variant="soft">
          {status}
        </Label>
      </Box>
    </CustomTooltip>
  );
};

const renderDiaryStatus = (status: DiaryStatus) => {
  const displayLabel = status === 'NotSubmitted' ? 'Pending' : status;
  const tooltipText = DIARY_STATUS_DESCRIPTIONS[status] || `${displayLabel} status`;
  return (
    <CustomTooltip title={tooltipText} placement="top" arrow>
      <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
        <Label color={diaryStatusColor[status] ?? 'default'} variant="soft">
          {displayLabel}
        </Label>
      </Box>
    </CustomTooltip>
  );
};

const LessonPlanScreen = () => {
  const dispatch = useDispatch();
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const { employee, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setIsChanges(false));
  }, [dispatch]);

  const { data: mySubordinates } = useGetMyEmployeesUnderManagerQuery(undefined, {
    skip: !employee?.id,
  });

  const hasSubordinates = useMemo(
    () => mySubordinates?.employees && mySubordinates.employees.length > 0,
    [mySubordinates]
  );

  const canReviewSubmissions = useMemo(() => {
    const roleBasedCheck = readRoleNames(employee, user).some(canRoleReviewLessonPlans);
    return roleBasedCheck || Boolean(hasSubordinates);
  }, [employee, user, hasSubordinates]);
  const [activeTab, setActiveTab] = useState<TabValue>('dailyTimeline');
  const [healthScore] = useState<TeachingHealthScore>(initialHealthScore);

  const currentTeacherId = useMemo(
    () => employee?.id || employee?.employeeId || employee?.userId || user?.sub || user?.id || '',
    [employee, user]
  );

  // ─── Queries & Mutations via useQueryAndMutation ─────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs().startOf('day'));

  const timelineDateParam = useMemo(
    () =>
      selectedDate?.isValid()
        ? dateConvertor(selectedDate.startOf('day').format(dateFormat))
        : '',
    [selectedDate]
  );

  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isFetching: isTimelineFetching,
    refetch: refetchTimeline,
  } = useGetLessonPlanTimelineQuery(
    {
      date: timelineDateParam,
      academicMediumId: currentMedium?.id,
      teacherId: !canReviewSubmissions && currentTeacherId ? currentTeacherId : undefined,
    },
    {
      skip: !timelineDateParam,
      refetchOnMountOrArgChange: true,
    }
  );

  const isTimelineBusy = isTimelineLoading || isTimelineFetching;

  const isTimelineOwner = useMemo(
    () => !timelineData?.teacherId || timelineData.teacherId === currentTeacherId,
    [timelineData, currentTeacherId]
  );

  const {
    data: lessonPlanList,
    refetch: refetchLessonPlans,
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
  } = useGetLessonPlansQuery({
    academicYearId: currentYear?.id,
    academicMediumId: currentMedium?.id,
    teacherId: !canReviewSubmissions && currentTeacherId ? currentTeacherId : undefined,
    maxResultCount: 1000,
  });

  const {
    data: teacherDiaryList,
    refetch: refetchTeacherDiaries,
    isLoading: isDiariesLoading,
    isFetching: isDiariesFetching,
  } = useGetTeacherDiariesQuery({
    academicYearId: currentYear?.id,
    academicMediumId: currentMedium?.id,
    teacherId: !canReviewSubmissions && currentTeacherId ? currentTeacherId : undefined,
    maxResultCount: 1000,
  });

  const { data: homeworkTypeData, isLoading: isHomeworkTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkTypesQuery,
    params: { academicMediumId: currentMedium?.id },
    options: { skip: !currentMedium?.id },
  });

  const [createLessonPlan, { isLoading: isCreatingLesson }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLessonPlanMutation,
    popupConfig: { error: false },
  });
  const [updateLessonPlan, { isLoading: isUpdatingLesson }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLessonPlanMutation,
    popupConfig: { error: false },
  });
  const [submitLessonPlan, { isLoading: isSubmittingLesson }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitLessonPlanMutation,
    popupConfig: { error: false },
  });
  const isSavingLesson = isCreatingLesson || isUpdatingLesson || isSubmittingLesson;
  const [approveLessonPlan, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveLessonPlanMutation,
  });
  const [rejectLessonPlan, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectLessonPlanMutation,
  });
  const [requestChanges, { isLoading: isRequestingPlanChanges }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRequestPlanChangesMutation,
  });
  const [createHomeworkFromLessonPlan, { isLoading: isCreatingHomeworkFromPlan }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useCreateHomeworkFromLessonPlanMutation,
    });
  const [createTeacherDiary, { isLoading: isCreatingDiary }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateTeacherDiaryMutation,
  });
  const [updateTeacherDiary, { isLoading: isUpdatingDiary }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTeacherDiaryMutation,
  });
  const [submitTeacherDiary, { isLoading: isSubmittingDiary }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitTeacherDiaryMutation,
  });
  const isSavingDiary = isCreatingDiary || isUpdatingDiary || isSubmittingDiary;

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
        reviewedByName: p.reviewedByName,
        reviewedAt: p.reviewedAt,
        timetableSlotId: p.timetableSlotId,
        teacherDiaryId: p.teacherDiaryId,
        insightType: p.insightType,
        insightSeverity: p.insightSeverity,
        insightMessage: p.insightMessage,
        isPlanCreationBlocked: Boolean(p.isPlanCreationBlocked),
      })) || []
    );
  }, [lessonPlanList]);

  /**
   * Memoization Justification:
   * - Reconciles two API datasets and prevents repeated O(slots × plans) work during screen renders.
   * - Keeps the timeline slot objects stable until their source data or selected date changes.
   */
  const reconciledTimelineSlots = useMemo(
    () =>
      reconcileTimelineSlots(
        timelineData?.slots || [],
        lessonPlans,
        selectedDate.format('YYYY-MM-DD'),
        timelineData?.teacherId
      ),
    [lessonPlans, selectedDate, timelineData]
  );

  const isReconciledTimelineBusy = isTimelineBusy || isPlansLoading || isPlansFetching;

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
  const [homeworkTouched, setHomeworkTouched] = useState(false);

  const mediumMinDate = useMemo(() => {
    const startStr = (currentMedium as any)?.startDate || (currentYear as any)?.startDate;
    return startStr ? dayjs(startStr) : undefined;
  }, [currentMedium, currentYear]);

  const mediumMaxDate = useMemo(() => {
    const endStr = (currentMedium as any)?.endDate || (currentYear as any)?.endDate;
    return endStr ? dayjs(endStr) : undefined;
  }, [currentMedium, currentYear]);

  const homeworkFieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!homeworkForm.homeworkTypeId) {
      errors.homeworkTypeId = 'Homework Type is required.';
    }
    if (!homeworkForm.title.trim()) {
      errors.title = 'Homework Title is required.';
    }
    if (!homeworkForm.description.trim()) {
      errors.description = 'Description is required.';
    }

    if (!homeworkForm.publishAt || !homeworkForm.publishAt.isValid()) {
      errors.publishAt = 'Publish Date is required.';
    } else {
      if (mediumMinDate && homeworkForm.publishAt.isBefore(mediumMinDate, 'day')) {
        errors.publishAt = `Publish Date must be on or after ${mediumMinDate.format('DD/MM/YYYY')}`;
      } else if (mediumMaxDate && homeworkForm.publishAt.isAfter(mediumMaxDate, 'day')) {
        errors.publishAt = `Publish Date must be on or before ${mediumMaxDate.format('DD/MM/YYYY')}`;
      }
    }

    if (!homeworkForm.dueAt || !homeworkForm.dueAt.isValid()) {
      errors.dueAt = 'Due Date is required.';
    } else {
      if (mediumMinDate && homeworkForm.dueAt.isBefore(mediumMinDate, 'day')) {
        errors.dueAt = `Due Date must be on or after ${mediumMinDate.format('DD/MM/YYYY')}`;
      } else if (mediumMaxDate && homeworkForm.dueAt.isAfter(mediumMaxDate, 'day')) {
        errors.dueAt = `Due Date must be on or before ${mediumMaxDate.format('DD/MM/YYYY')}`;
      } else if (
        homeworkForm.publishAt &&
        homeworkForm.publishAt.isValid() &&
        (homeworkForm.dueAt.isBefore(homeworkForm.publishAt) ||
          homeworkForm.dueAt.isSame(homeworkForm.publishAt))
      ) {
        errors.dueAt = 'Due date/time must be after publish date/time.';
      }
    }

    return errors;
  }, [homeworkForm, mediumMinDate, mediumMaxDate]);

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
    setHomeworkTouched(false);
  }, []);

  const closeHomeworkFromPlan = () => {
    setHomeworkPlan(null);
    setHomeworkError('');
    setHomeworkTouched(false);
  };

  const saveHomeworkFromPlan = async () => {
    if (!homeworkPlan) return;
    setHomeworkTouched(true);

    if (!currentMedium?.id) {
      shikshaMitraToast.error({ message: 'Academic medium is required before creating homework.' });
      return;
    }

    if (Object.keys(homeworkFieldErrors).length > 0) {
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
          publishAt: homeworkForm.publishAt!.toISOString(),
          dueAt: homeworkForm.dueAt!.toISOString(),
        },
      }).unwrap();

      closeHomeworkFromPlan();
      shikshaMitraToast.success({ message: 'Homework created from lesson plan successfully.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.error?.message || 'Failed to create homework from lesson plan.',
      });
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
          academicYearId: currentYear?.id,
          teacherId: form.teacherId,
          standardId: form.standardId,
          divisionId: form.divisionId,
          subjectId: form.subjectId,
          plannedDate,
          timetableSlotId: form.timetableSlotId || null,
          isAiGenerated: form.source === 'AiGenerated',
          // LessonPlanStatus: Draft = 0, Submitted = 1. The create endpoint
          // applies this transition atomically for the modal's primary action.
          status: submitAfterSave ? 1 : 0,
          ...planDetailsPayload,
        };

        let result;
        if (form.id) {
          result = await updateLessonPlan({ id: form.id, body: planDetailsPayload }).unwrap();
        } else {
          result = await createLessonPlan(createPayload).unwrap();
        }

        const resultId =
          result?.id ||
          result?.result?.id ||
          (result as any)?.result?.Id ||
          (result as any)?.Id ||
          form.id;
        // New plans are submitted by the create payload. Existing plans still
        // use the guarded submit endpoint after their editable fields update.
        if (submitAfterSave && form.id && resultId) {
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
    async (form: DiaryFormState, submit: boolean) => {
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

        let diaryId = existingDiary?.id;
        if (existingDiary) {
          await updateTeacherDiary({ id: existingDiary.id, body }).unwrap();
        } else {
          const createdDiary = await createTeacherDiary(body).unwrap();
          diaryId = createdDiary.id;
        }

        if (submit) {
          if (!diaryId) throw new Error('Teacher diary could not be identified after saving.');
          await submitTeacherDiary({ id: diaryId }).unwrap();
        }

        setDiaryModalOpen(false);
        await refetchTeacherDiaries();
        await refetchLessonPlans();
        await refetchTimeline();
        shikshaMitraToast.success({
          message: submit ? 'Teacher diary submitted successfully.' : 'Teacher diary notes saved.',
        });
      } catch (err: any) {
        const errorMsg =
          err?.data?.detail ||
          err?.data?.title ||
          err?.data?.error?.message ||
          err?.detail ||
          err?.message ||
          'Teacher diary can be submitted only against an approved lesson plan.';
        shikshaMitraToast.error({
          message: errorMsg,
        });
      }
    },
    [
      createTeacherDiary,
      getDiaryForLesson,
      refetchLessonPlans,
      refetchTeacherDiaries,
      refetchTimeline,
      submitTeacherDiary,
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
          return false;
        }
        await approveLessonPlan({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Approved successfully.' });
        return true;
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.error?.message || 'Failed to approve.' });
        return false;
      }
    },
    [approveLessonPlan, refetchTimeline, refetchLessonPlans]
  );

  const handleReject = useCallback(
    async (target: ReviewTarget, comment: string) => {
      try {
        if (target.type === 'diary') {
          shikshaMitraToast.info({ message: 'Diary rejection is not wired yet.' });
          return false;
        }
        if (!comment) {
          shikshaMitraToast.warning({ message: 'Please provide a reason.' });
          return false;
        }
        await rejectLessonPlan({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Rejected and returned for correction.' });
        return true;
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.error?.message || 'Failed to reject.' });
        return false;
      }
    },
    [rejectLessonPlan, refetchTimeline, refetchLessonPlans]
  );

  const handleRequestChanges = useCallback(
    async (target: ReviewTarget, comment: string) => {
      try {
        if (target.type === 'diary') {
          shikshaMitraToast.info({ message: 'Diary change request is not wired yet.' });
          return false;
        }
        if (!comment) {
          shikshaMitraToast.warning({ message: 'Please provide comments.' });
          return false;
        }
        await requestChanges({ id: target.id, body: { comment } }).unwrap();
        refetchTimeline();
        refetchLessonPlans();
        shikshaMitraToast.success({ message: 'Changes requested successfully.' });
        return true;
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to request changes.',
        });
        return false;
      }
    },
    [requestChanges, refetchTimeline, refetchLessonPlans]
  );

  // ─── Status Descriptions & Rich Tooltips ───────────────────────────────────

  const lessonColumns = useMemo(
    () => [
      {
        id: 'plannedDate',
        label: 'Date',
        align: 'left' as const,
        filterType: 'date' as const,
        minWidth: 120,
        sticky: true,
        render: (v: string) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
      },
      {
        id: 'period',
        label: 'Period',
        align: 'left' as const,
        minWidth: 110,
        filterType: 'string' as const,
      },
      {
        id: 'plannedTime',
        label: 'Time',
        align: 'left' as const,
        minWidth: 120,
        render: (v: string) => v || '—',
      },
      {
        id: 'className',
        label: 'Class / Div',
        align: 'left' as const,
        minWidth: 120,
        filterType: 'enum' as const,
        render: (_v: any, row: any) => `${row.className}-${row.divisionName}`,
      },
      {
        id: 'subjectName',
        label: 'Subject',
        align: 'left' as const,
        minWidth: 130,
        filterType: 'enum' as const,
      },
      {
        id: 'chapterName',
        label: 'Chapter',
        align: 'left' as const,
        minWidth: 150,
        filterType: 'string' as const,
      },
      {
        id: 'topic',
        label: 'Topic',
        align: 'left' as const,
        minWidth: 200,
        filterType: 'string' as const,
      },
      {
        id: 'teacherName',
        label: 'Teacher',
        align: 'left' as const,
        minWidth: 160,
        filterType: 'enum' as const,
      },
      {
        id: 'insightMessage',
        label: 'Insight',
        align: 'left' as const,
        minWidth: 220,
        isFilter: false,
        render: (v: string, row: any) =>
          v ? (
            <CustomTooltip title={v} placement="top" arrow>
              <Stack direction="row" spacing={0.75} alignItems="flex-start">
                <Iconify
                  icon="mdi:information-outline"
                  width={16}
                  sx={{
                    mt: 0.25,
                    flexShrink: 0,
                    color: row.insightSeverity === 'error' ? 'error.main' : 'warning.main',
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                    cursor: 'pointer',
                  }}
                >
                  {v}
                </Typography>
              </Stack>
            </CustomTooltip>
          ) : (
            '-'
          ),
      },
      {
        id: 'plannedCompletionPercentage',
        label: 'Planned %',
        align: 'left' as const,
        filterType: 'number' as const,
        minWidth: 110,
        render: (v: number) => (
          <Stack spacing={1}>
            <Typography variant="body2">{v}%</Typography>
            <LinearProgress variant="determinate" value={v} sx={{ height: 4, borderRadius: 1 }} />
          </Stack>
        ),
      },
      {
        id: 'actualCompletionPercentage',
        label: 'Actual %',
        align: 'left' as const,
        filterType: 'number' as const,
        minWidth: 110,
        render: (v: number) => (
          <Stack spacing={1}>
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
        id: 'planStatus',
        label: (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
              Plan Status
            </Typography>
            <CustomTooltip title={PlanStatusHeaderTooltip} placement="top" arrow>
              <Iconify
                icon="lucide:info"
                width={14}
                height={14}
                sx={{ color: 'text.secondary', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
        ),
        align: 'left' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Submitted', value: 'Submitted' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
          { label: 'Cancelled', value: 'Cancelled' },
        ],
        minWidth: 70,
        maxWidth: 180,
        render: (v: PlanStatus) => renderPlanStatus(v),
      },
      {
        id: 'diaryStatus',
        label: (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
              Diary Status
            </Typography>
            <CustomTooltip title={DiaryStatusHeaderTooltip} placement="top" arrow>
              <Iconify
                icon="lucide:info"
                width={14}
                height={14}
                sx={{ color: 'text.secondary', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
        ),
        align: 'left' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Pending', value: 'NotSubmitted' },
          { label: 'Draft', value: 'Draft' },
          { label: 'Submitted', value: 'Submitted' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
        ],
        minWidth: 80,
        render: (v: DiaryStatus) => renderDiaryStatus(v),
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 120,
        align: 'left' as const,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right' as const,
        render: (_v: unknown, row: any) => {
          const plan = row as LessonPlanRow;
          const diary = getDiaryForLesson(plan.id);
          const isApproved = plan.planStatus === 'Approved';
          const isCancelled = plan.planStatus === 'Cancelled';
          const isDiaryDisabled = !isApproved || isCancelled;
          const isOwner = plan.teacherId === currentTeacherId;

          const diaryTooltipTitle = isCancelled
            ? 'Lesson plan is cancelled.'
            : !isApproved
              ? 'Lesson plan must be approved to add or edit diary notes.'
              : diary
                ? 'Edit diary notes'
                : 'Add diary notes';

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {isOwner && (
                <Tooltip title={diaryTooltipTitle}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={isDiaryDisabled}
                      onClick={() => openDiary(plan)}
                      sx={{ color: isDiaryDisabled ? 'action.disabled' : 'primary.main' }}
                    >
                      <Iconify icon="mdi:notebook-edit-outline" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => openDetails(plan)}
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="carbon:view-filled" width={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [openDiary, openDetails, getDiaryForLesson, currentTeacherId]
  );

  const diaryColumns = useMemo(
    () => [
      {
        id: 'plannedDate',
        label: 'Date',
        align: 'left' as const,
        filterType: 'date' as const,
        minWidth: 120,
        sticky: true,
        render: (v: string) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
      },
      {
        id: 'period',
        label: 'Period',
        align: 'left' as const,
        minWidth: 110,
        filterType: 'string' as const,
      },
      {
        id: 'className',
        label: 'Class/Div',
        align: 'left' as const,
        minWidth: 120,
        filterType: 'enum' as const,
        render: (_v: any, r: any) => `${r.className}-${r.divisionName}`,
      },
      {
        id: 'subjectName',
        label: 'Subject',
        align: 'left' as const,
        minWidth: 130,
        filterType: 'enum' as const,
      },
      {
        id: 'chapterName',
        label: 'Chapter',
        align: 'left' as const,
        minWidth: 150,
        filterType: 'string' as const,
      },
      {
        id: 'topic',
        label: 'Topic',
        align: 'left' as const,
        minWidth: 200,
        filterType: 'string' as const,
      },
      {
        id: 'teacherName',
        label: 'Teacher',
        align: 'left' as const,
        minWidth: 160,
        filterType: 'enum' as const,
      },
      {
        id: 'actualCompletionPercentage',
        label: 'Actual %',
        align: 'left' as const,
        filterType: 'number' as const,
        minWidth: 110,
        render: (v: number) => `${v}%`,
      },
      {
        id: 'diaryStatus',
        label: (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} fontSize="0.8125rem">
              Diary Status
            </Typography>
            <CustomTooltip title={DiaryStatusHeaderTooltip} placement="top" arrow>
              <Iconify
                icon="lucide:info"
                width={14}
                height={14}
                sx={{ color: 'text.secondary', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
        ),
        align: 'left' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Pending', value: 'NotSubmitted' },
          { label: 'Draft', value: 'Draft' },
          { label: 'Submitted', value: 'Submitted' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
        ],
        minWidth: 140,
        render: (v: DiaryStatus) => renderDiaryStatus(v),
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 120,
        align: 'left' as const,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right' as const,
        render: (_v: unknown, row: any) => {
          const plan = row as LessonPlanRow;
          const diary = getDiaryForLesson(plan.id);
          const isApproved = plan.planStatus === 'Approved';
          const isCancelled = plan.planStatus === 'Cancelled';
          const isDiaryDisabled = !isApproved || isCancelled;
          const isOwner = plan.teacherId === currentTeacherId;

          const diaryTooltipTitle = isCancelled
            ? 'Lesson plan is cancelled.'
            : !isApproved
              ? 'Lesson plan must be approved to add or edit diary notes.'
              : diary
                ? 'Edit diary notes'
                : 'Add diary notes';

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {isOwner && (
                <Tooltip title={diaryTooltipTitle}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={isDiaryDisabled}
                      onClick={() => openDiary(plan)}
                      sx={{ color: isDiaryDisabled ? 'action.disabled' : 'primary.main' }}
                    >
                      <Iconify icon="mdi:notebook-edit-outline" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => openDetails(plan)}
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="carbon:view-filled" width={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [openDetails, openDiary, getDiaryForLesson, currentTeacherId]
  );

  const visibleLessonColumns = useMemo(
    () => lessonColumns.filter((col) => col.id !== 'teacherName' || canReviewSubmissions),
    [canReviewSubmissions, lessonColumns]
  );

  const visibleDiaryColumns = useMemo(
    () => diaryColumns.filter((col) => col.id !== 'teacherName' || canReviewSubmissions),
    [canReviewSubmissions, diaryColumns]
  );

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

  const visibleTabs = useMemo(
    () => TABS.filter((tab) => tab.value !== 'reviewQueue' || canReviewSubmissions),
    [canReviewSubmissions]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 91px)',
        maxHeight: 'calc(100vh - 91px)',
        overflow: 'hidden',
      }}
    >
      {/* Sticky Top Header Area */}
      <Box sx={{ flexShrink: 0 }}>
        <CustomBreadcrumbs
          heading="Lesson Plan / Teacher Diary"
          description="Plan lessons, record daily teaching evidence, review diary submissions, and track syllabus progress in one place."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum', href: '/academic/curriculumSubjects' },
            { name: 'Lesson Plan / Teacher Diary' },
          ]}
        />

        {/* Teaching KPI Cards Accordion */}
        <Accordion
          defaultExpanded={false}
          disableGutters
          variant="outlined"
          sx={{
            mb: 1,
            borderRadius: '12px',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" width={18} />}
            sx={{
              minHeight: 44,
              px: 2,
              '& .MuiAccordionSummary-content': { my: 1 },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:chart-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Teaching Metrics & KPI Overview
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5, pt: 0 }}>
            <TeachingKpiCards
              lessonPlans={lessonPlans}
              diaryEntries={diaryEntries}
              onCardClick={(key) => {
                if (key === 'pending_approvals') {
                  if (canReviewSubmissions) {
                    setActiveTab('reviewQueue');
                  } else {
                    setQuickFilter('pending_approval');
                    setActiveTab('lessonList');
                  }
                } else if (key === 'missed_lessons') {
                  setQuickFilter('missed_lessons');
                  setActiveTab('lessonList');
                } else if (key === 'syllabus_delay') {
                  setQuickFilter('delayed_progress');
                  setActiveTab('lessonList');
                }
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Tab Navigation & Filters */}
        <Paper
          sx={{
            mb: 1,
            '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <CustomTabs
            value={activeTab}
            onChange={(_, value) => {
              dispatch(setIsChanges(false));
              setActiveTab(value as TabValue);
            }}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, borderRadius: '12px' }}
            role="tablist"
          >
            {visibleTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={20} />}
              />
            ))}
          </CustomTabs>
        </Paper>
      </Box>

      {/* Scrollable Tab Content Area using custom Scrollbar */}
      <Box
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
          {activeTab === 'dailyTimeline' && (
            <DailyTimelineTab
              selectedDate={selectedDate}
              onChangeDate={(newDate) => {
                if (newDate?.isValid()) {
                  setSelectedDate(newDate.startOf('day'));
                }
              }}
              slots={isReconciledTimelineBusy ? [] : reconciledTimelineSlots}
              isLoading={isReconciledTimelineBusy}
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
              columns={visibleLessonColumns}
              isLoading={isPlansLoading || (!lessonModalOpen && isPlansFetching)}
              noDataText="No lesson plans match the current filters. Try adjusting or clearing filters, or add a new lesson plan."
            />
          )}

          {/* {activeTab === 'weeklyPlanner' && (
            <WeeklyPlannerTab
              lessonPlans={lessonPlans}
              currentTeacherId={currentTeacherId}
              onAddLesson={openAddLesson}
              onEditLesson={openEditLesson}
              onViewDetails={openDetails}
              onSubmitDiary={openDiary}
              onCreateHomework={openHomeworkFromPlan}
              onMarkMissed={(plan) => {
                shikshaMitraToast.info({
                  message: `Mark missed for ${plan.topic} is not wired yet.`,
                });
              }}
              onCopyPreviousWeek={() =>
                shikshaMitraToast.info({ message: 'Previous week lessons copied as draft.' })
              }
            />
          )} */}

          {activeTab === 'teacherDiary' && (
            <CustomizableTable
              tableId="teacher-diary-tab-table"
              tableTitle="Teacher Diary"
              data={lessonPlans.filter((p) => p.plannedDate <= todayIso)}
              columns={visibleDiaryColumns}
              isLoading={
                isPlansLoading ||
                isDiariesLoading ||
                // Only show isFetching loading when the diary/lesson modal is fully closed.
                // When a modal is open and a partial mutation succeeds (e.g. create succeeds
                // but submit fails), RTK Query tag invalidation can trigger isFetching even
                // though the overall operation errored. Gate the background loading so the
                // table does not flash a spinner while the user is still in the modal.
                (!diaryModalOpen && !lessonModalOpen && (isPlansFetching || isDiariesFetching))
              }
              noDataText="No past or today lessons available for diary."
            />
          )}

          {activeTab === 'reviewQueue' && (
            <ReviewQueueTab
              lessonPlans={lessonPlans}
              canReviewSubmissions={canReviewSubmissions}
              currentTeacherId={currentTeacherOption?.value}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onViewDetails={openDetails}
              onRevisePlan={openEditLesson}
              isApproving={isApproving}
              isRejecting={isRejecting}
              isRequesting={isRequestingPlanChanges}
              isLoading={isPlansLoading || isPlansFetching}
              onRefresh={refetchLessonPlans}
            />
          )}
        </Scrollbar>
      </Box>

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
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Create Homework From Lesson Plan
            </Typography>
            <CustomTooltip
              arrow
              placement="bottom-start"
              title={
                <Box sx={{ p: 1, maxWidth: 320 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    Homework Guidance
                  </Typography>
                  <Typography variant="caption" display="block">
                    Generate homework assignments directly from planned topics. Pre-fills topic and objectives, allowing you to configure submission type, deadlines, and publishing rules.
                  </Typography>
                </Box>
              }
            >
              <IconButton size="small" color="info">
                <Iconify icon="lucide:info" width={18} />
              </IconButton>
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        handleClose={closeHomeworkFromPlan}
      >
        <DialogScrollContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            {homeworkPlan && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:notebook-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {homeworkPlan.topic}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
                    <Label variant="soft" color="primary">
                      {homeworkPlan.className}-{homeworkPlan.divisionName}
                    </Label>
                    <Label variant="soft" color="info">
                      {homeworkPlan.subjectName}
                    </Label>
                    {homeworkPlan.chapterName && (
                      <Typography variant="caption" color="text.secondary">
                        Chapter: {homeworkPlan.chapterName}
                      </Typography>
                    )}
                  </Stack>
                  {homeworkPlan.insightMessage && (
                    <Alert
                      severity={homeworkPlan.insightSeverity === 'error' ? 'error' : 'warning'}
                      icon={<Iconify icon="mdi:information-outline" />}
                      sx={{ py: 0.25, px: 1, borderRadius: 1 }}
                    >
                      {homeworkPlan.insightMessage}
                    </Alert>
                  )}
                </Stack>
              </Paper>
            )}

            <CustomSelect
              label="Homework Type *"
              options={homeworkTypeOptions}
              isLoading={isHomeworkTypesLoading}
              value={homeworkForm.homeworkTypeId}
              onChange={(value) =>
                setHomeworkForm((current) => ({
                  ...current,
                  homeworkTypeId: value as string,
                }))
              }
              formControlProps={{ fullWidth: true }}
              error={homeworkTouched && Boolean(homeworkFieldErrors.homeworkTypeId)}
              helperText={homeworkTouched ? homeworkFieldErrors.homeworkTypeId : undefined}
            />

            <TextField
              size="small"
              label="Homework Title *"
              value={homeworkForm.title}
              onChange={(event) =>
                setHomeworkForm((current) => ({ ...current, title: event.target.value }))
              }
              fullWidth
              error={homeworkTouched && Boolean(homeworkFieldErrors.title)}
              helperText={homeworkTouched ? homeworkFieldErrors.title : undefined}
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
              error={homeworkTouched && Boolean(homeworkFieldErrors.description)}
              helperText={homeworkTouched ? homeworkFieldErrors.description : undefined}
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
                minDate={mediumMinDate}
                maxDate={mediumMaxDate}
                disablePast
                slotProps={{
                  popper: { placement: 'top-start', sx: { zIndex: 1300 } },
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: homeworkTouched && Boolean(homeworkFieldErrors.publishAt),
                    helperText: homeworkTouched ? homeworkFieldErrors.publishAt : undefined,
                  },
                }}
              />
              <DateTimePicker
                label="Due Date *"
                value={homeworkForm.dueAt}
                onChange={(value) => setHomeworkForm((current) => ({ ...current, dueAt: value }))}
                format="DD/MM/YYYY HH:mm"
                ampm={false}
                minDate={
                  homeworkForm.publishAt && homeworkForm.publishAt.isValid()
                    ? homeworkForm.publishAt
                    : mediumMinDate
                }
                maxDate={mediumMaxDate}
                disablePast
                slotProps={{
                  popper: { placement: 'top-start', sx: { zIndex: 1300 } },
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: homeworkTouched && Boolean(homeworkFieldErrors.dueAt),
                    helperText: homeworkTouched ? homeworkFieldErrors.dueAt : undefined,
                  },
                }}
              />
            </Stack>
          </Stack>
        </DialogScrollContent>

        <Divider />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ p: 2, bgcolor: 'background.paper' }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={closeHomeworkFromPlan}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isCreatingHomeworkFromPlan}
            startIcon={<Iconify icon="mdi:book-plus-outline" />}
            onClick={saveHomeworkFromPlan}
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              borderRadius: 1,
              px: 2,
              '&:hover': { bgcolor: 'text.secondary' },
            }}
          >
            Create Homework
          </LoadingButton>
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
