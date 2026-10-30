import { it, expect, describe } from 'vitest';

import { orderDesignAreas, getTimetableDays, getDesignOverview } from './academic-design-model';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

const area = (key: AcademicInsightsDisplayArea['area']['key']): AcademicInsightsDisplayArea => ({
  area: { key, title: key, icon: 'mdi:book', links: [] }, links: [],
  section: { key, status: 'ready', summary: '', metrics: [], series: [], items: [] },
});
const mapping = { ...area('classrooms'), section: { ...area('classrooms').section,
  metrics: [{ key: 'mapped', label: 'Mapped', value: 21 }, { key: 'divisions', label: 'Divisions', value: 31 }],
  series: [{ name: 'mapping', points: [{ key: 'preview', label: 'Preview division', value: 1 }] }] } };
const timetable = { ...area('timetable'), section: { ...area('timetable').section,
  metrics: [{ key: 'timetables', label: 'Timetables', value: 2 }],
  series: [{ name: 'periods', points: [
    { key: 'tue', label: 'Tue', x: 2, y: 1, value: 0 },
    { key: 'mon1', label: 'Mon', x: 1, y: 1, value: 4 },
    { key: 'mon2', label: 'Mon', x: 1, y: 2, value: 2 },
  ] }] } };

describe('approved image dashboard data composition', () => {
  it('uses the exact approved administrator row pairs without changing the preserved array', () => {
    const keys = ['classrooms', 'curriculum', 'timetable', 'student360', 'calendar', 'lesson', 'tasks', 'evaluation', 'exams', 'reports', 'notifications', 'audits', 'settings'] as const;
    const original = keys.map(area);
    expect(orderDesignAreas(original, 'admin').map((entry) => entry.area.key)).toEqual([
      'classrooms', 'curriculum', 'timetable', 'lesson', 'tasks', 'evaluation', 'student360', 'exams', 'calendar', 'reports', 'notifications', 'audits', 'settings',
    ]);
    expect(original.map((entry) => entry.area.key)).toEqual(keys);
  });

  it.each(['director', 'principal', 'vice', 'coordinator', 'hod', 'teacher', 'classTeacher', 'exam', 'timetable', 'student', 'parent'])('keeps the existing permitted priorities for %s', (role) => {
    const permitted = [area('tasks'), area('exams')];
    expect(orderDesignAreas(permitted, role)).toEqual(permitted);
    expect(getDesignOverview(permitted, role)).toEqual([]);
  });

  it('uses authoritative mapped totals rather than the capped preview and derives genuine weekly entries', () => {
    const metrics = getDesignOverview([mapping, timetable], 'admin');
    expect(metrics.map((metric) => [metric.key, metric.value, metric.denominator])).toEqual([
      ['mapped', 21, 31], ['timetables', 2, undefined], ['weekly-entries', 6, undefined],
    ]);
  });

  it('does not invent mapped totals, failed metrics or a school aggregate for personal views', () => {
    expect(getDesignOverview([{ ...mapping, section: { ...mapping.section, metrics: [] } }], 'admin')[0].value).toBeNull();
    expect(getDesignOverview([{ ...mapping, section: { ...mapping.section, status: 'error' } }], 'admin')).toEqual([]);
    const personal = { ...area('curriculum'), section: { ...area('curriculum').section,
      metrics: [{ key: 'chapters', label: 'Published chapters', value: 12 }] } };
    expect(getDesignOverview([personal], 'parent')).toEqual([{ ...personal.section.metrics[0], key: 'curriculum:chapters', icon: personal.area.icon, caption: 'curriculum', denominator: undefined }]);
  });

  it('keeps zero and missing weekdays distinct and rejects an invalid sample total', () => {
    expect(getTimetableDays(timetable.section)).toEqual({ days: [{ day: 1, count: 6 }, { day: 2, count: 0 }], total: 6 });
    expect(getTimetableDays({ ...timetable.section, series: [] })).toEqual({ days: [], total: null });
    const invalid = { ...timetable.section, series: [{ name: 'periods', points: [{ key: 'x', label: 'Monday', x: 1, value: -1 }] }] };
    expect(getTimetableDays(invalid).total).toBeNull();
  });
});
