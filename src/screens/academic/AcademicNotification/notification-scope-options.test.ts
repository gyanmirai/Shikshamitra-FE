import type { UserScopeHierarchy } from 'src/redux/userScope/types';

import { it, expect, describe } from 'vitest';

import { notificationScopeOptions } from './notification-scope-options';

const audit = { creationTime: '', creatorId: '', lastModificationTime: '', lastModifierId: '' };
const year = { id: 'year' };
const board = { id: 'board' };
const medium = {
  id: 'medium',
  educationMediumStages: [{
    ...audit, id: 'stage', name: 'Middle school', educationMediumId: 'medium',
    standards: [{
      ...audit, id: 'class', name: 'Class 6', educationMediumStageId: 'stage',
      divisions: [
        { ...audit, id: 'a', name: 'A', standardId: 'class', strength: 30 },
        { ...audit, id: 'b', name: 'B', standardId: 'class', strength: 30 },
      ],
    }],
  }],
};
const scopedUser: UserScopeHierarchy = {
  userId: 'staff', userName: 'Teacher', isAdmin: false, fromCache: false, generatedAt: '',
  accessibleHierarchy: [{
    academicYearId: 'year', academicYearName: '2026', hasFullBoardAccess: false,
    boards: [{
      boardId: 'board', boardName: 'CBSE', hasAccess: true, hasFullMediumAccess: false,
      mediums: [{
        mediumId: 'medium', mediumName: 'English', hasAccess: true, hasFullMediumStageAccess: false,
        mediumStages: [{
          mediumStageId: 'stage', mediumStageName: 'Middle school', hasAccess: true, hasFullStandardAccess: false,
          standards: [{
            standardId: 'class', standardName: 'Class 6', hasAccess: true, hasFullDivisionAccess: false,
            divisions: [{ divisionId: 'a', divisionName: 'A', hasAccess: true }],
          }],
        }],
      }],
    }],
  }],
};

describe('Notification rule scope options', () => {
  it('offers a division assignment without allowing a write to its parent scope', () => {
    expect(notificationScopeOptions(scopedUser, year, board, medium)).toEqual([{
      value: 'division:a',
      label: 'Middle school / Class 6 / A',
      scope: { academicYearId: 'year', boardId: 'board', mediumId: 'medium', classId: 'class', divisionId: 'a' },
    }]);
  });

  it('expands compressed full school access using the selected context', () => {
    const options = notificationScopeOptions({ ...scopedUser, isAdmin: true, accessibleHierarchy: [] }, year, board, medium);
    expect(options.map(({ value }) => value)).toEqual(['school', 'year', 'board', 'medium', 'class:class', 'division:a', 'division:b']);
  });
});
