import type {
  AcademicInsightsSeries,
  AcademicInsightsSection,
} from 'src/redux/academicAPI/academicInsightsTypes';

import { fNumber } from 'src/utils/format-number';

const seriesLabels: Record<string, string> = {
  'class-mapping': 'Class teacher mapping',
  'attendance-score': 'Attendance & published scores',
  'attendance-status': 'Attendance by status',
  'attendance-days': 'Attendance days',
  'recorded-progress': 'Recorded progress',
  'planned-progress': 'Planned progress',
  'planned-target': 'Planned target',
  status: 'Plan status',
  periods: 'Scheduled periods',
  homework: 'Homework',
  assignment: 'Assignments',
  assignments: 'Assignments',
  review: 'Submission review',
  stages: 'Exam stages',
  'completed-exports': 'Completed exports',
  categories: 'Notification categories',
  existence: 'Configuration records',
};

export function displaySeriesName(name: string) {
  const label = seriesLabels[name.toLowerCase()];
  return typeof label === 'string' ? label : name;
}

export const isFiniteValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const displayValue = (value: number | null | undefined, unit?: string) =>
  isFiniteValue(value)
    ? `${fNumber(value)}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`
    : 'Unavailable';

export function usableSeries(series: AcademicInsightsSeries[]) {
  return series
    .map((entry) => ({
      ...entry,
      points: entry.points.filter((point) => isFiniteValue(point.value)),
    }))
    .filter((entry) => entry.points.length > 0);
}

export function chartCategories(series: AcademicInsightsSeries[]) {
  const categories = new Map<string, string>();
  series.forEach((entry) =>
    entry.points.forEach((point) => categories.set(point.key, point.label))
  );
  return Array.from(categories, ([key, label]) => ({ key, label }));
}

export function columnSeries(series: AcademicInsightsSeries[]) {
  const categories = chartCategories(series);
  return series.map((entry) => ({
    name: entry.name,
    data: categories.map(({ key }) => {
      const value = entry.points.find((point) => point.key === key)?.value;
      return isFiniteValue(value) ? value : null;
    }),
  }));
}

export function hasVisualizationData(section: AcademicInsightsSection) {
  return (
    section.items.length > 0 ||
    (section.key === 'student360' &&
      section.metrics.some((metric) => metric.unit === '%' && isFiniteValue(metric.value))) ||
    section.series.some((entry) => entry.points.some((point) => isFiniteValue(point.value)))
  );
}
