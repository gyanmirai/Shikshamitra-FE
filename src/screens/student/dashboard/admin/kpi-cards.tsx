import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { useGetStudentDashboardSummaryQuery } from 'src/redux/student';

import CompactKPICard from '../principal/kpi-card-item';

type KpiStatus = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';

const AdminKPICards = () => {
  const { data: summary } = useGetStudentDashboardSummaryQuery(undefined);

  const items: {
    id: string;
    title: string;
    value: string | number;
    tooltip: string;
    status: KpiStatus;
    path: string;
  }[] = [
    {
      id: 'STU_TOTAL',
      title: 'Total Students',
      value: summary?.totalStudents ?? '-',
      tooltip: 'Total number of currently enrolled students in the school.',
      status: 'primary',
      path: studentPaths.records.studentList,
    },
    {
      id: 'STU_MALE',
      title: 'Male Students',
      value: summary?.maleStudents ?? '-',
      tooltip: 'Currently enrolled students with male gender recorded.',
      status: 'info',
      path: studentPaths.records.studentList,
    },
    {
      id: 'STU_FEMALE',
      title: 'Female Students',
      value: summary?.femaleStudents ?? '-',
      tooltip: 'Currently enrolled students with female gender recorded.',
      status: 'success',
      path: studentPaths.records.studentList,
    },
  ];

  return (
    <Grid container spacing={1}>
      {items.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            path={kpi.path}
            tooltip={kpi.tooltip}
            status={kpi.status}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminKPICards;
