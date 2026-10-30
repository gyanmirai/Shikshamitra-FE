import type Highcharts from 'highcharts';

export function withChartHeight(options: Highcharts.Options, height: unknown): Highcharts.Options {
  const pixels = typeof height === 'number' ? height
    : typeof height === 'string' && /^\d+(\.\d+)?px$/.test(height) ? Number.parseFloat(height) : undefined;
  if (pixels === undefined || !Number.isFinite(pixels) || pixels < 0) return options;
  return { ...options, chart: { ...options.chart, height: pixels } };
}
