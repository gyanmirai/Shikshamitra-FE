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
import { Add, Rule, Save, Print, Today, FactCheck, AutoStories } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Switch,
  Slider,
  Divider,
  TextField,
  Typography,
  IconButton,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import {
  todayIso,
  weekDays,
  weekStartIso,
  classOptions,
  statusOptions,
  periodOptions,
  periodTimeMap,
  teacherOptions,
  chapterOptions,
  subjectOptions,
  initialSettings,
  divisionOptions,
  reviewModeOptions,
  notificationEvents,
  initialLessonPlans,
  diaryStatusOptions,
  academicYearOptions,
  missedReasonOptions,
  initialDiaryEntries,
  teachingMethodOptions,
} from './lessonPlanData';

import type {
  LessonPlanRow,
  TeacherDiaryRow,
  LessonPlanStatus,
  TeacherDiaryStatus,
} from './lessonPlanData';

type LessonFormState = {
  id?: string;
  academicYear: string;
  teacherName: string;
  className: string;
  divisionName: string;
  subjectName: string;
  chapterName: string;
  plannedDate: Dayjs | null;
  period: string;
  topic: string;
  learningObjective: string;
  teachingMethod: string;
  resourcesRequired: string;
  plannedCompletionPercentage: number;
};

type DiaryFormState = {
  lessonPlanId: string;
  actualDate: Dayjs | null;
  classConducted: boolean;
  actualTopicTaught: string;
  actualContentSummary: string;
  completionPercentage: number;
  studentResponse: string;
  homeworkAssigned: string;
  resourcesUsed: string;
  missedReason: string;
  rescheduledToDate: Dayjs | null;
  teacherRemarks: string;
};

type ReviewState = {
  targetType: 'plan' | 'diary';
  targetId: string;
  isApproved: boolean;
  reviewRemarks: string;
};

const statusColor: Record<
  LessonPlanStatus | TeacherDiaryStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  'Not Started': 'default',
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Cancelled: 'default',
};

const defaultLessonForm: LessonFormState = {
  academicYear: '2026-27',
  teacherName: 'Rohit Mehta',
  className: '',
  divisionName: '',
  subjectName: '',
  chapterName: '',
  plannedDate: dayjs(todayIso),
  period: '',
  topic: '',
  learningObjective: '',
  teachingMethod: 'Explanation + Board Work',
  resourcesRequired: '',
  plannedCompletionPercentage: 0,
};

const defaultDiaryForm: DiaryFormState = {
  lessonPlanId: '',
  actualDate: dayjs(todayIso),
  classConducted: true,
  actualTopicTaught: '',
  actualContentSummary: '',
  completionPercentage: 0,
  studentResponse: '',
  homeworkAssigned: '',
  resourcesUsed: '',
  missedReason: 'Other',
  rescheduledToDate: null,
  teacherRemarks: '',
};

const lessonPlanViewOptions = [
  { value: 'all', label: 'All Teachers' },
  { value: 'Rohit Mehta', label: 'Rohit Mehta' },
  { value: 'Anita Sharma', label: 'Anita Sharma' },
  { value: 'Farah Khan', label: 'Farah Khan' },
  { value: 'Kiran Patel', label: 'Kiran Patel' },
  { value: 'Nisha Rao', label: 'Nisha Rao' },
];

const allClassOptions = [{ value: 'all', label: 'All Classes' }, ...classOptions];
const allDivisionOptions = [{ value: 'all', label: 'All Divisions' }, ...divisionOptions];
const allSubjectOptions = [{ value: 'all', label: 'All Subjects' }, ...subjectOptions];
const allChapterOptions = [{ value: 'all', label: 'All Chapters' }, ...chapterOptions];

const createDraftDiary = (lesson: LessonPlanRow): DiaryFormState => ({
  ...defaultDiaryForm,
  lessonPlanId: lesson.id,
  actualDate: dayjs(lesson.plannedDate),
  actualTopicTaught: lesson.topic,
  completionPercentage: lesson.actualCompletionPercentage || lesson.plannedCompletionPercentage,
});

const LessonPlanScreen = () => {
  const [activeTab, setActiveTab] = useState('lessonList');
  const [lessonPlans, setLessonPlans] = useState(initialLessonPlans);
  const [diaryEntries, setDiaryEntries] = useState(initialDiaryEntries);
  const [settings, setSettings] = useState(initialSettings);
  const [academicYearFilter, setAcademicYearFilter] = useState('2026-27');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diaryStatusFilter, setDiaryStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs(weekStartIso));
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs(weekStartIso).add(6, 'day'));
  const [weekStart, setWeekStart] = useState<Dayjs | null>(dayjs(weekStartIso));
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState(defaultLessonForm);
  const [diaryForm, setDiaryForm] = useState(defaultDiaryForm);
  const [reviewState, setReviewState] = useState<ReviewState>({
    targetType: 'plan',
    targetId: '',
    isApproved: true,
    reviewRemarks: '',
  });
  const [formError, setFormError] = useState('');
  const [diaryError, setDiaryError] = useState('');

  const getDiaryForLesson = useCallback(
    (lessonPlanId: string) => diaryEntries.find((entry) => entry.lessonPlanId === lessonPlanId),
    [diaryEntries]
  );

  const filteredPlans = useMemo(() => {
    const from = fromDate?.format('YYYY-MM-DD');
    const to = toDate?.format('YYYY-MM-DD');

    return lessonPlans.filter((plan) => {
      const matchesAcademicYear = plan.academicYear === academicYearFilter;
      const matchesTeacher = teacherFilter === 'all' || plan.teacherName === teacherFilter;
      const matchesClass = classFilter === 'all' || plan.className === classFilter;
      const matchesDivision = divisionFilter === 'all' || plan.divisionName === divisionFilter;
      const matchesSubject = subjectFilter === 'all' || plan.subjectName === subjectFilter;
      const matchesChapter = chapterFilter === 'all' || plan.chapterName === chapterFilter;
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesDiaryStatus =
        diaryStatusFilter === 'all' || plan.diaryStatus === diaryStatusFilter;
      const matchesFrom = !from || plan.plannedDate >= from;
      const matchesTo = !to || plan.plannedDate <= to;

      return (
        matchesAcademicYear &&
        matchesTeacher &&
        matchesClass &&
        matchesDivision &&
        matchesSubject &&
        matchesChapter &&
        matchesStatus &&
        matchesDiaryStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    academicYearFilter,
    chapterFilter,
    classFilter,
    diaryStatusFilter,
    divisionFilter,
    fromDate,
    lessonPlans,
    statusFilter,
    subjectFilter,
    teacherFilter,
    toDate,
  ]);

  const dashboardMetrics = useMemo(() => {
    const thisWeekPlans = lessonPlans.filter(
      (plan) =>
        plan.plannedDate >= dayjs(weekStartIso).format('YYYY-MM-DD') &&
        plan.plannedDate <= dayjs(weekStartIso).add(6, 'day').format('YYYY-MM-DD')
    );
    const submittedToday = diaryEntries.filter(
      (entry) => entry.actualDate === todayIso && ['Submitted', 'Approved'].includes(entry.status)
    ).length;

    return [
      {
        label: 'Lessons planned this week',
        value: thisWeekPlans.length,
        icon: 'mdi:calendar-week-outline',
        color: 'primary.main',
      },
      {
        label: 'Diaries submitted today',
        value: submittedToday,
        icon: 'mdi:notebook-check-outline',
        color: 'success.main',
      },
      {
        label: 'Pending diary submissions',
        value: lessonPlans.filter((plan) => plan.diaryStatus === 'Not Started').length,
        icon: 'mdi:book-clock-outline',
        color: 'warning.main',
      },
      {
        label: 'Pending approvals',
        value: lessonPlans.filter(
          (plan) => plan.status === 'Submitted' || plan.diaryStatus === 'Submitted'
        ).length,
        icon: 'mdi:account-clock-outline',
        color: 'info.main',
      },
      {
        label: 'Missed lessons this week',
        value: diaryEntries.filter((entry) => !entry.classConducted).length,
        icon: 'mdi:calendar-remove-outline',
        color: 'error.main',
      },
      {
        label: 'Syllabus delay count',
        value: lessonPlans.filter(
          (plan) => plan.plannedCompletionPercentage - plan.actualCompletionPercentage > 10
        ).length,
        icon: 'mdi:chart-timeline-variant-shimmer',
        color: 'secondary.main',
      },
    ];
  }, [diaryEntries, lessonPlans]);

  const openAddLesson = useCallback((date?: Dayjs) => {
    setFormError('');
    setLessonForm({
      ...defaultLessonForm,
      plannedDate: date || dayjs(todayIso),
    });
    setLessonDialogOpen(true);
  }, []);

  const openEditLesson = useCallback((plan: LessonPlanRow) => {
    if (plan.status === 'Approved') {
      shikshaMitraToast.warning({ message: 'Approved lesson plans are read-only.' });
      return;
    }

    setFormError('');
    setLessonForm({
      id: plan.id,
      academicYear: plan.academicYear,
      teacherName: plan.teacherName,
      className: plan.className,
      divisionName: plan.divisionName,
      subjectName: plan.subjectName,
      chapterName: plan.chapterName,
      plannedDate: dayjs(plan.plannedDate),
      period: plan.period,
      topic: plan.topic,
      learningObjective: plan.learningObjective,
      teachingMethod: plan.teachingMethod,
      resourcesRequired: plan.resourcesRequired,
      plannedCompletionPercentage: plan.plannedCompletionPercentage,
    });
    setLessonDialogOpen(true);
  }, []);

  const validateLessonForm = useCallback(() => {
    if (
      !lessonForm.className ||
      !lessonForm.divisionName ||
      !lessonForm.subjectName ||
      !lessonForm.chapterName ||
      !lessonForm.plannedDate ||
      !lessonForm.period ||
      !lessonForm.topic
    ) {
      return 'Class, division, subject, chapter, date, period and topic are required.';
    }

    if (
      lessonForm.plannedCompletionPercentage < 0 ||
      lessonForm.plannedCompletionPercentage > 100
    ) {
      return 'Planned completion must be between 0 and 100.';
    }

    if (lessonForm.teacherName === 'Farah Khan' && lessonForm.subjectName !== 'English') {
      return 'Teacher is not assigned to the selected subject/class in this dummy workflow.';
    }

    return '';
  }, [lessonForm]);

  const handleSaveLesson = useCallback(
    (submitAfterSave = false) => {
      const error = validateLessonForm();
      if (error) {
        setFormError(error);
        return;
      }

      const plannedDate = lessonForm.plannedDate?.format('YYYY-MM-DD') || todayIso;
      const nextPlan: LessonPlanRow = {
        id: lessonForm.id || `lp-${Date.now()}`,
        academicYear: lessonForm.academicYear,
        teacherName: lessonForm.teacherName,
        className: lessonForm.className,
        divisionName: lessonForm.divisionName,
        subjectName: lessonForm.subjectName,
        chapterName: lessonForm.chapterName,
        plannedDate,
        period: lessonForm.period,
        plannedTime: periodTimeMap[lessonForm.period] || 'Manual period',
        topic: lessonForm.topic,
        learningObjective: lessonForm.learningObjective,
        teachingMethod: lessonForm.teachingMethod,
        resourcesRequired: lessonForm.resourcesRequired,
        plannedCompletionPercentage: lessonForm.plannedCompletionPercentage,
        actualCompletionPercentage: 0,
        existingChapterProgress: 0,
        diaryStatus: 'Not Started',
        status: submitAfterSave ? 'Submitted' : 'Draft',
        reviewStatus: submitAfterSave ? 'Plan Pending Approval' : 'Draft',
      };

      setLessonPlans((current) => {
        const exists = current.some((plan) => plan.id === nextPlan.id);
        if (exists) {
          return current.map((plan) =>
            plan.id === nextPlan.id
              ? {
                  ...plan,
                  ...nextPlan,
                  actualCompletionPercentage: plan.actualCompletionPercentage,
                  existingChapterProgress: plan.existingChapterProgress,
                  diaryStatus: plan.diaryStatus,
                }
              : plan
          );
        }
        return [nextPlan, ...current];
      });
      setLessonDialogOpen(false);
      shikshaMitraToast.success({
        message: submitAfterSave
          ? 'Lesson plan submitted for review.'
          : 'Lesson plan saved as draft.',
      });
    },
    [lessonForm, validateLessonForm]
  );

  const submitPlan = useCallback((planId: string) => {
    setLessonPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              status: 'Submitted',
              reviewStatus: 'Plan Pending Approval',
            }
          : plan
      )
    );
    shikshaMitraToast.success({ message: 'Lesson plan submitted for review.' });
  }, []);

  const openDiary = useCallback(
    (plan: LessonPlanRow) => {
      const existingDiary = getDiaryForLesson(plan.id);
      if (existingDiary?.status === 'Approved') {
        shikshaMitraToast.warning({ message: 'Approved diary is read-only.' });
        return;
      }

      setDiaryError('');
      setDiaryForm(
        existingDiary
          ? {
              lessonPlanId: existingDiary.lessonPlanId,
              actualDate: dayjs(existingDiary.actualDate),
              classConducted: existingDiary.classConducted,
              actualTopicTaught: existingDiary.actualTopicTaught,
              actualContentSummary: existingDiary.actualContentSummary,
              completionPercentage: existingDiary.completionPercentage,
              studentResponse: existingDiary.studentResponse,
              homeworkAssigned: existingDiary.homeworkAssigned,
              resourcesUsed: existingDiary.resourcesUsed,
              missedReason: existingDiary.missedReason || 'Other',
              rescheduledToDate: existingDiary.rescheduledToDate
                ? dayjs(existingDiary.rescheduledToDate)
                : null,
              teacherRemarks: existingDiary.teacherRemarks,
            }
          : createDraftDiary(plan)
      );
      setDiaryDialogOpen(true);
    },
    [getDiaryForLesson]
  );

  const validateDiary = useCallback(() => {
    const lesson = lessonPlans.find((plan) => plan.id === diaryForm.lessonPlanId);
    if (!lesson) return 'Select a planned lesson first.';
    if (!diaryForm.actualDate) return 'Actual date is required.';

    if (diaryForm.classConducted) {
      if (!diaryForm.actualTopicTaught || !diaryForm.actualContentSummary) {
        return 'Actual topic and content summary are required for conducted classes.';
      }
      if (
        !settings.allowProgressDecrease &&
        diaryForm.completionPercentage < lesson.existingChapterProgress
      ) {
        return `Chapter progress is already ${lesson.existingChapterProgress}%. Enter ${lesson.existingChapterProgress}% or above, or request admin override.`;
      }
    } else if (!diaryForm.missedReason) {
      return 'Missed reason is required when class was not conducted.';
    }

    if (diaryForm.completionPercentage < 0 || diaryForm.completionPercentage > 100) {
      return 'Completion percentage must be between 0 and 100.';
    }

    return '';
  }, [diaryForm, lessonPlans, settings.allowProgressDecrease]);

  const handleSaveDiary = useCallback(
    (submitAfterSave = false) => {
      const error = validateDiary();
      if (error) {
        setDiaryError(error);
        return;
      }

      const lesson = lessonPlans.find((plan) => plan.id === diaryForm.lessonPlanId);
      const status: TeacherDiaryRow['status'] = submitAfterSave ? 'Submitted' : 'Draft';
      const nextDiary: TeacherDiaryRow = {
        id: getDiaryForLesson(diaryForm.lessonPlanId)?.id || `diary-${Date.now()}`,
        lessonPlanId: diaryForm.lessonPlanId,
        actualDate: diaryForm.actualDate?.format('YYYY-MM-DD') || todayIso,
        classConducted: diaryForm.classConducted,
        actualTopicTaught: diaryForm.classConducted ? diaryForm.actualTopicTaught : '',
        actualContentSummary: diaryForm.classConducted ? diaryForm.actualContentSummary : '',
        completionPercentage: diaryForm.classConducted ? diaryForm.completionPercentage : 0,
        studentResponse: diaryForm.classConducted ? diaryForm.studentResponse : '',
        homeworkAssigned: diaryForm.classConducted ? diaryForm.homeworkAssigned : '',
        resourcesUsed: diaryForm.classConducted ? diaryForm.resourcesUsed : '',
        missedReason: diaryForm.classConducted ? undefined : (diaryForm.missedReason as any),
        rescheduledToDate: diaryForm.rescheduledToDate?.format('YYYY-MM-DD'),
        teacherRemarks: diaryForm.teacherRemarks,
        status,
        submittedAt: submitAfterSave ? dayjs().toISOString() : undefined,
      };

      setDiaryEntries((current) => {
        const exists = current.some((entry) => entry.id === nextDiary.id);
        return exists
          ? current.map((entry) => (entry.id === nextDiary.id ? nextDiary : entry))
          : [nextDiary, ...current];
      });

      setLessonPlans((current) =>
        current.map((plan) =>
          plan.id === diaryForm.lessonPlanId
            ? {
                ...plan,
                diaryStatus: status,
                actualCompletionPercentage: nextDiary.completionPercentage,
                reviewStatus: submitAfterSave ? 'Diary Pending Approval' : plan.reviewStatus,
                ...(lesson && !diaryForm.classConducted && diaryForm.rescheduledToDate
                  ? { originalLessonPlanId: lesson.id }
                  : {}),
              }
            : plan
        )
      );
      setDiaryDialogOpen(false);
      shikshaMitraToast.success({
        message: submitAfterSave
          ? 'Teacher diary submitted for review.'
          : 'Teacher diary saved as draft.',
      });
    },
    [diaryForm, getDiaryForLesson, lessonPlans, validateDiary]
  );

  const openReview = useCallback((targetType: 'plan' | 'diary', targetId: string) => {
    setReviewState({ targetType, targetId, isApproved: true, reviewRemarks: '' });
    setReviewDialogOpen(true);
  }, []);

  const handleReview = useCallback(() => {
    if (reviewState.targetType === 'plan') {
      setLessonPlans((current) =>
        current.map((plan) =>
          plan.id === reviewState.targetId
            ? {
                ...plan,
                status: reviewState.isApproved ? 'Approved' : 'Rejected',
                reviewStatus: reviewState.isApproved
                  ? 'Plan Approved'
                  : 'Plan Correction Requested',
                reviewRemarks: reviewState.reviewRemarks,
                reviewedBy: 'HOD / Principal',
                reviewedAt: dayjs().toISOString(),
              }
            : plan
        )
      );
    } else {
      const reviewedDiary = diaryEntries.find((entry) => entry.id === reviewState.targetId);
      setDiaryEntries((current) =>
        current.map((entry) =>
          entry.id === reviewState.targetId
            ? {
                ...entry,
                status: reviewState.isApproved ? 'Approved' : 'Rejected',
                reviewRemarks: reviewState.reviewRemarks,
                reviewedBy: 'HOD / Principal',
                reviewedAt: dayjs().toISOString(),
              }
            : entry
        )
      );

      if (reviewedDiary) {
        setLessonPlans((current) =>
          current.map((plan) =>
            plan.id === reviewedDiary.lessonPlanId
              ? {
                  ...plan,
                  diaryStatus: reviewState.isApproved ? 'Approved' : 'Rejected',
                  actualCompletionPercentage: reviewedDiary.completionPercentage,
                  existingChapterProgress:
                    reviewState.isApproved && reviewedDiary.classConducted
                      ? reviewedDiary.completionPercentage
                      : plan.existingChapterProgress,
                  reviewStatus: reviewState.isApproved
                    ? 'Progress Synced'
                    : 'Diary Correction Requested',
                  reviewRemarks: reviewState.reviewRemarks,
                }
              : plan
          )
        );
      }
    }

    setReviewDialogOpen(false);
    shikshaMitraToast.success({
      message: reviewState.isApproved
        ? 'Review approved. Progress sync audit is recorded.'
        : 'Review rejected and returned for correction.',
    });
  }, [diaryEntries, reviewState]);

  const renderStatus = (status: LessonPlanStatus | TeacherDiaryStatus) => (
    <Chip label={status} size="small" color={statusColor[status]} variant="soft" />
  );

  const lessonColumns = [
    { id: 'plannedDate', label: 'Date', filterType: 'date' as const, minWidth: 120, sticky: true },
    { id: 'period', label: 'Period', minWidth: 110 },
    { id: 'plannedTime', label: 'Time', minWidth: 120 },
    {
      id: 'className',
      label: 'Class / Div',
      minWidth: 120,
      render: (_value: string, row: any) => `${row.className}-${row.divisionName}`,
    },
    { id: 'subjectName', label: 'Subject', minWidth: 130 },
    { id: 'chapterName', label: 'Chapter', minWidth: 150 },
    { id: 'topic', label: 'Topic', minWidth: 220 },
    { id: 'teacherName', label: 'Teacher', minWidth: 160 },
    {
      id: 'plannedCompletionPercentage',
      label: 'Planned %',
      filterType: 'number' as const,
      minWidth: 110,
      render: (value: number) => `${value}%`,
    },
    {
      id: 'actualCompletionPercentage',
      label: 'Actual %',
      filterType: 'number' as const,
      minWidth: 100,
      render: (value: number) => `${value}%`,
    },
    {
      id: 'status',
      label: 'Plan Status',
      minWidth: 130,
      render: (value: LessonPlanStatus) => renderStatus(value),
    },
    {
      id: 'diaryStatus',
      label: 'Diary Status',
      minWidth: 130,
      render: (value: TeacherDiaryStatus) => renderStatus(value),
    },
    { id: 'reviewStatus', label: 'Review Status', minWidth: 180 },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 210,
      align: 'center' as const,
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, row: any) => {
        const plan = row as LessonPlanRow;
        const diary = getDiaryForLesson(plan.id);
        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton size="small" title="Edit lesson plan" onClick={() => openEditLesson(plan)}>
              <Iconify icon={GlobalIcons.edit} />
            </IconButton>
            <IconButton
              size="small"
              title="Submit lesson plan"
              disabled={!['Draft', 'Rejected'].includes(plan.status)}
              onClick={() => submitPlan(plan.id)}
            >
              <Iconify icon={GlobalIcons.submit} />
            </IconButton>
            <IconButton
              size="small"
              title={diary ? 'View / edit diary' : 'Add diary'}
              disabled={plan.status === 'Cancelled'}
              onClick={() => openDiary(plan)}
            >
              <Iconify icon="mdi:notebook-edit-outline" />
            </IconButton>
            <IconButton
              size="small"
              title="Review"
              disabled={plan.status !== 'Submitted' && plan.diaryStatus !== 'Submitted'}
              onClick={() =>
                plan.diaryStatus === 'Submitted' && diary
                  ? openReview('diary', diary.id)
                  : openReview('plan', plan.id)
              }
            >
              <Iconify icon="mdi:clipboard-check-outline" />
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

  const reviewRows = useMemo(() => {
    const planRows = lessonPlans
      .filter((plan) => plan.status === 'Submitted')
      .map((plan) => ({
        id: plan.id,
        targetType: 'plan',
        teacherName: plan.teacherName,
        submittedDate: plan.plannedDate,
        classDivision: `${plan.className}-${plan.divisionName}`,
        subjectName: plan.subjectName,
        chapterName: plan.chapterName,
        topic: plan.topic,
        plannedCompletionPercentage: plan.plannedCompletionPercentage,
        actualCompletionPercentage: '-',
        remarks: plan.learningObjective,
        submittedAt: plan.plannedDate,
      }));

    const diaryRows = diaryEntries
      .filter((entry) => entry.status === 'Submitted')
      .map((entry) => {
        const plan = lessonPlans.find((item) => item.id === entry.lessonPlanId);
        return {
          id: entry.id,
          targetType: 'diary',
          teacherName: plan?.teacherName || '-',
          submittedDate: entry.actualDate,
          classDivision: plan ? `${plan.className}-${plan.divisionName}` : '-',
          subjectName: plan?.subjectName || '-',
          chapterName: plan?.chapterName || '-',
          topic: entry.actualTopicTaught || plan?.topic || '-',
          plannedCompletionPercentage: plan?.plannedCompletionPercentage || 0,
          actualCompletionPercentage: entry.completionPercentage,
          remarks: entry.teacherRemarks,
          submittedAt: entry.submittedAt || entry.actualDate,
        };
      });

    return [...planRows, ...diaryRows];
  }, [diaryEntries, lessonPlans]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Lesson Plan / Teacher Diary"
        description="Plan weekly lessons, record daily teaching evidence, review diary submissions, and sync approved progress with chapters."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Lesson Plan / Teacher Diary' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Print />}
              onClick={() =>
                shikshaMitraToast.info({ message: 'Lesson plan list export prepared.' })
              }
            >
              Export
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => openAddLesson()}
            >
              Add Lesson Plan
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
        {dashboardMetrics.map((item) => (
          <Card key={item.label} sx={{ flex: '1 1 220px', borderRadius: 2 }}>
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
          <CustomSelect
            label="Academic Year"
            options={academicYearOptions}
            value={academicYearFilter}
            onChange={(value) => setAcademicYearFilter(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Teacher"
            options={lessonPlanViewOptions}
            value={teacherFilter}
            onChange={(value) => setTeacherFilter(value as string)}
            formControlProps={{ sx: { minWidth: 170 } }}
          />
          <CustomSelect
            label="Class"
            options={allClassOptions}
            value={classFilter}
            onChange={(value) => setClassFilter(value as string)}
            formControlProps={{ sx: { minWidth: 130 } }}
          />
          <CustomSelect
            label="Division"
            options={allDivisionOptions}
            value={divisionFilter}
            onChange={(value) => setDivisionFilter(value as string)}
            formControlProps={{ sx: { minWidth: 130 } }}
          />
          <CustomSelect
            label="Subject"
            options={allSubjectOptions}
            value={subjectFilter}
            onChange={(value) => setSubjectFilter(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Chapter"
            options={allChapterOptions}
            value={chapterFilter}
            onChange={(value) => setChapterFilter(value as string)}
            formControlProps={{ sx: { minWidth: 170 } }}
          />
          <CustomSelect
            label="Plan Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Diary Status"
            options={diaryStatusOptions}
            value={diaryStatusFilter}
            onChange={(value) => setDiaryStatusFilter(value as string)}
            formControlProps={{ sx: { minWidth: 170 } }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
            slotProps={{ textField: { size: 'small', sx: { maxWidth: 180 } } }}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={setToDate}
            slotProps={{ textField: { size: 'small', sx: { maxWidth: 180 } } }}
          />
        </Stack>
      </Card>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab
            value="lessonList"
            label="Lesson Plans"
            icon={<AutoStories />}
            iconPosition="start"
          />
          <Tab value="weeklyPlanner" label="Weekly Planner" icon={<Today />} iconPosition="start" />
          <Tab
            value="todayDiary"
            label="Teacher Diary"
            icon={<Iconify icon="mdi:notebook-edit-outline" />}
            iconPosition="start"
          />
          <Tab value="reviewQueue" label="Review Queue" icon={<FactCheck />} iconPosition="start" />
          <Tab
            value="dashboard"
            label="Dashboard"
            icon={<Iconify icon="mdi:view-dashboard-outline" />}
            iconPosition="start"
          />
          <Tab
            value="reports"
            label="Reports"
            icon={<Iconify icon={GlobalIcons.report} />}
            iconPosition="start"
          />
          <Tab value="settings" label="Settings" icon={<Rule />} iconPosition="start" />
          <Tab
            value="notifications"
            label="Notifications"
            icon={<Iconify icon={GlobalIcons.bell} />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {activeTab === 'lessonList' && (
        <CustomizableTable
          tableId="lesson-plan-list-table"
          tableTitle="Lesson Plan List"
          data={filteredPlans}
          columns={lessonColumns}
        />
      )}

      {activeTab === 'weeklyPlanner' && (
        <Card sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <DatePicker
              label="Week"
              value={weekStart}
              onChange={setWeekStart}
              slotProps={{ textField: { size: 'small', sx: { maxWidth: 180 } } }}
            />
            <Button
              size="small"
              variant="contained"
              startIcon={<Save />}
              onClick={() => {
                setLessonPlans((current) =>
                  current.map((plan) =>
                    filteredPlans.some((filtered) => filtered.id === plan.id) &&
                    plan.status === 'Draft'
                      ? { ...plan, status: 'Submitted', reviewStatus: 'Week Plan Pending Approval' }
                      : plan
                  )
                );
                shikshaMitraToast.success({ message: 'Draft week plan submitted for review.' });
              }}
            >
              Submit Week Plan
            </Button>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {weekDays.map((day, index) => {
              const date = (weekStart || dayjs(weekStartIso)).add(index, 'day');
              const plansForDay = lessonPlans.filter(
                (plan) => plan.plannedDate === date.format('YYYY-MM-DD')
              );
              return (
                <Card key={day} variant="outlined" sx={{ borderRadius: 1 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{day}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {date.format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        title="Add lesson"
                        onClick={() => openAddLesson(date)}
                      >
                        <Iconify icon={GlobalIcons.addIcon} />
                      </IconButton>
                    </Stack>
                    <Stack spacing={1}>
                      {plansForDay.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No lesson planned.
                        </Typography>
                      ) : (
                        plansForDay.map((plan) => (
                          <Box
                            key={plan.id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              border: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography variant="subtitle2">{plan.period}</Typography>
                              {renderStatus(plan.status)}
                            </Stack>
                            <Typography variant="body2">
                              {plan.subjectName} - {plan.chapterName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {plan.topic}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Card>
      )}

      {activeTab === 'todayDiary' && (
        <CustomizableTable
          tableId="today-teacher-diary-table"
          tableTitle="Daily Teacher Diary"
          data={lessonPlans.filter((plan) => plan.plannedDate <= todayIso)}
          columns={lessonColumns}
          noDataText="No planned lessons are available for diary entry."
        />
      )}

      {activeTab === 'reviewQueue' && (
        <CustomizableTable
          tableId="lesson-plan-review-queue-table"
          tableTitle="Review Queue"
          data={reviewRows}
          columns={[
            { id: 'teacherName', label: 'Teacher', minWidth: 160, sticky: true },
            { id: 'submittedDate', label: 'Date', filterType: 'date', minWidth: 120 },
            { id: 'classDivision', label: 'Class', minWidth: 110 },
            { id: 'subjectName', label: 'Subject', minWidth: 130 },
            { id: 'chapterName', label: 'Chapter', minWidth: 160 },
            { id: 'topic', label: 'Topic', minWidth: 220 },
            {
              id: 'plannedCompletionPercentage',
              label: 'Planned %',
              filterType: 'number',
              minWidth: 110,
            },
            { id: 'actualCompletionPercentage', label: 'Actual %', minWidth: 110 },
            { id: 'remarks', label: 'Remarks', minWidth: 240 },
            {
              id: 'submittedAt',
              label: 'Submitted At',
              filterType: 'dateTime',
              minWidth: 170,
              render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'),
            },
            {
              id: 'actions',
              label: 'Approve / Reject',
              minWidth: 130,
              align: 'center',
              isFilter: false,
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              render: (_value, row) => (
                <IconButton
                  size="small"
                  title="Review"
                  onClick={() => openReview(row.targetType, row.id)}
                >
                  <Iconify icon="mdi:clipboard-check-outline" />
                </IconButton>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'dashboard' && (
        <Stack spacing={2}>
          <CustomizableTable
            tableId="teacher-diary-compliance-table"
            tableTitle="Teacher-wise Diary Compliance"
            data={teacherOptions.map((teacher) => {
              const teacherPlans = lessonPlans.filter((plan) => plan.teacherName === teacher.value);
              const completed = teacherPlans.filter(
                (plan) => plan.diaryStatus === 'Approved'
              ).length;
              return {
                teacher: teacher.label,
                plannedLessons: teacherPlans.length,
                completedDiary: completed,
                pendingDiary: teacherPlans.filter((plan) => plan.diaryStatus === 'Not Started')
                  .length,
                pendingApproval: teacherPlans.filter((plan) => plan.diaryStatus === 'Submitted')
                  .length,
                compliance: teacherPlans.length
                  ? `${Math.round((completed / teacherPlans.length) * 100)}%`
                  : '0%',
              };
            })}
            columns={[
              { id: 'teacher', label: 'Teacher', minWidth: 170 },
              {
                id: 'plannedLessons',
                label: 'Planned Lessons',
                filterType: 'number',
                minWidth: 150,
              },
              {
                id: 'completedDiary',
                label: 'Completed Diary',
                filterType: 'number',
                minWidth: 150,
              },
              { id: 'pendingDiary', label: 'Pending Diary', filterType: 'number', minWidth: 140 },
              {
                id: 'pendingApproval',
                label: 'Pending Approval',
                filterType: 'number',
                minWidth: 150,
              },
              { id: 'compliance', label: 'Compliance %', minWidth: 130 },
            ]}
          />
          <CustomizableTable
            tableId="subject-planned-vs-actual-dashboard-table"
            tableTitle="Subject-wise Planned vs Actual"
            data={subjectOptions.map((subject) => {
              const subjectPlans = lessonPlans.filter((plan) => plan.subjectName === subject.value);
              const planned = subjectPlans.reduce(
                (sum, plan) => sum + plan.plannedCompletionPercentage,
                0
              );
              const actual = subjectPlans.reduce(
                (sum, plan) => sum + plan.actualCompletionPercentage,
                0
              );
              return {
                subject: subject.label,
                plannedAverage: subjectPlans.length ? Math.round(planned / subjectPlans.length) : 0,
                actualAverage: subjectPlans.length ? Math.round(actual / subjectPlans.length) : 0,
                delay: subjectPlans.length
                  ? Math.max(0, Math.round((planned - actual) / subjectPlans.length))
                  : 0,
              };
            })}
            columns={[
              { id: 'subject', label: 'Subject', minWidth: 170 },
              { id: 'plannedAverage', label: 'Planned %', filterType: 'number', minWidth: 130 },
              { id: 'actualAverage', label: 'Actual %', filterType: 'number', minWidth: 130 },
              { id: 'delay', label: 'Delay %', filterType: 'number', minWidth: 120 },
            ]}
          />
        </Stack>
      )}

      {activeTab === 'reports' && (
        <Stack spacing={2}>
          <CustomizableTable
            tableId="lesson-plan-completion-report-table"
            tableTitle="Lesson Plan Completion Report"
            data={teacherOptions.map((teacher) => {
              const teacherPlans = lessonPlans.filter((plan) => plan.teacherName === teacher.value);
              const completed = teacherPlans.filter(
                (plan) => plan.diaryStatus === 'Approved'
              ).length;
              return {
                teacher: teacher.label,
                classDivision:
                  teacherPlans.map((plan) => `${plan.className}-${plan.divisionName}`).join(', ') ||
                  '-',
                subject: teacherPlans.map((plan) => plan.subjectName).join(', ') || '-',
                plannedLessons: teacherPlans.length,
                completedDiary: completed,
                missedLessons: diaryEntries.filter((entry) => {
                  const plan = lessonPlans.find((item) => item.id === entry.lessonPlanId);
                  return plan?.teacherName === teacher.value && !entry.classConducted;
                }).length,
                pendingDiary: teacherPlans.filter((plan) => plan.diaryStatus === 'Not Started')
                  .length,
                completion: teacherPlans.length
                  ? `${Math.round((completed / teacherPlans.length) * 100)}%`
                  : '0%',
              };
            })}
            columns={[
              { id: 'teacher', label: 'Teacher', minWidth: 170 },
              { id: 'classDivision', label: 'Class / Division', minWidth: 180 },
              { id: 'subject', label: 'Subject', minWidth: 180 },
              {
                id: 'plannedLessons',
                label: 'Planned Lessons',
                filterType: 'number',
                minWidth: 150,
              },
              {
                id: 'completedDiary',
                label: 'Completed Diary',
                filterType: 'number',
                minWidth: 150,
              },
              { id: 'missedLessons', label: 'Missed Lessons', filterType: 'number', minWidth: 140 },
              { id: 'pendingDiary', label: 'Pending Diary', filterType: 'number', minWidth: 140 },
              { id: 'completion', label: 'Completion %', minWidth: 130 },
            ]}
          />
          <CustomizableTable
            tableId="planned-vs-actual-report-table"
            tableTitle="Planned vs Actual Report"
            data={lessonPlans.map((plan) => {
              const diary = getDiaryForLesson(plan.id);
              return {
                plannedDate: plan.plannedDate,
                actualDate: diary?.actualDate || '-',
                teacher: plan.teacherName,
                className: `${plan.className}-${plan.divisionName}`,
                subject: plan.subjectName,
                chapter: plan.chapterName,
                plannedTopic: plan.topic,
                actualTopic: diary?.actualTopicTaught || '-',
                plannedPercentage: plan.plannedCompletionPercentage,
                actualPercentage: plan.actualCompletionPercentage,
                difference: plan.actualCompletionPercentage - plan.plannedCompletionPercentage,
                status: plan.diaryStatus,
              };
            })}
            columns={[
              { id: 'plannedDate', label: 'Planned Date', filterType: 'date', minWidth: 130 },
              { id: 'actualDate', label: 'Actual Date', minWidth: 130 },
              { id: 'teacher', label: 'Teacher', minWidth: 160 },
              { id: 'className', label: 'Class', minWidth: 110 },
              { id: 'subject', label: 'Subject', minWidth: 130 },
              { id: 'chapter', label: 'Chapter', minWidth: 160 },
              { id: 'plannedTopic', label: 'Planned Topic', minWidth: 220 },
              { id: 'actualTopic', label: 'Actual Topic', minWidth: 220 },
              { id: 'plannedPercentage', label: 'Planned %', filterType: 'number', minWidth: 120 },
              { id: 'actualPercentage', label: 'Actual %', filterType: 'number', minWidth: 110 },
              { id: 'difference', label: 'Difference', filterType: 'number', minWidth: 110 },
              {
                id: 'status',
                label: 'Status',
                minWidth: 130,
                render: (value) => renderStatus(value),
              },
            ]}
          />
          <CustomizableTable
            tableId="pending-diary-report-table"
            tableTitle="Pending Diary Report"
            data={lessonPlans
              .filter((plan) => plan.diaryStatus === 'Not Started')
              .map((plan) => ({
                teacher: plan.teacherName,
                date: plan.plannedDate,
                className: `${plan.className}-${plan.divisionName}`,
                subject: plan.subjectName,
                plannedTopic: plan.topic,
                daysPending: Math.max(0, dayjs(todayIso).diff(dayjs(plan.plannedDate), 'day')),
              }))}
            columns={[
              { id: 'teacher', label: 'Teacher', minWidth: 170 },
              { id: 'date', label: 'Date', filterType: 'date', minWidth: 120 },
              { id: 'className', label: 'Class', minWidth: 110 },
              { id: 'subject', label: 'Subject', minWidth: 130 },
              { id: 'plannedTopic', label: 'Planned Topic', minWidth: 240 },
              { id: 'daysPending', label: 'Days Pending', filterType: 'number', minWidth: 140 },
            ]}
          />
          <CustomizableTable
            tableId="syllabus-delay-report-table"
            tableTitle="Syllabus Delay Report"
            data={lessonPlans
              .filter((plan) => plan.plannedCompletionPercentage > plan.actualCompletionPercentage)
              .map((plan) => ({
                className: plan.className,
                divisionName: plan.divisionName,
                subject: plan.subjectName,
                chapter: plan.chapterName,
                plannedCompletionDate: plan.plannedDate,
                actualCompletionDate:
                  plan.diaryStatus === 'Approved'
                    ? getDiaryForLesson(plan.id)?.actualDate || '-'
                    : '-',
                currentProgress: plan.actualCompletionPercentage,
                delayDays: Math.max(0, dayjs(todayIso).diff(dayjs(plan.plannedDate), 'day')),
                teacher: plan.teacherName,
                reason: plan.reviewStatus,
              }))}
            columns={[
              { id: 'className', label: 'Class', minWidth: 90 },
              { id: 'divisionName', label: 'Division', minWidth: 100 },
              { id: 'subject', label: 'Subject', minWidth: 130 },
              { id: 'chapter', label: 'Chapter', minWidth: 160 },
              {
                id: 'plannedCompletionDate',
                label: 'Planned Date',
                filterType: 'date',
                minWidth: 130,
              },
              { id: 'actualCompletionDate', label: 'Actual Date', minWidth: 130 },
              {
                id: 'currentProgress',
                label: 'Current Progress',
                filterType: 'number',
                minWidth: 150,
              },
              { id: 'delayDays', label: 'Delay Days', filterType: 'number', minWidth: 120 },
              { id: 'teacher', label: 'Teacher', minWidth: 160 },
              { id: 'reason', label: 'Reason', minWidth: 200 },
            ]}
          />
        </Stack>
      )}

      {activeTab === 'settings' && (
        <Card sx={{ p: 2 }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <CustomSelect
              label="Academic Year"
              options={academicYearOptions}
              value={settings.academicYear}
              onChange={(value) =>
                setSettings((current) => ({ ...current, academicYear: value as string }))
              }
              formControlProps={{ sx: { maxWidth: 240 } }}
            />
            <CustomSelect
              label="Approval Mode"
              options={reviewModeOptions}
              value={settings.approvalMode}
              onChange={(value) =>
                setSettings((current) => ({ ...current, approvalMode: value as any }))
              }
              formControlProps={{ sx: { maxWidth: 320 } }}
            />
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowBackDateEntry}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        allowBackDateEntry: event.target.checked,
                      }))
                    }
                  />
                }
                label="Allow backdated diary entry"
              />
              <Box sx={{ maxWidth: 360 }}>
                <Typography variant="body2" color="text.secondary">
                  Max backdate days: {settings.maxBackDateDays}
                </Typography>
                <Slider
                  min={0}
                  max={15}
                  value={settings.maxBackDateDays}
                  onChange={(_, value) =>
                    setSettings((current) => ({ ...current, maxBackDateDays: value as number }))
                  }
                  valueLabelDisplay="auto"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowProgressDecrease}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        allowProgressDecrease: event.target.checked,
                      }))
                    }
                  />
                }
                label="Allow progress decrease with admin override"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoUpdateChapterProgress}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        autoUpdateChapterProgress: event.target.checked,
                      }))
                    }
                  />
                }
                label="Auto update chapter progress after approved diary"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireDiaryForEveryPlannedLesson}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        requireDiaryForEveryPlannedLesson: event.target.checked,
                      }))
                    }
                  />
                }
                label="Require diary for every planned lesson"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.isActive}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, isActive: event.target.checked }))
                    }
                  />
                }
                label="Settings active"
              />
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => shikshaMitraToast.success({ message: 'Lesson plan settings saved.' })}
            >
              Save Settings
            </Button>
          </Stack>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <CustomizableTable
          tableId="lesson-plan-notification-events-table"
          tableTitle="Lesson Plan Notification Events"
          data={notificationEvents}
          columns={[
            { id: 'event', label: 'Event', minWidth: 220, sticky: true },
            { id: 'audience', label: 'Audience', minWidth: 180 },
            { id: 'sampleMessage', label: 'Sample Message', minWidth: 360 },
            {
              id: 'enabled',
              label: 'Enabled',
              minWidth: 100,
              render: (value) => (
                <Chip
                  label={value ? 'Enabled' : 'Disabled'}
                  color={value ? 'success' : 'default'}
                  size="small"
                  variant="soft"
                />
              ),
            },
          ]}
        />
      )}

      <CustomDialog
        open={lessonDialogOpen}
        title={lessonForm.id ? 'Edit Lesson Plan' : 'Add Lesson Plan'}
        maxWidth="md"
        handleClose={() => setLessonDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {formError && (
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                <Typography variant="body2">{formError}</Typography>
              </Box>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Academic Year"
                options={academicYearOptions}
                value={lessonForm.academicYear}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, academicYear: value as string }))
                }
              />
              <CustomSelect
                label="Teacher"
                options={teacherOptions}
                value={lessonForm.teacherName}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, teacherName: value as string }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Class"
                options={classOptions}
                value={lessonForm.className}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, className: value as string }))
                }
              />
              <CustomSelect
                label="Division"
                options={divisionOptions}
                value={lessonForm.divisionName}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, divisionName: value as string }))
                }
              />
              <CustomSelect
                label="Subject"
                options={subjectOptions}
                value={lessonForm.subjectName}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, subjectName: value as string }))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Chapter"
                options={chapterOptions}
                value={lessonForm.chapterName}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, chapterName: value as string }))
                }
              />
              <DatePicker
                label="Planned Date"
                value={lessonForm.plannedDate}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, plannedDate: value }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <CustomSelect
                label="Period / Time"
                options={periodOptions}
                value={lessonForm.period}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, period: value as string }))
                }
              />
            </Stack>
            <TextField
              size="small"
              label="Topic"
              value={lessonForm.topic}
              onChange={(event) =>
                setLessonForm((current) => ({ ...current, topic: event.target.value }))
              }
              fullWidth
            />
            <TextField
              size="small"
              label="Learning Objective"
              value={lessonForm.learningObjective}
              onChange={(event) =>
                setLessonForm((current) => ({ ...current, learningObjective: event.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Teaching Method"
                options={teachingMethodOptions}
                value={lessonForm.teachingMethod}
                onChange={(value) =>
                  setLessonForm((current) => ({ ...current, teachingMethod: value as string }))
                }
              />
              <TextField
                size="small"
                label="Planned Completion %"
                type="number"
                value={lessonForm.plannedCompletionPercentage}
                onChange={(event) =>
                  setLessonForm((current) => ({
                    ...current,
                    plannedCompletionPercentage: Number(event.target.value),
                  }))
                }
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />
            </Stack>
            <TextField
              size="small"
              label="Resources Required"
              value={lessonForm.resourcesRequired}
              onChange={(event) =>
                setLessonForm((current) => ({ ...current, resourcesRequired: event.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setLessonDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => handleSaveLesson(false)}>
            Save Draft
          </Button>
          <Button variant="contained" onClick={() => handleSaveLesson(true)}>
            Submit Plan
          </Button>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={diaryDialogOpen}
        title="Daily Teacher Diary"
        maxWidth="md"
        handleClose={() => setDiaryDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {diaryError && (
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                <Typography variant="body2">{diaryError}</Typography>
              </Box>
            )}
            <DatePicker
              label="Actual Date"
              value={diaryForm.actualDate}
              onChange={(value) => setDiaryForm((current) => ({ ...current, actualDate: value }))}
              slotProps={{ textField: { size: 'small', sx: { maxWidth: 220 } } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={diaryForm.classConducted}
                  onChange={(event) =>
                    setDiaryForm((current) => ({
                      ...current,
                      classConducted: event.target.checked,
                    }))
                  }
                />
              }
              label="Class conducted"
            />
            {diaryForm.classConducted ? (
              <>
                <TextField
                  size="small"
                  label="Actual Topic Taught"
                  value={diaryForm.actualTopicTaught}
                  onChange={(event) =>
                    setDiaryForm((current) => ({
                      ...current,
                      actualTopicTaught: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Actual Content Summary"
                  value={diaryForm.actualContentSummary}
                  onChange={(event) =>
                    setDiaryForm((current) => ({
                      ...current,
                      actualContentSummary: event.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
                <TextField
                  size="small"
                  label="Completion %"
                  type="number"
                  value={diaryForm.completionPercentage}
                  onChange={(event) =>
                    setDiaryForm((current) => ({
                      ...current,
                      completionPercentage: Number(event.target.value),
                    }))
                  }
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                  size="small"
                  label="Student Response"
                  value={diaryForm.studentResponse}
                  onChange={(event) =>
                    setDiaryForm((current) => ({ ...current, studentResponse: event.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    size="small"
                    label="Homework Assigned"
                    value={diaryForm.homeworkAssigned}
                    onChange={(event) =>
                      setDiaryForm((current) => ({
                        ...current,
                        homeworkAssigned: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Resources Used"
                    value={diaryForm.resourcesUsed}
                    onChange={(event) =>
                      setDiaryForm((current) => ({ ...current, resourcesUsed: event.target.value }))
                    }
                    fullWidth
                  />
                </Stack>
              </>
            ) : (
              <Stack spacing={2}>
                <CustomSelect
                  label="Missed Reason"
                  options={missedReasonOptions}
                  value={diaryForm.missedReason}
                  onChange={(value) =>
                    setDiaryForm((current) => ({ ...current, missedReason: value as string }))
                  }
                  formControlProps={{ sx: { maxWidth: 320 } }}
                />
                <DatePicker
                  label="Rescheduled To"
                  value={diaryForm.rescheduledToDate}
                  onChange={(value) =>
                    setDiaryForm((current) => ({ ...current, rescheduledToDate: value }))
                  }
                  slotProps={{ textField: { size: 'small', sx: { maxWidth: 220 } } }}
                />
              </Stack>
            )}
            <TextField
              size="small"
              label="Teacher Remarks"
              value={diaryForm.teacherRemarks}
              onChange={(event) =>
                setDiaryForm((current) => ({ ...current, teacherRemarks: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setDiaryDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => handleSaveDiary(false)}>
            Save Draft
          </Button>
          <Button variant="contained" onClick={() => handleSaveDiary(true)}>
            Submit Diary
          </Button>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={reviewDialogOpen}
        title={reviewState.targetType === 'plan' ? 'Review Lesson Plan' : 'Review Teacher Diary'}
        maxWidth="sm"
        handleClose={() => setReviewDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={reviewState.isApproved}
                  onChange={(event) =>
                    setReviewState((current) => ({ ...current, isApproved: event.target.checked }))
                  }
                />
              }
              label={reviewState.isApproved ? 'Approve' : 'Reject / Request Correction'}
            />
            <TextField
              size="small"
              label="Review Remarks"
              value={reviewState.reviewRemarks}
              onChange={(event) =>
                setReviewState((current) => ({ ...current, reviewRemarks: event.target.value }))
              }
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setReviewDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewState.isApproved ? 'primary' : 'warning'}
            onClick={handleReview}
          >
            Submit Review
          </Button>
        </Stack>
      </CustomDialog>
    </Box>
  );
};

export default LessonPlanScreen;
