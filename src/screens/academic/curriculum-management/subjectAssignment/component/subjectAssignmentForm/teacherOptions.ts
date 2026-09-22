export interface TeacherOption {
  id: string;
  name: string;
  employeeCode?: string | null;
  label: string;
}

interface TeacherSource {
  id: string;
  fullName?: string | null;
  name?: string | null;
  employeeIdentifier?: string | null;
  employeeCode?: string | null;
}

export const formatTeacherLabel = (employeeCode: string | null | undefined, name: string) =>
  employeeCode?.trim() ? `${employeeCode.trim()} - ${name}` : name;

export const toTeacherOption = (teacher: TeacherSource): TeacherOption => {
  const name = teacher.fullName?.trim() || teacher.name?.trim() || 'Unnamed teacher';
  const employeeCode = teacher.employeeIdentifier?.trim() || teacher.employeeCode?.trim() || null;

  return {
    id: teacher.id,
    name,
    employeeCode,
    label: formatTeacherLabel(employeeCode, name),
  };
};

export const getUnifiedTeachers = <T extends { id: string }>(subject: {
  teachers?: T[] | null;
  primaryTeacher?: T | null;
  secondaryTeachers?: T[] | null;
}): T[] => {
  const teachers = subject.teachers?.length
    ? subject.teachers
    : [subject.primaryTeacher, ...(subject.secondaryTeachers ?? [])].filter(
        (teacher): teacher is T => Boolean(teacher?.id?.trim())
      );

  return Array.from(
    new Map(teachers.filter((teacher) => teacher.id.trim()).map((teacher) => [teacher.id, teacher]))
      .values()
  );
};
