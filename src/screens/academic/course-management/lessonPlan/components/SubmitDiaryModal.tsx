'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  Tab,
  List,
  Tabs,
  Alert,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

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
  teachingMethodUsed: plan.teachingMethod,
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

const TABS = ['Teaching', 'Reflection', 'Evidence'] as const;
type TabKey = (typeof TABS)[number];

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
  const [tab, setTab] = useState<TabKey>('Teaching');
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

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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

  const handleSelectActualFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const newStagedFiles = filesArray.map((file, i) => {
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
        status: 'staged' as const,
        progress: 0,
        previewUrl,
      };
    });

    setMockFiles((prev) => [...prev, ...newStagedFiles]);
    e.target.value = '';
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

  const handleStartUpload = (targetId?: string) => {
    setMockFiles((prev) =>
      prev.map((f) => {
        if (!targetId || f.id === targetId) {
          if (f.status === 'staged' || f.status === 'failed') {
            return { ...f, status: 'uploading', progress: 25, error: undefined };
          }
        }
        return f;
      })
    );

    setTimeout(() => {
      setMockFiles((prev) =>
        prev.map((f) => (f.status === 'uploading' ? { ...f, progress: 70 } : f))
      );
    }, 400);

    setTimeout(() => {
      setMockFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'uploaded', progress: 100 } : f
        )
      );
    }, 900);
  };

  const handleClearStaged = () => {
    setMockFiles((prev) => prev.filter((f) => f.status === 'uploaded'));
  };

  const set = useCallback(
    <K extends keyof DiaryFormState>(key: K, value: DiaryFormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const validate = (): string => {
    if (!form.actualDate) return 'Actual date is required.';
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

    if (submit && plan && plan.planStatus !== 'Approved' && plan.approvalStatus !== 'Approved') {
      const businessErr = 'Teacher diary can be submitted only against an approved lesson plan.';
      setError(businessErr);
      shikshaMitraToast.error({ message: businessErr });
      return;
    }

    setError('');

    // Auto upload remaining staged files on save/submit
    const hasStaged = mockFiles.some((f) => f.status === 'staged' || f.status === 'uploading');
    if (hasStaged) {
      handleStartUpload();
      setTimeout(() => {
        onSave(form, submit);
      }, 1000);
      return;
    }

    onSave(form, submit);
  };

  const tabIcon = (t: TabKey): string => {
    switch (t) {
      case 'Teaching':
        return 'mdi:school-outline';
      case 'Reflection':
        return 'mdi:thought-bubble-outline';
      case 'Evidence':
        return 'mdi:paperclip';

      default:
        return 'mdi:circle-outline';
    }
  };

  const sectionHeader = (icon: string, label: string) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={16} sx={{ color: 'text.disabled' }} />
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
        {label}
      </Typography>
    </Stack>
  );

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

  const isEvidenceComplete = mockFiles.some(
    (f) => f.status === 'uploaded' || f.status === 'staged'
  );

  return (
    <>
      <CustomDialog
        open={open}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {existingDiary ? 'Edit Teacher Diary' : 'Submit Teacher Diary'}
            </Typography>
            {form.isBackdated && (
              <Label color="warning" variant="soft" startIcon={<Iconify icon="mdi:history" />}>
                Backdated
              </Label>
            )}
          </Stack>
        }
        maxWidth="md"
        handleClose={onClose}
      >
        {/* Streamlined Plan Context Summary */}
        {plan && (
          <Box
            sx={{
              px: 3,
              py: 1.25,
              bgcolor: 'background.neutral',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" useFlexGap>
              <Typography variant="caption">
                <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  Class:
                </Box>
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {plan.className}-{plan.divisionName}
                </Box>
              </Typography>

              <Typography variant="caption">
                <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  Subject:
                </Box>
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {plan.subjectName}
                </Box>
              </Typography>

              <Typography variant="caption">
                <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  Chapter:
                </Box>
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {plan.chapterName}
                </Box>
              </Typography>

              <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>
                <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  Planned Topic:
                </Box>
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {plan.topic}
                </Box>
              </Typography>

              <Label
                color="primary"
                variant="soft"
                sx={{ height: 22, px: 1, fontWeight: 700, fontSize: '0.6875rem' }}
              >
                Planned: {plan.plannedCompletionPercentage}%
              </Label>
            </Stack>
          </Box>
        )}

        {/* Professional Stepper Tab Navigation Bar */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
            {TABS.map((t, idx) => {
              const stepNum = idx + 1;
              const isActive = tab === t;
              const isCompleted =
                t === 'Teaching'
                  ? isTeachingComplete
                  : t === 'Reflection'
                    ? isReflectionComplete
                    : isEvidenceComplete;

              return (
                <Box
                  key={t}
                  onClick={() => setTab(t)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: isActive ? 'primary.main' : 'divider',
                    bgcolor: isActive
                      ? (theme) =>
                          alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.16 : 0.08
                          )
                      : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: isActive ? '0px 2px 6px rgba(0,0,0,0.04)' : 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.12 : 0.04
                        ),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: isCompleted
                        ? 'success.main'
                        : isActive
                          ? 'primary.main'
                          : (theme) => alpha(theme.palette.text.primary, 0.12),
                      color: isCompleted || isActive ? '#fff' : 'text.primary',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? <Iconify icon="mdi:check" width={16} /> : stepNum}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? 'primary.main' : 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {t}
                      </Typography>
                      {isCompleted && (
                        <Iconify
                          icon="mdi:check-circle"
                          width={14}
                          sx={{ color: 'success.main' }}
                        />
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.6875rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t === 'Teaching' && 'Coverage & method'}
                      {t === 'Reflection' && 'Notes & feedback'}
                      {t === 'Evidence' && 'Photos & files'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <DialogScrollContent>
          <Stack spacing={1}>
            {error && (
              <Alert severity="error" icon={<Iconify icon="mdi:alert-circle-outline" />}>
                {error}
              </Alert>
            )}

            {/* Diary Quality Score */}
            {(() => {
              const tone = qualityScore >= 70 ? 'success' : 'warning';
              return (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette[tone].main, 0.24),
                    bgcolor: (theme) => alpha(theme.palette[tone].main, 0.08),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:chart-donut" width={16} sx={{ color: `${tone}.main` }} />
                      <Typography variant="caption" fontWeight={600} color="text.primary">
                        Diary Quality Score
                      </Typography>
                    </Stack>
                    <Label color={tone} variant="soft">
                      {qualityScore}%{qualityScore < 50 && ' — Needs Improvement'}
                      {qualityScore >= 50 && qualityScore < 75 && ' — Good'}
                      {qualityScore >= 75 && ' — Excellent'}
                    </Label>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={qualityScore}
                    color={tone}
                    sx={{ mt: 1, borderRadius: 1, height: 6 }}
                  />
                </Box>
              );
            })()}

            {tab === 'Teaching' && (
              <>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={1}>
                    {sectionHeader('mdi:calendar-check-outline', 'Class Status')}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                      <DatePicker
                        label="Actual Date *"
                        value={form.actualDate}
                        onChange={(v) => set('actualDate', v)}
                        slotProps={{ textField: { size: 'small', sx: { maxWidth: 200 } } }}
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
                  </Stack>
                </Box>

                {form.classConducted ? (
                  <>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack spacing={1}>
                        {sectionHeader('mdi:book-open-variant', 'Lesson Coverage')}
                        <TextField
                          size="small"
                          label="Actual Topic Covered *"
                          value={form.actualTopicCovered}
                          onChange={(e) => set('actualTopicCovered', e.target.value)}
                          fullWidth
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" color="text.secondary">
                                Actual Completion
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {form.actualCompletionPercentage}%
                              </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={form.actualCompletionPercentage}
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                              <TextField
                                size="small"
                                type="number"
                                value={form.actualCompletionPercentage}
                                onChange={(e) =>
                                  set('actualCompletionPercentage', Number(e.target.value))
                                }
                                inputProps={{ min: 0, max: 100, style: { width: 60 } }}
                              />
                            </Box>
                          </Box>
                          <CustomSelect
                            label="Teaching Method Used"
                            options={teachingMethodOptions}
                            value={form.teachingMethodUsed}
                            onChange={(v) => set('teachingMethodUsed', v as string)}
                            formControlProps={{ sx: { flex: 1 } }}
                          />
                        </Stack>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack spacing={1}>
                        {sectionHeader('mdi:account-group-outline', 'Classroom Feedback')}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <CustomSelect
                            label="Class Understanding Level"
                            options={understandingLevelOptions}
                            value={form.classUnderstandingLevel}
                            onChange={(v) =>
                              set('classUnderstandingLevel', v as UnderstandingLevel)
                            }
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
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          alignItems="center"
                        >
                          <TextField
                            size="small"
                            label="Homework Assigned"
                            value={form.homeworkAssigned}
                            onChange={(e) => set('homeworkAssigned', e.target.value)}
                            fullWidth
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={form.needRevision}
                                onChange={(e) => set('needRevision', e.target.checked)}
                              />
                            }
                            label="Needs Revision"
                            sx={{ whiteSpace: 'nowrap' }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Stack spacing={1}>
                      <Alert severity="warning" icon={<Iconify icon="mdi:alert-outline" />}>
                        Class not conducted. Please provide a reason and reschedule date if needed.
                      </Alert>
                      <CustomSelect
                        label="Missed Reason *"
                        options={missedReasonOptions}
                        value={form.missedReason}
                        onChange={(v) => set('missedReason', v as MissedReason)}
                        formControlProps={{ sx: { maxWidth: 320 } }}
                      />
                      <DatePicker
                        label="Rescheduled To"
                        value={form.rescheduledToDate}
                        onChange={(v) => set('rescheduledToDate', v)}
                        slotProps={{ textField: { size: 'small', sx: { maxWidth: 220 } } }}
                      />
                    </Stack>
                  </Box>
                )}
              </>
            )}

            {tab === 'Reflection' && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={1}>
                  {sectionHeader('mdi:thought-bubble-outline', 'Teacher Reflection')}
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
                  <TextField
                    size="small"
                    label="Students Needing Support"
                    value={form.studentsNeedingSupport}
                    onChange={(e) => set('studentsNeedingSupport', e.target.value)}
                    fullWidth
                    placeholder="Names or roll numbers of students who need extra attention"
                  />
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
              </Box>
            )}

            {tab === 'Evidence' && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {sectionHeader('mdi:paperclip', 'Supporting Evidence')}
                    <Stack direction="row" spacing={1}>
                      {mockFiles.some((f) => f.status === 'staged') && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={handleClearStaged}
                          >
                            Clear Staged
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mdi:cloud-upload-outline" />}
                            onClick={() => handleStartUpload()}
                          >
                            Upload Selected ({mockFiles.filter((f) => f.status === 'staged').length}
                            )
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  <Alert severity="info" icon={<Iconify icon="mdi:information-outline" />}>
                    Select or drop classroom evidence files to stage them locally. Choose the file
                    type before uploading.
                  </Alert>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={handleSelectActualFiles}
                  />

                  {/* Dropzone */}
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
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
                        handleSelectActualFiles({ target: { files: e.dataTransfer.files } } as any);
                      }
                    }}
                  >
                    <Iconify
                      icon="mdi:cloud-upload-outline"
                      width={36}
                      sx={{ color: 'primary.main', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                      Click or drag files to select evidence (Images, PDF, Worksheets)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Files from your computer will be staged locally for type tagging before
                      uploading. Max 10 MB each.
                    </Typography>
                  </Box>

                  {/* Staged & Uploaded File List */}
                  {mockFiles.length > 0 && (
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                      >
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
                                borderColor:
                                  file.status === 'uploaded'
                                    ? (theme) => alpha(theme.palette.success.main, 0.3)
                                    : file.status === 'uploading'
                                      ? (theme) => alpha(theme.palette.warning.main, 0.3)
                                      : 'divider',
                                bgcolor: (theme) =>
                                  file.status === 'uploaded'
                                    ? alpha(theme.palette.success.main, 0.04)
                                    : file.status === 'uploading'
                                      ? alpha(theme.palette.warning.main, 0.04)
                                      : 'background.neutral',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Stack spacing={1}>
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
                                              ? 'mdi:file-pdf-box'
                                              : isPhoto
                                                ? 'mdi:file-image-outline'
                                                : 'mdi:file-document-outline'
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

                                  {/* File Type Tag Selector */}
                                  <CustomSelect
                                    label="Type"
                                    options={evidenceTypeOptions}
                                    value={file.type}
                                    onChange={(val) => handleFileTypeChange(file.id, val as string)}
                                    disabled={file.status === 'uploading'}
                                    formControlProps={{ sx: { minWidth: 160 } }}
                                  />

                                  {/* Status Label */}
                                  {file.status === 'staged' && (
                                    <Label
                                      color="info"
                                      variant="soft"
                                      startIcon={<Iconify icon="mdi:clock-outline" />}
                                    >
                                      Staged
                                    </Label>
                                  )}
                                  {file.status === 'uploading' && (
                                    <Label color="warning" variant="soft">
                                      Uploading {file.progress}%
                                    </Label>
                                  )}
                                  {file.status === 'uploaded' && (
                                    <Label
                                      color="success"
                                      variant="soft"
                                      startIcon={<Iconify icon="mdi:check-circle" />}
                                    >
                                      Uploaded
                                    </Label>
                                  )}
                                  {file.status === 'failed' && (
                                    <Label
                                      color="error"
                                      variant="soft"
                                      startIcon={<Iconify icon="mdi:alert-circle" />}
                                    >
                                      Failed
                                    </Label>
                                  )}

                                  {/* Item Actions */}
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
                                      <Iconify icon="mdi:eye-outline" />
                                    </IconButton>
                                    {file.status === 'staged' && (
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        title="Upload File"
                                        onClick={() => handleStartUpload(file.id)}
                                      >
                                        <Iconify icon="mdi:cloud-upload-outline" />
                                      </IconButton>
                                    )}
                                    {file.status === 'failed' && (
                                      <Button
                                        size="small"
                                        color="warning"
                                        onClick={() => handleStartUpload(file.id)}
                                      >
                                        Retry
                                      </Button>
                                    )}
                                    <IconButton
                                      size="small"
                                      color="default"
                                      title="Remove"
                                      onClick={() => handleRemoveFile(file.id)}
                                    >
                                      <Iconify icon="mdi:close" />
                                    </IconButton>
                                  </Stack>
                                </Stack>

                                {/* Progress bar when uploading */}
                                {file.status === 'uploading' && (
                                  <LinearProgress
                                    variant="determinate"
                                    value={file.progress}
                                    color="warning"
                                    sx={{ height: 4, borderRadius: 1 }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          );
                        })}
                      </List>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogScrollContent>

        <Divider />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, bgcolor: 'background.paper' }}
        >
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
              variant="text"
              color="inherit"
              startIcon={<Iconify icon="mdi:close" />}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="mdi:content-save-outline" />}
              onClick={() => handleSave(false)}
            >
              Save Draft
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              loading={loading}
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              onClick={() => handleSave(true)}
            >
              Submit Diary
            </LoadingButton>
          </Stack>
        </Stack>
      </CustomDialog>
      {/* File Preview Lightbox Dialog */}
      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Iconify
              icon="mdi:file-eye-outline"
              width={22}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            />
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {previewFile?.name}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setPreviewFile(null)}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, textAlign: 'center', bgcolor: 'background.neutral' }}>
          {previewFile?.previewUrl ? (
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
            <Box
              sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
            >
              <Iconify
                icon="mdi:file-document-outline"
                width={56}
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {previewFile?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {previewFile?.size}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
          <Label color="primary" variant="soft">
            Type: {previewFile?.type}
          </Label>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => setPreviewFile(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmitDiaryModal;
