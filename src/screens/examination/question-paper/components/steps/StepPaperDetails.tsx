'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { CreationMode } from '../../types';

export interface PaperDetailsFormValues {
  academicYearId: string;
  paperTitle: string;
  standardId: string;
  subjectId: string;
  examId: string;
  totalMarks: number;
  durationMinutes: number;
  creationMode: CreationMode;
  generalInstructions: string;
}

interface StepPaperDetailsProps {
  formik: FormikProps<PaperDetailsFormValues>;
  classOptions: { value: string; label: string }[];
  subjectOptions: { value: string; label: string }[];
  examOptions: { value: string; label: string }[];
  isSubjectLoading?: boolean;
  isExamLoading?: boolean;
  academicYearLabel?: string;
  readOnly?: boolean;
  paperTitleValidationAttempted: boolean;
}

export default function StepPaperDetails({
  formik,
  classOptions,
  subjectOptions,
  examOptions,
  isSubjectLoading = false,
  isExamLoading = false,
  academicYearLabel,
  readOnly = false,
  paperTitleValidationAttempted,
}: StepPaperDetailsProps) {
  const showError = (field: keyof PaperDetailsFormValues) =>
    (field === 'paperTitle'
      ? paperTitleValidationAttempted
      : formik.touched[field] || formik.submitCount > 0) && Boolean(formik.errors[field]);

  return (
    <Stack spacing={3} sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5">Paper Details</Typography>
          <Typography variant="body2" color="text.secondary">
            Define the fundamental attributes of this question paper.
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {academicYearLabel || 'Academic Year'}
          </Typography>
        </Box>
      </Box>

      <SectionCard title="Basic Information">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="flex-start"
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 2, minWidth: 200, width: { xs: '100%', md: 'auto' } }}>
            <ShakingTextField error={showError('paperTitle')}>
              <LanguageInputField
                fullWidth
                size="small"
                label="Paper Name *"
                name="paperTitle"
                placeholder="e.g. Mid-Term Mathematics Examination"
                value={formik.values.paperTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={readOnly}
                error={showError('paperTitle')}
                helperText={
                  (showError('paperTitle') && formik.errors.paperTitle) ||
                  'A clear name helps reviewers identify this paper.'
                }
              />
            </ShakingTextField>
          </Box>

          <Box sx={{ flex: 1.1, minWidth: 140, width: { xs: '100%', md: 'auto' } }}>
            <ShakingTextField error={showError('standardId')}>
              <CustomSelect
                label="Class *"
                options={classOptions}
                value={formik.values.standardId}
                disabled={readOnly}
                onChange={(val) => {
                  formik.setFieldValue('standardId', val);
                  formik.setFieldValue('subjectId', '');
                  formik.setFieldValue('examId', '');
                }}
                error={showError('standardId')}
                helperText={showError('standardId') ? String(formik.errors.standardId) : ''}
              />
            </ShakingTextField>
          </Box>

          <Box sx={{ flex: 1.1, minWidth: 140, width: { xs: '100%', md: 'auto' } }}>
            <ShakingTextField error={showError('subjectId')}>
              <CustomSelect
                label="Subject *"
                options={formik.values.standardId ? subjectOptions : []}
                value={formik.values.subjectId}
                disabled={readOnly || !formik.values.standardId || isSubjectLoading}
                isLoading={isSubjectLoading}
                onChange={(val) => {
                  formik.setFieldValue('subjectId', val);
                  formik.setFieldValue('examId', '');
                }}
                error={showError('subjectId')}
                helperText={
                  showError('subjectId')
                    ? 'Please select a Subject.'
                    : !formik.values.standardId
                      ? 'Select a class first.'
                      : ''
                }
              />
            </ShakingTextField>
          </Box>

          <Box sx={{ flex: 1.3, minWidth: 160, width: { xs: '100%', md: 'auto' } }}>
            <CustomSelect
              label="Exam (optional)"
              options={examOptions}
              value={formik.values.examId}
              disabled={readOnly || isExamLoading}
              isLoading={isExamLoading}
              onChange={(val) => formik.setFieldValue('examId', val as string)}
            />
          </Box>
        </Stack>
      </SectionCard>

      <SectionCard title="Paper Settings">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="flex-start"
          sx={{ width: '100%' }}
        >
          <Box sx={{ width: { xs: '100%', md: 140 }, flexShrink: 0 }}>
            <ShakingTextField error={showError('totalMarks')}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Total Marks *"
                placeholder="e.g. 80"
                name="totalMarks"
                value={formik.values.totalMarks}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={readOnly}
                error={showError('totalMarks')}
                helperText={(showError('totalMarks') && formik.errors.totalMarks) || ''}
                inputProps={{ min: 1, max: 1000 }}
              />
            </ShakingTextField>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 170 }, flexShrink: 0 }}>
            <ShakingTextField error={showError('durationMinutes')}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Duration (minutes) *"
                placeholder="e.g. 180"
                name="durationMinutes"
                value={formik.values.durationMinutes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={readOnly}
                error={showError('durationMinutes')}
                helperText={
                  (showError('durationMinutes') && formik.errors.durationMinutes) ||
                  'e.g. 180 minutes'
                }
                inputProps={{ min: 10, max: 480 }}
              />
            </ShakingTextField>
          </Box>

          <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
            <ShakingTextField error={showError('generalInstructions')}>
              <LanguageInputField
                fullWidth
                size="small"
                label="General Instructions (Optional)"
                name="generalInstructions"
                value={formik.values.generalInstructions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={readOnly}
                error={showError('generalInstructions')}
                placeholder="Mention any specific exam day rules or formatting instructions."
              />
            </ShakingTextField>
          </Box>
        </Stack>
      </SectionCard>

      <Box sx={{ mt: 3, p: 2.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          What happens next?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          In the next step, <strong>Paper Pattern</strong>, you will define sections, allocate
          marks, and choose the question types (e.g., MCQs, Subjective). The total marks must match{' '}
          <strong>{formik.values.totalMarks || 'the total marks'}</strong> you specified above.
        </Typography>
      </Box>
    </Stack>
  );
}
