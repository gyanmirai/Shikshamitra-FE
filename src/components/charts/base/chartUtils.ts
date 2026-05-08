'use client';

import type Highcharts from 'highcharts';
import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------
// Reusable utilities for building polished Highcharts configs.
// ----------------------------------------------------------------------

/**
 * Returns CSS-variable based palette colors when the theme exposes
 * `theme.vars` (MUI CSS-vars mode). This is critical for dark mode: with
 * CSS vars, `theme.palette.text.primary` returns a static hex from the
 * BASE palette and never switches with the active mode, while
 * `theme.vars.palette.text.primary` is `var(--palette-text-primary)` and
 * automatically follows light/dark.
 */
export function getThemePalette(theme: Theme) {
  const v: any = (theme as any).vars ?? null;
  const p = v?.palette ?? theme.palette;
  return {
    textPrimary: p.text.primary,
    textSecondary: p.text.secondary,
    textDisabled: p.text.disabled,
    divider: p.divider,
    paper: p.background.paper,
    primaryMain: p.primary.main,
    primaryDark: p.primary.dark,
    primaryLight: p.primary.light,
    successMain: p.success.main,
    successDark: p.success.dark,
    warningMain: p.warning.main,
    warningDark: p.warning.dark,
    infoMain: p.info.main,
    infoDark: p.info.dark,
    errorMain: p.error.main,
    actionHover: p.action.hover,
  };
}

/** Soft vertical gradient fill — perfect for area/spline charts. */
export function makeAreaGradient(color: string, intensity = 0.45): Highcharts.GradientColorObject {
  return {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, hexWithAlpha(color, intensity)],
      [1, hexWithAlpha(color, 0)],
    ],
  };
}

/** Vertical gradient for columns/bars (top → softer bottom). */
export function makeBarGradient(color: string): Highcharts.GradientColorObject {
  return {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, color],
      [1, hexWithAlpha(color, 0.55)],
    ],
  };
}

/** Convert any CSS color to rgba with alpha, falling back to original. */
export function hexWithAlpha(color: string, alpha: number): string {
  if (!color) return color;
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return color;
    const parts = m[1].split(',').map((s) => s.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

/** Default brand palette derived from the MUI theme. */
export function getBrandPalette(theme: Theme): string[] {
  const p = getThemePalette(theme);
  return [
    p.primaryMain,
    p.warningMain,
    p.infoMain,
    p.errorMain,
    p.successMain,
    p.warningDark,
    p.successDark,
    p.infoDark,
    p.primaryDark,
  ];
}

/** A premium tooltip formatter (HTML). */
export function premiumTooltipFormatter(theme: Theme) {
  return function tooltipFormatter(this: any) {
    const points: any[] = this.points ?? [this];
    const first = points[0];
    const firstSeriesType = first?.series?.type;
    const firstIsPieLike =
      firstSeriesType === 'pie' ||
      firstSeriesType === 'funnel' ||
      firstSeriesType === 'pyramid' ||
      firstSeriesType === 'variablepie';

    // For pie/donut/funnel series the slice name is the only meaningful
    // header. For everything else, prefer the human-readable category /
    // key over the raw x value (which is a numeric index when the axis
    // uses categories).
    let rawTitle: any;
    if (firstIsPieLike) {
      rawTitle = first?.point?.name ?? first?.name ?? first?.key ?? first?.point?.category ?? '';
    } else {
      rawTitle =
        first?.point?.category ??
        first?.point?.name ??
        first?.key ??
        first?.category ??
        first?.name ??
        this.key ??
        this.x;
    }
    const title =
      typeof rawTitle === 'number' && first?.series?.xAxis?.categories
        ? (first.series.xAxis.categories[rawTitle] ?? rawTitle)
        : (rawTitle ?? '');
    const rows = points
      .map((p) => {
        const color = p.color ?? p.series.color;
        const value = typeof p.y === 'number' ? p.y.toLocaleString() : p.y;
        // For pie/donut and similar single-point series, prefer the
        // point's own name (slice label) over the series name.
        const isPieLike =
          p.series?.type === 'pie' || p.series?.type === 'funnel' || p.series?.type === 'pyramid';
        const label = isPieLike ? (p.name ?? p.series.name) : p.series.name;
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:4px 12px;font-family:${
            theme.typography.fontFamily
          };">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};"></span>
            <span style="color:${theme.palette.text.secondary};font-size:12px;flex:1;">${label}</span>
            <span style="color:${
              theme.palette.text.primary
            };font-size:12.5px;font-weight:600;">${value}</span>
          </div>`;
      })
      .join('');

    return `
      <div style="min-width:160px;border-radius:12px;overflow:hidden;backdrop-filter:blur(8px);">
        <div style="padding:8px 12px;font-size:12px;font-weight:700;color:${
          theme.palette.text.primary
        };background:${varAlpha(theme.palette.grey['500Channel'], 0.08)};">${title}</div>
        <div style="padding:4px 0;">${rows}</div>
      </div>`;
  };
}

/** Centered text inside a donut. */
export function donutCenterTitle(label: string, value: string | number, theme: Theme) {
  const p = getThemePalette(theme);
  return `
    <div style="text-align:center;font-family:${theme.typography.fontFamily};">
      <div style="font-size:12px;font-weight:600;color:${p.textSecondary};">${label}</div>
      <div style="font-size:22px;font-weight:700;color:${p.textPrimary};margin-top:4px;">${value}</div>
    </div>`;
}

/** Build a standard responsive rule that scales for mobile. */
export const RESPONSIVE_MOBILE_RULE = (maxWidth = 600) => ({
  condition: { maxWidth },
  chartOptions: {
    legend: { itemDistance: 10, itemStyle: { fontSize: '11.5px' } },
    xAxis: { labels: { style: { fontSize: '10.5px' } } },
    yAxis: { labels: { style: { fontSize: '10.5px' } } },
  },
});
