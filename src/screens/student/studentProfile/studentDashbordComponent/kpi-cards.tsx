import { Grid } from '@mui/material';

import CompactKPICard from '../../dashboard/principal/kpi-card-item';

const items = [
  {
    id: 'ACADEMIC_PERF',
    title: 'Academic Performance',
    value: '-',
    status: 'success' as const,
    tooltip: 'Academic performance data is not available.',
  },
  {
    id: 'ATTENDANCE_SUM',
    title: 'Attendance Summary',
    value: '-',
    status: 'success' as const,
    tooltip: 'Attendance summary data is not available.',
  },
  {
    id: 'FEE_STATUS',
    title: 'Fee Status',
    value: '-',
    status: 'warning' as const,
    tooltip: 'Fee status data is not available.',
  },
  {
    id: 'HOMEWORK_STATUS',
    title: 'Homework Completion',
    value: '-',
    status: 'info' as const,
    tooltip: 'Homework completion data is not available.',
  },
];

export const StudentProfileKPICards = () => (
  <Grid container spacing={1}>
    {items.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          status={kpi.status}
          tooltip={kpi.tooltip}
        />
      </Grid>
    ))}
  </Grid>
);

export default StudentProfileKPICards;
