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
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Stack, Alert, Button, Divider, Typography } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetChapterLookupQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { todayIso } from '../lessonPlanData';
import { LessonPlanTextInput } from './LessonPlanTextInput';
import { getLessonPlanTextApiErrors } from '../lessonPlanApiErrors';
import { LessonPlanContextDisplay } from './LessonPlanContextDisplay';
import { LessonPlanSection as SectionPaper } from './LessonPlanSection';
import { LessonPlanTeachingResources } from './LessonPlanTeachingResources';
import { useLessonPlanCompletion } from '../hooks/use-lesson-plan-completion';
import { lessonPlanTextFields, validateLessonPlanText } from '../lessonPlanTextValidation';
import {
  hasDuplicateLessonSlot,
  hasDuplicateLessonTopic,
} from '../lessonPlanDuplicateValidation';

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
  source: 'Manual',
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

type ChapterOption = SelectOption & {
  id: string;
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
  const [savingAction, setSavingAction] = useState<'draft' | 'submit' | null>(null);
  const saveInProgress = React.useRef(false);
  const fieldRefs = React.useRef<
    Partial<Record<LessonPlanTextField, HTMLInputElement | HTMLTextAreaElement | null>>
  >({});
  const pendingFocus = React.useRef<LessonPlanTextField | 'summary' | null>(null);
  const errorPanelRef = React.useRef<HTMLDivElement>(null);
  const isSaving = isLoading || savingAction !== null;

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
  const { subjectId } = form;
  const { standardId } = form;
  const { data: chaptersData } = useGetChapterLookupQuery(
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

  const validate = (): string => {
    if (!form.teacherId) return 'Teacher is required.';
    if (!form.plannedDate) return 'Planned date is required.';
    if (!form.period) return 'Period / time is required.';
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
    setSavingAction(submit ? 'submit' : 'draft');
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
      setSavingAction(null);
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

            {/* Section 1: Schedule & Context */}
            <SectionPaper
              title="Schedule & Context"
              caption="Timetable details for this lesson. These values are fixed."
              icon="solar:calendar-date-bold-duotone"
            >
              <LessonPlanContextDisplay
                teacherName={form.teacherName}
                plannedDate={form.plannedDate?.format('DD MMM YYYY') || ''}
                period={form.period}
                className={form.className}
                divisionName={form.divisionName}
                subjectName={form.subjectName}
              />
            </SectionPaper>

            {/* Section 2: Chapter & Topic */}
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

            {/* Section 3: Progress & Resources */}
            <SectionPaper
              title="Progress & Resources"
              caption="Set the chapter completion target and list any required materials"
              icon="solar:presentation-graph-bold-duotone"
            >
              <LessonPlanTeachingResources
                resourcesRequired={form.resourcesRequired}
                resourcesError={fieldErrors.resourcesRequired}
                resourcesInputRef={(input) => {
                  fieldRefs.current.resourcesRequired = input;
                }}
                completion={{
                  value: completion.target,
                  minimum: completion.minimum,
                  ready: completion.ready,
                  loading: completion.loading,
                  error: completion.error,
                  retry: completion.retry,
                }}
                disabled={isSaving}
                onResourcesChange={(value) => set('resourcesRequired', value)}
                onCompletionChange={(value) => set('plannedCompletionPercentage', value)}
              />
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
            loading={savingAction === 'draft'}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            onClick={() => handleSave(false)}
            disabled={!completion.ready || isSaving}
          >
            Draft
          </LoadingButton>
          <LoadingButton
            size="small"
            variant="contained"
            loading={savingAction === 'submit'}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => handleSave(true)}
            disabled={!completion.ready || isSaving}
          >
            Submit
          </LoadingButton>
        </Stack>
      </CustomDialog>
    </BackPopUpChecked>
  );
};

export default AddLessonPlanModal;
