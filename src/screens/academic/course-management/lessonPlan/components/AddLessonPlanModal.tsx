'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Slider,
  Divider,
  Tooltip,
  TextField,
  Typography,
  InputAdornment,
  LinearProgress,
} from '@mui/material';

import { todayIso, lessonPlanTemplates, teachingMethodOptions } from '../lessonPlanData';

import type { LessonSource, LessonPlanRow } from '../lessonPlanData';

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
  editData?: LessonPlanRow | null;
  prefillDate?: Dayjs | null;
  timelinePrefill?: Partial<LessonFormState> | null;
  currentTeacher?: SelectOption | null;
  lessonPlans?: LessonPlanRow[];
  onClose: () => void;
  onSave: (form: LessonFormState, submitAfterSave: boolean) => void;
  onAiGenerate?: () => void;
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

const FormSection = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={16} />
      </Box>
      <Typography variant="subtitle2" sx={{ letterSpacing: 0.2 }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

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

const resolvePreviousProgress = (
  lessonPlans: LessonPlanRow[],
  chapterId?: string,
  topic?: string
) => {
  if (!chapterId) return 0;

  const normalizedTopic = normalizeText(topic);
  const matchingPlans = lessonPlans.filter((plan) => plan.chapterId === chapterId);
  const topicMatches = normalizedTopic
    ? matchingPlans.filter((plan) => normalizeText(plan.topic) === normalizedTopic)
    : [];
  const candidates = topicMatches.length > 0 ? topicMatches : matchingPlans;

  return candidates.reduce((progress, plan) => {
    const completedProgress =
      plan.actualCompletionPercentage ||
      plan.existingChapterProgress ||
      plan.plannedCompletionPercentage ||
      0;
    return Math.max(progress, completedProgress);
  }, 0);
};

const AddLessonPlanModal = ({
  open,
  editData,
  prefillDate,
  timelinePrefill,
  currentTeacher,
  lessonPlans = [],
  onClose,
  onSave,
  onAiGenerate,
  isLoading = false,
}: Props) => {
  const [form, setForm] = useState<LessonFormState>(() => ({
    ...defaultForm,
    plannedDate: prefillDate || dayjs(todayIso),
  }));

  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const isTimelinePrefill = Boolean(timelinePrefill?.timetableSlotId);

  /**
   * Memoization Justification:
   * - Keeps the logged-in teacher option stable between local form updates inside the modal.
   * - Prevents CustomSelect from receiving a new options array on every keystroke.
   * - The option only changes when Redux auth/current teacher context changes.
   */
  const teacherOptions = React.useMemo<SelectOption[]>(() => {
    if (!currentTeacher) return [];
    return [currentTeacher];
  }, [currentTeacher]);

  // Load timetable slots based on selected teacher and date
  const selectedTeacherId = form.teacherId;
  const plannedDateStr = form.plannedDate ? dateConvertor(form.plannedDate.format(dateFormat)) : '';

  const { data: timelineData } = useGetLessonPlanTimelineQuery(
    {
      date: plannedDateStr || dateConvertor(dayjs(todayIso).format(dateFormat)),
      teacherId: selectedTeacherId,
    },
    { skip: isTimelinePrefill || !selectedTeacherId || !plannedDateStr }
  );

  const isLocked = !!editData;
  const isContextLocked = isLocked || isTimelinePrefill;

  /**
   * Identifies period slot IDs that already have a lesson plan created
   * for the selected date and teacher, excluding the current plan being edited.
   */
  const disabledPeriodValues = React.useMemo(() => {
    if (isLocked) return []; // When editing, context is locked
    const formattedDate = form.plannedDate?.format('YYYY-MM-DD');
    if (!formattedDate) return [];

    return lessonPlans
      .filter((plan) => {
        const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === formattedDate;
        const sameTeacher =
          !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
        const notCurrentPlan = !form.id || plan.id !== form.id;
        return sameDate && sameTeacher && notCurrentPlan;
      })
      .map((plan) => plan.timetableSlotId)
      .filter(Boolean) as string[];
  }, [form.id, form.plannedDate, form.teacherId, isLocked, lessonPlans]);

  /**
   * Memoization Justification:
   * - Keeps period options stable while users fill the lesson details.
   * - Prevents CustomSelect from reprocessing slot options on unrelated form edits.
   * - The options only depend on fetched timeline data or the locked timeline prefill.
   */
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

  /**
   * Memoization Justification:
   * - The selected slot is reused by both insight display and validation.
   * - Avoids scanning timeline slots multiple times while users edit lesson text fields.
   * - It only changes when the selected period or fetched timeline slots change.
   */
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

  // Load chapters based on auto-populated subjectId & standardId
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

  // Handlers
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
    const previousProgress = resolvePreviousProgress(lessonPlans, selectedCh?.id, form.topic);
    setForm((prev) => ({
      ...prev,
      chapterName,
      chapterId: selectedCh?.id || '',
      plannedCompletionPercentage: previousProgress || prev.plannedCompletionPercentage,
    }));
  };

  const handleTopicBlur = () => {
    const previousProgress = resolvePreviousProgress(lessonPlans, form.chapterId, form.topic);
    if (previousProgress > 0) {
      setForm((prev) => ({
        ...prev,
        plannedCompletionPercentage: previousProgress,
      }));
    }
  };

  React.useEffect(() => {
    if (open) {
      setShowValidation(false);
      if (editData) {
        setForm({
          id: editData.id,
          academicYear: editData.academicYear || '2026-27',
          teacherName: editData.teacherName || '',
          teacherId: (editData as any).teacherId || '',
          className: editData.className || '',
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
          standardId: (editData as any).standardId || '',
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

  const set = useCallback(
    <K extends keyof LessonFormState>(key: K, value: LessonFormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

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
    if (hasDuplicateLessonTopic(form, lessonPlans))
      return 'A lesson plan with the same topic already exists for this teacher on this date.';
    if (form.plannedCompletionPercentage < 0 || form.plannedCompletionPercentage > 100)
      return 'Planned completion must be between 0 and 100.';
    return '';
  };

  const handleSave = (submit: boolean) => {
    setShowValidation(true);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onSave(form, submit);
  };

  const aiQualityScore = form.topic && form.learningObjective && form.teachingMethod ? 75 : 0;

  const requiredFieldsFilled = [
    form.teacherId,
    form.plannedDate,
    form.period,
    form.chapterId,
    form.topic.trim(),
  ].filter(Boolean).length;
  const totalRequiredFields = 5;

  return (
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
        <Stack spacing={1}>
          {error && (
            <Alert severity="error" icon={<Iconify icon="mdi:alert-circle-outline" />}>
              {error}
            </Alert>
          )}

          {/* Template selector */}
          <FormSection icon="mdi:lightning-bolt-outline" title="Quick Template">
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
                        <Iconify icon="mdi:check-circle" width={16} sx={{ ml: '4px !important' }} />
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
          </FormSection>

          {/* Schedule & context */}
          <FormSection icon="mdi:calendar-clock-outline" title="Schedule & Context">
            <Stack spacing={1}>
              <CustomSelect
                label="Teacher *"
                options={teacherOptions}
                value={form.teacherId || ''}
                onChange={(v) => handleTeacherChange(v as string)}
                disabled
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
          </FormSection>

          {/* Chapter & topic */}
          <FormSection icon="mdi:book-open-page-variant-outline" title="Chapter & Topic">
            <Stack spacing={1}>
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

              <TextField
                size="small"
                label="Topic *"
                value={form.topic}
                onChange={(e) => set('topic', e.target.value)}
                onBlur={handleTopicBlur}
                fullWidth
                placeholder="e.g. Addition of Fractions"
                error={showValidation && !form.topic.trim()}
                helperText={
                  showValidation && !form.topic.trim()
                    ? 'Topic is required'
                    : 'Matches prior progress for this chapter automatically on blur'
                }
              />

              <TextField
                size="small"
                label="Learning Objective"
                value={form.learningObjective}
                onChange={(e) => set('learningObjective', e.target.value)}
                fullWidth
                multiline
                minRows={2}
                placeholder="Students will be able to..."
                helperText="Clearly state what students should achieve by the end of the lesson"
              />
            </Stack>
          </FormSection>

          {/* Teaching method & resources */}
          <FormSection icon="mdi:teach" title="Teaching Method & Resources">
            <Stack spacing={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <CustomSelect
                  label="Teaching Method"
                  options={teachingMethodOptions}
                  value={form.teachingMethod}
                  onChange={(v) => set('teachingMethod', v as string)}
                  formControlProps={{ sx: { flex: 1 } }}
                />
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Planned Completion
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {form.plannedCompletionPercentage}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={form.plannedCompletionPercentage}
                    sx={{ my: 1, height: 6, borderRadius: 1 }}
                  />
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    size="small"
                    value={form.plannedCompletionPercentage}
                    onChange={(_, v) => set('plannedCompletionPercentage', v as number)}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' },
                    ]}
                  />
                </Box>
              </Stack>

              <TextField
                size="small"
                label="Resources Required"
                value={form.resourcesRequired}
                onChange={(e) => set('resourcesRequired', e.target.value)}
                fullWidth
                multiline
                minRows={2}
                placeholder="Textbook, worksheet, projector..."
                helperText="List materials, tools or aids needed to deliver this lesson"
              />
            </Stack>
          </FormSection>

          {/* AI Quality Preview */}
          {aiQualityScore > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:auto-fix" width={16} sx={{ color: 'primary.dark' }} />
                  <Typography variant="caption" color="primary.dark" fontWeight={600}>
                    AI Lesson Plan Quality Preview
                  </Typography>
                </Stack>
                <Label color={aiQualityScore >= 75 ? 'success' : 'warning'} variant="soft">
                  {aiQualityScore}%
                </Label>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={aiQualityScore}
                color={aiQualityScore >= 75 ? 'success' : 'warning'}
                sx={{ borderRadius: 1, height: 6 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.75, display: 'block' }}
              >
                {!form.resourcesRequired && 'Add resources to improve quality. '}
                {!form.learningObjective && 'Add learning objective. '}
                {aiQualityScore >= 75 && 'Good plan quality!'}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogScrollContent>

      <Divider />
      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 2 }}
      >
        {onAiGenerate ? (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<Iconify icon="mdi:robot-outline" />}
            onClick={onAiGenerate}
          >
            AI Generate
          </Button>
        ) : (
          <Box />
        )}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={isLoading}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            onClick={() => handleSave(false)}
          >
            Save Draft
          </LoadingButton>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isLoading}
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            onClick={() => handleSave(true)}
          >
            Submit Plan
          </LoadingButton>
        </Stack>
      </Stack>
    </CustomDialog>
  );
};

export default AddLessonPlanModal;
