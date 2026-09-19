import { it, expect, describe } from 'vitest';

import { buildElectiveAssignmentUpdates } from './buildElectiveAssignmentUpdates';

describe('buildElectiveAssignmentUpdates', () => {
  it('includes explicit null selections so saved assignments can be removed', () => {
    expect(
      buildElectiveAssignmentUpdates(
        [{ studentId: 'assigned-student' }, { studentId: 'unassigned-student' }],
        { 'assigned-student': 'computer-science' }
      )
    ).toEqual([
      { studentId: 'assigned-student', selectedSubjectId: 'computer-science' },
      { studentId: 'unassigned-student', selectedSubjectId: null },
    ]);
  });
});
