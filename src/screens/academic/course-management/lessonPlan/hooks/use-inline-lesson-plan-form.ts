'use client';

import type { FormEvent } from 'react';
import type { FormikErrors } from 'formik';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { getLessonPlanTextApiErrors } from '../lessonPlanApiErrors';
import { useLessonPlanCompletion } from './use-lesson-plan-completion';
import {
  buildInlineLessonPlanForm,
  getInlineLessonContextError,
  getInlineLessonDuplicateError,
  inlineLessonPlanValidationSchema,
} from '../inlineLessonPlanForm';

import type {
  InlineLessonChapter,
  InlineLessonPlanValues,
  UseInlineLessonPlanFormProps,
} from '../inlineLessonPlanForm';

export function useInlineLessonPlanForm({
  context,
  selectedDate,
  lessonPlans,
  onSave,
  onCreated,
}: UseInlineLessonPlanFormProps) {
  const [formError, setFormError] = useState('');
  const chapterInputRef = useRef<HTMLInputElement>(null);
  const topicInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const { data: chapterData, isLoading: isLoadingChapters } = useGetChaptersByStandardQuery(
    { standardId: context.standardId || '', subjectId: context.subjectId || '' },
    { skip: !context.standardId || !context.subjectId }
  );
  const chapters = (chapterData ?? []) as InlineLessonChapter[];

  const formik = useFormik<InlineLessonPlanValues>({
    initialValues: {
      chapterId: '',
      chapterName: '',
      topic: '',
      plannedCompletionPercentage: 0,
    },
    validationSchema: inlineLessonPlanValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setFormError('');
      const contextError = getInlineLessonContextError(context);
      if (contextError) {
        setFormError(contextError);
        return;
      }
      if (!completion.ready) {
        setFormError(completion.error || 'Wait for the recorded chapter progress to load.');
        return;
      }
      const duplicateError = getInlineLessonDuplicateError(
        context,
        selectedDate,
        values.topic,
        lessonPlans
      );
      if (duplicateError?.field === 'topic') {
        formik.setFieldError('topic', duplicateError.message);
        topicInputRef.current?.focus();
        return;
      }
      if (duplicateError) {
        setFormError(duplicateError.message);
        return;
      }
      try {
        await onSave(
          buildInlineLessonPlanForm(context, selectedDate, values, completion.target),
          false
        );
        onCreated();
      } catch (error) {
        const fieldErrors = getLessonPlanTextApiErrors(error);
        if (fieldErrors.topic) formik.setFieldError('topic', fieldErrors.topic);
        setFormError(
          fieldErrors.topic
            ? 'Correct the highlighted field and try again.'
            : parseApiProblemDetail(error).detail
        );
      }
    },
  });

  const completion = useLessonPlanCompletion(
    true,
    { ...context, chapterId: formik.values.chapterId },
    formik.values.plannedCompletionPercentage
  );

  useEffect(() => {
    if (formError) errorRef.current?.focus();
  }, [formError]);

  const handleChapterChange = (chapterId: string) => {
    const chapter = chapters.find((item) => item.id === chapterId);
    formik.setFieldValue('chapterId', chapterId);
    formik.setFieldValue('chapterName', chapter?.chapterName || chapter?.name || '');
    formik.setFieldValue('plannedCompletionPercentage', 0);
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FormikErrors<InlineLessonPlanValues> = await formik.validateForm();
    if (Object.keys(errors).length) {
      await formik.setTouched({
        chapterId: true,
        chapterName: true,
        topic: true,
        plannedCompletionPercentage: true,
      });
      (errors.chapterId ? chapterInputRef.current : topicInputRef.current)?.focus();
      return;
    }
    await formik.submitForm();
  };

  return {
    formik,
    completion,
    formError,
    errorRef,
    chapterInputRef,
    topicInputRef,
    isLoadingChapters,
    chapterOptions: chapters.map((chapter) => ({
      value: chapter.id,
      label: chapter.chapterName || chapter.name || 'Untitled chapter',
    })),
    handleChapterChange,
    handleSubmit,
  };
}
