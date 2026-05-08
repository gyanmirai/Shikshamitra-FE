'use client';

import type Highcharts from 'highcharts';
import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

import { getThemePalette } from './chartUtils';

// ----------------------------------------------------------------------
// World-class enterprise Highcharts theme.
// All values are derived from the MUI theme so light/dark switches just
// work. Returns a deep-mergeable Highcharts.Options object.
// ----------------------------------------------------------------------

export type ChartThemeMode = 'light' | 'dark';

export function buildChartTheme(theme: Theme): Highcharts.Options {
  const isDark = theme.palette.mode === 'dark';

  const fontFamily =
    (theme.typography.fontFamily as string) ?? 'Inter, system-ui, -apple-system, sans-serif';

  // Use CSS-vars-aware palette so dark/light switches are reflected at
  // runtime without re-rendering charts. `theme.palette.*` returns a
  // static hex from the BASE palette in CSS-vars themes; `theme.vars.palette.*`
  // returns `var(--palette-*)` which respects the active mode.
  const p = getThemePalette(theme);
  const { textPrimary } = p;
  const { textSecondary } = p;
  const { textDisabled } = p;
  const { divider } = p;
  const { paper } = p;

  const grey500Channel =
    (theme as any).vars?.palette?.grey?.['500Channel'] ?? theme.palette.grey['500Channel'];

  const tooltipBg = isDark
    ? varAlpha('20 26 35', 0.92) // soft slate
    : 'rgba(255,255,255,0.92)';

  return {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily, color: textPrimary as any },
      spacing: [12, 12, 12, 12],
      animation: { duration: 600 },
      zooming: { mouseWheel: { enabled: false } },
      panning: { enabled: false, type: 'x' },
    },
    colors: [
      p.primaryMain,
      p.warningMain,
      p.infoMain,
      p.errorMain,
      p.successMain,
      p.warningDark,
      p.successDark,
      p.infoDark,
      p.primaryDark,
    ],
    title: { text: undefined, style: { color: textPrimary, fontFamily } },
    subtitle: { text: undefined, style: { color: textSecondary, fontFamily } },
    credits: { enabled: false },
    accessibility: { enabled: true, keyboardNavigation: { enabled: true } },
    exporting: { enabled: false }, // opt-in per chart
    lang: { thousandsSep: ',' },
    xAxis: {
      lineColor: 'transparent',
      tickColor: 'transparent',
      gridLineColor: divider,
      gridLineDashStyle: 'Dash',
      gridLineWidth: 0,
      labels: {
        enabled: true,
        style: {
          color: textSecondary,
          fontSize: '12px',
          fontWeight: '500',
          fontFamily,
        },
      },
      title: {
        style: { color: textSecondary, fontSize: '12px', fontFamily, fontWeight: '600' },
      },
      crosshair: {
        color: varAlpha(grey500Channel, 0.18),
        dashStyle: 'Dash',
        width: 1,
      },
    },
    yAxis: {
      gridLineColor: divider,
      gridLineDashStyle: 'Dash',
      gridLineWidth: 1,
      lineWidth: 0,
      tickAmount: 5,
      labels: {
        enabled: true,
        style: {
          color: textSecondary,
          fontSize: '12px',
          fontWeight: '500',
          fontFamily,
        },
      },
      title: {
        style: { color: textSecondary, fontSize: '12px', fontFamily, fontWeight: '600' },
      },
    },
    legend: {
      enabled: false,
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        color: textPrimary,
        fontSize: '13px',
        fontWeight: '500',
        fontFamily,
      },
      itemHoverStyle: { color: p.primaryMain },
      itemHiddenStyle: { color: textDisabled },
      symbolRadius: 6,
      symbolHeight: 10,
      symbolWidth: 10,
      itemDistance: 16,
    },
    tooltip: {
      useHTML: true,
      shared: true,
      backgroundColor: tooltipBg as any,
      borderWidth: 0,
      borderRadius: 12,
      shadow: {
        color: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(15,23,42,0.18)',
        offsetX: 0,
        offsetY: 8,
        opacity: 1,
        width: 14,
      },
      style: {
        color: theme.palette.text.primary,
        fontSize: '12.5px',
        fontFamily,
      },
      padding: 0,
      hideDelay: 80,
    },
    plotOptions: {
      series: {
        animation: { duration: 600 },
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 4,
          lineWidth: 2,
          lineColor: paper,
          states: { hover: { enabled: true, radius: 6 } },
        },
        states: {
          hover: { lineWidthPlus: 0, halo: { size: 6, opacity: 0.18 } },
          inactive: { opacity: 0.35 },
        },
        dataLabels: {
          color: textPrimary as any,
          style: {
            color: textPrimary,
            fontSize: '11.5px',
            fontWeight: '600',
            fontFamily,
            textOutline: 'none',
          },
        },
      },
      column: {
        borderRadius: 6,
        borderWidth: 0,
        pointPadding: 0.12,
        groupPadding: 0.18,
      } as any,
      bar: {
        borderRadius: 6,
        borderWidth: 0,
      } as any,
      line: {
        lineWidth: 2.5,
      },
      area: {
        lineWidth: 2.5,
        fillOpacity: 0.18,
        marker: { enabled: false, radius: 3 },
      },
      areaspline: {
        lineWidth: 2.5,
        fillOpacity: 0.18,
        marker: { enabled: false, radius: 3 },
      },
      spline: {
        lineWidth: 2.5,
      },
      pie: {
        borderWidth: 0,
        borderRadius: 6,
        innerSize: '0%',
        dataLabels: {
          enabled: false,
          distance: 12,
          color: textPrimary as any,
          connectorColor: textDisabled as any,
          style: {
            color: textPrimary,
            fontSize: '12px',
            fontWeight: '600',
            fontFamily,
            textOutline: 'none',
          },
        },
      } as any,
      heatmap: {
        borderRadius: 6,
        borderWidth: 2,
        borderColor: paper,
      } as any,
      solidgauge: {
        rounded: true,
        innerRadius: '80%',
      } as any,
    },
    drilldown: {
      activeAxisLabelStyle: { color: p.primaryMain, textDecoration: 'none' },
      activeDataLabelStyle: { color: p.primaryMain, textDecoration: 'none' },
    },
    responsive: {
      rules: [
        {
          condition: { maxWidth: theme.breakpoints.values.sm },
          chartOptions: {
            xAxis: { labels: { style: { fontSize: '10.5px' } } },
            yAxis: { labels: { style: { fontSize: '10.5px' } } },
            legend: { itemStyle: { fontSize: '11.5px' }, itemDistance: 10 },
            plotOptions: {
              column: { borderRadius: 4 } as any,
              bar: { borderRadius: 4 } as any,
            },
          },
        },
      ],
    },
  };
}
