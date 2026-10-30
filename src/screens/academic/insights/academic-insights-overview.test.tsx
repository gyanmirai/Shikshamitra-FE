
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AcademicInsightsOverview } from './academic-insights-overview';

import type { AcademicInsightsDisplayArea } from './academic-insights-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden /> }));

const area = (
  key: 'lesson' | 'curriculum',
  value: number | null,
  status = 'ready'
): AcademicInsightsDisplayArea => ({
  area: {
    key,
    title: key === 'lesson' ? 'Lesson Plans & Teacher Diary' : 'Subjects & Syllabus',
    icon: 'solar:book-bold',
    links: [],
  },
  section: {
    key,
    status: status as 'ready' | 'error',
    summary: '',
    metrics: [
      {
        key: 'recorded',
        label: key === 'lesson' ? 'Lesson plans' : 'Recorded progress',
        value,
        unit: key === 'curriculum' ? '%' : undefined,
      },
    ],
    series: [],
    items: [],
  },
  links: [],
});

describe('Academic overview presentation', () => {
  it('names the summary and keeps the supplied role priority and genuine zero', () => {
    render(<AcademicInsightsOverview areas={[area('lesson', 0), area('curriculum', 70)]} />);
    const overview = screen.getByRole('group', { name: 'Academic overview' });
    const metrics = within(overview).getAllByRole('definition');
    expect(metrics.map((metric) => metric.textContent)).toEqual(['0', '70%']);
    expect(within(overview).getByText('Lesson Plans & Teacher Diary')).toBeVisible();
    expect(within(overview).getByText('Subjects & Syllabus')).toBeVisible();
    expect(within(overview).queryByRole('link')).not.toBeInTheDocument();
  });

  it('omits missing and failed metrics rather than showing sample dashboard figures', () => {
    render(
      <AcademicInsightsOverview areas={[area('lesson', null), area('curriculum', 70, 'error')]} />
    );
    expect(screen.queryByRole('group', { name: 'Academic overview' })).not.toBeInTheDocument();
    expect(screen.queryByText('70%')).not.toBeInTheDocument();
  });
});
