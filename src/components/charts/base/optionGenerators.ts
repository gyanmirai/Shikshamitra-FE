'use client';

import type Highcharts from 'highcharts';
import type { Theme } from '@mui/material/styles';

import { makeBarGradient, makeAreaGradient } from './chartUtils';

// ----------------------------------------------------------------------
// Reusable chart option generators. Pair these with <BaseChart /> to get
// premium, theme-aware charts in 2 lines.
// ----------------------------------------------------------------------

export type SeriesPoint = number | [string | number, number] | { name?: string; y: number };

export interface CommonGenInput {
  theme: Theme;
  categories?: string[] | number[];
  colors?: string[];
  stacked?: boolean | '100%';
  dataLabels?: boolean;
  legend?: boolean;
}

// ---------- Line ----------
export function getLineChartOptions(
  input: CommonGenInput & {
    series: Array<{ name: string; data: SeriesPoint[]; color?: string }>;
    smooth?: boolean;
  }
): Highcharts.Options {
  const { categories, colors, series, smooth = true, dataLabels, legend } = input;
  return {
    chart: { type: smooth ? 'spline' : 'line' },
    colors,
    xAxis: { categories: categories as any },
    yAxis: { title: { text: undefined } },
    legend: { enabled: !!legend },
    plotOptions: {
      series: { dataLabels: { enabled: !!dataLabels } },
    },
    series: series.map((s) => ({
      type: smooth ? 'spline' : 'line',
      name: s.name,
      data: s.data as any,
      color: s.color,
    })) as Highcharts.SeriesOptionsType[],
  };
}

// ---------- Area ----------
export function getAreaChartOptions(
  input: CommonGenInput & {
    series: Array<{ name: string; data: SeriesPoint[]; color?: string }>;
    smooth?: boolean;
  }
): Highcharts.Options {
  const { theme, categories, colors, series, smooth = true, stacked, dataLabels, legend } = input;
  const palette = colors ?? [theme.palette.primary.main];
  const stacking = stacked === '100%' ? 'percent' : stacked ? 'normal' : undefined;
  return {
    chart: { type: smooth ? 'areaspline' : 'area' },
    colors,
    xAxis: { categories: categories as any },
    yAxis: { title: { text: undefined } },
    legend: { enabled: !!legend },
    plotOptions: {
      series: { stacking: stacking as any, dataLabels: { enabled: !!dataLabels } },
      area: { fillOpacity: 0.18 },
      areaspline: { fillOpacity: 0.18 },
    },
    series: series.map((s, i) => ({
      type: smooth ? 'areaspline' : 'area',
      name: s.name,
      data: s.data as any,
      color: s.color ?? palette[i % palette.length],
      fillColor: makeAreaGradient(s.color ?? palette[i % palette.length], 0.45) as any,
    })) as Highcharts.SeriesOptionsType[],
  };
}

// ---------- Bar / Column ----------
export function getBarChartOptions(
  input: CommonGenInput & {
    series: Array<{ name: string; data: SeriesPoint[]; color?: string }>;
    horizontal?: boolean;
    gradient?: boolean;
  }
): Highcharts.Options {
  const {
    theme,
    categories,
    colors,
    series,
    horizontal,
    stacked,
    gradient = true,
    dataLabels,
    legend,
  } = input;
  const palette = colors ?? [theme.palette.primary.main];
  const stacking = stacked === '100%' ? 'percent' : stacked ? 'normal' : undefined;
  const type = horizontal ? 'bar' : 'column';
  return {
    chart: { type },
    colors,
    xAxis: { categories: categories as any },
    yAxis: { title: { text: undefined } },
    legend: { enabled: !!legend },
    plotOptions: {
      column: { stacking: stacking as any, borderRadius: 6 } as any,
      bar: { stacking: stacking as any, borderRadius: 6 } as any,
      series: { dataLabels: { enabled: !!dataLabels } },
    },
    series: series.map((s, i) => ({
      type,
      name: s.name,
      data: s.data as any,
      color: gradient
        ? (makeBarGradient(s.color ?? palette[i % palette.length]) as any)
        : (s.color ?? palette[i % palette.length]),
    })) as Highcharts.SeriesOptionsType[],
  };
}

// ---------- Pie / Donut ----------
export function getPieChartOptions(
  input: CommonGenInput & {
    data: Array<{ name: string; y: number; color?: string }>;
    donut?: boolean;
    innerSize?: string;
    showLabels?: boolean;
  }
): Highcharts.Options {
  const { colors, data, donut, innerSize = '70%', showLabels, legend = true } = input;
  return {
    chart: { type: 'pie' },
    colors,
    legend: { enabled: !!legend },
    plotOptions: {
      pie: {
        innerSize: donut ? innerSize : '0%',
        borderRadius: 8,
        borderWidth: 0,
        dataLabels: { enabled: !!showLabels, distance: 14 },
      } as any,
    },
    series: [
      {
        type: 'pie',
        name: '',
        data: data as any,
      } as Highcharts.SeriesPieOptions,
    ],
  };
}

// ---------- Heatmap ----------
export function getHeatmapOptions(
  input: CommonGenInput & {
    xCategories: string[];
    yCategories: string[];
    data: Array<[number, number, number]>; // [xIndex, yIndex, value]
    minColor?: string;
    maxColor?: string;
  }
): Highcharts.Options {
  const { theme, xCategories, yCategories, data, minColor, maxColor, legend = true } = input;
  return {
    chart: { type: 'heatmap' },
    xAxis: { categories: xCategories },
    yAxis: { categories: yCategories, title: { text: undefined }, reversed: true },
    legend: { enabled: !!legend, align: 'right', verticalAlign: 'middle', layout: 'vertical' },
    colorAxis: {
      min: 0,
      minColor: minColor ?? theme.palette.primary.light,
      maxColor: maxColor ?? theme.palette.primary.dark,
    },
    series: [
      {
        type: 'heatmap',
        name: 'value',
        data,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.palette.background.paper,
      } as Highcharts.SeriesHeatmapOptions,
    ],
  };
}

// ---------- Gauge (solidgauge progress arc) ----------
export function getGaugeChartOptions(input: {
  theme: Theme;
  value: number;
  min?: number;
  max?: number;
  color?: string;
  label?: string;
}): Highcharts.Options {
  const { theme, value, min = 0, max = 100, color, label } = input;
  const accent = color ?? theme.palette.primary.main;
  return {
    chart: { type: 'solidgauge' },
    pane: {
      center: ['50%', '60%'],
      size: '110%',
      startAngle: -120,
      endAngle: 120,
      background: [
        {
          backgroundColor: theme.palette.action.hover,
          innerRadius: '70%',
          outerRadius: '100%',
          shape: 'arc',
          borderWidth: 0,
        },
      ],
    } as any,
    yAxis: {
      min,
      max,
      lineWidth: 0,
      tickPositions: [],
      labels: { enabled: false },
    },
    plotOptions: {
      solidgauge: { innerRadius: '70%', rounded: true, dataLabels: { enabled: false } } as any,
    },
    series: [
      {
        type: 'solidgauge',
        name: label ?? 'Value',
        data: [{ y: value, color: accent }],
      } as Highcharts.SeriesSolidgaugeOptions,
    ],
    tooltip: { enabled: false },
  };
}

// ---------- Radial / Donut Progress ----------
export function getRadialProgressOptions(input: {
  theme: Theme;
  value: number; // 0..100
  color?: string;
}): Highcharts.Options {
  const { theme, value, color } = input;
  const accent = color ?? theme.palette.primary.main;
  return {
    chart: { type: 'pie' },
    plotOptions: {
      pie: {
        innerSize: '78%',
        borderWidth: 0,
        startAngle: 0,
        endAngle: 360,
        dataLabels: { enabled: false },
      } as any,
    },
    series: [
      {
        type: 'pie',
        name: 'Progress',
        data: [
          { name: 'value', y: Math.max(0, Math.min(100, value)), color: accent },
          {
            name: 'rest',
            y: 100 - Math.max(0, Math.min(100, value)),
            color: theme.palette.action.hover,
          },
        ],
      } as Highcharts.SeriesPieOptions,
    ],
    tooltip: { enabled: false },
    legend: { enabled: false },
  };
}
