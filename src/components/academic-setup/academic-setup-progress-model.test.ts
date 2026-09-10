import { it, expect, describe } from 'vitest';

import {
  getHierarchyCounts,
  getHierarchyCoverage,
  getHierarchyNextStep,
} from './academic-setup-progress-model';

describe('academic hierarchy progress', () => {
  const boards = [
    {
      id: 'board-1',
      name: 'CBSE',
      academicYearId: 'year-1',
      educationMediums: [
        {
          id: 'medium-1',
          name: 'English',
          educationBoardId: 'board-1',
          educationMediumStages: [
            {
              id: 'stage-1',
              name: 'Primary',
              educationMediumId: 'medium-1',
              standards: [],
            },
          ],
        },
      ],
    },
  ];

  it('counts each level and reports structural coverage', () => {
    const counts = getHierarchyCounts(boards);

    expect(counts).toEqual({ boards: 1, mediums: 1, stages: 1, standards: 0, divisions: 0 });
    expect(getHierarchyCoverage(counts)).toEqual({ completedLevels: 3, percentage: 60 });
  });

  it('explains the next actionable hierarchy step', () => {
    expect(getHierarchyNextStep(getHierarchyCounts(boards))).toBe(
      'Select a stage and add its first standard.'
    );
    expect(
      getHierarchyNextStep({ boards: 0, mediums: 0, stages: 0, standards: 0, divisions: 0 })
    ).toBe('Start by adding the first education board for this academic year.');
  });
});
