import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

import type { LessonPlanRow } from './lessonPlanData';

export type LessonPlanDuplicateInput = {
  id?: string;
  teacherId?: string;
  timetableSlotId?: string;
  plannedDate: Dayjs | null;
  topic: string;
};

export type LessonPlanDuplicateCandidate = Pick<
  LessonPlanRow,
  'id' | 'teacherId' | 'timetableSlotId' | 'plannedDate' | 'topic'
>;

const normalizeText = (value?: string | null) =>
  value?.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ') || '';

export const hasDuplicateLessonTopic = (
  form: LessonPlanDuplicateInput,
  lessonPlans: LessonPlanDuplicateCandidate[]
) => {
  const topic = normalizeText(form.topic);
  const plannedDate = form.plannedDate?.format('YYYY-MM-DD');

  if (!topic || !plannedDate) return false;

  return lessonPlans.some((plan) => {
    const sameRecord = form.id && plan.id === form.id;
    const sameTeacher = !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
    const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === plannedDate;
    const sameTopic = normalizeText(plan.topic) === topic;

    return !sameRecord && sameTeacher && sameDate && sameTopic;
  });
};

export const hasDuplicateLessonSlot = (
  form: LessonPlanDuplicateInput,
  lessonPlans: LessonPlanDuplicateCandidate[]
) => {
  const plannedDate = form.plannedDate?.format('YYYY-MM-DD');
  if (!plannedDate || !form.timetableSlotId) return false;

  return lessonPlans.some((plan) => {
    const sameRecord = form.id && plan.id === form.id;
    const sameTeacher = !form.teacherId || !plan.teacherId || plan.teacherId === form.teacherId;
    const sameDate = dayjs(plan.plannedDate).format('YYYY-MM-DD') === plannedDate;
    const sameSlot = plan.timetableSlotId === form.timetableSlotId;

    return !sameRecord && sameTeacher && sameDate && sameSlot;
  });
};
