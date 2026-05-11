'use client';

import type { Options as HCOptions } from 'highcharts';
import type { HighchartsReactRefObject } from '@highcharts/react';

import { forwardRef } from 'react';
import { Chart, setHighcharts } from '@highcharts/react';

import { ensureHighchartsModules } from './highchartsModules';

// Register the global Highcharts instance (with all extra modules) once on
// the client. The new @highcharts/react v5 uses an internal singleton that
// we set via `setHighcharts` so subsequent <Chart /> calls pick up the
// fully-loaded namespace.
ensureHighchartsModules();
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  setHighcharts(require('highcharts'));
}

type Props = {
  options: HCOptions;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const HighchartsClient = forwardRef<HighchartsReactRefObject, Props>(
  ({ options, containerProps }, ref) => (
    <Chart
      ref={ref as any}
      options={options}
      containerProps={containerProps ?? { style: { width: '100%', height: '100%' } }}
    />
  )
);
