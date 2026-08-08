import { it, expect, describe } from 'vitest';

import { getExamBulkFailures } from './bulk-operation-errors';

describe('enrollment bulk operation failures', () => {
  it('keeps every failed row identifiable with its most useful reason', () => {
    const failures = getExamBulkFailures(
      {
        requestedCount: 3,
        succeededCount: 1,
        failedCount: 2,
        items: [
          { entityId: 'exam-1', success: true, blockingReasons: [] },
          {
            entityId: 'exam-2',
            success: false,
            errorCode: 'AdmissionCrm:ResultLocked',
            message: 'Result is locked.',
            blockingReasons: [],
          },
          {
            entityId: 'exam-3',
            success: false,
            errorCode: 'AdmissionCrm:AttendanceRequired',
            message: null,
            blockingReasons: ['Mark attendance first', 'Confirm identity'],
          },
        ],
      },
      [
        { id: 'exam-2', applicantName: 'Aarav Patel' },
        { id: 'exam-3', applicantName: 'Diya Shah' },
      ] as never
    );

    expect(failures).toEqual([
      { entityId: 'exam-2', applicantName: 'Aarav Patel', reason: 'Result is locked.' },
      {
        entityId: 'exam-3',
        applicantName: 'Diya Shah',
        reason: 'Mark attendance first; Confirm identity',
      },
    ]);
  });
});
