import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentModuleDashboardContext } from 'src/redux/student/dashboard/student-module-dashboard-types';

import { Grid } from '@mui/material';

import { dashboardGraphs } from '../dashboard-graph-data';
import StudentDashboardChartCard from './student-dashboard-chart-card';
import StudentDashboardPriorities from './student-dashboard-priorities';

import type { StudentSectionQueries } from '../hooks/use-student-dashboard-sections';

type Props = {
  context: StudentModuleDashboardContext;
  queries: StudentSectionQueries;
  permissions: GrantedPermission[];
  detail?: boolean;
};

export default function StudentDashboardInsights({
  context,
  queries,
  permissions,
  detail = false,
}: Props) {
  const graphs = dashboardGraphs(queries, permissions, context.mode, detail).filter((graph) =>
    context.sections.includes(graph.section)
  );
  const showPriorities =
    !detail &&
    context.sections.some((section) => section === 'admissions' || section === 'attendance');
  const columns = graphs.length + (showPriorities ? 1 : 0);
  if (!columns) return null;
  return (
    <Grid container spacing={1} alignItems="stretch">
      {showPriorities && (
        <Grid size={{ xs: 12, lg: columns === 1 ? 12 : columns === 2 ? 6 : 4 }}>
          <StudentDashboardPriorities
            queries={queries}
            permissions={permissions}
            mode={context.mode}
          />
        </Grid>
      )}
      {graphs.map(({ section, ...graph }) => (
        <Grid key={graph.title} size={{ xs: 12, lg: columns === 1 ? 12 : columns === 2 ? 6 : 4 }}>
          <StudentDashboardChartCard
            {...graph}
            loading={queries[section].isFetching && !queries[section].currentData}
            failed={queries[section].isError}
          />
        </Grid>
      ))}
    </Grid>
  );
}
