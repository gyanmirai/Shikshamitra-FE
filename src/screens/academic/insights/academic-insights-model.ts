import type { GrantedPermission } from 'src/utils/permissions';
import type {
  AcademicInsightsSection,
  AcademicInsightsResponse,
} from 'src/redux/academicAPI/academicInsightsTypes';

import { hasGrantedPermission } from 'src/utils/permissions';
import { canAccessAcademicRoute } from 'src/utils/academic-navigation-access';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';

import { academicInsightsAreas } from './academic-insights-catalog';

import type { AcademicInsightsArea, AcademicInsightsLink } from './academic-insights-catalog';

export type AcademicInsightsDisplayArea = {
  area: AcademicInsightsArea;
  section: AcademicInsightsSection;
  links: AcademicInsightsLink[];
};

const orders: Record<string, string[]> = {
  admin: [
    'classrooms',
    'curriculum',
    'timetable',
    'student360',
    'calendar',
    'lesson',
    'tasks',
    'evaluation',
    'exams',
    'reports',
    'notifications',
    'audits',
    'settings',
  ],
  director: ['reports', 'student360', 'curriculum', 'exams', 'lesson', 'timetable'],
  principal: ['student360', 'curriculum', 'lesson', 'exams', 'evaluation', 'timetable'],
  vice: ['timetable', 'calendar', 'classrooms', 'student360', 'lesson', 'exams'],
  coordinator: ['lesson', 'curriculum', 'evaluation', 'student360', 'classrooms', 'tasks'],
  hod: ['curriculum', 'lesson', 'evaluation', 'student360', 'tasks', 'exams'],
  teacher: ['lesson', 'tasks', 'evaluation', 'curriculum', 'timetable', 'student360'],
  classTeacher: ['student360', 'classrooms', 'tasks', 'evaluation', 'exams', 'curriculum'],
  exam: ['exams', 'classrooms', 'calendar', 'timetable', 'reports', 'settings'],
  timetable: ['timetable', 'classrooms', 'curriculum', 'calendar', 'reports', 'settings'],
  student: ['timetable', 'tasks', 'evaluation', 'exams', 'student360', 'curriculum', 'calendar'],
  parent: ['student360', 'tasks', 'evaluation', 'exams', 'timetable', 'curriculum', 'calendar'],
};
const personalTitles: Record<string, string> = {
  student360: 'Attendance & Published Scores',
  tasks: 'Learning Tasks',
  evaluation: 'Teacher Feedback',
  timetable: 'My Timetable',
  exams: 'Exams & Published Results',
  curriculum: 'Subjects & Syllabus',
  calendar: 'Holidays & Events',
};
const roleLabels: Record<string, string> = {
  admin: 'School Administrator',
  director: 'Director',
  principal: 'Principal',
  vice: 'Vice Principal',
  coordinator: 'Academic Coordinator',
  hod: 'Head of Department',
  teacher: 'Subject Teacher',
  classTeacher: 'Class Teacher',
  exam: 'Examination Coordinator',
  timetable: 'Timetable Coordinator',
  student: 'Student',
  parent: 'Parent',
  common: 'Academic Workspace',
};
export const getAcademicInsightsRoleLabel = (role: string) =>
  roleLabels[role] ?? 'Academic Workspace';

export function getAcademicInsightsDisplayAreas(
  response: AcademicInsightsResponse,
  permissions: GrantedPermission[]
): AcademicInsightsDisplayArea[] {
  if (
    !hasGrantedPermission(permissions, academicPermissions.root) ||
    !hasGrantedPermission(permissions, 'Academics.Dashboard.View')
  )
    return [];
  const personal = response.role === 'student' || response.role === 'parent';
  const priority = orders[response.role] ?? [];
  const ordered = [...academicInsightsAreas].sort((a, b) => {
    const rank = (key: string) =>
      priority.includes(key) ? priority.indexOf(key) : priority.length;
    return rank(a.key) - rank(b.key);
  });
  return ordered.flatMap((area) => {
    const section = response.sections.find((entry) => entry.key === area.key);
    if (!section) return [];
    if (personal)
      return personalTitles[area.key]
        ? [{ area: { ...area, title: personalTitles[area.key] }, section, links: [] }]
        : [];
    const links = area.links.filter(
      (entry) =>
        hasGrantedPermission(permissions, entry.permission) &&
        canAccessAcademicRoute(entry.href, permissions)
    );
    if (links.length === 0) return [];
    if (area.key === 'settings')
      links.unshift({
        label: 'Setup guide',
        href: academicPaths.setup,
        permission: links[0].permission,
      });
    return [{ area, section, links }];
  });
}

export const getAcademicInsightsOverview = (areas: AcademicInsightsDisplayArea[]) =>
  areas
    .flatMap(({ area, section }) => {
      if (section.status !== 'ready') return [];
      const metric = section.metrics.find((entry) => entry.value !== null);
      return metric && metric.value !== null
        ? [
            {
              ...metric,
              value: metric.value,
              key: `${area.key}:${metric.key}`,
              context: area.title,
              icon: area.icon,
            },
          ]
        : [];
    })
    .slice(0, 4);
