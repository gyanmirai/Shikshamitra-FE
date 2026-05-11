'use client';

import type Highcharts from 'highcharts';
import type { Theme } from '@mui/material/styles';

import { mergeDeep } from './deepMerge';
import { getThemePalette, makeAreaGradient, premiumTooltipFormatter } from './chartUtils';

// ----------------------------------------------------------------------
// Best-effort ApexCharts → Highcharts options translator.
//
// The goal is: existing dashboard consumers can keep passing options that
// look like ApexCharts (xaxis, yaxis, plotOptions.bar, dataLabels, fill,
// stroke, ...) and we render them with Highcharts without rewriting the
// 100+ call sites. This is intentionally pragmatic — it covers the common
// shapes we use across the app (line/area/spline/bar/column/pie/donut/
// radialBar/heatmap/radar/polarArea/mixed) and falls back to sensible
// defaults for everything else.
// ----------------------------------------------------------------------

export type ApexLikeType =
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'radialBar'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'candlestick'
  | 'boxPlot'
  | 'radar'
  | 'polarArea'
  | 'rangeBar'
  | 'rangeArea'
  | 'treemap';

export type ApexLikeOptions = Record<string, any> | undefined;
export type ApexLikeSeries = any;

const HC_TYPE_BY_APEX: Partial<Record<ApexLikeType, string>> = {
  line: 'line',
  area: 'areaspline',
  pie: 'pie',
  donut: 'pie',
  radialBar: 'solidgauge',
  scatter: 'scatter',
  bubble: 'bubble',
  heatmap: 'heatmap',
  candlestick: 'candlestick',
  boxPlot: 'boxplot',
  radar: 'line', // approximated with polar+line
  polarArea: 'column', // approximated with polar+column
  rangeBar: 'columnrange',
  rangeArea: 'arearange',
  treemap: 'treemap',
};

function pickHcType(apexType: ApexLikeType, opts: ApexLikeOptions): string {
  if (apexType === 'bar') {
    const horizontal = opts?.plotOptions?.bar?.horizontal === true;
    return horizontal ? 'bar' : 'column';
  }
  return HC_TYPE_BY_APEX[apexType] ?? 'line';
}

function ensureArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function translateAxis(axis: any): Highcharts.XAxisOptions {
  if (!axis) return {};
  const out: Highcharts.XAxisOptions = {};
  if (axis.categories) {
    out.categories = axis.categories;
    // Defensive: when categories are provided, always show labels — many
    // dashboards relied on Apex's default behavior here. Consumers can
    // still hide them via `xaxis.labels.show: false`.
    out.labels = { enabled: true } as any;
  }
  if (axis.title?.text) out.title = { text: axis.title.text };
  if (axis.min !== undefined) out.min = axis.min;
  if (axis.max !== undefined) out.max = axis.max;
  if (axis.tickAmount) (out as any).tickAmount = axis.tickAmount;
  if (axis.type === 'datetime') out.type = 'datetime';

  // Apex `labels.show` / `axisBorder.show` / `axisTicks.show` mappings.
  if (axis.labels?.show === false) {
    out.labels = { ...(out.labels ?? {}), enabled: false } as any;
  }
  if (axis.axisBorder?.show === false) out.lineWidth = 0;
  if (axis.axisTicks?.show === false) (out as any).tickLength = 0;

  if (axis.labels?.style?.colors) {
    out.labels = {
      ...(out.labels ?? {}),
      style: {
        color: Array.isArray(axis.labels.style.colors)
          ? axis.labels.style.colors[0]
          : axis.labels.style.colors,
      },
    } as any;
  }
  if (axis.labels?.rotate !== undefined) {
    out.labels = { ...(out.labels ?? {}), rotation: axis.labels.rotate } as any;
  }
  if (axis.labels?.formatter) {
    const fn = axis.labels.formatter;
    out.labels = {
      ...(out.labels ?? {}),
      formatter() {
        try {
          return fn(this.value, this.pos);
        } catch {
          return String(this.value);
        }
      },
    } as any;
  }
  if (axis.opposite) out.opposite = true;
  return out;
}

function translateYAxes(yaxis: any): Highcharts.YAxisOptions | Highcharts.YAxisOptions[] {
  if (!yaxis) return {};
  if (Array.isArray(yaxis)) return yaxis.map(translateAxis) as Highcharts.YAxisOptions[];
  return translateAxis(yaxis) as Highcharts.YAxisOptions;
}

function translateSeries(
  apexType: ApexLikeType,
  series: ApexLikeSeries,
  opts: ApexLikeOptions
): Highcharts.SeriesOptionsType[] {
  // Pie / donut: series is number[], labels live in options.labels.
  if (apexType === 'pie' || apexType === 'donut') {
    const values = ensureArray(series as number[]);
    const labels: string[] = opts?.labels ?? [];
    return [
      {
        type: 'pie',
        name: opts?.title?.text ?? 'Total',
        innerSize:
          apexType === 'donut'
            ? ((opts?.plotOptions?.pie?.donut?.size as string | undefined) ?? '70%')
            : '0%',
        data: values.map((v, i) => ({
          name: labels[i] ?? `Slice ${i + 1}`,
          y: typeof v === 'number' ? v : Number(v) || 0,
        })),
      } as Highcharts.SeriesPieOptions,
    ];
  }

  // RadialBar — approximate as solid gauges.
  if (apexType === 'radialBar') {
    const values = ensureArray(series as number[]);
    const labels: string[] = opts?.labels ?? [];
    return values.map(
      (v, i) =>
        ({
          type: 'solidgauge',
          name: labels[i] ?? `Value ${i + 1}`,
          data: [typeof v === 'number' ? v : Number(v) || 0],
        }) as Highcharts.SeriesSolidgaugeOptions
    );
  }

  // Heatmap: series=[{name, data:[{x,y,value} | {x,y}]}]
  if (apexType === 'heatmap') {
    const list = ensureArray(series as any[]);
    return list.map(
      (s, sIdx) =>
        ({
          type: 'heatmap',
          name: s.name,
          data: (s.data ?? []).map((d: any, i: number) => {
            const x = typeof d?.x === 'number' ? d.x : i;
            const value = typeof d?.y === 'number' ? d.y : Number(d?.y) || 0;
            return [x, sIdx, value];
          }),
        }) as Highcharts.SeriesHeatmapOptions
    );
  }

  // Treemap
  if (apexType === 'treemap') {
    const list = ensureArray(series as any[]);
    const data = list.flatMap((s: any) =>
      (s.data ?? []).map((d: any) => ({ name: d.x ?? d.name, value: Number(d.y) || 0 }))
    );
    return [{ type: 'treemap', data } as Highcharts.SeriesTreemapOptions];
  }

  // Default: array of { name, data, type? }.
  const list = ensureArray(series as any[]);
  return list.map((s) => {
    const seriesType = s.type
      ? pickHcType(s.type as ApexLikeType, opts)
      : pickHcType(apexType, opts);
    return {
      type: seriesType,
      name: s.name,
      data: s.data,
      yAxis: typeof s.yAxis === 'number' ? s.yAxis : undefined,
      color: s.color,
    } as Highcharts.SeriesOptionsType;
  });
}

function translateTooltip(tooltip: any): Highcharts.TooltipOptions {
  if (!tooltip) return {};
  const out: Highcharts.TooltipOptions = {};
  if (tooltip.shared !== undefined) out.shared = tooltip.shared;
  if (tooltip.enabled === false) out.enabled = false;
  if (tooltip.x?.format) out.xDateFormat = tooltip.x.format;

  const formatY = tooltip.y?.formatter;
  if (typeof formatY === 'function') {
    out.pointFormatter = function pointFormatter(this: any) {
      let value: any = this.y;
      try {
        value = formatY(this.y, {
          series: this.series,
          dataPointIndex: this.index,
          w: { config: this.series?.chart?.userOptions ?? {} },
        });
      } catch {
        /* ignore */
      }
      return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`;
    };
  }

  if (typeof tooltip.custom === 'function') {
    const { custom } = tooltip;
    out.useHTML = true;
    out.formatter = function customFormatter(this: any) {
      try {
        const points = this.points ?? [this];
        const seriesIndex = points[0]?.series?.index ?? 0;
        const dataPointIndex = points[0]?.point?.index ?? 0;
        return custom({
          series: points.map((p: any) => p.series.options.data),
          seriesIndex,
          dataPointIndex,
          w: { config: this.series?.chart?.userOptions ?? {}, globals: {} },
        });
      } catch {
        return undefined as any;
      }
    };
  }
  return out;
}

function translateLegend(legend: any): Highcharts.LegendOptions {
  if (!legend) return {};
  const out: Highcharts.LegendOptions = {};
  if (legend.show !== undefined) out.enabled = legend.show !== false;
  if (legend.position) {
    const pos = legend.position as 'top' | 'bottom' | 'left' | 'right';
    if (pos === 'top' || pos === 'bottom') out.verticalAlign = pos;
    if (pos === 'left' || pos === 'right') {
      out.align = pos;
      out.layout = 'vertical';
    }
  }
  if (legend.horizontalAlign)
    out.align = legend.horizontalAlign === 'center' ? 'center' : legend.horizontalAlign;
  if (legend.fontSize) out.itemStyle = { ...(out.itemStyle ?? {}), fontSize: legend.fontSize };
  if (legend.fontWeight)
    out.itemStyle = { ...(out.itemStyle ?? {}), fontWeight: String(legend.fontWeight) };
  return out;
}

function translateDataLabels(dl: any): { enabled?: boolean; formatter?: any } {
  if (!dl) return {};
  const out: any = {};
  if (dl.enabled !== undefined) out.enabled = dl.enabled;
  if (typeof dl.formatter === 'function') {
    const fn = dl.formatter;
    out.formatter = function dlFormatter(this: any) {
      try {
        return fn(this.y, {
          seriesIndex: this.series?.index,
          dataPointIndex: this.point?.index,
          w: { config: this.series?.chart?.userOptions ?? {} },
        });
      } catch {
        return this.y;
      }
    };
  }
  if (dl.style?.colors)
    out.style = {
      color: Array.isArray(dl.style.colors) ? dl.style.colors[0] : dl.style.colors,
    };
  return out;
}

function translatePlotOptions(
  apexType: ApexLikeType,
  apex: any,
  colors: string[] | undefined
): Highcharts.PlotOptions {
  const po: Highcharts.PlotOptions = {};
  const bar = apex?.plotOptions?.bar;
  if (bar) {
    const barOpts: any = {
      borderRadius: bar.borderRadius ?? 6,
    };
    if (bar.columnWidth) {
      const pct = parseFloat(String(bar.columnWidth)) / 100;
      if (!Number.isNaN(pct)) {
        barOpts.pointPadding = (1 - pct) / 2;
        barOpts.groupPadding = 0.08;
      }
    }
    if (bar.distributed) barOpts.colorByPoint = true;
    po.column = { ...(po.column as any), ...barOpts };
    po.bar = { ...(po.bar as any), ...barOpts };
  }

  const pie = apex?.plotOptions?.pie;
  if (pie) {
    po.pie = {
      ...(po.pie as any),
      borderRadius: pie.borderRadius ?? 6,
      borderWidth: 0,
    } as any;
  }

  const radial = apex?.plotOptions?.radialBar;
  if (radial) {
    (po as any).solidgauge = {
      rounded: true,
      innerRadius: radial.hollow?.size ?? '70%',
    };
  }

  const stroke = apex?.stroke;
  if (stroke) {
    const lineWidth = typeof stroke.width === 'number' ? stroke.width : 2.5;
    po.series = {
      ...(po.series as any),
      lineWidth,
    };
    if (stroke.curve === 'straight') {
      po.line = { ...(po.line as any) };
      po.area = { ...(po.area as any) };
    }
  }

  const fill = apex?.fill;
  if (fill?.type === 'gradient' && colors?.length) {
    po.area = {
      ...(po.area as any),
      fillColor: makeAreaGradient(colors[0], fill.gradient?.opacityFrom ?? 0.35) as any,
    };
    po.areaspline = {
      ...(po.areaspline as any),
      fillColor: makeAreaGradient(colors[0], fill.gradient?.opacityFrom ?? 0.35) as any,
    };
  }

  return po;
}

// ----------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------

export function apexToHighcharts(
  apexType: ApexLikeType,
  series: ApexLikeSeries,
  options: ApexLikeOptions,
  theme: Theme
): Highcharts.Options {
  const colors: string[] | undefined = options?.colors;
  const hcSeries = translateSeries(apexType, series, options);
  const dataLabels = translateDataLabels(options?.dataLabels);
  const plotOptions = translatePlotOptions(apexType, options, colors);

  // Apply data labels to the series-level plotOptions so they cascade.
  if (dataLabels.enabled !== undefined || dataLabels.formatter) {
    plotOptions.series = { ...(plotOptions.series as any), dataLabels };
    plotOptions.pie = { ...(plotOptions.pie as any), dataLabels };
  }

  const stacked = options?.chart?.stacked;
  if (stacked) {
    plotOptions.series = {
      ...(plotOptions.series as any),
      stacking: options?.chart?.stackType === '100%' ? 'percent' : 'normal',
    };
  }

  // For radar / polarArea we also need polar:true on the chart.
  const isPolar = apexType === 'radar' || apexType === 'polarArea';

  const xAxis = translateAxis(options?.xaxis);
  if (apexType === 'heatmap') {
    // Use category axis with the labels from the first series' data.
    const firstSeries = ensureArray(series as any[])[0];
    if (!xAxis.categories && firstSeries?.data) {
      xAxis.categories = (firstSeries.data ?? []).map((d: any, i: number) => d?.x ?? `${i + 1}`);
    }
  }

  const yAxis = translateYAxes(options?.yaxis);

  const baseOptions: Highcharts.Options = {
    chart: {
      type: hcSeries[0]?.type ?? pickHcType(apexType, options),
      polar: isPolar || undefined,
      height: options?.chart?.height,
      width: options?.chart?.width,
      events: options?.chart?.events,
    },
    title: options?.title?.text ? { text: options.title.text } : { text: undefined },
    subtitle: options?.subtitle?.text ? { text: options.subtitle.text } : undefined,
    colors,
    xAxis,
    yAxis: yAxis as any,
    legend: translateLegend(options?.legend),
    tooltip: {
      ...translateTooltip(options?.tooltip),
      ...(options?.tooltip?.custom ? {} : { formatter: premiumTooltipFormatter(theme) as any }),
    },
    plotOptions,
    series: hcSeries,
  };

  // Heatmap colorAxis: map from plotOptions.heatmap.colorScale or use brand gradient.
  if (apexType === 'heatmap') {
    const stops = options?.plotOptions?.heatmap?.colorScale?.ranges;
    const palette = getThemePalette(theme);
    baseOptions.colorAxis = {
      min: 0,
      minColor: palette.primaryLight,
      maxColor: palette.primaryDark,
      ...(stops && Array.isArray(stops) && stops.length
        ? {
            min: Math.min(...stops.map((s: any) => Number(s.from) || 0)),
            max: Math.max(...stops.map((s: any) => Number(s.to) || 0)),
          }
        : {}),
    };
  }

  // Centered donut total label.
  const donutTotal = options?.plotOptions?.pie?.donut?.labels?.total;
  if ((apexType === 'donut' || (apexType === 'pie' && donutTotal)) && donutTotal?.show !== false) {
    const label = donutTotal?.label ?? 'Total';
    baseOptions.plotOptions = {
      ...(baseOptions.plotOptions as any),
      pie: {
        ...((baseOptions.plotOptions as any)?.pie ?? {}),
        innerSize:
          apexType === 'donut'
            ? ((options?.plotOptions?.pie?.donut?.size as string | undefined) ?? '70%')
            : '0%',
      } as any,
    };
    const tot =
      Array.isArray(series) && (series as number[]).every((v) => typeof v === 'number')
        ? (series as number[]).reduce((a, b) => a + b, 0)
        : null;
    if (tot != null) {
      const palette = getThemePalette(theme);
      baseOptions.subtitle = {
        useHTML: true,
        verticalAlign: 'middle',
        floating: true,
        y: 8,
        text: `<div style="text-align:center"><div style="font-size:12px;color:${palette.textSecondary};font-weight:600">${label}</div><div style="font-size:22px;font-weight:700;color:${palette.textPrimary}">${tot.toLocaleString()}</div></div>`,
      };
    }
  }

  // Forward any pre-built Highcharts overrides under options.highcharts.
  if (options?.highcharts) {
    return mergeDeep(baseOptions, options.highcharts);
  }
  return baseOptions;
}
