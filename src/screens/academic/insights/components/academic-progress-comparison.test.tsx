import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AcademicProgressComparison } from './academic-progress-comparison';

const section: AcademicInsightsSection = {
  key: 'curriculum',
  status: 'ready',
  summary: '',
  items: [],
  metrics: [{ key: 'recorded-progress', label: 'Average recorded progress', value: 63, unit: '%' }],
  series: [
    { name: 'recorded-progress', points: [{ key: 'math', label: 'Mathematics', value: 80 }] },
  ],
};

describe('syllabus progress headline', () => {
  it('uses the authoritative aggregate rather than averaging the preview points', () => {
    render(<AcademicProgressComparison section={section} />);
    const headline = screen.getByRole('group', { name: 'Syllabus progress summary' });
    expect(headline).toHaveTextContent('63%');
    expect(headline).toHaveTextContent('Average recorded progress');
    expect(headline).not.toHaveTextContent('80%');
    expect(headline).not.toHaveTextContent('chapters');
  });

  it('keeps a real zero visible without inventing a percentage when the aggregate is missing', () => {
    const { rerender } = render(
      <AcademicProgressComparison
        section={{ ...section, metrics: [{ ...section.metrics[0], value: 0 }] }}
      />
    );
    expect(screen.getByRole('group', { name: 'Syllabus progress summary' })).toHaveTextContent(
      '0%'
    );
    rerender(<AcademicProgressComparison section={{ ...section, metrics: [] }} />);
    expect(
      screen.queryByRole('group', { name: 'Syllabus progress summary' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Mathematics', { selector: 'p' })).toBeVisible();
  });
});
