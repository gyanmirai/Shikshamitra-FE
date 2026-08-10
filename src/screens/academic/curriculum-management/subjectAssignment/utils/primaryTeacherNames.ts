import type { ISubjectFormValues } from '../component/type';

export function getPrimaryTeacherNames(item: ISubjectFormValues): string[] {
  const names = item.primaryTeacherNames?.length
    ? item.primaryTeacherNames
    : item.subjects?.map((subject) => subject.primaryTeacher?.name);
  const teacherNames = names?.filter((name): name is string => Boolean(name?.trim())) ?? [];

  if (teacherNames.length > 0) return Array.from(new Set(teacherNames));
  return item.primaryTeacherName?.trim() ? [item.primaryTeacherName.trim()] : [];
}
