import type { Board } from 'src/types/school';

import { it, expect, describe } from 'vitest';

import { NODE_TYPE_META, buildHierarchyTree, findHierarchyNode } from './academic-setup-model';

describe('academic hierarchy model', () => {
  const year = { id: 'year-1', name: '2026-2027' };
  const board = {
    id: 'board-1',
    name: 'CBSE',
    type: 1,
    academicYearId: year.id,
    creationTime: '',
    creatorId: '',
    lastModificationTime: '',
    lastModifierId: '',
    educationMediums: [
      {
        id: 'medium-1',
        name: 'English',
        educationBoardId: 'board-1',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStages: [
          {
            id: 'stage-1',
            name: 'Primary',
            educationMediumId: 'medium-1',
            creationTime: '',
            creatorId: '',
            lastModificationTime: '',
            lastModifierId: '',
            standards: [],
          },
        ],
      },
    ],
  } satisfies Board;

  it('keeps Organization as the API type but presents it as Stage', () => {
    const tree = buildHierarchyTree([board], year);
    const stage = findHierarchyNode(tree, 'stage-1', 'Organization');

    expect(stage?.name).toBe('Primary');
    expect(stage?.parentsData.board?.name).toBe('CBSE');
    expect(NODE_TYPE_META.Organization.label).toBe('Stage');
    expect(NODE_TYPE_META.Organization.addLabel).toBe('Add standard');
  });
});
