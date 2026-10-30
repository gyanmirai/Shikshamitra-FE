import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { usableSeries, columnSeries, isFiniteValue, chartCategories, displaySeriesName } from '../insights/components/visualization-data';

export function getDesignChartData(section: AcademicInsightsSection) {
  const source = usableSeries(section.series);
  const coordinates = source.flatMap((series) => series.points)
    .filter((point) => isFiniteValue(point.x) && isFiniteValue(point.y));
  const scatter = section.key === 'student360' && coordinates.length > 0;
  const donut = section.key === 'evaluation';
  const slices = source.flatMap((series) => series.points.map((point) => ({
    name: source.length > 1 ? `${displaySeriesName(series.name)}: ${point.label}` : point.label,
    value: point.value,
  })));
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const series = scatter ? source.map((entry) => ({ name: displaySeriesName(entry.name),
    data: entry.points.filter((point) => isFiniteValue(point.x) && isFiniteValue(point.y))
      .map((point) => ({ name: point.label, x: point.x!, y: point.y! })) }))
    : columnSeries(source).map((entry) => ({ ...entry, name: displaySeriesName(entry.name) }));
  return { source, coordinates, scatter, donut, slices, total, series, categories: chartCategories(source) };
}
