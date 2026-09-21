import { it, expect, describe } from 'vitest';

import { buildExamResultRows, buildClassProgressRows } from './academic-dashboard-chart-data';

describe('academic dashboard chart data', () => {
  it('removes assessments that do not have result records', () => {
    expect(
      buildExamResultRows({
        subjectNames: ['Exam without results', 'Class 10-A Unit Test'],
        passCounts: [0, 24],
        failCounts: [0, 3],
      })
    ).toEqual([
      {
        assessment: 'Class 10-A Unit Test',
        passed: 24,
        failed: 3,
        total: 27,
      },
    ]);
  });

  it('normalizes invalid counts instead of sending NaN to the chart', () => {
    expect(
      buildExamResultRows({
        subjectNames: ['Class 9-B Final'],
        passCounts: [Number.NaN],
        failCounts: [2.4],
      })
    ).toEqual([
      {
        assessment: 'Class 9-B Final',
        passed: 0,
        failed: 2,
        total: 2,
      },
    ]);
  });

  it('keeps class labels and clamps progress to the percentage range', () => {
    expect(
      buildClassProgressRows({
        classNames: ['Class 8 - A', 'Class 9 - B'],
        completionPercentages: [45, 140],
      })
    ).toEqual([
      { classDivision: 'Class 8 - A', completion: 45 },
      { classDivision: 'Class 9 - B', completion: 100 },
    ]);
  });
});
