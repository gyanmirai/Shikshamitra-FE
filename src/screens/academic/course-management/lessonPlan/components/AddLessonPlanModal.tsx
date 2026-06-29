'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Slider,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  todayIso,
  classOptions,
  periodOptions,
  teacherOptions,
  subjectOptions,
  chapterOptions,
  divisionOptions,
  lessonPlanTemplates,
  teachingMethodOptions,
} from '../lessonPlanData';

import type { LessonSource, LessonPlanRow } from '../lessonPlanData';

export type LessonFormState = {
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
  template: string;
  source: LessonSource;
};

const defaultForm: LessonFormState = {
  academicYear: '2026-27',
  teacherName: '',
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
  onClose: () => void;
  onSave: (form: LessonFormState, submitAfterSave: boolean) => void;
  onAiGenerate?: () => void;
};

const AddLessonPlanModal = ({
  open,
  editData,
  prefillDate,
  onClose,
  onSave,
  onAiGenerate,
}: Props) => {
  const [form, setForm] = useState<LessonFormState>(() => {
    if (editData) {
      return {
        id: editData.id,
        academicYear: editData.academicYear,
        teacherName: editData.teacherName,
        className: editData.className,
        divisionName: editData.divisionName,
        subjectName: editData.subjectName,
        chapterName: editData.chapterName,
        plannedDate: dayjs(editData.plannedDate),
        period: editData.period,
        topic: editData.topic,
        learningObjective: editData.learningObjective,
        teachingMethod: editData.teachingMethod,
        resourcesRequired: editData.resourcesRequired,
        plannedCompletionPercentage: editData.plannedCompletionPercentage,
        template: '',
        source: editData.source || 'Manual',
      };
    }
    return { ...defaultForm, plannedDate: prefillDate || dayjs(todayIso) };
  });

  const [error, setError] = useState('');

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
    if (!form.className) return 'Class is required.';
    if (!form.divisionName) return 'Division is required.';
    if (!form.subjectName) return 'Subject is required.';
    if (!form.chapterName) return 'Chapter is required.';
    if (!form.plannedDate) return 'Planned date is required.';
    if (!form.period) return 'Period / time is required.';
    if (!form.topic.trim()) return 'Topic is required.';
    if (form.plannedCompletionPercentage < 0 || form.plannedCompletionPercentage > 100)
      return 'Planned completion must be between 0 and 100.';
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

  const aiQualityScore = form.topic && form.learningObjective && form.teachingMethod ? 75 : 0;

  return (
    <CustomDialog
      open={open}
      title={form.id ? 'Edit Lesson Plan' : 'Add Lesson Plan'}
      maxWidth="md"
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Template selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Quick Template
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {lessonPlanTemplates.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  size="small"
                  variant={form.template === t.value ? 'filled' : 'outlined'}
                  color={form.template === t.value ? 'primary' : 'default'}
                  onClick={() => applyTemplate(t.value)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Teacher */}
          <CustomSelect
            label="Teacher"
            options={teacherOptions}
            value={form.teacherName}
            onChange={(v) => set('teacherName', v as string)}
          />

          {/* Class + Division + Subject */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <CustomSelect
              label="Class *"
              options={classOptions}
              value={form.className}
              onChange={(v) => set('className', v as string)}
            />
            <CustomSelect
              label="Division *"
              options={divisionOptions}
              value={form.divisionName}
              onChange={(v) => set('divisionName', v as string)}
            />
            <CustomSelect
              label="Subject *"
              options={subjectOptions}
              value={form.subjectName}
              onChange={(v) => set('subjectName', v as string)}
            />
          </Stack>

          {/* Chapter + Date + Period */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <CustomSelect
              label="Chapter *"
              options={chapterOptions}
              value={form.chapterName}
              onChange={(v) => set('chapterName', v as string)}
            />
            <DatePicker
              label="Planned Date *"
              value={form.plannedDate}
              onChange={(v) => set('plannedDate', v)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <CustomSelect
              label="Period / Time *"
              options={periodOptions}
              value={form.period}
              onChange={(v) => set('period', v as string)}
            />
          </Stack>

          {/* Topic */}
          <TextField
            size="small"
            label="Topic *"
            value={form.topic}
            onChange={(e) => set('topic', e.target.value)}
            fullWidth
            placeholder="e.g. Addition of Fractions"
          />

          {/* Learning Objective */}
          <TextField
            size="small"
            label="Learning Objective"
            value={form.learningObjective}
            onChange={(e) => set('learningObjective', e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Students will be able to..."
          />

          {/* Teaching Method + Planned % */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <CustomSelect
              label="Teaching Method"
              options={teachingMethodOptions}
              value={form.teachingMethod}
              onChange={(v) => set('teachingMethod', v as string)}
              formControlProps={{ sx: { flex: 1 } }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Planned Completion: {form.plannedCompletionPercentage}%
              </Typography>
              <Slider
                min={0}
                max={100}
                step={5}
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

          {/* Resources */}
          <TextField
            size="small"
            label="Resources Required"
            value={form.resourcesRequired}
            onChange={(e) => set('resourcesRequired', e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Textbook, worksheet, projector..."
          />

          {/* AI Quality Preview */}
          {aiQualityScore > 0 && (
            <Box sx={{ p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" color="primary.dark" fontWeight={600}>
                  AI Lesson Plan Quality Preview
                </Typography>
                <Typography variant="caption" color="primary.dark" fontWeight={700}>
                  {aiQualityScore}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={aiQualityScore}
                sx={{ borderRadius: 1, height: 6 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
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
        {onAiGenerate && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<Iconify icon="mdi:robot-outline" />}
            onClick={onAiGenerate}
          >
            AI Generate
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
            Submit Plan
          </Button>
        </Stack>
      </Stack>
    </CustomDialog>
  );
};

export default AddLessonPlanModal;
export type { LessonFormState };
