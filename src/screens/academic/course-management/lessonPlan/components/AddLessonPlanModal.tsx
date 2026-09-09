'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Chip,
  Stack,
  Alert,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { LessonPlanTextInput } from './LessonPlanTextInput';
import { ChapterCompletionSlider } from './ChapterCompletionSlider';
import { getLessonPlanTextApiErrors } from '../lessonPlanApiErrors';
import { LessonPlanSection as SectionPaper } from './LessonPlanSection';
import { useLessonPlanCompletion } from '../hooks/use-lesson-plan-completion';
import { todayIso, lessonPlanTemplates, teachingMethodOptions } from '../lessonPlanData';
import { lessonPlanTextFields, validateLessonPlanText } from '../lessonPlanTextValidation';

import type { LessonSource, LessonPlanRow } from '../lessonPlanData';
import type { LessonPlanTextField, LessonPlanTextErrors } from '../lessonPlanTextValidation';

export type LessonFormState = {
  id?: string;
  academicYear: string;
  teacherName: string;
  teacherId?: string;
  standardId?: string;
  divisionId?: string;
  subjectId?: string;
  chapterId?: string;
  timetableSlotId?: string;
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
  template: string;
  source: LessonSource;
};

const defaultForm: LessonFormState = {
  academicYear: '2026-27',
  teacherName: '',
  teacherId: '',
  standardId: '',
  divisionId: '',
  subjectId: '',
  chapterId: '',
  timetableSlotId: '',
  className: '',
  divisionName: '',
  subjectName: '',
  chapterName: '',
  plannedDate: dayjs(todayIso),
  period: '',
  topic: '',
  learningObjective: '',
  teachingMethod: 'ExplanationBoardWork',
  resourcesRequired: '',
  plannedCompletionPercentage: 0,
  template: '',
  source: 'Manual',
};

const templateDefaults: Record<string, Partial<LessonFormState>> = {
  Lecture: { teachingMethod: 'ExplanationBoardWork' },
  ActivityBased: { teachingMethod: 'ActivityBased' },
  LabPractical: { teachingMethod: 'LabPractical' },
  Revision: { teachingMethod: 'Revision', topic: 'Revision Class' },
  TestPreparation: { teachingMethod: 'TestPreparation', topic: 'Test Preparation' },
  ProjectWork: { teachingMethod: 'ProjectWork' },
  RemedialClass: { teachingMethod: 'Revision', topic: 'Remedial Class' },
  OralPractice: { teachingMethod: 'OralPractice' },
  Storytelling: { teachingMethod: 'Storytelling' },
  WorksheetPractice: { teachingMethod: 'WorksheetPractice' },
};

type Props = {
  open: boolean;
  academicYearId?: string;
  editData?: LessonPlanRow | null;
  prefillDate?: Dayjs | null;
  timelinePrefill?: Partial<LessonFormState> | null;
  currentTeacher?: SelectOption | null;
  lessonPlans?: LessonPlanRow[];
  onClose: () => void;
  onSave: (form: LessonFormState, submitAfterSave: boolean) => void | Promise<void>;
  isLoading?: boolean;
};

type SelectOption = {
  value: string;
  label: string;
};

type TimelineSlot = {
  timetableSlotId: string;
  periodName: string;
  startTime: string;
  endTime: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  subjectId: string;
  subjectName: string;
  insightMessage?: string | null;
  insightSeverity?: string | null;
  isPlanCreationBlocked?: boolean;
};

type ChapterOption = SelectOption & {
  id: string;
};

const AutoFilledField = ({ label, value }: { label: string; value: string }) => (
  <TextField
    size="small"
    label={label}
    value={value}
    fullWidth
    slotProps={{
      input: {
        readOnly: true,
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="mdi:auto-fix" width={14} sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title="Auto-filled from the selected timetable period.">
              <Iconify icon="mdi:information-outline" width={16} sx={{ color: 'text.disabled' }} />
            </Tooltip>
          </InputAdornment>
        ),
      },
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        bgcolor: 'background.neutral',
      },
    }}
  />
);

const normalizeText = (value?: string | null) =>
  value?.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ') || '';

const hasDuplicateLessonTopic = (form: LessonFormState, lessonPlans: LessonPlanRow[]) => {
  const topic = normalizeText(form.topic);
  const plannedDate = form.plannedDate?.format('YYYY-MM-DD');

  if (!topic || !plannedDate) return false;

  return lessonPlans.some((plan) => {
    const sameRecord = form.id && plan.id === form.id;
    const sameTeacher = !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
    const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === plannedDate;
    const sameTopic = normalizeText(plan.topic) === topic;

    return !sameRecord && sameTeacher && sameDate && sameTopic;
  });
};

const hasDuplicateLessonSlot = (form: LessonFormState, lessonPlans: LessonPlanRow[]) => {
  const plannedDate = form.plannedDate?.format('YYYY-MM-DD');
  if (!plannedDate || !form.timetableSlotId) return false;

  return lessonPlans.some((plan) => {
    const sameRecord = form.id && plan.id === form.id;
    const sameTeacher = !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
    const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === plannedDate;
    const sameSlot = plan.timetableSlotId === form.timetableSlotId;

    return !sameRecord && sameTeacher && sameDate && sameSlot;
  });
};

const AddLessonPlanModal = ({
  open,
  academicYearId,
  editData,
  prefillDate,
  timelinePrefill,
  currentTeacher,
  lessonPlans = [],
  onClose,
  onSave,
  isLoading = false,
}: Props) => {
  const [form, setForm] = useState<LessonFormState>(() => ({
    ...defaultForm,
    plannedDate: prefillDate || dayjs(todayIso),
  }));

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LessonPlanTextErrors>({});
  const [saving, setSaving] = useState(false);
  const saveInProgress = React.useRef(false);
  const fieldRefs = React.useRef<
    Partial<Record<LessonPlanTextField, HTMLInputElement | HTMLTextAreaElement | null>>
  >({});
  const pendingFocus = React.useRef<LessonPlanTextField | 'summary' | null>(null);
  const errorPanelRef = React.useRef<HTMLDivElement>(null);
  const isSaving = isLoading || saving;

  React.useEffect(() => {
    if (!isSaving && pendingFocus.current) {
      const input =
        pendingFocus.current === 'summary'
          ? errorPanelRef.current
          : fieldRefs.current[pendingFocus.current];
      input?.focus();
      pendingFocus.current = null;
    }
  }, [error, fieldErrors, isSaving]);
  const completion = useLessonPlanCompletion(
    open,
    {
      academicYearId,
      standardId: form.standardId,
      divisionId: form.divisionId,
      subjectId: form.subjectId,
      chapterId: form.chapterId,
    },
    form.plannedCompletionPercentage
  );
  const [showValidation, setShowValidation] = useState(false);
  const isTimelinePrefill = Boolean(timelinePrefill?.timetableSlotId);

  const teacherOptions = React.useMemo<SelectOption[]>(() => {
    if (!currentTeacher) return [];
    return [currentTeacher];
  }, [currentTeacher]);

  const selectedTeacherId = form.teacherId;
  const plannedDateStr = form.plannedDate
    ? dateConvertor(form.plannedDate.startOf('day').format(dateFormat))
    : '';

  const { data: timelineData } = useGetLessonPlanTimelineQuery(
    {
      date: plannedDateStr || dateConvertor(dayjs(todayIso).startOf('day').format(dateFormat)),
      teacherId: selectedTeacherId,
    },
    {
      skip: isTimelinePrefill || !selectedTeacherId || !plannedDateStr,
      refetchOnMountOrArgChange: true,
    }
  );

  const isLocked = !!editData;
  const isContextLocked = isLocked || isTimelinePrefill;

  const disabledPeriodValues = React.useMemo(() => {
    if (isLocked) return [];
    const formattedDate = form.plannedDate?.format('YYYY-MM-DD');
    if (!formattedDate) return [];

    return lessonPlans
      .filter((plan) => {
        const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === formattedDate;
        const sameTeacher = !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
        const notCurrentPlan = !form.id || plan.id !== form.id;
        return sameDate && sameTeacher && notCurrentPlan;
      })
      .map((plan) => plan.timetableSlotId)
      .filter(Boolean) as string[];
  }, [form.id, form.plannedDate, form.teacherId, isLocked, lessonPlans]);

  const periodOptions = React.useMemo<SelectOption[]>(() => {
    if (isTimelinePrefill && timelinePrefill?.timetableSlotId) {
      return [
        {
          value: timelinePrefill.timetableSlotId,
          label: timelinePrefill.period || timelinePrefill.timetableSlotId,
        },
      ];
    }

    return (
      timelineData?.slots?.map((slot: TimelineSlot) => ({
        value: slot.timetableSlotId,
        label: `${slot.periodName} (${slot.startTime} - ${slot.endTime})`,
      })) || []
    );
  }, [isTimelinePrefill, timelineData, timelinePrefill]);

  const selectedTimelineSlot = React.useMemo(
    () =>
      timelineData?.slots?.find(
        (slot: TimelineSlot) => slot.timetableSlotId === form.timetableSlotId
      ) || null,
    [form.timetableSlotId, timelineData]
  );

  const activeInsight =
    selectedTimelineSlot?.insightMessage ||
    timelineData?.slots?.find((slot: TimelineSlot) => slot.insightMessage)?.insightMessage ||
    null;
  const activeInsightSeverity =
    selectedTimelineSlot?.insightSeverity ||
    timelineData?.slots?.find((slot: TimelineSlot) => slot.insightMessage)?.insightSeverity ||
    'warning';

  const { subjectId } = form;
  const { standardId } = form;
  const { data: chaptersData } = useGetChaptersByStandardQuery(
    { standardId: standardId || '', subjectId: subjectId || '' },
    {
      skip: !subjectId || !standardId || subjectId === 'undefined' || subjectId === 'null',
    }
  );

  const chapterOptions = React.useMemo<ChapterOption[]>(
    () =>
      chaptersData?.map((ch: any) => ({
        value: ch.chapterName,
        label: ch.chapterName,
        id: ch.id,
      })) || [],
    [chaptersData]
  );

  const handleTeacherChange = (teacherId: string) => {
    const selectedTeacher = teacherOptions.find((opt) => opt.value === teacherId);
    setForm((prev) => ({
      ...prev,
      teacherId,
      teacherName: selectedTeacher?.label || '',
      period: '',
      timetableSlotId: '',
      className: '',
      divisionName: '',
      subjectName: '',
      standardId: '',
      divisionId: '',
      subjectId: '',
      chapterName: '',
      chapterId: '',
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setForm((prev) => ({
      ...prev,
      plannedDate: date,
      period: '',
      timetableSlotId: '',
      className: '',
      divisionName: '',
      subjectName: '',
      standardId: '',
      divisionId: '',
      subjectId: '',
      chapterName: '',
      chapterId: '',
    }));
  };

  const handlePeriodChange = (v: string) => {
    const selectedSlot = timelineData?.slots?.find(
      (slot: TimelineSlot) => slot.timetableSlotId === v
    );
    if (selectedSlot) {
      const s = selectedSlot;
      setForm((prev) => ({
        ...prev,
        period: s.periodName,
        timetableSlotId: s.timetableSlotId,
        className: s.standardName,
        divisionName: s.divisionName,
        subjectName: s.subjectName,
        standardId: s.standardId,
        divisionId: s.divisionId,
        subjectId: s.subjectId,
        chapterName: '',
        chapterId: '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        period: v,
      }));
    }
  };

  const handleChapterChange = (chapterName: string) => {
    const selectedCh = chapterOptions.find((opt) => opt.value === chapterName);
    setForm((prev) => ({
      ...prev,
      chapterName,
      chapterId: selectedCh?.id || '',
      plannedCompletionPercentage: 0,
    }));
  };

  React.useEffect(() => {
    if (open) {
      setShowValidation(false);
      setFieldErrors({});
      pendingFocus.current = null;
      if (editData) {
        setForm({
          id: editData.id,
          academicYear: editData.academicYear || '2026-27',
          teacherName: editData.teacherName || '',
          teacherId: (editData as any).teacherId || '',
          className: editData.className || (editData as any).standardName || '',
          divisionName: editData.divisionName || '',
          subjectName: editData.subjectName || '',
          chapterName: editData.chapterName || '',
          plannedDate: editData.plannedDate
            ? dayjs(editData.plannedDate)
            : prefillDate || dayjs(todayIso),
          period: editData.period || '',
          topic: editData.topic || '',
          learningObjective: editData.learningObjective || '',
          teachingMethod: editData.teachingMethod || 'ExplanationBoardWork',
          resourcesRequired: editData.resourcesRequired || '',
          plannedCompletionPercentage: editData.plannedCompletionPercentage || 0,
          template: '',
          source: editData.source || 'Manual',
          timetableSlotId: (editData as any).timetableSlotId || '',
          standardId: (editData as any).standardId || (editData as any).classId || '',
          divisionId: (editData as any).divisionId || '',
          subjectId: (editData as any).subjectId || '',
          chapterId: (editData as any).chapterId || '',
        });
      } else {
        const teacherId = timelinePrefill?.teacherId || currentTeacher?.value || '';
        const teacherName = timelinePrefill?.teacherName || currentTeacher?.label || '';

        setForm({
          ...defaultForm,
          plannedDate: prefillDate || dayjs(todayIso),
          ...timelinePrefill,
          teacherId,
          teacherName,
        });
      }
      setError('');
    }
  }, [currentTeacher, editData, open, prefillDate, timelinePrefill]);

  const set = <K extends keyof LessonFormState>(key: K, value: LessonFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!Object.hasOwn(prev, key)) return prev;
      const next = { ...prev };
      delete next[key as LessonPlanTextField];
      return next;
    });
    setError('');
  };

  const applyTemplate = (templateValue: string) => {
    const defaults = templateDefaults[templateValue] || {};
    setForm((prev) => ({ ...prev, template: templateValue, ...defaults }));
  };

  const validate = (): string => {
    if (!form.teacherId) return 'Teacher is required.';
    if (!form.plannedDate) return 'Planned date is required.';
    if (!form.period) return 'Period / time is required.';
    if (selectedTimelineSlot?.isPlanCreationBlocked)
      return selectedTimelineSlot.insightMessage || 'This period is blocked for lesson planning.';
    if (!form.standardId || !form.className)
      return 'Please select a valid timetable period with class details.';
    if (!form.divisionId || !form.divisionName)
      return 'Please select a valid timetable period with division details.';
    if (!form.subjectId || !form.subjectName)
      return 'Please select a valid timetable period with subject details.';
    if (!form.chapterId || !form.chapterName) return 'Chapter is required.';
    if (!form.topic.trim()) return 'Topic is required.';
    if (hasDuplicateLessonSlot(form, lessonPlans))
      return 'A lesson plan already exists for this teacher and timetable period on this date.';
    if (hasDuplicateLessonTopic(form, lessonPlans))
      return 'A lesson plan with the same topic already exists for this teacher on this date.';
    if (form.plannedCompletionPercentage < 0 || form.plannedCompletionPercentage > 100)
      return 'Planned completion must be between 0 and 100.';
    if (!completion.ready) return completion.error || 'Please wait for recorded chapter progress.';
    return '';
  };

  const showFieldErrors = (errors: LessonPlanTextErrors) => {
    pendingFocus.current =
      (Object.keys(lessonPlanTextFields) as LessonPlanTextField[]).find((field) => errors[field]) ??
      null;
    setFieldErrors(errors);
  };

  const handleSave = async (submit: boolean) => {
    if (saveInProgress.current || isLoading) return;
    setShowValidation(true);
    const textErrors = validateLessonPlanText(form);
    showFieldErrors(textErrors);
    const err = validate();
    if (err || Object.keys(textErrors).length) {
      if (!Object.keys(textErrors).length) pendingFocus.current = 'summary';
      setError(err || 'Please correct the highlighted fields.');
      return;
    }
    setError('');
    saveInProgress.current = true;
    setSaving(true);
    try {
      const result = onSave({ ...form, plannedCompletionPercentage: completion.target }, submit);
      if (result) await result;
    } catch (saveError) {
      const errors = getLessonPlanTextApiErrors(saveError);
      showFieldErrors(errors);
      if (!Object.keys(errors).length) pendingFocus.current = 'summary';
      setError(
        Object.keys(errors).length
          ? 'Please correct the highlighted fields.'
          : parseApiProblemDetail(saveError).detail
      );
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  };

  const initialValues = React.useMemo(
    () => ({
      teacherId: editData
        ? (editData as any).teacherId
        : timelinePrefill?.teacherId || currentTeacher?.value || '',
      plannedDate: (editData?.plannedDate
        ? dayjs(editData.plannedDate)
        : prefillDate || dayjs(todayIso)
      )?.format('YYYY-MM-DD'),
      period: editData?.period || timelinePrefill?.period || '',
      timetableSlotId: (editData as any)?.timetableSlotId || timelinePrefill?.timetableSlotId || '',
      chapterName: editData?.chapterName || '',
      chapterId: (editData as any)?.chapterId || '',
      topic: editData?.topic || '',
      learningObjective: editData?.learningObjective || '',
      teachingMethod: editData?.teachingMethod || 'ExplanationBoardWork',
      resourcesRequired: editData?.resourcesRequired || '',
      plannedCompletionPercentage: editData?.plannedCompletionPercentage || 0,
    }),
    [editData, timelinePrefill, currentTeacher, prefillDate]
  );

  const currentValues = React.useMemo(
    () => ({
      teacherId: form.teacherId,
      plannedDate: form.plannedDate?.format('YYYY-MM-DD'),
      period: form.period,
      timetableSlotId: form.timetableSlotId,
      chapterName: form.chapterName,
      chapterId: form.chapterId,
      topic: form.topic,
      learningObjective: form.learningObjective,
      teachingMethod: form.teachingMethod,
      resourcesRequired: form.resourcesRequired,
      plannedCompletionPercentage: completion.target,
    }),
    [completion.target, form]
  );
  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={currentValues}>
      <CustomDialog
        open={open}
        title={
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {form.id ? 'Edit Lesson Plan' : 'Add Lesson Plan'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Schedule a lesson, set its coverage plan, and track expected progress."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
              {form.source === 'AiGenerated' && (
                <Label color="info" variant="soft" startIcon={<Iconify icon="mdi:robot-outline" />}>
                  AI Generated
                </Label>
              )}
            </Stack>
          </Stack>
        }
        maxWidth="md"
        handleClose={onClose}
      >
        <DialogScrollContent sx={{ bgcolor: 'background.neutral', pb: 2 }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && (
              <Alert
                ref={errorPanelRef}
                tabIndex={-1}
                severity="error"
                icon={<Iconify icon="mdi:alert-circle-outline" />}
              >
                {error}
              </Alert>
            )}

            {/* Section 1: Quick Template */}
            <SectionPaper
              title="Quick Template"
              caption="Select a predefined structure to fill common fields automatically"
              icon="solar:bolt-bold-duotone"
            >
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {lessonPlanTemplates.map((t) => {
                  const selected = form.template === t.value;
                  return (
                    <Chip
                      key={t.value}
                      label={t.label}
                      size="small"
                      icon={
                        selected ? (
                          <Iconify
                            icon="mdi:check-circle"
                            width={16}
                            sx={{ ml: '4px !important' }}
                          />
                        ) : undefined
                      }
                      variant={selected ? 'filled' : 'outlined'}
                      color={selected ? 'primary' : 'default'}
                      onClick={() => applyTemplate(t.value)}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: selected ? 700 : 500,
                        transition: (theme) =>
                          theme.transitions.create(['background-color', 'box-shadow']),
                        ...(!selected && {
                          '&:hover': { bgcolor: 'action.hover' },
                        }),
                      }}
                    />
                  );
                })}
              </Stack>
            </SectionPaper>

            {/* Section 2: Schedule & Context */}
            <SectionPaper
              title="Schedule & Context"
              caption="Define teacher, lecture date, period slot, class, division and subject"
              icon="solar:calendar-date-bold-duotone"
            >
              <Stack spacing={1.5}>
                <CustomSelect
                  label="Teacher *"
                  options={teacherOptions}
                  value={form.teacherId || ''}
                  onChange={(v) => handleTeacherChange(v as string)}
                  disabled
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <DatePicker
                    label="Planned Date *"
                    value={form.plannedDate}
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: { size: 'small', fullWidth: true, disabled: isContextLocked },
                    }}
                  />
                  <CustomSelect
                    label="Period / Time *"
                    options={periodOptions}
                    value={form.timetableSlotId || form.period}
                    onChange={(v) => handlePeriodChange(v as string)}
                    disabled={isContextLocked}
                    disabledValues={disabledPeriodValues}
                    disabledLabel="Already Created"
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <AutoFilledField label="Class *" value={form.className} />
                  <AutoFilledField label="Division *" value={form.divisionName} />
                  <AutoFilledField label="Subject *" value={form.subjectName} />
                </Stack>

                {activeInsight && (
                  <Alert
                    severity={activeInsightSeverity === 'error' ? 'error' : 'warning'}
                    icon={<Iconify icon="mdi:information-outline" />}
                  >
                    {activeInsight}
                  </Alert>
                )}
              </Stack>
            </SectionPaper>

            {/* Section 3: Chapter & Topic */}
            <SectionPaper
              title="Chapter & Topic"
              caption="Specify chapter, lesson topic, and target learning objectives"
              icon="solar:notebook-bold-duotone"
            >
              <Stack spacing={1.5}>
                <CustomSelect
                  label="Chapter *"
                  options={chapterOptions}
                  value={form.chapterName}
                  onChange={(v) => handleChapterChange(v as string)}
                  error={showValidation && (!form.chapterId || !form.chapterName)}
                  helperText={
                    showValidation && (!form.chapterId || !form.chapterName)
                      ? 'Chapter is required'
                      : ''
                  }
                />

                <LessonPlanTextInput
                  field="topic"
                  value={form.topic}
                  onChange={(value) => set('topic', value)}
                  disabled={isSaving}
                  inputRef={(input) => {
                    fieldRefs.current.topic = input;
                  }}
                  error={
                    fieldErrors.topic ||
                    (showValidation && !form.topic.trim() ? 'Topic is required' : undefined)
                  }
                />

                <LessonPlanTextInput
                  field="learningObjective"
                  value={form.learningObjective}
                  onChange={(value) => set('learningObjective', value)}
                  disabled={isSaving}
                  inputRef={(input) => {
                    fieldRefs.current.learningObjective = input;
                  }}
                  error={fieldErrors.learningObjective}
                />
              </Stack>
            </SectionPaper>

            {/* Section 4: Teaching Method & Resources */}
            <SectionPaper
              title="Teaching Method & Resources"
              caption="Select teaching methodology, completion target, and required materials"
              icon="solar:presentation-graph-bold-duotone"
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems="flex-start"
                >
                  <CustomSelect
                    label="Teaching Method"
                    options={teachingMethodOptions}
                    value={form.teachingMethod}
                    onChange={(v) => set('teachingMethod', v as string)}
                    formControlProps={{ sx: { flex: 1 } }}
                  />
                  <ChapterCompletionSlider
                    value={completion.target}
                    minimum={completion.minimum}
                    disabled={!completion.ready}
                    loading={completion.loading}
                    error={completion.error}
                    onRetry={completion.retry}
                    onChange={(value) => set('plannedCompletionPercentage', value)}
                  />
                </Stack>

                <LessonPlanTextInput
                  field="resourcesRequired"
                  value={form.resourcesRequired}
                  onChange={(value) => set('resourcesRequired', value)}
                  disabled={isSaving}
                  inputRef={(input) => {
                    fieldRefs.current.resourcesRequired = input;
                  }}
                  error={fieldErrors.resourcesRequired}
                />
              </Stack>
            </SectionPaper>
          </Stack>
        </DialogScrollContent>

        <Divider />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={isSaving}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            onClick={() => handleSave(false)}
            disabled={!completion.ready}
          >
            Draft
          </LoadingButton>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isSaving}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => handleSave(true)}
            disabled={!completion.ready}
          >
            Submit
          </LoadingButton>
        </Stack>
      </CustomDialog>
    </BackPopUpChecked>
  );
};

export default AddLessonPlanModal;
