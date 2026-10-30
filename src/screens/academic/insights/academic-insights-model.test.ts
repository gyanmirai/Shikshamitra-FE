import type { AcademicInsightsResponse } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, expect, describe } from 'vitest';
import { academicPermissions } from 'src/constants/academic-menu';

import { academicInsightsAreas } from './academic-insights-catalog';
import { getAcademicInsightsDisplayAreas } from './academic-insights-model';

const response: AcademicInsightsResponse = {
  role: 'teacher', scopeLabel: 'Assigned classes', generatedAt: '2026-10-29T10:00:00Z',
  sections: ['tasks', 'lesson', 'exams'].map((key) => ({
    key: key as 'tasks' | 'lesson' | 'exams', status: 'ready', summary: '', metrics: [], series: [], items: [],
  })),
};
const grants = (...names: string[]) => names.map((name) => ({ name, isGranted: true }));
const lessonGrants = grants(academicPermissions.root, academicPermissions.curriculum.root,
  'Academics.Dashboard.View', `${academicPermissions.curriculum.lessonPlan}.View`);

describe('Academic Insights role composition and navigation', () => {
  it('does not expose counts or links because a role name matches', () => {
    expect(getAcademicInsightsDisplayAreas({ ...response, role: 'admin' }, [])).toEqual([]);
  });

  it('includes only returned sections with effective action and navigation visibility', () => {
    const result = getAcademicInsightsDisplayAreas(response, lessonGrants);
    expect(result.map((entry) => entry.area.key)).toEqual(['lesson']);
    expect(result[0].links.map((entry) => entry.href)).toEqual(['/academic/lesson-plan']);
    expect(getAcademicInsightsDisplayAreas(response, grants(`${academicPermissions.curriculum.lessonPlan}.View`))).toEqual([]);
  });

  it('orders permitted sections by responsibility without changing their data', () => {
    const permissions = [...lessonGrants, ...grants(academicPermissions.homework.root,
      `${academicPermissions.homework.learningTasks}.View`)];
    const teacher = getAcademicInsightsDisplayAreas(response, permissions);
    expect(teacher.map((entry) => entry.area.key)).toEqual(['lesson', 'tasks']);
    expect(teacher[0].section).toBe(response.sections[1]);
  });

  it('keeps verified personal responses separate from staff navigation', () => {
    const personal = { ...response, role: 'parent', sections: [...response.sections,
      { ...response.sections[0], key: 'settings' as const }] };
    const result = getAcademicInsightsDisplayAreas(personal, grants(academicPermissions.root, 'Academics.Dashboard.View'));
    expect(result.map((entry) => entry.area.key)).toEqual(['tasks', 'exams']);
    expect(result.every((entry) => entry.links.length === 0)).toBe(true);
  });

  it('retains the verified personal timetable without exposing staff destinations', () => {
    const personal = { ...response, role: 'student', sections: [
      { ...response.sections[0], key: 'timetable' as const },
      { ...response.sections[0], key: 'settings' as const }] };
    const result = getAcademicInsightsDisplayAreas(personal,
      grants(academicPermissions.root, 'Academics.Dashboard.View'));
    expect(result.map((entry) => entry.area.title)).toEqual(['My Timetable']);
    expect(result[0].links).toEqual([]);
  });

  it.each(['admin', 'director', 'principal', 'vice', 'coordinator', 'hod', 'teacher',
    'classTeacher', 'exam', 'timetable'])('preserves all permitted implemented sections for %s', (role) => {
    const values = (value: object): string[] => Object.values(value).flatMap((entry) =>
      typeof entry === 'string' ? [entry] : values(entry));
    const permissions = grants(...values(academicPermissions), 'Academics.Dashboard.View',
      ...academicInsightsAreas.flatMap((area) => area.links.map((entry) => entry.permission)));
    const full = { ...response, role, sections: academicInsightsAreas.map((area) =>
      ({ ...response.sections[0], key: area.key })) };
    const result = getAcademicInsightsDisplayAreas(full, permissions);
    expect(result).toHaveLength(13);
    expect(new Set(result.map((entry) => entry.area.key)).size).toBe(13);
  });
});
