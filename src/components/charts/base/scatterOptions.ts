import type Highcharts from 'highcharts';

type ScatterInput = { markers?: { size?: unknown }; stroke?: { width?: unknown } };

export function scatterOptions(options?: ScatterInput): Highcharts.PlotScatterOptions {
  const size = options?.markers?.size;
  const width = options?.stroke?.width;
  const explicitSize = typeof size === 'number' && Number.isFinite(size) && size >= 0;
  return {
    lineWidth: typeof width === 'number' && Number.isFinite(width) ? width : 0,
    marker: { enabled: !explicitSize || size > 0, radius: explicitSize ? size : 4 },
  };
}
