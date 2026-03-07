'use client';

import { Box, Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { Chart, useChart } from 'src/components/chart';
import { financePaths } from 'src/constants/finance-menu';
import { studentPaths } from 'src/constants/student-menu';
import { transportPaths } from 'src/constants/transport-menu';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

interface BarEntry {
  label: string;
  value: number;
  color: string;
}

interface KpiItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  status: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary';
  path: string;
  bars?: BarEntry[];
}

const kpiData: KpiItem[] = [
  {
    id: 'TOTAL_STUDENTS',
    title: 'Total Students',
    value: '2,450',
    icon: 'hugeicons:students',
    status: 'primary',
    path: studentPaths.records.studentList,
    bars: [
      { label: 'Girls', value: 1190, color: '#FF6B9D' },
      { label: 'Boys', value: 1260, color: '#4FC3F7' },
    ],
  },
  {
    id: 'TOTAL_STAFF',
    title: 'Total Staff',
    value: '185',
    icon: 'clarity:employee-group-solid',
    status: 'info',
    path: hrPaths.employee.list,
    bars: [
      { label: 'Female', value: 82, color: '#FF6B9D' },
      { label: 'Male', value: 103, color: '#4FC3F7' },
    ],
  },
  {
    id: 'TODAY_ATTENDANCE',
    title: 'Today Attendance',
    value: '94.2%',
    icon: 'solar:user-check-bold',
    status: 'success',
    path: hrPaths.attendance.attendanceTracking,
  },
  {
    id: 'PENDING_FEE',
    title: 'Pending Fee',
    value: '₹12.5L',
    icon: 'solar:wad-of-money-bold',
    status: 'error',
    path: financePaths.feeCollection,
  },
  {
    id: 'ACTIVE_ROUTES',
    title: 'Active Routes',
    value: '16',
    icon: 'solar:bus-bold',
    status: 'warning',
    path: transportPaths.routeManagement,
  },
  {
    id: 'PENDING_ADMISSIONS',
    title: 'Pending Admissions',
    value: '42',
    icon: 'solar:document-add-bold',
    status: 'secondary',
    path: studentPaths.enrollment.admission,
  },
];

// ----------------------------------------------------------------------

function InlineBarChart({ bars }: { bars: BarEntry[] }) {
  const chartOptions = useChart({
    colors: bars.map((b) => b.color),
    chart: {
      animations: { enabled: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 2,
        distributed: true,
      },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val}`,
        title: {
          formatter: (seriesName: string, opts: any) =>
            `${bars[opts?.dataPointIndex]?.label ?? seriesName}:`,
        },
      },
      marker: { show: true },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    xaxis: {
      categories: bars.map((b) => b.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        show: true,
        style: {
          fontSize: '7px',
          fontWeight: 600,
          colors: bars.map((b) => b.color),
        },
      },
    },
    yaxis: { show: false },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: 20, height: 40 }}>
        <Chart
          type="bar"
          series={[{ name: 'Value', data: bars.map((b) => b.value) }]}
          options={chartOptions}
          width={30}
          height={40}
          dir="ltr"
        />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

const AdminKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={kpi.id}>
        <Box sx={{ position: 'relative', height: '100%' }}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            status={kpi.status}
            path={kpi.path}
          />
          {kpi.bars && (
            <Box
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <InlineBarChart bars={kpi.bars} />
            </Box>
          )}
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default AdminKpiCards;
