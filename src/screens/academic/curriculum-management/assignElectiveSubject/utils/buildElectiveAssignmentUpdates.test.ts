import { it, expect, describe } from 'vitest';

import { buildElectiveAssignmentUpdates } from './buildElectiveAssignmentUpdates';

describe('buildElectiveAssignmentUpdates', () => {
  it('submits only editable students in a partially locked roster', () => {
    const roster = [
      { studentId: 'existing', isLocked: true },
      { studentId: 'new', isLocked: false },
    ];
    expect(
      buildElectiveAssignmentUpdates(roster, { existing: 'pt', new: 'computer-science' })
    ).toEqual([{ studentId: 'new', selectedSubjectId: 'computer-science' }]);
  });

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
