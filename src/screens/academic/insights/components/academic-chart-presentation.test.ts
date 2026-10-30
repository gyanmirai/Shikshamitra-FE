import { it, expect, describe } from 'vitest';

import { percentageDomain, academicCountTooltip, academicScatterTooltip } from './academic-chart-presentation';

describe('Academic chart presentation', () => {
  it('keeps zero counts and identifies the actual bucket and series in tooltips', () => {
    const text = academicCountTooltip.call({ category: 'Due today', y: 0,
      series: { name: 'Homework', type: 'column' } });
    expect(text).toContain('Due today');
    expect(text).toContain('Homework: 0');
    expect(text).not.toContain('Unavailable');
  });
  it('fits percentage axes around actual observations with readable padding', () => {
    expect(percentageDomain([89, 96, 98])).toEqual({ min: 80, max: 100 });
    expect(percentageDomain([75, 84, 91])).toEqual({ min: 70, max: 100 });
  });

  it('retains zero and unusual real values without inventing an empty domain', () => {
    expect(percentageDomain([0])).toEqual({ min: 0, max: 5 });
    expect(percentageDomain([108])?.max).toBeGreaterThan(108);
    expect(percentageDomain([NaN])).toBeUndefined();
  });

  it('identifies both scatter coordinates and safely displays student names', () => {
    const text = academicScatterTooltip.call({ name: '<b>Student A</b>', x: 91, y: 78 });
    expect(text).toContain('&lt;b&gt;Student A&lt;/b&gt;');
    expect(text).toContain('Attendance: 91%');
    expect(text).toContain('Published score: 78%');
    expect(text).not.toContain('<b>Student A</b>');
  });
});
