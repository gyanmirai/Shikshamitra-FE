'use client';

import { Grid } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';

import TeacherCharts from './charts';
import TeacherSchedule from './schedule';
import TeacherKpiCards from './kpi-cards';

// ----------------------------------------------------------------------

export default function MainDashboardTeacher() {
  return (
    <DashboardContent disablePadding>
      <Grid container spacing={1} pb={1}>
        {/* ── KPI Cards ──────────────────────────────────────────────── */}
        <Grid size={12}>
          <TeacherKpiCards />
        </Grid>

        {/* ── Today's Schedule ──────────────────────────────────────── */}
        <Grid size={12}>
          <TeacherSchedule />
        </Grid>

        {/* ── Charts (Bar / Line / Pie) ─────────────────────────────── */}
        <Grid size={12}>
          <TeacherCharts />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
