import { SubjectAssignmentStatus } from '../../curriculum-management/subjectAssignment/enum/subjectType';

export interface SyllabusAssignmentSubject {
  subjectId?: string;
  subjectName?: string | null;
  subject?: { id?: string; name?: string | null } | null;
}

export interface SyllabusAssignmentItem {
  id: string;
  status: SubjectAssignmentStatus | string | number;
  subjectType?: number;
  electiveGroupId?: string | null;
  subjects?: SyllabusAssignmentSubject[];
}

export interface SyllabusSubjectOption {
  value: string;
  label: string;
  originalItem: SyllabusAssignmentItem;
  isElective: boolean;
  electiveGroupId?: string;
}

const getSubjectId = (subject: SyllabusAssignmentSubject, index: number) =>
  subject.subjectId || subject.subject?.id || String(index);

const getSubjectName = (subject: SyllabusAssignmentSubject) =>
  subject.subjectName || subject.subject?.name || '';

/** Normalizes copied and grouped assignments into one option per actual subject. */
export const buildSyllabusSubjectOptions = (
  items: ReadonlyArray<SyllabusAssignmentItem>
): SyllabusSubjectOption[] => {
  const options: SyllabusSubjectOption[] = [];
  const seenElectiveSubjects = new Set<string>();

  items.forEach((item) => {
    if (item.status !== SubjectAssignmentStatus.Published && item.status !== 'Published') return;

    const subjects = item.subjects || [];
    const isElective = Boolean(item.electiveGroupId) || item.subjectType === 1;
    if (!isElective) {
      const subject = subjects[0];
      options.push({
        value: item.id,
        label: subject ? getSubjectName(subject) : '',
        originalItem: item,
        isElective: false,
      });
      return;
    }

    const groupKey = item.electiveGroupId || item.id;
    subjects.forEach((subject, index) => {
      const subjectId = getSubjectId(subject, index);
      const dedupeKey = `${groupKey}::${subjectId}`;
      if (seenElectiveSubjects.has(dedupeKey)) return;

      seenElectiveSubjects.add(dedupeKey);
      options.push({
        value: dedupeKey,
        label: getSubjectName(subject),
        originalItem: item,
        isElective: true,
        electiveGroupId: groupKey,
      });
    });
  });

  return options;
};

export const resolveSyllabusSubject = (
  value: string,
  items: ReadonlyArray<SyllabusAssignmentItem>
) => {
  const [groupKey, subjectId] = value.split('::');
  const item = items.find((candidate) => {
    if (candidate.id === value || candidate.id === groupKey) return true;
    if (candidate.electiveGroupId !== groupKey) return false;
    return (candidate.subjects || []).some(
      (subject, index) => getSubjectId(subject, index) === subjectId
    );
  });

  if (!item) return { subjectId: value, label: '' };
  if (!value.includes('::')) {
    const subject = item.subjects?.[0];
    return {
      subjectId: subject ? getSubjectId(subject, 0) : value,
      label: subject ? getSubjectName(subject) : '',
    };
  }

  const subject = (item.subjects || []).find(
    (candidate, index) => getSubjectId(candidate, index) === subjectId
  );
  return { subjectId: subjectId || value, label: subject ? getSubjectName(subject) : '' };
};
