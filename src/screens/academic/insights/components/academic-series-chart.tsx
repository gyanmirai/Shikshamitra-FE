'use client';

import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { ChartLegends } from 'src/components/chart/chart-legends';
import { getThemePalette } from 'src/components/charts/base/chartUtils';

import { ChartDataAlternative } from './chart-data-alternative';
import { dueBucketLabel, percentageDomain, academicCountTooltip, academicScatterTooltip } from './academic-chart-presentation';
import {
  columnSeries,
  usableSeries,
  isFiniteValue,
  chartCategories,
  displaySeriesName,
} from './visualization-data';

export function AcademicSeriesChart({ section }: { section: AcademicInsightsSection }) {
  const theme = useTheme();
  const palette = getThemePalette(theme);
  const series = usableSeries(section.series);
  const categories = chartCategories(series);
  const scatter =
    section.key === 'student360' &&
    series.some((entry) =>
      entry.points.some((point) => isFiniteValue(point.x) && isFiniteValue(point.y))
    );
  const donut = section.key === 'evaluation';
  const colors = [palette.primaryMain, palette.infoMain, palette.warningMain];
  const coordinates = series.flatMap((entry) => entry.points)
    .filter((point) => isFiniteValue(point.x) && isFiniteValue(point.y));
  const slices = series.flatMap((entry) =>
    entry.points.map((point) => ({
      name: series.length > 1 ? `${displaySeriesName(entry.name)}: ${point.label}` : point.label,
      value: point.value,
    }))
  );
  const hasPositiveSlice = slices.some((point) => point.value > 0);
  const total = slices.reduce((sum, point) => sum + point.value, 0);
  const data = scatter
    ? series.map((entry) => ({
        name: displaySeriesName(entry.name),
        data: entry.points
          .filter((point) => isFiniteValue(point.x) && isFiniteValue(point.y))
          .map((point) => ({ name: point.label, x: point.x, y: point.y })),
      }))
    : columnSeries(series).map((entry) => ({ ...entry, name: displaySeriesName(entry.name) }));
  const options = useChart({
    colors,
    chart: { stacked: section.key === 'tasks', animations: { enabled: false } },
    labels: slices.map((point) => point.name),
    legend: { show: !scatter && !donut && series.length > 1, position: 'bottom', horizontalAlign: 'left' },
    xaxis: scatter
      ? { ...percentageDomain(coordinates.map((point) => point.x!)), title: { text: 'Recorded attendance (%)' } }
      : {
          categories: categories.map((category) => dueBucketLabel(category.key, category.label)),
          labels: { rotate: categories.length > 4 ? -25 : 0, style: { colors: palette.textSecondary } },
        },
    yaxis: {
      min: 0,
      ...(scatter ? percentageDomain(coordinates.map((point) => point.y!)) : {}),
      title: { text: scatter ? 'Published score (%)' : 'Count' },
      labels: { style: { colors: palette.textSecondary } },
    },
    markers: { size: scatter ? 5 : 0 },
    stroke: { width: scatter ? 0 : 2.5 },
    plotOptions: { pie: { donut: { labels: { total: { show: donut, label: 'Received' } } } } },
    dataLabels: { enabled: section.key === 'lesson' },
    highcharts: {
      chart: { animation: false },
      plotOptions: { series: { animation: false } },
      xAxis: scatter ? { startOnTick: false, endOnTick: false, tickAmount: 5 } : {},
      yAxis: { allowDecimals: scatter, ...(scatter ? { startOnTick: false, endOnTick: false, tickAmount: 4 } : {}) },
      tooltip: { shared: false, useHTML: false, backgroundColor: palette.paper,
        style: { color: palette.textPrimary },
        formatter: scatter ? academicScatterTooltip : academicCountTooltip },
    },
  });
  const noCoordinates = scatter && data.every((entry) => entry.data.length === 0);
  const noPlot = series.length === 0 || noCoordinates || (donut && !hasPositiveSlice);

  return (
    <Box sx={{ minWidth: 0 }}>
      {noPlot ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
          {donut && slices.length > 0 && !hasPositiveSlice
            ? 'All recorded evaluation counts are zero.'
            : 'No comparable chart samples are available.'}
        </Typography>
      ) : (
        <Chart
          type={scatter ? 'scatter' : donut ? 'donut' : 'bar'}
          series={donut ? slices.map((point) => point.value) : data}
          options={options}
          height={donut ? 230 : 280}
          role="region"
          aria-label={section.summary || `${section.key} chart`}
          sx={{ maxWidth: '100%', overflow: 'hidden' }}
        />
      )}
      {donut && hasPositiveSlice && !noPlot && <ChartLegends
        labels={slices.map((point) => point.name)} colors={colors}
        values={slices.map((point) => `${point.value.toLocaleString()} (${new Intl.NumberFormat('en-IN',
          { maximumFractionDigits: 1 }).format(point.value * 100 / total)}%)`)}
        sx={{ justifyContent: 'center', pt: 1 }} />}
      <ChartDataAlternative
        series={section.series}
        coordinateLabels={scatter ? ['Attendance (%)', 'Published score (%)'] : undefined}
      />
    </Box>
  );
}
