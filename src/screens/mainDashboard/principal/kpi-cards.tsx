'use client';

import { Box, Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { Chart, useChart } from 'src/components/chart';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';
import { classManagementPaths } from 'src/constants/class-management';
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
  status: 'primary' | 'success' | 'info' | 'warning' | 'error';
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
    id: 'AVG_STUDENT_ATTENDANCE',
    title: 'Avg Student Attendance %',
    value: '91.4%',
    icon: 'solar:user-check-bold',
    status: 'success',
    path: studentPaths.attendance.markAttendance,
    bars: [
      { label: 'Girls', value: 91, color: '#FF6B9D' },
      { label: 'Boys', value: 92, color: '#4FC3F7' },
    ],
  },
  {
    id: 'AVG_TEACHER_ATTENDANCE',
    title: 'Avg Teacher Attendance %',
    value: '95.8%',
    icon: 'clarity:employee-group-solid',
    status: 'info',
    path: hrPaths.attendance.attendanceTracking,
    bars: [
      { label: 'Present', value: 91, color: '#22C55E' },
      { label: 'Absent', value: 92, color: '#EF4444' },
    ],
  },
  {
    id: 'CURRICULUM_COMPLETION',
    title: 'Curriculum Completion %',
    value: '68.2%',
    icon: 'solar:book-bold',
    status: 'warning',
    path: classManagementPaths.chapters,
    bars: [
      { label: 'Completed', value: 68, color: '#22C55E' },
      { label: 'Pending', value: 32, color: '#EF4444' },
    ],
  },
  {
    id: 'UPCOMING_EXAMS',
    title: 'Upcoming Exams (7d)',
    value: '6',
    icon: 'solar:document-bold',
    status: 'error',
    path: academicPaths.examination.schedule,
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
          /* Each label inherits its bar's color for visual cohesion */
          colors: bars.map((b) => b.color),
        },
        // offsetY: -2,
      },
    },
    yaxis: { show: false },
  });

  return (
    /* Chart + text labels wrapper — labels rendered via MUI since sparkline hides xaxis */
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
      {/* Colored text labels below each bar */}
      {/* <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
        {bars.map((b) => (
          <Typography
            key={b.label}
            sx={{ fontSize: '0.58rem', fontWeight: 700, color: b.color, lineHeight: 1 }}
          >
            {b.label}
          </Typography>
        ))}
      </Stack> */}
    </Box>
  );
}

// ----------------------------------------------------------------------

const PrincipalKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={kpi.id}>
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
                right: 16,
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

export default PrincipalKpiCards;
