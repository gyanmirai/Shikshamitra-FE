import { it, expect, describe } from 'vitest';
import { emptyAccessSelection } from 'src/utils/academicHierarchyUtils';
import { buildUserScopeBulkAssignPayload } from 'src/utils/userScopeBulkAssignPayload';

describe('staff academic permission payload', () => {
  const allBoards = [
    {
      id: 'board-1',
      academicYearId: 'year-1',
      educationMediums: [
        {
          id: 'medium-1',
          educationMediumStages: [
            {
              id: 'stage-1',
              standards: [],
            },
          ],
        },
      ],
    },
  ];

  it('builds the V2 bulk assign body without old flat-array fields', () => {
    const payload = buildUserScopeBulkAssignPayload({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      selection: {
        ...emptyAccessSelection(),
        organizations: ['stage-1'],
      },
      allBoards,
    });

    expect(payload).toEqual({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      scopes: [
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
          educationMediumStageId: 'stage-1',
        },
      ],
      clearExisting: false,
    });
    expect(payload).not.toHaveProperty('academicYearIds');
    expect(payload).not.toHaveProperty('educationBoardIds');
    expect(payload).not.toHaveProperty('educationMediumIds');
    expect(payload).not.toHaveProperty('educationMediumStageIds');
    expect(payload).not.toHaveProperty('standardIds');
    expect(payload).not.toHaveProperty('divisionIds');
  });
});
