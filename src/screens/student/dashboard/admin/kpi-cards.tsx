import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
// Import the shared component from principal dashboard
// Ideally this should be moved to a common folder, but importing from relative path for now
import CompactKPICard from '../principal/kpi-card-item';

const kpiData = [
  {
    id: 'ENQ_TOTAL',
    title: 'Total Inquiries',
    value: '1,250',
    percent: 12.5,
    chart: { data: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26] },
    icon: 'mdi:clipboard-text-outline',
    status: 'success' as const,
    path: studentPaths.enrollment.inquiry,
  },
  {
    id: 'REG_TOTAL',
    title: 'Total Registration',
    value: '980',
    percent: 8.2,
    chart: { data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35] },
    icon: 'mdi:account-plus-outline',
    status: 'info' as const,
    path: studentPaths.enrollment.registration,
  },
  {
    id: 'ADM_TOTAL',
    title: 'Total Admission',
    value: '850',
    percent: -2.4,
    chart: { data: [100, 40, 30, 70, 40, 20, 80, 40, 10, 20] },
    icon: 'mdi:file-document-edit-outline',
    status: 'warning' as const,
    path: studentPaths.enrollment.admission,
  },
  {
    id: 'STU_TOTAL',
    title: 'Total Students',
    value: '3,500',
    percent: 5.1,
    chart: { data: [15, 35, 50, 40, 60, 45, 80, 70, 90, 100] },
    fullChart: {
      type: 'bar',
      series: [
        { name: 'Boys', data: [1800] },
        { name: 'Girls', data: [1700] },
      ],
      colors: ['#00B8D9', '#FF5630'], // Info (blue), Error (red/orange)
      options: {
        tooltip: {
          x: { show: false },
          y: { formatter: (val: number) => `${val} Students` },
        },
        xaxis: {
          categories: ['Total'],
          labels: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '40%',
            borderRadius: 2,
            distributed: false,
          },
        },
      },
    },
    icon: 'mdi:school-outline',
    status: 'primary' as const,
    path: studentPaths.records.studentList,
  },
  {
    id: 'STU_LEFT',
    title: 'Students Left',
    value: '45',
    percent: 1.2,
    chart: { data: [5, 10, 5, 15, 8, 12, 10, 15, 18, 20] },
    icon: 'mdi:account-minus-outline',
    status: 'error' as const,
    path: studentPaths.records.studentList,
    tooltip: 'Includes transferred and dropped-out students during the selected period.',
  },
  {
    id: 'RTE_STUDENTS',
    title: 'RTE Students',
    value: '120',
    percent: 0.5,
    chart: { data: [110, 112, 114, 115, 116, 118, 119, 120, 120, 120] },
    icon: 'mdi:account-check-outline',
    status: 'info' as const,
    path: studentPaths.records.studentList,
    tooltip: 'Students admitted under the Right to Education scheme.',
  },
];

const AdminKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          percentChange={kpi.percent}
          trendData={kpi.chart.data}
          path={kpi.path}
          tooltip={kpi.tooltip}
          status={kpi.status}
          chart={(kpi as any).fullChart}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
