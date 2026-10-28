import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';

import { AcademicHealthScoreCard } from './AcademicHealthScoreCard';

const props = {
  title: 'Academic Health',
  status: 'Healthy',
  description: 'Current academic readiness.',
  factors: [{ label: 'Curriculum', value: 'undefined%', tone: 'success' as const }],
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Academic health score presentation', () => {
  it.each([NaN, Infinity])(
    'shows unavailable rather than rendering a non-finite score (%s)',
    (score) => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<AcademicHealthScoreCard {...props} score={score} />);
      expect(screen.getByText('Unavailable', { exact: true })).toBeVisible();
      expect(screen.getByText('Academic health data is unavailable.')).toBeVisible();
      expect(screen.queryByText('Healthy', { exact: true })).not.toBeInTheDocument();
      expect(screen.queryByText('undefined%')).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
    }
  );

  it('retains a valid zero score and its supplied status', () => {
    render(<AcademicHealthScoreCard {...props} score={0} status="Needs Attention" factors={[]} />);
    const card = screen.getByRole('region', { name: 'Academic Health' });
    expect(within(card).getByRole('heading', { level: 3, name: '0' })).toBeVisible();
    expect(within(card).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(within(card).getByText('Needs Attention')).toBeVisible();
  });
});
