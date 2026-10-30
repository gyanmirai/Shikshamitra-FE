'use client';

import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import { getThemePalette } from 'src/components/charts/base/chartUtils';

import { getTimetableDays } from './academic-design-model';
import { displayValue } from '../insights/components/visualization-data';
import { ChartDataAlternative } from '../insights/components/chart-data-alternative';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AcademicDesignTimetable({ section }: { section: AcademicInsightsSection }) {
  const result = getTimetableDays(section);
  const palette = getThemePalette(useTheme());
  const options = useChart({
    colors: [palette.primaryMain], chart: { animations: { enabled: false } },
    xaxis: { categories: result.days.map((day) => days[day.day]), labels: { rotate: 0 } },
    yaxis: { min: 0, title: { text: 'Entries' } },
    legend: { show: false }, dataLabels: { enabled: true },
    stroke: { width: 0 }, plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
    highcharts: { chart: { animation: false, spacing: [8, 4, 4, 0] },
      yAxis: { allowDecimals: false }, plotOptions: { series: { animation: false } } },
  });
  const count = section.metrics.find((metric) => metric.key === 'timetables')?.value;
  return <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '108px minmax(0, 1fr)' }, gap: 2, alignItems: 'center' }}>
      <Stack component="dl" direction={{ xs: 'row', sm: 'column' }} gap={2} sx={{ m: 0 }}>
        {([['Saved timetables', count, GlobalIcons.calendar], ['Weekly entries', result.total, GlobalIcons.documentIcon]] as const).map(([label, value, icon]) =>
          <Box key={label}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Iconify icon={icon} width={22} aria-hidden sx={{ color: 'text.secondary' }} />
              <Typography component="dd" variant="h4" sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}>{displayValue(value)}</Typography>
            </Stack>
            <Typography component="dt" variant="caption" color="text.secondary">{label}</Typography>
          </Box>)}
      </Stack>
      <Chart type="bar" series={[{ name: 'Entries', data: result.days.map((day) => day.count) }]}
        options={options} height={180} role="region" aria-label="Weekly timetable entries"
        sx={{ minWidth: 0, overflow: 'hidden' }} />
    </Box>
    <ChartDataAlternative series={section.series} coordinateLabels={['Weekday (0=Sunday)', 'Period']} valueLabel="Timetable entries" />
  </>;
}
