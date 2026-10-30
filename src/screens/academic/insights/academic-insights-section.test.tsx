import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { AcademicInsightsSectionCard } from './academic-insights-section';
import { ChartDataAlternative } from './components/chart-data-alternative';

import type { AcademicInsightsDisplayArea } from './academic-insights-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('./components/academic-insights-visualization', () => ({
  AcademicInsightsVisualization: () => <div>Recorded progress visualization</div>,
}));

const entry: AcademicInsightsDisplayArea = {
  area: { key: 'curriculum', title: 'Subject Allocation & Syllabus', icon: 'solar:notebook-bold', links: [] },
  section: { key: 'curriculum', status: 'ready', summary: 'Recorded progress only; no planned target is inferred.',
    metrics: [], series: [], items: [] }, links: [],
};

describe('Academic Insights section consistency', () => {
  it('uses a named section, semantic heading and keyboard-accessible section information', async () => {
    render(<AcademicInsightsSectionCard entry={entry} refreshing={false} onRetry={vi.fn()} />);
    expect(screen.getByRole('region', { name: entry.area.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: entry.area.title })).toBeVisible();
    const help = screen.getByRole('button', { name: `${entry.area.title} information` });
    await userEvent.tab();
    expect(help).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(entry.section.summary);
    expect(screen.getByText('Recorded progress visualization')).toBeVisible();
  });

  it('keeps chart values accessible without a repeated visible data toggle', () => {
    render(<ChartDataAlternative series={[{ name: 'recorded-progress',
      points: [{ key: 'maths', label: 'Mathematics', value: 68 }] }]} unit="%" />);
    expect(screen.queryByText('View chart data')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const alternative = screen.getByRole('group', { name: 'Chart data' });
    expect(alternative).not.toHaveAttribute('aria-hidden');
    expect(alternative).toHaveTextContent('Mathematics');
    expect(alternative).toHaveTextContent('68%');
  });
});
