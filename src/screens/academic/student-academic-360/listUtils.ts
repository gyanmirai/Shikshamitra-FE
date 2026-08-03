import { getStudentId, getStudentName, readOptionalText, readText } from './types';

import type { Academic360Metric, Academic360StudentRow } from './types';

export type AcademicSmartFilter =
  | 'all'
  | 'needsAttention'
  | 'lowAttendance'
  | 'overdueHomework'
  | 'performanceDecline'
  | 'noData'
  | 'activeIntervention';

export type AcademicSortKey =
  | 'priority'
  | 'rollNo'
  | 'studentName'
  | 'attendance'
  | 'homework'
  | 'examAverage'
  | 'academicHealth'
  | 'alertCount'
  | 'lastUpdated';

export type StudentAcademicListItem = {
  student: Academic360StudentRow;
  studentId: string;
  name: string;
  grNo: string;
  rollNo: string;
  profileImageUrl: string;
  attendance?: Academic360Metric;
  homework?: Academic360Metric;
  examAverage?: Academic360Metric;
  trend: string;
  academicHealth: string;
  academicHealthReasons: string[];
  alertCount?: number;
  activeInterventionCount?: number;
  dataCompleteness: string;
  lastUpdatedAt?: string;
};

const metricFromUnknown = (value: Academic360StudentRow['attendance']): Academic360Metric | undefined => {
  if (typeof value === 'number') return { percentage: value, value };
  if (!value || typeof value !== 'object') return undefined;
  return value;
};

const percentageOf = (metric?: Academic360Metric): number | undefined => {
  const value = metric?.percentage ?? metric?.value;
  return typeof value === 'number' ? value : undefined;
};

const hasAcademicData = (item: StudentAcademicListItem): boolean =>
  Boolean(
    item.attendance ||
      item.homework ||
      item.examAverage ||
      item.alertCount !== undefined ||
      item.activeInterventionCount !== undefined ||
      item.lastUpdatedAt
  );

const healthRank: Record<string, number> = {
  supportrecommended: 1,
  urgent: 1,
  needsattention: 2,
  activeintervention: 3,
  insufficientdata: 4,
  improving: 5,
  ontrack: 6,
};

export const normalizeAcademicStudent = (student: Academic360StudentRow): StudentAcademicListItem => {
  const attendance = metricFromUnknown(student.attendance);
  const homework = metricFromUnknown(student.homework);
  const examAverage = metricFromUnknown(student.examAverage);
  const dataCompleteness =
    typeof student.dataCompleteness === 'string'
      ? student.dataCompleteness
      : readText(student.dataCompleteness?.status, 'Insufficient Data');

  return {
    student,
    studentId: getStudentId(student),
    name: getStudentName(student) || '-',
    grNo: readText(student.grNo),
    rollNo: readText(student.rollNo),
    profileImageUrl: readOptionalText(student.profileImageUrl ?? student.photoUrl),
    attendance,
    homework,
    examAverage,
    trend: readText(student.trend, 'Insufficient Data'),
    academicHealth: readText(student.academicHealth, attendance || homework || examAverage ? 'On Track' : 'Insufficient Data'),
    academicHealthReasons: student.academicHealthReasons || [],
    alertCount: typeof student.alertCount === 'number' ? student.alertCount : undefined,
    activeInterventionCount:
      typeof student.activeInterventionCount === 'number' ? student.activeInterventionCount : undefined,
    dataCompleteness,
    lastUpdatedAt: readOptionalText(student.lastUpdatedAt ?? student.updatedAt),
  };
};

export const matchesAcademicFilter = (
  item: StudentAcademicListItem,
  filter: AcademicSmartFilter
): boolean => {
  const attendance = percentageOf(item.attendance);
  const homeworkPending = item.homework?.pending ?? 0;
  const health = item.academicHealth.toLowerCase().replace(/\s/g, '');

  if (filter === 'all') return true;
  if (filter === 'needsAttention') return ['needsattention', 'supportrecommended', 'urgent'].includes(health);
  if (filter === 'lowAttendance') return typeof attendance === 'number' && attendance < 75;
  if (filter === 'overdueHomework') return homeworkPending > 0;
  if (filter === 'performanceDecline') return item.trend.toLowerCase() === 'declining';
  if (filter === 'noData') return !hasAcademicData(item) || health === 'insufficientdata';
  return (item.activeInterventionCount ?? 0) > 0;
};

export const getAcademicPriority = (item: StudentAcademicListItem): number => {
  const health = item.academicHealth.toLowerCase().replace(/\s/g, '');
  const attendance = percentageOf(item.attendance);
  if (typeof attendance === 'number' && attendance < 75) return 1;
  if ((item.alertCount ?? 0) > 0 && ['supportrecommended', 'needsattention'].includes(health)) return 1;
  return healthRank[health] ?? 4;
};

export const getMetricPercentage = percentageOf;

export const sortAcademicStudents = (
  items: StudentAcademicListItem[],
  sortKey: AcademicSortKey,
  direction: 'asc' | 'desc'
): StudentAcademicListItem[] =>
  [...items].sort((first, second) => {
    const modifier = direction === 'asc' ? 1 : -1;
    const numberValue = (item: StudentAcademicListItem) => {
      if (sortKey === 'priority') return getAcademicPriority(item);
      if (sortKey === 'attendance') return getMetricPercentage(item.attendance) ?? -1;
      if (sortKey === 'homework') return getMetricPercentage(item.homework) ?? -1;
      if (sortKey === 'examAverage') return getMetricPercentage(item.examAverage) ?? -1;
      if (sortKey === 'alertCount') return item.alertCount ?? -1;
      return Number(readOptionalText(item.rollNo)) || 0;
    };
    const textValue = (item: StudentAcademicListItem) => {
      if (sortKey === 'studentName') return item.name;
      if (sortKey === 'academicHealth') return item.academicHealth;
      if (sortKey === 'lastUpdated') return item.lastUpdatedAt || '';
      return '';
    };

    if (['studentName', 'academicHealth', 'lastUpdated'].includes(sortKey)) {
      return textValue(first).localeCompare(textValue(second)) * modifier;
    }

    return (numberValue(first) - numberValue(second)) * modifier;
  });

export const studentMatchesSearch = (item: StudentAcademicListItem, searchTerm: string): boolean => {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;
  return [
    item.name,
    item.grNo,
    item.rollNo,
    item.student.standardName,
    item.student.standard,
    item.student.divisionName,
    item.student.division,
  ].some((value) => value && value.toString().toLowerCase().includes(query));
};

