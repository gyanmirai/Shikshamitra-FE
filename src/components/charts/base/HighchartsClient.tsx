'use client';

import type { Options as HCOptions } from 'highcharts';
import type { HighchartsReactRefObject } from '@highcharts/react';

import { forwardRef } from 'react';
import { Chart, setHighcharts } from '@highcharts/react';

import { ensureHighchartsModules, Highcharts } from './highchartsModules';

// Register the global Highcharts instance (with all extra modules) once on
// the client. The new @highcharts/react v5 uses an internal singleton that
// we set via `setHighcharts` so subsequent <Chart /> calls pick up the
// fully-loaded namespace.
ensureHighchartsModules();
if (typeof window !== 'undefined') {
  setHighcharts(Highcharts);
}

type Props = {
  options: HCOptions;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const HighchartsClient = forwardRef<HighchartsReactRefObject, Props>(
  ({ options, containerProps }, ref) => (
    <Chart
      ref={ref as any}
      highcharts={Highcharts}
      options={options as any}
      containerProps={containerProps ?? { style: { width: '100%', height: '100%' } }}
    />
  )
);
