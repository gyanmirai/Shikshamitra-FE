import type { SubjectScheduleLecture } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getScheduleDayLabel(day: number): string {
  return DAY_LABELS[day] || 'Unknown day';
}

export function getTimetableStatus(status: number): {
  label: string;
  color: 'success' | 'warning' | 'default';
} {
  if (status === 2) return { label: 'Published', color: 'success' };
  if (status === 1) return { label: 'Draft', color: 'warning' };
  return { label: 'Not created', color: 'default' };
}

export function groupLecturesByDay(lectures: SubjectScheduleLecture[]) {
  const grouped = new Map<number, SubjectScheduleLecture[]>();
  lectures.forEach((lecture) => {
    grouped.set(lecture.day, [...(grouped.get(lecture.day) || []), lecture]);
  });
  return Array.from(grouped.entries()).sort(([first], [second]) => first - second);
}
