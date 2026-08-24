'use client';

/* eslint-disable import/extensions */

// Lazy-load Highcharts modules on the client only. Importing all of them
// here keeps every consuming chart fully featured (heatmap, gauge, export,
// accessibility, etc.) without requiring per-chart wiring.
//
// Highcharts v13 with @highcharts/react uses the es-modules master modules.
// Importing them registers each module on the shared Highcharts instance.

import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import 'highcharts/es-modules/masters/highcharts-more.src.js';
import 'highcharts/es-modules/masters/modules/solid-gauge.src.js';
import 'highcharts/es-modules/masters/modules/heatmap.src.js';
import 'highcharts/es-modules/masters/modules/treemap.src.js';
import 'highcharts/es-modules/masters/modules/funnel.src.js';
import 'highcharts/es-modules/masters/modules/exporting.src.js';
import 'highcharts/es-modules/masters/modules/export-data.src.js';
import 'highcharts/es-modules/masters/modules/offline-exporting.src.js';
import 'highcharts/es-modules/masters/modules/accessibility.src.js';
import 'highcharts/es-modules/masters/modules/pattern-fill.src.js';

export function ensureHighchartsModules(): typeof Highcharts {
  return Highcharts;
}

export { Highcharts };
