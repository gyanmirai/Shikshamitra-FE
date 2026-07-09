'use client';

import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Grid, Typography } from '@mui/material';
import {
  getActiveDaysCount,
  getTeachingSlotsPerDay,
  getWeeklyTeachingCapacity,
  getNonTeachingSlotsPerDay,
} from 'src/utils/timetable-capacity';

interface CapacitySummaryProps {
  slotConfigurations: Array<{ weekRange?: number[]; timeSlots?: { slotType?: string }[] }>;
}

/**
 * Live "available vs required" capacity readout shown while editing Lecture Slots.
 * Mirrors the shared status logic so the number here always matches the list/table.
 */
export default function CapacitySummary({ slotConfigurations }: CapacitySummaryProps) {
  const stats = useMemo(() => {
    const groups = (slotConfigurations || [])
      .filter((c) => Array.isArray(c.weekRange) && c.weekRange.length === 2)
      .map((c) => ({
        weekRangeStart: c.weekRange![0],
        weekRangeEnd: c.weekRange![1],
        timeSlots: c.timeSlots || [],
      }));

    const primary = groups[0];
    const totalSlotsPerDay = primary?.timeSlots.length ?? 0;
    const teachingSlotsPerDay = getTeachingSlotsPerDay(primary?.timeSlots ?? []);
    const nonTeachingSlotsPerDay = getNonTeachingSlotsPerDay(primary?.timeSlots ?? []);
    const activeDaysCount = getActiveDaysCount(groups);
    const weeklyTeachingCapacity = getWeeklyTeachingCapacity(groups);

    return {
      totalSlotsPerDay,
      teachingSlotsPerDay,
      nonTeachingSlotsPerDay,
      activeDaysCount,
      weeklyTeachingCapacity,
    };
  }, [slotConfigurations]);

  const items = [
    { label: 'Total Slots', value: stats.totalSlotsPerDay },
    { label: 'Teaching Slots/Day', value: stats.teachingSlotsPerDay },
    { label: 'Non-Teaching Slots/Day', value: stats.nonTeachingSlotsPerDay },
    { label: 'Active Days', value: stats.activeDaysCount },
    { label: 'Weekly Teaching Capacity', value: stats.weeklyTeachingCapacity, highlight: true },
  ];

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
      }}
    >
      <Grid container spacing={1.5}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 6, sm: 12 / items.length }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color={item.highlight ? 'primary.main' : 'text.primary'}
            >
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
