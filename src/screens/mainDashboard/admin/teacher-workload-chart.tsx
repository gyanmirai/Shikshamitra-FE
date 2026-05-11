'use client';

import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// ----------------------------------------------------------------------

// Thresholds (in periods per week)
const MODERATE_THRESHOLD = 30; // >= 30 → orange
const HEAVY_THRESHOLD = 36; // >= 36 → red

export type TeacherWorkloadItem = {
  name: string;
  periods: number;
  subjects?: string[];
  classes?: string[];
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  data?: TeacherWorkloadItem[];
};

const DEFAULT_DATA: TeacherWorkloadItem[] = [
  { name: 'Teacher D', periods: 35, subjects: ['Maths', 'Science'], classes: ['8A', '9B', '10A'] },
  { name: 'Teacher B', periods: 32, subjects: ['English', 'Hindi'], classes: ['6A', '7A', '8B'] },
  { name: 'Teacher A', periods: 28, subjects: ['History', 'Civics'], classes: ['9A', '10B'] },
  { name: 'Teacher C', periods: 18, subjects: ['Art'], classes: ['6B'] },
];

const SUBJECT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'maths', label: 'Maths' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
];

export default function TeacherWorkloadChart({
  title = 'Teacher Workload Distribution',
  subheader = 'Weekly timetable periods per teacher',
  data = DEFAULT_DATA,
  ...other
}: Props) {
  const theme = useTheme();

  const [subject, setSubject] = useState('all');

  // Sort highest → lowest
  const sorted = [...data].sort((a, b) => b.periods - a.periods);

  const barColors = sorted.map((t) => {
    if (t.periods >= HEAVY_THRESHOLD) return theme.palette.error.main;
    if (t.periods >= MODERATE_THRESHOLD) return theme.palette.warning.main;
    return theme.palette.success.main;
  });

  const chartOptions = useChart({
    chart: {
      type: 'bar',
    },
    colors: barColors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true, // one color per bar
        dataLabels: {
          position: 'right',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val} periods`,
      style: { fontSize: '11px', fontWeight: 600 },
      offsetX: 4,
    },
    tooltip: {
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const teacher = sorted[dataPointIndex];
        const subject_list = teacher.subjects?.join(', ') || '—';
        const class_list = teacher.classes?.join(', ') || '—';
        return `
                  <div style="padding:10px 14px;font-size:13px;line-height:1.6;">
                    <strong>${teacher.name}</strong><br/>
                    <span>Total Periods: <b>${teacher.periods}</b></span><br/>
                    <span>Subjects: ${subject_list}</span><br/>
                    <span>Classes: ${class_list}</span>
                  </div>`;
      },
    },
    xaxis: {
      categories: sorted.map((t) => t.name),
      min: 0,
      max: 40,
      title: {
        text: 'Number of Periods per Week',
        style: { fontSize: '12px', fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px' },
      },
    },
    legend: { show: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  });

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <CustomSelect
            label="Subject"
            options={SUBJECT_OPTIONS}
            value={subject}
            onChange={(v) => setSubject(v as string)}
            formControlProps={{ sx: { minWidth: '110px' } }}
          />
        }
        sx={{ mb: 1, p: 2 }}
      />

      <Chart
        type="bar"
        series={[{ data: sorted.map((t) => t.periods) }]}
        options={chartOptions}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ pl: 1, pr: 2.5 }}
      />

      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ px: 3, pt: 1, pb: 2, justifyContent: 'center' }}>
        {[
          { color: theme.palette.success.main, label: 'Normal (< 30)' },
          { color: theme.palette.warning.main, label: 'Moderate (30–35)' },
          { color: theme.palette.error.main, label: 'Heavy Overload (≥ 36)' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Box component="span" sx={{ fontSize: 11, color: 'text.secondary' }}>
              {item.label}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
