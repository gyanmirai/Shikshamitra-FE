'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  List,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  Slider,
  Divider,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { TeacherDiaryPlanContext } from './TeacherDiaryPlanContext';
import { getPrimaryTeachingMethod } from '../lessonPlanTeachingMethods';
import {
  type TeacherDiaryStep,
  TeacherDiaryStepNavigation,
} from './TeacherDiaryStepNavigation';
import {
  todayIso,
  missedReasonOptions,
  evidenceTypeOptions,
  teachingMethodOptions,
  engagementLevelOptions,
  understandingLevelOptions,
} from '../lessonPlanData';

import type {
  MissedReason,
  LessonPlanRow,
  TeacherDiaryRow,
  EngagementLevel,
  UnderstandingLevel,
} from '../lessonPlanData';

export type DiaryFormState = {
  lessonPlanId: string;
  actualDate: Dayjs | null;
  classConducted: boolean;
  actualTopicCovered: string;
  actualContentSummary: string;
  actualCompletionPercentage: number;
  teachingMethodUsed: string;
  studentResponse: string;
  classUnderstandingLevel: UnderstandingLevel;
  studentEngagementLevel: EngagementLevel;
  needRevision: boolean;
  reflection: string;
  whatWentWell: string;
  whatWasDifficult: string;
  studentsNeedingSupport: string;
  nextClassFollowUp: string;
  remedialActionRequired: string;
  homeworkAssigned: string;
  missedReason: MissedReason | '';
  rescheduledToDate: Dayjs | null;
  isBackdated: boolean;
  backdatedReason: string;
  teacherRemarks: string;
};

export const defaultDiaryForm: DiaryFormState = {
  lessonPlanId: '',
  actualDate: dayjs(todayIso),
  classConducted: true,
  actualTopicCovered: '',
  actualContentSummary: '',
  actualCompletionPercentage: 0,
  teachingMethodUsed: 'ExplanationBoardWork',
  studentResponse: '',
  classUnderstandingLevel: 'Medium',
  studentEngagementLevel: 'Medium',
  needRevision: false,
  reflection: '',
  whatWentWell: '',
  whatWasDifficult: '',
  studentsNeedingSupport: '',
  nextClassFollowUp: '',
  remedialActionRequired: '',
  homeworkAssigned: '',
  missedReason: '',
  rescheduledToDate: null,
  isBackdated: false,
  backdatedReason: '',
  teacherRemarks: '',
};

export const createDraftDiaryForm = (plan: LessonPlanRow): DiaryFormState => ({
  ...defaultDiaryForm,
  lessonPlanId: plan.id || (plan as any).Id,
  actualDate: dayjs(plan.plannedDate),
  actualTopicCovered: plan.topic,
  actualCompletionPercentage: plan.plannedCompletionPercentage,
  teachingMethodUsed: getPrimaryTeachingMethod(plan.teachingMethod),
});

type Props = {
  open: boolean;
  plan?: LessonPlanRow | null;
  existingDiary?: TeacherDiaryRow | null;
  allowBackdated?: boolean;
  maxBackdateDays?: number;
  loading?: boolean;
  onClose: () => void;
  onSave: (form: DiaryFormState, submit: boolean) => void;
  onAiSummary?: () => void;
};

const SectionCard = ({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 2 },
      mb: 1.5,
      position: 'relative',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'clip',
    }}
  >
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 1.25,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Iconify icon={icon} width={20} sx={{ color: 'text.secondary' }} />
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {title}
        </Typography>
      </Stack>
      {action}
    </Box>
    {children}
  </Paper>
);

const SubmitDiaryModal = ({
  open,
  plan,
  existingDiary,
  allowBackdated = true,
  maxBackdateDays = 3,
  loading = false,
  onClose,
  onSave,
  onAiSummary,
}: Props) => {
  const [tab, setTab] = useState<TeacherDiaryStep>('Teaching');
  const [form, setForm] = useState<DiaryFormState>(() => {
    if (existingDiary) {
      return {
        lessonPlanId: existingDiary.lessonPlanId,
        actualDate: dayjs(existingDiary.actualDate),
        classConducted: existingDiary.classConducted,
        actualTopicCovered: existingDiary.actualTopicCovered || existingDiary.actualTopicTaught,
        actualContentSummary: existingDiary.actualContentSummary,
        actualCompletionPercentage:
          existingDiary.actualCompletionPercentage || existingDiary.completionPercentage,
        teachingMethodUsed: existingDiary.teachingMethodUsed || 'ExplanationBoardWork',
        studentResponse: existingDiary.studentResponse,
        classUnderstandingLevel: existingDiary.classUnderstandingLevel || 'Medium',
        studentEngagementLevel: existingDiary.studentEngagementLevel || 'Medium',
        needRevision: existingDiary.needRevision || false,
        reflection: existingDiary.reflection || '',
        whatWentWell: existingDiary.whatWentWell || '',
        whatWasDifficult: existingDiary.whatWasDifficult || '',
        studentsNeedingSupport: existingDiary.studentsNeedingSupport || '',
        nextClassFollowUp: existingDiary.nextClassFollowUp || '',
        remedialActionRequired: existingDiary.remedialActionRequired || '',
        homeworkAssigned: existingDiary.homeworkAssigned || '',
        missedReason: (existingDiary.missedReason as MissedReason) || '',
        rescheduledToDate: existingDiary.rescheduledToDate
          ? dayjs(existingDiary.rescheduledToDate)
          : null,
        isBackdated: existingDiary.isBackdated || false,
        backdatedReason: existingDiary.backdatedReason || '',
        teacherRemarks: existingDiary.teacherRemarks || '',
      };
    }
    if (plan) return createDraftDiaryForm(plan);
    return defaultDiaryForm;
  });

  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    type: string;
    size: string;
    previewUrl?: string;
  } | null>(null);

  const [mockFiles, setMockFiles] = useState<
    {
      id: string;
      name: string;
      size: string;
      type: string;
      status: 'staged' | 'uploading' | 'uploaded' | 'failed';
      progress: number;
      previewUrl?: string;
      error?: string;
    }[]
  >([]);

  const mediumMinDate = useMemo(() => {
    const startStr = (currentMedium as any)?.startDate || (currentYear as any)?.startDate;
    return startStr ? dayjs(startStr) : undefined;
  }, [currentMedium, currentYear]);

  const mediumMaxDate = useMemo(() => {
    const endStr = (currentMedium as any)?.endDate || (currentYear as any)?.endDate;
    return endStr ? dayjs(endStr) : undefined;
  }, [currentMedium, currentYear]);

  const handleSelectActualFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const filesArray: File[] = Array.from(files);
    const newUploadedFiles = filesArray.map((file, i) => {
      const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
      const isDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx');
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

      const defaultType = isPdf ? 'PdfNotes' : isDoc ? 'Worksheet' : 'ClassPhoto';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr =
        file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      return {
        id: `file-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: sizeStr,
        type: defaultType,
        status: 'uploaded' as const,
        progress: 100,
        previewUrl,
      };
    });

    setMockFiles((prev) => [...prev, ...newUploadedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileTypeChange = (id: string, newType: string) => {
    setMockFiles((prev) => prev.map((f) => (f.id === id ? { ...f, type: newType } : f)));
  };

  const handleRemoveFile = (id: string) => {
    setMockFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const set = useCallback(
    <K extends keyof DiaryFormState>(key: K, value: DiaryFormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const validate = (): string => {
    if (!form.actualDate || !form.actualDate.isValid()) return 'Actual date is required.';
    if (mediumMinDate && form.actualDate.isBefore(mediumMinDate, 'day'))
      return `Actual date must be on or after ${mediumMinDate.format('DD/MM/YYYY')}.`;
    if (mediumMaxDate && form.actualDate.isAfter(mediumMaxDate, 'day'))
      return `Actual date must be on or before ${mediumMaxDate.format('DD/MM/YYYY')}.`;

    if (form.rescheduledToDate && form.rescheduledToDate.isValid()) {
      if (mediumMinDate && form.rescheduledToDate.isBefore(mediumMinDate, 'day'))
        return `Rescheduled date must be on or after ${mediumMinDate.format('DD/MM/YYYY')}.`;
      if (mediumMaxDate && form.rescheduledToDate.isAfter(mediumMaxDate, 'day'))
        return `Rescheduled date must be on or before ${mediumMaxDate.format('DD/MM/YYYY')}.`;
    }

    if (form.classConducted) {
      if (!form.actualTopicCovered.trim()) return 'Actual topic covered is required.';
      if (form.actualCompletionPercentage < 0 || form.actualCompletionPercentage > 100)
        return 'Completion % must be 0–100.';
    } else if (!form.missedReason) return 'Missed reason is required when class was not conducted.';
    if (form.isBackdated && !form.backdatedReason.trim())
      return 'Reason is required for backdated diary entry.';
    return '';
  };

  const handleSave = (submit: boolean) => {
    const err = validate();
    if (err) {
      setError(err);
      shikshaMitraToast.error({ message: err });
      return;
    }

    if (
      submit &&
      plan &&
      plan.planStatus !== 'Approved' &&
      plan.approvalStatus !== 'Approved' &&
      plan.status !== 'Approved' &&
      (plan.status as any) !== 2
    ) {
      const businessErr = 'Teacher diary can be submitted only against an approved lesson plan.';
      setError(businessErr);
      shikshaMitraToast.error({ message: businessErr });
      return;
    }

    setError('');
    onSave(form, submit);
  };

  const diaryQualityScore = (): number => {
    let score = 0;
    if (form.classConducted) {
      if (form.actualTopicCovered) score += 20;
      if (form.actualContentSummary) score += 15;
      if (form.actualCompletionPercentage > 0) score += 15;
      if (form.studentResponse) score += 15;
      if (form.reflection) score += 15;
      if (form.whatWentWell) score += 5;
      if (form.nextClassFollowUp) score += 10;
      if (mockFiles.length > 0) score += 5;
    } else {
      score = form.missedReason ? 60 : 0;
    }
    return Math.min(100, score);
  };

  const qualityScore = diaryQualityScore();

  const isTeachingComplete = Boolean(
    form.actualDate &&
    (form.classConducted
      ? form.actualTopicCovered.trim() !== '' && form.actualCompletionPercentage >= 0
      : Boolean(form.missedReason))
  );

  const isReflectionComplete = Boolean(
    form.reflection.trim() ||
    form.whatWentWell.trim() ||
    form.whatWasDifficult.trim() ||
    form.studentsNeedingSupport.trim() ||
    form.nextClassFollowUp.trim() ||
    form.remedialActionRequired.trim() ||
    form.teacherRemarks.trim()
  );

  const isEvidenceComplete = mockFiles.length > 0;

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={onClose}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span" sx={{ fontWeight: 'normal' }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              {existingDiary ? 'Edit Teacher Diary' : 'Submit Teacher Diary'}
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Record actual classroom coverage, student responses, teacher reflections, and attach evidence."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ color: 'text.secondary', cursor: 'pointer' }}
                width={16}
                height={16}
              />
            </CustomTooltip>
            {form.isBackdated && (
              <Label color="warning" variant="soft" startIcon={<Iconify icon={GlobalIcons.history} />}>
                Backdated
              </Label>
            )}
          </Box>
        }
        maxWidth="md"
        hasForm
      >
        {plan && <TeacherDiaryPlanContext plan={plan} />}

        <TeacherDiaryStepNavigation
          activeStep={tab}
          completedSteps={{
            Teaching: isTeachingComplete,
            Reflection: isReflectionComplete,
            Evidence: isEvidenceComplete,
          }}
          onChange={setTab}
          disabled={loading}
        />

        <DialogScrollContent onSubmit={() => handleSave(true)}>
          <Stack
            spacing={1}
            role="tabpanel"
            id={`diary-panel-${tab}`}
            aria-labelledby={`diary-step-${tab}`}
          >
            {error && (
              <Alert severity="error" icon={<Iconify icon="mdi:alert-circle-outline" />}>
                {error}
              </Alert>
            )}

            {/* Backdated Warning & Reason */}
            {form.isBackdated && (
              <Alert severity="warning" icon={<Iconify icon={GlobalIcons.history} />}>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Backdated Entry Notice
                  </Typography>
                  <Typography variant="caption">
                    This diary is being submitted after the scheduled date. Please provide a reason for the delayed entry.
                  </Typography>
                  <TextField
                    size="small"
                    label="Backdated Reason *"
                    value={form.backdatedReason}
                    onChange={(e) => set('backdatedReason', e.target.value)}
                    fullWidth
                    required
                    placeholder="State reason for delayed submission..."
                  />
                </Stack>
              </Alert>
            )}

            {/* Diary Quality Score */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:chart-donut" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.primary">
                    Diary quality
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {qualityScore}%{qualityScore < 50 && ' · Needs improvement'}
                  {qualityScore >= 50 && qualityScore < 75 && ' · Good'}
                  {qualityScore >= 75 && ' · Excellent'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={qualityScore}
                sx={{
                  mt: 1,
                  borderRadius: 1,
                  height: 5,
                  bgcolor: 'action.selected',
                  '& .MuiLinearProgress-bar': { bgcolor: 'text.primary' },
                }}
              />
            </Box>

            {tab === 'Teaching' && (
              <Stack>
                <SectionCard title="Class Status" icon="mdi:calendar-check-outline">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <DatePicker
                      label="Actual Date *"
                      value={form.actualDate}
                      onChange={(v) => set('actualDate', v)}
                      minDate={mediumMinDate}
                      maxDate={mediumMaxDate}
                      slotProps={{ textField: { size: 'small', sx: { maxWidth: 220, width: '100%' } } }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.classConducted}
                          onChange={(e) => set('classConducted', e.target.checked)}
                        />
                      }
                      label="Class Conducted"
                    />
                  </Stack>
                </SectionCard>

                {form.classConducted ? (
                  <>
                    <SectionCard title="Lesson Coverage" icon="mdi:book-open-variant">
                      <Stack spacing={2}>
                        <TextField
                          size="small"
                          label="Actual Topic Covered *"
                          value={form.actualTopicCovered}
                          onChange={(e) => set('actualTopicCovered', e.target.value)}
                          fullWidth
                          required
                        />
                        <TextField
                          size="small"
                          label="Actual Content Summary"
                          value={form.actualContentSummary}
                          onChange={(e) => set('actualContentSummary', e.target.value)}
                          fullWidth
                          multiline
                          minRows={3}
                          placeholder="Describe what was taught in detail..."
                          helperText="Summarize the concepts, examples and activities actually covered"
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                          <Box sx={{ flex: 1, width: '100%' }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Actual Completion (%)
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                {form.actualCompletionPercentage}%
                              </Typography>
                            </Stack>
                            <Box sx={{ px: 0.5, pt: 0.5 }}>
                              <Slider
                                value={form.actualCompletionPercentage}
                                onChange={(_, val) => set('actualCompletionPercentage', val as number)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100}
                                step={5}
                                size="small"
                                sx={{
                                  height: 6,
                                  '& .MuiSlider-thumb': {
                                    width: 16,
                                    height: 16,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                          <CustomSelect
                            label="Teaching Method Used"
                            options={teachingMethodOptions}
                            value={form.teachingMethodUsed}
                            onChange={(v) => set('teachingMethodUsed', v as string)}
                            formControlProps={{ sx: { flex: 1, width: '100%' } }}
                          />
                        </Stack>
                      </Stack>
                    </SectionCard>

                    <SectionCard title="Classroom Feedback" icon="mdi:account-group-outline">
                      <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <CustomSelect
                            label="Class Understanding Level"
                            options={understandingLevelOptions}
                            value={form.classUnderstandingLevel}
                            onChange={(v) => set('classUnderstandingLevel', v as UnderstandingLevel)}
                            formControlProps={{ sx: { flex: 1 } }}
                          />
                          <CustomSelect
                            label="Student Engagement Level"
                            options={engagementLevelOptions}
                            value={form.studentEngagementLevel}
                            onChange={(v) => set('studentEngagementLevel', v as EngagementLevel)}
                            formControlProps={{ sx: { flex: 1 } }}
                          />
                        </Stack>
                        <TextField
                          size="small"
                          label="Student Response"
                          value={form.studentResponse}
                          onChange={(e) => set('studentResponse', e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                          placeholder="How did students respond to the lesson?"
                        />
                        <TextField
                          size="small"
                          label="Homework Assigned"
                          value={form.homeworkAssigned}
                          onChange={(e) => set('homeworkAssigned', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </SectionCard>
                  </>
                ) : (
                  <SectionCard title="Missed Class Details" icon="mdi:alert-outline">
                    <Stack spacing={2}>
                      <Alert severity="warning" icon={<Iconify icon="mdi:alert-outline" />}>
                        Class was not conducted. Please select a reason and reschedule date if applicable.
                      </Alert>
                      <CustomSelect
                        label="Missed Reason *"
                        options={missedReasonOptions}
                        value={form.missedReason}
                        onChange={(v) => set('missedReason', v as MissedReason)}
                        formControlProps={{ sx: { maxWidth: 360, width: '100%' } }}
                      />
                      <DatePicker
                        label="Rescheduled To"
                        value={form.rescheduledToDate}
                        onChange={(v) => set('rescheduledToDate', v)}
                        minDate={mediumMinDate}
                        maxDate={mediumMaxDate}
                        slotProps={{ textField: { size: 'small', sx: { maxWidth: 240, width: '100%' } } }}
                      />
                    </Stack>
                  </SectionCard>
                )}
              </Stack>
            )}

            {tab === 'Reflection' && (
              <SectionCard title="Teacher Reflection & Notes" icon="mdi:thought-bubble-outline">
                <Stack spacing={2}>
                  <TextField
                    size="small"
                    label="Overall Reflection"
                    value={form.reflection}
                    onChange={(e) => set('reflection', e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Overall thoughts on today's lesson..."
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      label="What Went Well?"
                      value={form.whatWentWell}
                      onChange={(e) => set('whatWentWell', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                    <TextField
                      size="small"
                      label="What Was Difficult?"
                      value={form.whatWasDifficult}
                      onChange={(e) => set('whatWasDifficult', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  </Stack>
                  <TextField
                    size="small"
                    label="Students Needing Support"
                    value={form.studentsNeedingSupport}
                    onChange={(e) => set('studentsNeedingSupport', e.target.value)}
                    fullWidth
                    placeholder="Names or roll numbers of students who need extra attention"
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      label="Next Class Follow-up"
                      value={form.nextClassFollowUp}
                      onChange={(e) => set('nextClassFollowUp', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                    <TextField
                      size="small"
                      label="Remedial Action Required"
                      value={form.remedialActionRequired}
                      onChange={(e) => set('remedialActionRequired', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  </Stack>
                  <TextField
                    size="small"
                    label="Teacher Remarks"
                    value={form.teacherRemarks}
                    onChange={(e) => set('teacherRemarks', e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>
              </SectionCard>
            )}

            {tab === 'Evidence' && (
              <SectionCard title="Supporting Evidence" icon="mdi:paperclip">
                <Stack spacing={2}>
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={(e) => handleSelectActualFiles(e.target.files)}
                  />

                  {/* Dropzone */}
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: 'background.neutral',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                    }}
                    onClick={handleTriggerFilePicker}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.length) {
                        handleSelectActualFiles(e.dataTransfer.files);
                      }
                    }}
                  >
                    <Iconify
                      icon={GlobalIcons.upload}
                      width={36}
                      sx={{ color: 'primary.main', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                      Click or drag files to select evidence (Images, PDF, Worksheets)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select classroom evidence files to attach. Max 10 MB each.
                    </Typography>
                  </Box>

                  {/* File List */}
                  {mockFiles.length > 0 && (
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Evidence Files ({mockFiles.length})
                      </Typography>

                      <List disablePadding>
                        {mockFiles.map((file) => {
                          const isPhoto =
                            file.type.includes('Photo') ||
                            file.name.endsWith('.jpg') ||
                            file.name.endsWith('.png');
                          const isPdf = file.type.includes('Pdf') || file.name.endsWith('.pdf');

                          return (
                            <Box
                              key={file.id}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.neutral',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                  sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }}
                                  onClick={() =>
                                    setPreviewFile({
                                      name: file.name,
                                      type: file.type,
                                      size: file.size,
                                      previewUrl: file.previewUrl,
                                    })
                                  }
                                >
                                  <Box
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: isPdf ? 'error.lighter' : 'primary.lighter',
                                      color: isPdf ? 'error.main' : 'primary.main',
                                      flexShrink: 0,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {file.previewUrl ? (
                                      <Box
                                        component="img"
                                        src={file.previewUrl}
                                        alt={file.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <Iconify
                                        icon={
                                          isPdf
                                            ? GlobalIcons.pdf
                                            : isPhoto
                                              ? GlobalIcons.image
                                              : GlobalIcons.doc
                                        }
                                        width={22}
                                      />
                                    )}
                                  </Box>

                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {file.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {file.size}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <CustomSelect
                                  label="Type"
                                  options={evidenceTypeOptions}
                                  value={file.type}
                                  onChange={(val) => handleFileTypeChange(file.id, val as string)}
                                  formControlProps={{ sx: { minWidth: 160 } }}
                                />

                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    title="Preview File"
                                    onClick={() =>
                                      setPreviewFile({
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                        previewUrl: file.previewUrl,
                                      })
                                    }
                                  >
                                    <Iconify icon={GlobalIcons.eye} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="default"
                                    title="Remove"
                                    onClick={() => handleRemoveFile(file.id)}
                                  >
                                    <Iconify icon={GlobalIcons.cancel} />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Box>
                          );
                        })}
                      </List>
                    </Stack>
                  )}
                </Stack>
              </SectionCard>
            )}
          </Stack>
        </DialogScrollContent>

        {/* Dialog Action Footer - Fixed at bottom outside scroll area */}
        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: 'background.paper', boxShadow: 'var(--shadows-10)' }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={tab === 'Teaching'}
              onClick={() => {
                if (tab === 'Reflection') setTab('Teaching');
                else if (tab === 'Evidence') setTab('Reflection');
              }}
              startIcon={<Iconify icon="ic:round-arrow-back" />}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={tab === 'Evidence'}
              onClick={() => {
                if (tab === 'Teaching') setTab('Reflection');
                else if (tab === 'Reflection') setTab('Evidence');
              }}
              endIcon={<Iconify icon="ic:round-arrow-forward" />}
            >
              Next
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              loading={loading}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={() => handleSave(true)}
            >
              Submit
            </LoadingButton>
          </Stack>
        </DialogActions>
      </CustomDialog>

      {/* File Preview Lightbox Dialog */}
      {previewFile && (
        <CustomDialog
          open={Boolean(previewFile)}
          handleClose={() => setPreviewFile(null)}
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon={GlobalIcons.eye} width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {previewFile.name}
              </Typography>
            </Stack>
          }
          maxWidth="sm"
          hasForm={false}
        >
          <DialogScrollContent>
            <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
              {previewFile.previewUrl ? (
                <Box
                  component="img"
                  src={previewFile.previewUrl}
                  alt={previewFile.name}
                  sx={{
                    maxHeight: 400,
                    maxWidth: '100%',
                    borderRadius: 1.5,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Iconify icon={GlobalIcons.doc} width={56} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.primary" fontWeight={600}>
                    {previewFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {previewFile.size}
                  </Typography>
                </Box>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pt: 1 }}>
                <Label color="primary" variant="soft">
                  Type: {previewFile.type}
                </Label>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={() => setPreviewFile(null)}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </DialogScrollContent>
        </CustomDialog>
      )}
    </>
  );
};

export default SubmitDiaryModal;
