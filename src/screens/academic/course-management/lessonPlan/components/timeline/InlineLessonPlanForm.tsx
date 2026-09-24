'use client';

import type { Dayjs } from 'dayjs';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Button, Divider, Typography } from '@mui/material';

import { InlineLessonPlanFields } from './InlineLessonPlanFields';
import { useInlineLessonPlanForm } from '../../hooks/use-inline-lesson-plan-form';

import type { LessonPlanRow } from '../../lessonPlanData';
import type { LessonFormState } from '../AddLessonPlanModal';
import type { InlineLessonPlanContext } from '../../inlineLessonPlanForm';

type Props = {
  context: InlineLessonPlanContext;
  selectedDate: Dayjs;
  lessonPlans: LessonPlanRow[];
  onCancel: () => void;
  onSave: (form: LessonFormState, submitAfterSave: boolean) => void | Promise<void>;
};

export function InlineLessonPlanForm({
  context,
  selectedDate,
  lessonPlans,
  onCancel,
  onSave,
}: Props) {
  const {
    formik,
    completion,
    formError,
    errorRef,
    chapterInputRef,
    topicInputRef,
    chapterOptions,
    isLoadingChapters,
    handleChapterChange,
    handleSubmit,
  } = useInlineLessonPlanForm({
    context,
    selectedDate,
    lessonPlans,
    onSave,
    onCreated: onCancel,
  });

  const cancelCreation = () => {
    formik.resetForm();
    onCancel();
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1.5 }}>
      <Divider sx={{ mb: 1.5 }} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={0.5}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Create lesson plan
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Choose the lesson content and save it as a draft for this period.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
          <Iconify icon="solar:info-circle-linear" width={16} />
          <Typography variant="caption">All fields marked * are required</Typography>
        </Stack>
      </Stack>

      {formError && (
        <Alert ref={errorRef} tabIndex={-1} severity="error" sx={{ mb: 1.5 }}>
          {formError}
        </Alert>
      )}

      <InlineLessonPlanFields
        formik={formik}
        completion={completion}
        chapterOptions={chapterOptions}
        chapterInputRef={chapterInputRef}
        topicInputRef={topicInputRef}
        isLoadingChapters={isLoadingChapters}
        onChapterChange={handleChapterChange}
      />

      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="mdi:close" width={18} />}
          onClick={cancelCreation}
          disabled={formik.isSubmitting}
          sx={{ minHeight: 44 }}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={formik.isSubmitting}
          disabled={completion.loading}
          startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
          sx={{ minHeight: 44 }}
        >
          Save plan
        </LoadingButton>
      </Stack>
    </Box>
  );
}
