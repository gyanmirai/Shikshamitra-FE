import { it, expect, describe } from 'vitest';

import { getPendingAssignmentRows } from './classTeacherPendingRows';

const rows = [
  { classId: '8', divisionId: 'A', assignmentStatus: 'Changed' },
  { classId: '8', divisionId: 'B', assignmentStatus: 'Active' },
  { classId: '9', divisionId: 'A', assignmentStatus: 'Active' },
];

describe('getPendingAssignmentRows', () => {
  it('keeps persisted drafts pending after refetch', () => {
    expect(getPendingAssignmentRows(rows, [])).toEqual([rows[0]]);
  });

  it('combines persisted drafts with local changes without duplicates', () => {
    expect(getPendingAssignmentRows(rows, [rows[0], rows[1]])).toEqual([
      rows[0],
      rows[1],
    ]);
  });
});
