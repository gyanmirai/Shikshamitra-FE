import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';

import { isFiniteValue } from '../insights/components/visualization-data';
import { getAcademicInsightsOverview } from '../insights/academic-insights-model';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

const imageOrder = ['classrooms', 'curriculum', 'timetable', 'lesson', 'tasks', 'evaluation',
  'student360', 'exams', 'calendar', 'reports', 'notifications', 'audits', 'settings'];

export type AcademicDesignMetric = {
  key: string; label: string; value: number | null; denominator?: number | null;
  unit?: string | null; icon: string; caption: string;
};

export function orderDesignAreas(areas: AcademicInsightsDisplayArea[], role: string) {
  return role === 'admin'
    ? [...areas].sort((a, b) => imageOrder.indexOf(a.area.key) - imageOrder.indexOf(b.area.key))
    : areas;
}

export function getTimetableDays(section: AcademicInsightsSection) {
  const points = section.series.flatMap((series) => series.points);
  const dayNumbers = [...new Set(points.flatMap((point) => isFiniteValue(point.x) &&
    Number.isInteger(point.x) && point.x >= 0 && point.x <= 6 ? [point.x] : []))]
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const days = dayNumbers.map((day) => {
    const samples = points.filter((point) => point.x === day);
    const count = samples.every((point) => isFiniteValue(point.value) && point.value >= 0)
      ? samples.reduce((sum, point) => sum + point.value, 0) : null;
    return { day, count };
  });
  const known = days.flatMap(({ count }) => isFiniteValue(count) ? [count] : []);
  return { days, total: days.length > 0 && days.length === known.length
    ? known.reduce((sum, count) => sum + count, 0) : null };
}

const metricValue = (section: AcademicInsightsSection, key: string) => {
  const value = section.metrics.find((metric) => metric.key === key)?.value;
  return isFiniteValue(value) ? value : null;
};

export function getDesignOverview(areas: AcademicInsightsDisplayArea[], role: string): AcademicDesignMetric[] {
  if (role !== 'admin') return getAcademicInsightsOverview(areas)
    .map(({ context, ...metric }) => ({ ...metric, caption: context, denominator: undefined }));
  return areas.flatMap(({ area, section }): AcademicDesignMetric[] => {
    if (section.status !== 'ready') return [];
    const base = { icon: area.icon, caption: area.title };
    switch (area.key) {
      case 'classrooms': return [{ ...base, key: 'mapped', label: 'Mapped divisions',
        value: metricValue(section, 'mapped'), denominator: metricValue(section, 'divisions') }];
      case 'curriculum': return [{ ...base, key: 'recorded-progress', label: 'Syllabus progress',
        value: metricValue(section, 'recorded-progress'), unit: '%' }];
      case 'timetable': return [
        { ...base, icon: GlobalIcons.calendar, key: 'timetables', label: 'Saved timetables', value: metricValue(section, 'timetables') },
        { ...base, icon: GlobalIcons.documentIcon, key: 'weekly-entries', label: 'Weekly entries', value: getTimetableDays(section).total },
      ];
      default: return [];
    }
  }).slice(0, 4);
}
