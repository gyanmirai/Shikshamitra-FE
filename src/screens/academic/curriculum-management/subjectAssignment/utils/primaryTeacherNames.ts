import type { ISubjectFormValues } from '../component/type';

export function getPrimaryTeacherNames(item: ISubjectFormValues): string[] {
  const detailedTeacherNames = item.subjects?.flatMap((subject) =>
    (subject.teachers?.length
      ? subject.teachers
      : [subject.primaryTeacher, ...(subject.secondaryTeachers ?? [])]
    ).map((teacher) => teacher?.name)
  );
  const names = item.teacherNames?.length
    ? item.teacherNames
    : detailedTeacherNames?.some(Boolean)
      ? detailedTeacherNames
      : item.primaryTeacherNames;
  const teacherNames = names?.filter((name): name is string => Boolean(name?.trim())) ?? [];

  if (teacherNames.length > 0) return Array.from(new Set(teacherNames));
  return item.primaryTeacherName?.trim() ? [item.primaryTeacherName.trim()] : [];
}
