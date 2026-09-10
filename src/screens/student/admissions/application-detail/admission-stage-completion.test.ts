import { it, expect, describe } from 'vitest';

import {
  getStageCompletionKind,
  isPassingEntranceExamResult,
  buildEntranceExamCompletionReason,
  buildPhysicalFormCompletionReason,
} from './admission-stage-completion';

describe('admission stage completion', () => {
  it('recognizes both native and compatibility entrance-exam stages', () => {
    expect(getStageCompletionKind({ stageType: 2, code: 'ASSESSMENT' } as never)).toBe(
      'entrance-exam'
    );
    expect(getStageCompletionKind({ stageType: 11, code: 'ENTRANCE_EXAM_PASSED' } as never)).toBe(
      'entrance-exam'
    );
  });

  it('only accepts marks that meet the configured pass mark', () => {
    const base = { scheduledAt: '2026-09-10T10:00', totalMarks: 100, passingMarks: 40 };

    expect(isPassingEntranceExamResult({ ...base, obtainedMarks: 76 })).toBe(true);
    expect(isPassingEntranceExamResult({ ...base, obtainedMarks: 39 })).toBe(false);
    expect(isPassingEntranceExamResult({ ...base, obtainedMarks: 101 })).toBe(false);
  });

  it('builds readable audit reasons for the entrance exam and physical form', () => {
    expect(
      buildEntranceExamCompletionReason({
        scheduledAt: '2026-09-10T10:00',
        totalMarks: 100,
        passingMarks: 40,
        obtainedMarks: 76,
      })
    ).toContain('score 76/100; pass mark 40');
    expect(buildPhysicalFormCompletionReason('PHY-2026-0002')).toContain(
      'form reference PHY-2026-0002'
    );
  });
});
