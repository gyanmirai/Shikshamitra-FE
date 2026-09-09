export interface TeacherOption {
  id: string;
  name: string;
  role: 'Primary' | 'Secondary';
}

export function buildTeacherOptions(
  subjects: Array<{
    subjectId?: string;
    primaryTeacher?: { id: string; name: string } | null;
    secondaryTeachers?: Array<{ id: string; name: string }>;
  }>
): Record<string, TeacherOption[]> {
  const result: Record<string, TeacherOption[]> = {};
  subjects.forEach((subject) => {
    if (!subject.subjectId) return;
    const options: TeacherOption[] = [];
    if (subject.primaryTeacher) options.push({ ...subject.primaryTeacher, role: 'Primary' });
    (subject.secondaryTeachers ?? []).forEach((teacher) => {
      if (!options.some((option) => option.id === teacher.id)) {
        options.push({ ...teacher, role: 'Secondary' });
      }
    });
    result[subject.subjectId] = options;
  });
  return result;
}
