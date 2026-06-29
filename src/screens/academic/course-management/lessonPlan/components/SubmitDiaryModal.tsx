'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
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
  lessonPlanId: plan.id,
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
  onClose: () => void;
  onSave: (form: DiaryFormState, submit: boolean) => void;
  onAiSummary?: () => void;
};

const TABS = ['Teaching', 'Reflection', 'Evidence', 'Settings'] as const;
type TabKey = (typeof TABS)[number];

const SubmitDiaryModal = ({
  open,
  plan,
  existingDiary,
  allowBackdated = true,
  maxBackdateDays = 3,
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
      title={existingDiary ? 'Edit Teacher Diary' : 'Submit Teacher Diary'}
      maxWidth="md"
      handleClose={onClose}
    >
      {/* Plan context banner */}
      {plan && (
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              <strong>Class:</strong> {plan.className}-{plan.divisionName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Subject:</strong> {plan.subjectName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Chapter:</strong> {plan.chapterName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Planned Topic:</strong> {plan.topic}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Planned:</strong> {plan.plannedCompletionPercentage}%
            </Typography>
          </Stack>
        </Box>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tab key={t} label={t} value={t} />
        ))}
      </Tabs>

      <DialogScrollContent>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Diary Quality Score */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: qualityScore >= 70 ? 'success.lighter' : 'warning.lighter',
              borderRadius: 1,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight={600}>
                Diary Quality Score
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {qualityScore}%{qualityScore < 50 && ' — Needs Improvement'}
                {qualityScore >= 50 && qualityScore < 75 && ' — Good'}
                {qualityScore >= 75 && ' — Excellent'}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={qualityScore}
              color={qualityScore >= 70 ? 'success' : 'warning'}
              sx={{ mt: 0.5, borderRadius: 1, height: 6 }}
            />
          </Box>

          {tab === 'Teaching' && (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
                {form.isBackdated && (
                  <Label color="warning" variant="soft">
                    Backdated Entry
                  </Label>
                )}
              </Stack>

              {form.classConducted ? (
                <>
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
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Actual Completion: {form.actualCompletionPercentage}%
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                    />
                  </Stack>
                </>
              ) : (
                <Stack spacing={2}>
                  <Alert severity="warning">
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
              )}
            </>
          )}

          {tab === 'Reflection' && (
            <>
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
            </>
          )}

          {tab === 'Evidence' && (
            <>
              <Alert severity="info">
                Upload classroom evidence to support your diary entry. Supported: photos, PDF,
                worksheets.
              </Alert>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={handleMockFileUpload}
              >
                <Iconify
                  icon="mdi:cloud-upload-outline"
                  width={40}
                  sx={{ color: 'text.secondary', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
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
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <Iconify icon="mdi:file-image-outline" />
                      <Typography variant="body2" sx={{ flex: 1 }}>
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
            </>
          )}

          {tab === 'Settings' && (
            <>
              {allowBackdated && (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isBackdated}
                        onChange={(e) => set('isBackdated', e.target.checked)}
                      />
                    }
                    label={`Backdated Entry (max ${maxBackdateDays} days)`}
                  />
                  {form.isBackdated && (
                    <TextField
                      size="small"
                      label="Backdated Reason *"
                      value={form.backdatedReason}
                      onChange={(e) => set('backdatedReason', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  )}
                </>
              )}
            </>
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
        {onAiSummary && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<Iconify icon="mdi:robot-outline" />}
            onClick={onAiSummary}
          >
            AI Summary
          </Button>
        )}
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => handleSave(false)}>
            Save Draft
          </Button>
          <Button variant="contained" onClick={() => handleSave(true)}>
            Submit & Update Progress
          </Button>
        </Stack>
      </Stack>
    </CustomDialog>
  );
};

export default SubmitDiaryModal;
