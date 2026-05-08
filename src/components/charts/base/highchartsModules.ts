'use client';

// Lazy-load Highcharts modules on the client only. Importing all of them
// here keeps every consuming chart fully featured (heatmap, gauge, export,
// accessibility, etc.) without requiring per-chart wiring.
//
// Highcharts v12 modules are UMD bundles that self-register against the
// global `_Highcharts` reference set by the highcharts entry. Importing
// them for side-effects is enough.

import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/solid-gauge';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/treemap';
import 'highcharts/modules/funnel';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/offline-exporting';
import 'highcharts/modules/accessibility';
import 'highcharts/modules/pattern-fill';

export function ensureHighchartsModules(): typeof Highcharts {
  return Highcharts;
}

export { Highcharts };
