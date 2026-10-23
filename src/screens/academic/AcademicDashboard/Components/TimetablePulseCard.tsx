import type { AdminAcademicDashboardTimetableData } from 'src/redux/academicAPI/academicDashboardApi';

import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Grid, Stack, Button, Typography } from '@mui/material';

import { CommandMetricRow } from './CommandMetricRow';
import { DashboardSectionCard } from './DashboardSectionCard';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

export function TimetablePulseCard({ data }: { data: AdminAcademicDashboardTimetableData }) {
  const { timetableRate } = data;

  return (
    <DashboardSectionCard
      title="Timetable & Operations Pulse"
      subheader="Timetable setup across every configured class and division"
      height="100%"
      minHeight={236}
      action={
        <Button
          component={Link}
          href={academicPaths.timetable.management}
          size="small"
          startIcon={<Iconify icon="solar:calendar-mark-linear" />}
        >
          Timetables
        </Button>
      }
    >
      <Stack spacing={1}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.07),
            border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Published Timetable Coverage
              </Typography>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>
                {timetableRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCount(data.activeTimetables)} published timetables ·{' '}
                {formatCount(data.pendingTimetables)} drafts
              </Typography>
            </Box>
            <Button
              component={Link}
              href={academicPaths.timetable.management}
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:play-circle-bold" />}
            >
              Configure Setup
            </Button>
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Coverage across school divisions
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {timetableRate}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 10,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
              }}
            >
              <Box sx={{ width: `${timetableRate}%`, height: 1, bgcolor: 'info.main' }} />
            </Box>
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Active TT"
              value={data.activeTimetables}
              icon="solar:calendar-bold"
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Pending TT"
              value={data.pendingTimetables}
              helper="Needs marking"
              icon="solar:calendar-remove-bold"
              tone="warning"
              emphasis={data.pendingTimetables > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Lecture Slots"
              value="Active"
              icon="solar:clock-circle-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 6 }}>
            <CommandMetricRow
              label="Weekly Targets"
              value="Configured"
              helper="All subjects set"
              icon="solar:list-bold"
              tone="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <CommandMetricRow
              label="Conflicts"
              value={data.conflictsCount}
              helper="Teacher overlap"
              icon="solar:danger-triangle-bold"
              tone="error"
              emphasis={data.conflictsCount > 0}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
}
