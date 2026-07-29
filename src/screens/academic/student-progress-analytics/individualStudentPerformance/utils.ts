import type {
  Academic360Metric,
  Academic360Response,
  Academic360StudentRow,
} from 'src/screens/academic/student-academic-360/types';

export type StudentOption = {
  label: string;
  value: string;
};

type StudentListPayload = {
  items?: Academic360StudentRow[];
};

export const readStudentRows = (payload: unknown): Academic360StudentRow[] => {
  if (Array.isArray(payload)) return payload as Academic360StudentRow[];
  if (!payload || typeof payload !== 'object') return [];

  return (payload as StudentListPayload).items || [];
};

export const toStudentOptions = (students: Academic360StudentRow[]): StudentOption[] =>
  students
    .map((student) => {
      const value = String(student.studentId || student.id || '');
      const name =
        student.studentName ||
        [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
      const rollNo = student.rollNo ? `Roll ${student.rollNo}` : '';

      return {
        value,
        label: [name || 'Unnamed Student', rollNo].filter(Boolean).join(' - '),
      };
    })
    .filter((option) => option.value);

export const getMetricPercentage = (metric?: Academic360Metric | number | null): number | null => {
  if (typeof metric === 'number') return metric;
  if (!metric) return null;
  const value = metric.percentage ?? metric.value;
  return typeof value === 'number' ? value : null;
};

export const getLearningCompletion = (data?: Academic360Response): number | null => {
  const totalAssigned = data?.learningTasks?.totalAssigned || 0;
  if (!totalAssigned) return null;

  return Math.round(((data?.learningTasks?.submitted || 0) / totalAssigned) * 100);
};

export const formatPercentage = (value: number | null): string =>
  typeof value === 'number' ? `${Math.round(value)}%` : '-';
