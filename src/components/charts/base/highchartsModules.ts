'use client';

/* eslint-disable import/extensions */

// Lazy-load Highcharts modules on the client only. Importing all of them
// here keeps every consuming chart fully featured (heatmap, gauge, export,
// accessibility, etc.) without requiring per-chart wiring.
//
// Highcharts v12 modules are UMD bundles that self-register against the
// global `_Highcharts` reference set by the highcharts entry. Importing
// them for side-effects is enough.

import Highcharts from 'highcharts/esm/highcharts.js';
import 'highcharts/esm/highcharts-more.js';
import 'highcharts/esm/modules/solid-gauge.js';
import 'highcharts/esm/modules/heatmap.js';
import 'highcharts/esm/modules/treemap.js';
import 'highcharts/esm/modules/funnel.js';
import 'highcharts/esm/modules/exporting.js';
import 'highcharts/esm/modules/export-data.js';
import 'highcharts/esm/modules/offline-exporting.js';
import 'highcharts/esm/modules/accessibility.js';
import 'highcharts/esm/modules/pattern-fill.js';

export function ensureHighchartsModules(): typeof Highcharts {
  return Highcharts;
}

export { Highcharts };
