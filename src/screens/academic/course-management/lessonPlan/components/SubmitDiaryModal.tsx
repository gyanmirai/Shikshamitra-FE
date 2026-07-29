'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
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

  const [error, setError] = useState('');
  const [mockFiles, setMockFiles] = useState<{ name: string; type: string }[]>([]);

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
      return;
    }
    setError('');
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

  const handleMockFileUpload = () => {
    setMockFiles((prev) => [...prev, { name: `evidence-${Date.now()}.jpg`, type: 'ClassPhoto' }]);
  };

  return (
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
      {/* Plan context banner */}
      {plan && (
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: 'background.neutral',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Iconify icon="mdi:google-classroom" width={16} sx={{ color: 'primary.main' }} />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                Class: {plan.className}-{plan.divisionName}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Iconify icon="mdi:book-outline" width={16} sx={{ color: 'secondary.main' }} />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                Subject: {plan.subjectName}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Iconify
                icon="mdi:book-open-page-variant-outline"
                width={16}
                sx={{ color: 'info.main' }}
              />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                Chapter: {plan.chapterName}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Iconify icon="mdi:target" width={16} sx={{ color: 'warning.main' }} />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                Planned Topic: {plan.topic}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Iconify icon="mdi:percent-outline" width={16} sx={{ color: 'primary.main' }} />
              <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 700 }}>
                Planned: {plan.plannedCompletionPercentage}%
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="standard"
        scrollButtons={false}
        sx={{
          px: 3,
          pt: 1.5,
          pb: 1.5,
          height: 100,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTabs-scrollButtons': {
            display: 'none !important',
          },
        }}
      >
        {TABS.map((t) => (
          <Tab
            key={t}
            label={t}
            value={t}
            icon={<Iconify icon={tabIcon(t)} width={18} />}
            iconPosition="start"
          />
        ))}
      </Tabs>

      <DialogScrollContent>
        <Stack spacing={1}>
          {error && (
            <Alert severity="error" icon={<Iconify icon="mdi:alert-circle-outline" />}>
              {error}
            </Alert>
          )}

          {/* Diary Quality Score */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: qualityScore >= 70 ? 'success.lighter' : 'warning.lighter',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: qualityScore >= 70 ? 'success.light' : 'warning.light',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify
                  icon="mdi:chart-donut"
                  width={16}
                  sx={{ color: qualityScore >= 70 ? 'success.dark' : 'warning.dark' }}
                />
                <Typography variant="caption" fontWeight={600}>
                  Diary Quality Score
                </Typography>
              </Stack>
              <Label color={qualityScore >= 70 ? 'success' : 'warning'} variant="soft">
                {qualityScore}%{qualityScore < 50 && ' — Needs Improvement'}
                {qualityScore >= 50 && qualityScore < 75 && ' — Good'}
                {qualityScore >= 75 && ' — Excellent'}
              </Label>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={qualityScore}
              color={qualityScore >= 70 ? 'success' : 'warning'}
              sx={{ mt: 1, borderRadius: 1, height: 6 }}
            />
          </Box>

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
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
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
              <Stack spacing={1}>
                {sectionHeader('mdi:paperclip', 'Supporting Evidence')}
                <Alert severity="info" icon={<Iconify icon="mdi:information-outline" />}>
                  Upload classroom evidence to support your diary entry. Supported: photos, PDF,
                  worksheets.
                </Alert>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'background.neutral',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                  }}
                  onClick={handleMockFileUpload}
                >
                  <Iconify
                    icon="mdi:cloud-upload-outline"
                    width={40}
                    sx={{ color: 'primary.main', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Click to upload evidence (class photo, board work, worksheet, PDF)
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Supported: JPG, PNG, PDF, MP4 (max 10 MB each)
                  </Typography>
                </Box>
                {mockFiles.length > 0 && (
                  <List dense>
                    {mockFiles.map((file, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: 'background.neutral',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1,
                        }}
                      >
                        <Iconify icon="mdi:file-image-outline" sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                          {file.name}
                        </Typography>
                        <CustomSelect
                          label="Type"
                          options={evidenceTypeOptions}
                          value={file.type}
                          onChange={() => {}}
                          formControlProps={{ sx: { minWidth: 160 } }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setMockFiles((p) => p.filter((_, j) => j !== i))}
                        >
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </Box>
                    ))}
                  </List>
                )}
              </Stack>
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
        <Box />
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
  );
};

export default SubmitDiaryModal;
