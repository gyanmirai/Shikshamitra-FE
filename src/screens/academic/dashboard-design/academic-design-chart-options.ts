import type { ChartOptions } from 'src/components/chart/types';
import type { getThemePalette } from 'src/components/charts/base/chartUtils';
import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { dueBucketLabel, percentageDomain, academicCountTooltip, academicScatterTooltip } from '../insights/components/academic-chart-presentation';

import type { getDesignChartData } from './academic-design-chart-data';

export function getDesignChartOptions(section: AcademicInsightsSection,
  model: ReturnType<typeof getDesignChartData>, palette: ReturnType<typeof getThemePalette>): ChartOptions {
  const { scatter, donut, slices, coordinates, categories, source } = model;
  return {
    colors: [palette.primaryMain, palette.textSecondary, palette.warningMain, palette.infoMain],
    chart: { stacked: section.key === 'tasks', animations: { enabled: false } },
    labels: slices.map((slice) => slice.name),
    legend: { show: !scatter && !donut && source.length > 1, position: 'top', horizontalAlign: 'left' },
    xaxis: scatter ? { ...percentageDomain(coordinates.map((point) => point.x!)), title: { text: 'Recorded attendance (%)' } }
      : { categories: categories.map((category) => dueBucketLabel(category.key, category.label)),
          labels: { rotate: 0, style: { colors: palette.textSecondary } } },
    yaxis: { min: 0, ...(scatter ? percentageDomain(coordinates.map((point) => point.y!)) : {}),
      title: { text: scatter ? 'Published score (%)' : 'Count' }, labels: { style: { colors: palette.textSecondary } } },
    markers: { size: scatter ? 5 : 0 },
    stroke: { width: 0 },
    plotOptions: { bar: { horizontal: section.key === 'tasks', borderRadius: 2, barHeight: '45%' },
      pie: { donut: { size: '70%', labels: { total: { show: donut, label: 'Received' } } } } },
    dataLabels: { enabled: false },
    highcharts: {
      chart: { animation: false, spacing: [8, 8, 8, 0] },
      plotOptions: { series: { animation: false } },
      xAxis: scatter ? { startOnTick: false, endOnTick: false, tickAmount: 5 } : {},
      yAxis: { allowDecimals: scatter, ...(scatter ? { startOnTick: false, endOnTick: false, tickAmount: 4 } : {}) },
      tooltip: { shared: false, useHTML: false, backgroundColor: palette.paper, style: { color: palette.textPrimary },
        formatter: scatter ? academicScatterTooltip : academicCountTooltip },
    },
  };
}
