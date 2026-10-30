'use client';

import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import { getThemePalette } from 'src/components/charts/base/chartUtils';

import { getDesignChartData } from './academic-design-chart-data';
import { getDesignChartOptions } from './academic-design-chart-options';
import { displayValue } from '../insights/components/visualization-data';
import { ChartDataAlternative } from '../insights/components/chart-data-alternative';

export function AcademicDesignChart({ section }: { section: AcademicInsightsSection }) {
  const palette = getThemePalette(useTheme());
  const model = getDesignChartData(section);
  const options = useChart(getDesignChartOptions(section, model, palette));
  const colors = options.colors ?? [];
  const noPlot = model.source.length === 0 || (model.donut && model.total <= 0);
  return <>
    {noPlot ? <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
      {model.donut && model.slices.length > 0 ? 'All recorded evaluation counts are zero.' : 'No comparable chart samples are available.'}
    </Typography> : <Box sx={{ display: 'grid', alignItems: 'center', gap: 1.5,
      gridTemplateColumns: model.donut ? { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' } : 'minmax(0, 1fr)' }}>
      <Chart type={model.scatter ? 'scatter' : model.donut ? 'donut' : 'bar'}
        series={model.donut ? model.slices.map((slice) => slice.value) : model.series}
        options={options} height={model.scatter ? 190 : 180} role="region" aria-label={section.summary || `${section.key} chart`}
        sx={{ minWidth: 0, maxWidth: 1, overflow: 'hidden' }} />
      {model.donut && <Stack component="ul" aria-label="Evaluation distribution" spacing={1.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {model.slices.map((slice, index) => <Stack component="li" direction="row" gap={1} key={slice.name} alignItems="center" sx={{ minWidth: 0 }}>
          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[index % colors.length], flexShrink: 0 }} />
          <Typography variant="caption" sx={{ flex: 1, overflowWrap: 'anywhere' }}>{slice.name}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{displayValue(slice.value)} ({new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(slice.value * 100 / model.total)}%)</Typography>
        </Stack>)}
      </Stack>}
    </Box>}
    <ChartDataAlternative series={section.series} coordinateLabels={model.scatter ? ['Attendance (%)', 'Published score (%)'] : undefined} />
  </>;
}
