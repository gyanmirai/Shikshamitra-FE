import type {
  AcademicInsightsSeries,
  AcademicInsightsSection,
} from 'src/redux/academicAPI/academicInsightsTypes';

import { it, expect, describe } from 'vitest';

import {
  columnSeries,
  displayValue,
  isFiniteValue,
  displaySeriesName,
  hasVisualizationData,
} from './visualization-data';

describe('academic visualization data', () => {
  it('humanizes known display names without changing raw chart data identities', () => {
    expect(displaySeriesName('attendance-score')).toBe('Attendance & published scores');
    expect(displaySeriesName('completed-exports')).toBe('Completed exports');
    expect(displaySeriesName('Custom subject group')).toBe('Custom subject group');
    const source: AcademicInsightsSeries[] = [{ name: 'recorded-progress', points: [] }];
    expect(columnSeries(source)[0].name).toBe('recorded-progress');
    expect(source[0].name).toBe('recorded-progress');
  });
  it('aligns series by point key and preserves missing observations as null', () => {
    const series: AcademicInsightsSeries[] = [
      { name: 'Homework', points: [{ key: 'today', label: 'Today', value: 0 }] },
      { name: 'Assignment', points: [{ key: 'overdue', label: 'Overdue', value: 2 }] },
    ];
    expect(columnSeries(series)).toEqual([
      { name: 'Homework', data: [0, null] },
      { name: 'Assignment', data: [null, 2] },
    ]);
  });

  it('does not coerce numeric-looking text or unavailable values to zero', () => {
    expect(isFiniteValue('42')).toBe(false);
    expect(isFiniteValue(null)).toBe(false);
    expect(isFiniteValue(Infinity)).toBe(false);
    expect(displayValue(null)).toBe('Unavailable');
    expect(displayValue(0, '%')).toBe('0%');
  });

  it('does not turn summary metrics into graphical observations', () => {
    const section: AcademicInsightsSection = {
      key: 'lesson',
      status: 'ready',
      summary: '',
      items: [],
      series: [],
      metrics: [{ key: 'total', label: 'Total', value: 12 }],
    };
    expect(hasVisualizationData(section)).toBe(false);
    expect(
      hasVisualizationData({
        ...section,
        series: [{ name: 'Status', points: [{ key: 'draft', label: 'Draft', value: 0 }] }],
      })
    ).toBe(true);
  });
});
