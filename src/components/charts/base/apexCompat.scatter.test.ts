import { it, expect, describe } from 'vitest';
import { createTheme } from '@mui/material/styles';

import { apexToHighcharts } from './apexCompat';

const observations = [{ name: 'Students', data: [{ name: 'Student A', x: 82, y: 71 }] }];

describe('shared scatter chart translation', () => {
  it('keeps independent observations visible without connecting lines', () => {
    const options = apexToHighcharts('scatter', observations,
      { markers: { size: 5 }, stroke: { width: 0 } }, createTheme());
    expect(options.plotOptions?.scatter?.marker).toMatchObject({ enabled: true, radius: 5 });
    expect(options.plotOptions?.scatter?.lineWidth).toBe(0);
    expect(options.series?.[0]).toMatchObject({ type: 'scatter', data: observations[0].data });
  });

  it('preserves explicit zero markers and does not alter other chart families', () => {
    const hidden = apexToHighcharts('scatter', observations, { markers: { size: 0 } }, createTheme());
    expect(hidden.plotOptions?.scatter?.marker?.enabled).toBe(false);
    const line = apexToHighcharts('line', observations, { stroke: { width: 2.5 } }, createTheme());
    expect(line.plotOptions?.scatter).toBeUndefined();
    expect(line.plotOptions?.series?.lineWidth).toBe(2.5);
  });
});
