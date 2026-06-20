import { it, expect, describe } from 'vitest';

import {
  hasAccessSelection,
  getScopedAcademicData,
  getScopedAcademicYears,
  expandAccessibleHierarchy,
  emptyAccessSelection,
  getGlobalAcademicSearchOptions,
  compressExplicitAcademicSelection,
  getValidGlobalAcademicSelection,
  getScopedSelectedAcademicOption,
} from './academicHierarchyUtils';

describe('expandAccessibleHierarchy', () => {
  const allBoards = [
    {
      id: 'board-1',
      educationMediums: [
        {
          id: 'medium-english',
          educationMediumStages: [
            {
              id: 'stage-primary',
              standards: [
                {
                  id: 'std-1',
                  divisions: [{ id: 'div-a' }, { id: 'div-b' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  it('expands a parent medium selection into all child stages, standards, and divisions', () => {
    const accessControl = {
      accessibleHierarchy: [
        {
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-1',
              hasFullMediumAccess: false,
              mediums: [
                {
                  mediumId: 'medium-english',
                  hasFullMediumStageAccess: true,
                  mediumStages: [],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(expandAccessibleHierarchy(accessControl, allBoards)).toEqual({
      boards: [],
      mediums: ['medium-english'],
      organizations: ['stage-primary'],
      standards: ['std-1'],
      divisions: ['div-a', 'div-b'],
    });
  });

  it('compresses expanded parent access back to the explicit parent payload', () => {
    expect(
      compressExplicitAcademicSelection(
        {
          boards: [],
          mediums: ['medium-english'],
          organizations: ['stage-primary'],
          standards: ['std-1'],
          divisions: ['div-a', 'div-b'],
        },
        allBoards
      )
    ).toEqual({
      boards: [],
      mediums: ['medium-english'],
      organizations: [],
      standards: [],
      divisions: [],
    });
  });

  it('returns empty arrays for empty selections without marking access present', () => {
    const compressed = compressExplicitAcademicSelection(emptyAccessSelection(), allBoards);

    expect(compressed).toEqual(emptyAccessSelection());
    expect(hasAccessSelection(compressed)).toBe(false);
  });

  it('does not escalate child-only selections to a parent payload', () => {
    expect(
      compressExplicitAcademicSelection(
        {
          boards: [],
          mediums: [],
          organizations: ['stage-primary'],
          standards: ['std-1'],
          divisions: ['div-a', 'div-b'],
        },
        allBoards
      )
    ).toEqual({
      boards: [],
      mediums: [],
      organizations: ['stage-primary'],
      standards: [],
      divisions: [],
    });
  });
});

describe('global academic scoped options', () => {
  const academicData = [
    {
      id: 'year-2026',
      name: '2026-2027',
      boards: [
        {
          id: 'board-cbse',
          name: 'CBSE',
          educationMediums: [
            {
              id: 'medium-cbse-english',
              name: 'English',
              educationMediumStages: [{ id: 'stage-cbse-secondary', name: 'Secondary' }],
            },
          ],
        },
        {
          id: 'board-gseb',
          name: 'GSEB',
          educationMediums: [
            {
              id: 'medium-gseb-english',
              name: 'English',
              educationMediumStages: [{ id: 'stage-gseb-secondary', name: 'Secondary' }],
            },
          ],
        },
      ],
    },
  ];
  const deepAcademicData = [
    {
      id: 'year-2026',
      name: '2026-2027',
      boards: [
        {
          id: 'board-cbse',
          name: 'CBSE',
          educationMediums: [
            {
              id: 'medium-cbse-english',
              name: 'English',
              educationMediumStages: [
                {
                  id: 'stage-primary',
                  name: 'Primary',
                  standards: [
                    {
                      id: 'standard-one',
                      name: 'Class 1',
                      divisions: [
                        { id: 'division-a', name: 'A' },
                        { id: 'division-b', name: 'B' },
                      ],
                    },
                    {
                      id: 'standard-two',
                      name: 'Class 2',
                      divisions: [{ id: 'division-c', name: 'C' }],
                    },
                  ],
                },
                {
                  id: 'stage-secondary',
                  name: 'Secondary',
                  standards: [
                    {
                      id: 'standard-nine',
                      name: 'Class 9',
                      divisions: [{ id: 'division-d', name: 'D' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  it('keeps year-only access available even when no board and medium options survive pruning', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [],
        },
      ],
    };
    const academicYears = [
      ...academicData,
      {
        id: 'year-2027',
        name: '2027-2028',
        boards: [],
      },
    ];

    const scopedData = getScopedAcademicData(academicYears, accessControl);
    const scopedYears = getScopedAcademicYears(academicYears, accessControl);

    expect(scopedData).toEqual([]);
    expect(scopedYears.map((year) => year.id)).toEqual(['year-2026']);
  });

  it('does not include restricted board and medium combinations', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: false,
              mediums: [
                {
                  mediumId: 'medium-cbse-english',
                  mediumName: 'English',
                  hasAccess: true,
                  hasFullMediumStageAccess: true,
                  mediumStages: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    expect(options.map((option) => option.label)).toEqual(['2026-2027 / CBSE / English']);
    expect(options.map((option) => option.label)).not.toContain('2026-2027 / GSEB / English');
  });

  it('includes only the scoped board for a board-level assignment', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };

    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    expect(scopedData[0].boards.map((board) => board.name)).toEqual(['CBSE']);
    expect(options.map((option) => option.label)).toEqual(['2026-2027 / CBSE / English']);
  });

  it('replaces a stale persisted currentYear with the scoped year tree', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };
    const staleCurrentYear = academicData[0];
    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    const selection = getValidGlobalAcademicSelection(
      staleCurrentYear,
      {},
      {},
      scopedData,
      options
    );

    expect(selection?.academicYear).toBe(scopedData[0]);
    expect(selection?.academicYear.boards.map((board) => board.name)).toEqual(['CBSE']);
    expect(selection?.academicYear.boards.map((board) => board.name)).not.toContain('GSEB');
  });

  it('clears a persisted restricted board and medium while preserving the scoped year', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };
    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    const selection = getValidGlobalAcademicSelection(
      academicData[0],
      academicData[0].boards[1],
      academicData[0].boards[1].educationMediums[0],
      scopedData,
      options
    );

    expect(selection?.academicYear).toBe(scopedData[0]);
    expect(selection?.board).toEqual({});
    expect(selection?.medium).toEqual({});
    expect(selection?.selectedOption).toBeNull();
    expect(selection?.clearYear).toBe(false);
  });

  it('does not return a selected option for a restricted persisted board and medium', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };
    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    const selectedOption = getScopedSelectedAcademicOption(
      academicData[0],
      academicData[0].boards[1],
      academicData[0].boards[1].educationMediums[0],
      options
    );

    expect(selectedOption).toBeNull();
  });

  it('does not return a renderable board and medium option for a restricted persisted selection', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };
    const staleRestrictedSelection = {
      label: '2026-2027 / GSEB / English',
      value: 'year-2026-board-gseb-medium-gseb-english',
      academicYear: academicData[0],
      board: academicData[0].boards[1],
      medium: academicData[0].boards[1].educationMediums[0],
    };
    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);
    const renderedOption = getScopedSelectedAcademicOption(
      staleRestrictedSelection.academicYear,
      staleRestrictedSelection.board,
      staleRestrictedSelection.medium,
      options
    );

    expect(renderedOption).toBeNull();
    expect(renderedOption?.label).not.toBe(staleRestrictedSelection.label);
  });

  it('keeps a valid scoped board and medium selected', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              boardName: 'CBSE',
              hasAccess: true,
              hasFullMediumAccess: true,
              mediums: [],
            },
          ],
        },
      ],
    };
    const scopedData = getScopedAcademicData(academicData, accessControl);
    const options = getGlobalAcademicSearchOptions(scopedData);

    const selectedOption = getScopedSelectedAcademicOption(
      academicData[0],
      academicData[0].boards[0],
      academicData[0].boards[0].educationMediums[0],
      options
    );

    expect(selectedOption?.label).toBe('2026-2027 / CBSE / English');
  });

  it('prunes sibling stages for a stage-scoped user', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              hasFullMediumAccess: false,
              mediums: [
                {
                  mediumId: 'medium-cbse-english',
                  hasFullMediumStageAccess: false,
                  mediumStages: [
                    {
                      mediumStageId: 'stage-primary',
                      hasAccess: true,
                      hasFullStandardAccess: true,
                      standards: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const scopedData = getScopedAcademicData(deepAcademicData, accessControl);
    const stages = scopedData[0].boards[0].educationMediums[0].educationMediumStages;

    expect(stages.map((stage) => stage.name)).toEqual(['Primary']);
    expect(stages[0].standards.map((standard) => standard.name)).toEqual(['Class 1', 'Class 2']);
  });

  it('prunes sibling standards for a standard-scoped user', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              hasFullMediumAccess: false,
              mediums: [
                {
                  mediumId: 'medium-cbse-english',
                  hasFullMediumStageAccess: false,
                  mediumStages: [
                    {
                      mediumStageId: 'stage-primary',
                      hasFullStandardAccess: false,
                      standards: [
                        {
                          standardId: 'standard-one',
                          hasAccess: true,
                          hasFullDivisionAccess: true,
                          divisions: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const scopedData = getScopedAcademicData(deepAcademicData, accessControl);
    const [{ boards }] = scopedData;
    const [{ educationMediums }] = boards;
    const [{ educationMediumStages }] = educationMediums;
    const [{ standards }] = educationMediumStages;

    expect(standards.map((standard) => standard.name)).toEqual(['Class 1']);
    const [standard] = standards;
    expect(standard.divisions.map((division) => division.name)).toEqual(['A', 'B']);
  });

  it('prunes sibling divisions for a division-scoped user', () => {
    const accessControl = {
      isAdmin: false,
      accessibleHierarchy: [
        {
          academicYearId: 'year-2026',
          hasFullBoardAccess: false,
          boards: [
            {
              boardId: 'board-cbse',
              hasFullMediumAccess: false,
              mediums: [
                {
                  mediumId: 'medium-cbse-english',
                  hasFullMediumStageAccess: false,
                  mediumStages: [
                    {
                      mediumStageId: 'stage-primary',
                      hasFullStandardAccess: false,
                      standards: [
                        {
                          standardId: 'standard-one',
                          hasFullDivisionAccess: false,
                          divisions: [{ divisionId: 'division-a', hasAccess: true }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const scopedData = getScopedAcademicData(deepAcademicData, accessControl);
    const standard =
      scopedData[0].boards[0].educationMediums[0].educationMediumStages[0].standards[0];

    expect(standard.name).toBe('Class 1');
    expect(standard.divisions.map((division) => division.name)).toEqual(['A']);
  });
});
