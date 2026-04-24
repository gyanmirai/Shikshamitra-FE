import type { ISubjectFormValues } from '../component/type';

/**
 * Returns a display label string for a subject assignment.
 * Handles both core (single subject) and elective (multiple subjects) types.
 */
export function getSubjectDisplayLabel(subject: ISubjectFormValues | null): string {
  if (!subject?.subjects?.length) return '';

  if (subject.subjectType === 1) {
    return (
      subject.subjects.map((sub) => `${sub.subjectName ?? ''} (${sub.subjectCode})`).join(', ') ??
      ''
    );
  }

  const first = subject.subjects[0];
  return `${first.subjectName ?? ''} (${first.subjectCode})`;
}
