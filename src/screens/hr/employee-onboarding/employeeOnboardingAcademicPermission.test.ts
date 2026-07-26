import { it, expect, describe } from 'vitest';

import {
  isOnboardingAcademicPermissionStepValid,
  buildOnboardingAcademicPermissionScopeRows,
} from './employeeOnboardingAcademicPermission';

describe('employee onboarding academic permission payload', () => {
  it('builds complete V2 scope rows from valid stage ids', () => {
    const result = buildOnboardingAcademicPermissionScopeRows(
      ['stage-1', 'stage-2'],
      new Map([
        [
          'stage-1',
          {
            id: 'stage-1',
            boardId: 'board-1',
            mediumId: 'medium-1',
          },
        ],
        [
          'stage-2',
          {
            id: 'stage-2',
            boardId: 'board-2',
            mediumId: 'medium-2',
          },
        ],
      ])
    );

    expect(result).toEqual({
      scopeRows: [
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
          educationMediumStageId: 'stage-1',
        },
        {
          educationBoardId: 'board-2',
          educationMediumId: 'medium-2',
          educationMediumStageId: 'stage-2',
        },
      ],
      unresolvedStageIds: [],
      isValid: true,
    });
  });

  it('blocks finalize payload creation when stage metadata is missing', () => {
    const result = buildOnboardingAcademicPermissionScopeRows(
      ['stage-1', 'stage-2', 'stage-3'],
      new Map([
        [
          'stage-1',
          {
            id: 'stage-1',
            boardId: 'board-1',
            mediumId: 'medium-1',
          },
        ],
        [
          'stage-2',
          {
            id: 'stage-2',
            boardId: '',
            mediumId: 'medium-2',
          },
        ],
      ])
    );

    expect(result.scopeRows).toEqual([
      {
        educationBoardId: 'board-1',
        educationMediumId: 'medium-1',
        educationMediumStageId: 'stage-1',
      },
    ]);
    expect(result.unresolvedStageIds).toEqual(['stage-2', 'stage-3']);
    expect(result.isValid).toBe(false);
  });

  it('requires complete academic scope only for teaching employees', () => {
    const invalidScope = {
      scopeRows: [],
      unresolvedStageIds: [],
      isValid: false,
    };

    expect(
      isOnboardingAcademicPermissionStepValid({
        isTeaching: true,
        academicYearId: 'year-1',
        isLoading: false,
        scopeRows: invalidScope,
      })
    ).toBe(false);
    expect(
      isOnboardingAcademicPermissionStepValid({
        isTeaching: false,
        academicYearId: null,
        isLoading: true,
        scopeRows: invalidScope,
      })
    ).toBe(true);
  });
});
