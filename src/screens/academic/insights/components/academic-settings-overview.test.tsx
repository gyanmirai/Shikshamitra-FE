import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { academicPaths } from 'src/constants/academic-menu';

import { getAcademicSettingsFooterLinks } from './academic-settings-data';
import { AcademicInsightsVisualization } from './academic-insights-visualization';

vi.mock('src/components/chart', () => ({
  Chart: () => <div />,
  useChart: (value: unknown) => value,
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden /> }));

const section: AcademicInsightsSection = {
  key: 'settings',
  status: 'ready',
  summary: '',
  metrics: [],
  series: [
    {
      name: 'existence',
      points: [{ key: 'subjects', label: 'subjects', value: 1, status: 'configured' }],
    },
  ],
  items: [
    { id: 'subjects', label: 'subjects', status: 'configured' },
    { id: 'rubrics', label: 'rubrics', status: 'empty' },
    { id: 'weekly-lectures', label: 'weekly-lectures', status: 'context-required' },
  ],
};
const links = [
  { label: 'Setup guide', href: academicPaths.setup, permission: 'view' },
  {
    label: 'Subjects creation',
    href: academicPaths.curriculum.settings.subjectsCreation,
    permission: 'view',
  },
  {
    label: 'Weekly lectures',
    href: academicPaths.timetable.settings.weeklyLectures,
    permission: 'view',
  },
];

describe('academic settings dashboard checklist', () => {
  it('groups settings and distinguishes record existence, missing records and required class context', () => {
    render(<AcademicInsightsVisualization section={section} links={links} />);
    expect(screen.getByText('1 setting with records')).toBeVisible();
    expect(screen.getByText('Records available')).toBeVisible();
    expect(screen.getByText('No records')).toBeVisible();
    expect(screen.getByText('Class needed')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Timetable' })).toBeVisible();
    expect(screen.getByText('Choose a class on the settings page.')).toBeVisible();
    expect(screen.getAllByText('Subjects Creation')).toHaveLength(1);
    expect(screen.queryByText('Configured')).not.toBeInTheDocument();
  });

  it('offers only the existing permission-filtered destinations', () => {
    render(<AcademicInsightsVisualization section={section} links={links} />);
    expect(screen.getByRole('link', { name: 'Subjects Creation' })).toHaveAttribute(
      'href',
      links[1].href
    );
    expect(screen.getByRole('link', { name: 'Weekly Lectures' })).toHaveAttribute(
      'href',
      links[2].href
    );
    expect(screen.queryByRole('link', { name: 'Rubric Templates' })).not.toBeInTheDocument();
  });

  it('retains the setup-guide footer without repeating settings links and preserves error navigation', () => {
    expect(getAcademicSettingsFooterLinks(section, links)).toEqual([links[0]]);
    expect(getAcademicSettingsFooterLinks({ ...section, status: 'error' }, links)).toEqual(links);
  });

  it('uses a supplied existence observation when the matching item has no status', () => {
    render(
      <AcademicInsightsVisualization
        section={{ ...section, items: [{ id: 'subjects', label: 'subjects' }] }}
        links={links}
      />
    );
    expect(screen.getByText('1 setting with records')).toBeVisible();
    expect(screen.getByText('Records available')).toBeVisible();
  });
});
