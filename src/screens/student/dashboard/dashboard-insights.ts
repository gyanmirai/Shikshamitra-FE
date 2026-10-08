import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentDashboardMode,
  StudentModuleDashboardMetric,
  StudentModuleDashboardSection,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { hasGrantedPermission } from 'src/utils/permissions';

import { dashboardSectionOrder } from './dashboard-access';

import type { StudentSectionQueries } from './hooks/use-student-dashboard-sections';

export function readableSection(query: StudentSectionQueries[keyof StudentSectionQueries]) {
  return query.isError || query.isUninitialized ? undefined : query.currentData;
}

export function permittedMetrics(
  data: StudentModuleDashboardSection | undefined,
  permissions: GrantedPermission[]
) {
  return (data?.metrics ?? []).filter((metric) =>
    hasGrantedPermission(permissions, metric.permission)
  );
}

const priorityLabels: Record<string, { title: string; action: string }> = {
  attention: { title: 'Student setup needs attention', action: 'Review setup' },
  ready: { title: 'Students ready for activation', action: 'Continue setup' },
  drafts: { title: 'Attendance drafts need submission', action: 'Open registers' },
  leave: { title: 'Leave requests await a decision', action: 'Review requests' },
};

export function dashboardPriorities(
  queries: StudentSectionQueries,
  permissions: GrantedPermission[],
  mode: StudentDashboardMode
): (StudentModuleDashboardMetric & { title: string; action: string })[] {
  return dashboardSectionOrder(mode).flatMap((section) =>
    permittedMetrics(readableSection(queries[section]), permissions)
      .filter((metric) => metric.value > 0 && priorityLabels[metric.id])
      .toSorted(
        (left, right) =>
          Object.keys(priorityLabels).indexOf(left.id) -
          Object.keys(priorityLabels).indexOf(right.id)
      )
      .map((metric) => ({ ...metric, ...priorityLabels[metric.id] }))
  );
}
