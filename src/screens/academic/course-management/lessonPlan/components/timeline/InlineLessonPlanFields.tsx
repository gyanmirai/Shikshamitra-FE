import type { RefObject } from 'react';
import type { FormikProps } from 'formik';

import { Box, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { LessonPlanTextInput } from '../LessonPlanTextInput';
import { ChapterCompletionSlider } from '../ChapterCompletionSlider';

import type { InlineLessonPlanValues } from '../../inlineLessonPlanForm';

type CompletionState = {
  target: number;
  minimum: number;
  ready: boolean;
  loading: boolean;
  error: string;
  retry: () => void;
};

type Props = {
  formik: FormikProps<InlineLessonPlanValues>;
  completion: CompletionState;
  chapterOptions: { value: string; label: string }[];
  chapterInputRef: RefObject<HTMLInputElement | null>;
  topicInputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  isLoadingChapters: boolean;
  onChapterChange: (chapterId: string) => void;
};

export function InlineLessonPlanFields({
  formik,
  completion,
  chapterOptions,
  chapterInputRef,
  topicInputRef,
  isLoadingChapters,
  onChapterChange,
}: Props) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(240px, 0.8fr) 1.2fr' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <CustomSelect
          label="Chapter *"
          value={formik.values.chapterId}
          options={chapterOptions}
          onChange={(value) => {
            formik.setFieldError('chapterId', undefined);
            formik.setFieldError('chapterName', undefined);
            onChapterChange(String(value));
          }}
          onBlur={formik.handleBlur}
          inputRef={chapterInputRef}
          isLoading={isLoadingChapters}
          disabled={formik.isSubmitting}
          error={formik.touched.chapterId && Boolean(formik.errors.chapterId)}
          helperText={formik.touched.chapterId ? formik.errors.chapterId : undefined}
          noOptionsMessage="No chapters are available for this class and subject."
        />

        <LessonPlanTextInput
          field="topic"
          value={formik.values.topic}
          onChange={(value) => {
            formik.setFieldError('topic', undefined);
            formik.setFieldValue('topic', value);
          }}
          onBlur={formik.handleBlur}
          inputRef={topicInputRef}
          disabled={formik.isSubmitting}
          error={formik.touched.topic ? formik.errors.topic : undefined}
        />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        {formik.values.chapterId ? (
          <ChapterCompletionSlider
            value={completion.target}
            minimum={completion.minimum}
            loading={completion.loading}
            error={completion.error}
            disabled={formik.isSubmitting || !completion.ready}
            onRetry={completion.retry}
            onChange={(value) => {
              formik.setFieldValue('plannedCompletionPercentage', value);
            }}
          />
        ) : (
          <Box
            sx={{
              p: 1.5,
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Select a chapter to set its target completion percentage.
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
