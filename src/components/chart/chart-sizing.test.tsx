import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Chart } from './chart';

vi.mock('src/components/charts/base/BaseChart', () => ({
  BaseChart: ({ options }: { options: { chart?: { height?: number | string } } }) =>
    <div data-testid="chart-engine" data-height={options.chart?.height} />,
}));

describe('shared chart frame and renderer sizing', () => {
  it.each([{ height: 280, pixels: '280' }, { height: '264px', pixels: '264' }])(
    'forwards the visible frame height to the renderer ($height)', ({ height, pixels }) => {
      render(<Chart type="bar" height={height} series={[{ name: 'Count', data: [4, 12] }]}
        options={{ chart: { height: 400 } }} />);
      expect(screen.getByTestId('chart-engine')).toHaveAttribute('data-height', pixels);
    }
  );

  it('preserves explicit renderer sizing when the frame uses an adaptive CSS height', () => {
    render(<Chart type="bar" height="100%" series={[{ name: 'Count', data: [4] }]}
      options={{ chart: { height: 320 } }} />);
    expect(screen.getByTestId('chart-engine')).toHaveAttribute('data-height', '320');
  });
});
