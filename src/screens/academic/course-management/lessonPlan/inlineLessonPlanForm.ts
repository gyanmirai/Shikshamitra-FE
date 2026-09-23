import type { Dayjs } from 'dayjs';

import * as Yup from 'yup';

import { hasDuplicateLessonSlot, hasDuplicateLessonTopic } from './lessonPlanDuplicateValidation';

import type { LessonPlanRow } from './lessonPlanData';
import type { LessonFormState } from './components/AddLessonPlanModal';
import type { LessonPlanDuplicateCandidate } from './lessonPlanDuplicateValidation';

export type InlineLessonChapter = { id: string; chapterName?: string; name?: string };

export type InlineLessonPlanValues = {
  chapterId: string;
  chapterName: string;
  topic: string;
  plannedCompletionPercentage: number;
};

export type InlineLessonPlanContext = {
  academicYearId?: string;
  academicYearName?: string;
  teacherId?: string;
  teacherName?: string;
  timetableSlotId?: string;
  periodName?: string;
  standardId?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
  subjectId?: string;
  subjectName?: string;
};

export type UseInlineLessonPlanFormProps = {
  context: InlineLessonPlanContext;
  selectedDate: Dayjs;
  lessonPlans: LessonPlanRow[];
  onSave: (form: LessonFormState, submitAfterSave: boolean) => void | Promise<void>;
  onCreated: () => void;
};

export const inlineLessonPlanValidationSchema = Yup.object({
  chapterId: Yup.string().required('Chapter is required.'),
  chapterName: Yup.string().required('Chapter is required.'),
  topic: Yup.string()
    .trim()
    .required('Topic is required.')
    .max(256, 'Topic must be 256 characters or fewer.'),
  plannedCompletionPercentage: Yup.number()
    .min(0, 'Planned completion cannot be below 0%.')
    .max(100, 'Planned completion cannot exceed 100%.'),
});

export const getInlineLessonContextError = (context: InlineLessonPlanContext) => {
  const requiredContext = [
    context.academicYearId,
    context.teacherId,
    context.timetableSlotId,
    context.standardId,
    context.divisionId,
    context.subjectId,
  ];
  return requiredContext.some((value) => !value)
    ? 'This timetable slot is missing required class details. Refresh and try again.'
    : '';
};

export const getInlineLessonDuplicateError = (
  context: InlineLessonPlanContext,
  selectedDate: Dayjs,
  topic: string,
  lessonPlans: LessonPlanDuplicateCandidate[]
) => {
  const input = {
    teacherId: context.teacherId,
    timetableSlotId: context.timetableSlotId,
    plannedDate: selectedDate,
    topic,
  };
  if (hasDuplicateLessonSlot(input, lessonPlans)) {
    return { message: 'A lesson plan already exists for this timetable period on this date.' };
  }
  if (hasDuplicateLessonTopic(input, lessonPlans)) {
    return {
      field: 'topic' as const,
      message: 'This topic is already planned for this teacher on this date.',
    };
  }
  return null;
};

export const buildInlineLessonPlanForm = (
  context: InlineLessonPlanContext,
  selectedDate: Dayjs,
  values: InlineLessonPlanValues,
  completionTarget: number
): LessonFormState => ({
  academicYear: context.academicYearName || '',
  teacherId: context.teacherId,
  teacherName: context.teacherName || '',
  standardId: context.standardId,
  divisionId: context.divisionId,
  subjectId: context.subjectId,
  chapterId: values.chapterId,
  timetableSlotId: context.timetableSlotId,
  className: context.standardName || '',
  divisionName: context.divisionName || '',
  subjectName: context.subjectName || '',
  chapterName: values.chapterName,
  plannedDate: selectedDate,
  period: context.periodName || '',
  topic: values.topic.trim(),
  learningObjective: '',
  teachingMethod: 'ExplanationBoardWork',
  resourcesRequired: '',
  plannedCompletionPercentage: completionTarget,
  source: 'Manual',
});
