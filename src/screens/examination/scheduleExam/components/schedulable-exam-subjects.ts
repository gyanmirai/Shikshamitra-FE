import type { IExamSubject } from '../type';

/** Empty elective selections remain visible as context but are not exam participants. */
export const hasSchedulableExamSubject = (
  subject: Pick<IExamSubject, 'electiveGroupId' | 'subjects' | 'isExamSelectionDisabled'>
): boolean => {
  if (subject.electiveGroupId && Array.isArray(subject.subjects)) {
    return subject.subjects.some((nested) => !nested.isExamSelectionDisabled);
  }
  return !subject.isExamSelectionDisabled;
};
