import { it, expect, describe } from 'vitest';

import { expandAcademicSetupAncestors } from './academic-setup-tree-utils';

import type { AcademicSetupNode } from './academic-setup-model';

describe('academic hierarchy tree state', () => {
  it('opens every ancestor when navigation selects a deep child', () => {
    const node = {
      id: 'division-1',
      name: 'A',
      type: 'Division',
      data: { id: 'year-1', name: '2026-2027' },
      parentsData: {
        board: { id: 'board-1' },
        medium: { id: 'medium-1' },
        organization: { id: 'stage-1' },
        standard: { id: 'standard-1' },
      },
    } as AcademicSetupNode;

    expect(expandAcademicSetupAncestors({}, node)).toEqual({
      'board-1': true,
      'medium-1': true,
      'stage-1': true,
      'standard-1': true,
    });
  });
});
