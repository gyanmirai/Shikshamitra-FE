import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentDashboardMode,
  StudentDashboardSectionKey,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { hasGrantedPermission } from 'src/utils/permissions';

import { dashboardSectionOrder } from './dashboard-access';
import { readableSection, permittedMetrics } from './dashboard-insights';

import type { DashboardChartRow } from './components/student-dashboard-chart-card';
import type { StudentSectionQueries } from './hooks/use-student-dashboard-sections';

export const dashboardChartPalette = [
  'primary',
  'info',
  'warning',
  'success',
  'secondary',
] as const;

export type DashboardGraph = {
  section: StudentDashboardSectionKey;
  title: string;
  description: string;
  type: 'bar' | 'donut';
  rows: DashboardChartRow[];
};

export function dashboardGraphs(
  queries: StudentSectionQueries,
  permissions: GrantedPermission[],
  mode: StudentDashboardMode,
  detail: boolean
): DashboardGraph[] {
  const records = readableSection(queries.records);
  const graphs: DashboardGraph[] = detail
    ? [
        {
          section: 'records',
          title: 'Class strength',
          description: 'Up to 12 largest visible classes · active permanent records',
          type: 'bar',
          rows: hasGrantedPermission(permissions, 'Students.Records.StudentList.View')
            ? (records?.classStrength ?? []).map((row) => ({
                id: row.standardId ?? 'unassigned',
                label: row.label,
                value: row.students,
                href: row.href,
              }))
            : [],
        },
        {
          section: 'admissions',
          title: 'Admissions workload',
          description:
            'Current counts in your scope. Ready and attention cases are included in unfinished setup.',
          type: 'bar',
          rows: permittedMetrics(readableSection(queries.admissions), permissions),
        },
      ]
    : [
        {
          section: 'records',
          title: 'Student population',
          description: 'Permanent records in the selected academic year and your scope',
          type: 'donut',
          rows: permittedMetrics(records, permissions),
        },
        {
          section: 'attendance',
          title: 'Attendance registers',
          description:
            'Submitted and draft saved registers · selected year. Attendance percentages and missing registers are available in reports.',
          type: 'donut',
          rows: permittedMetrics(readableSection(queries.attendance), permissions).filter(
            (row) => row.id === 'submitted' || row.id === 'drafts'
          ),
        },
      ];
  const order = dashboardSectionOrder(mode);
  return graphs.sort((left, right) => order.indexOf(left.section) - order.indexOf(right.section));
}
