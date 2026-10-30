import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AcademicWeeklyTimetable } from './academic-weekly-timetable';

const section: AcademicInsightsSection = {
  key: 'timetable',
  status: 'ready',
  summary: '',
  items: [],
  metrics: [{ key: 'timetables', label: 'Timetables', value: 2 }],
  series: [
    {
      name: 'periods',
      points: [
        { key: 'tue:1', label: 'Tuesday / 1', x: 2, y: 1, value: 0 },
        { key: 'mon:1', label: 'Monday / 1', x: 1, y: 1, value: 2 },
        { key: 'mon:2', label: 'Monday / 2', x: 1, y: 2, value: 3 },
      ],
    },
  ],
};

describe('weekly timetable overview', () => {
  it('totals actual entries by day and distinguishes saved timetables from weekly entries', () => {
    render(<AcademicWeeklyTimetable section={section} />);
    const rows = within(screen.getByRole('list', { name: 'Daily timetable entries' })).getAllByRole(
      'listitem'
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Monday');
    expect(rows[0]).toHaveTextContent('5 entries');
    expect(rows[1]).toHaveTextContent('Tuesday');
    expect(rows[1]).toHaveTextContent('0 entries');
    expect(screen.getByText('Saved timetables').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText('Weekly entries').nextElementSibling).toHaveTextContent('5');
    expect(screen.getByRole('group', { name: 'Chart data' })).toHaveTextContent('Monday / 2');
  });

  it('keeps missing weekdays absent instead of reporting that they have zero entries', () => {
    render(<AcademicWeeklyTimetable section={section} />);
    expect(screen.queryByText('Wednesday')).not.toBeInTheDocument();
    expect(screen.queryByText('Sunday')).not.toBeInTheDocument();
  });

  it('does not invent the number of saved timetables when its metric is missing', () => {
    render(<AcademicWeeklyTimetable section={{ ...section, metrics: [] }} />);
    expect(screen.getByText('Saved timetables').nextElementSibling).toHaveTextContent(
      'Unavailable'
    );
  });
});
