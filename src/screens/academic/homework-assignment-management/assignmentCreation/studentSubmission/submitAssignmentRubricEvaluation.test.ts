import { it, vi, expect, describe } from 'vitest';

import { submitAssignmentRubricEvaluation } from './submitAssignmentRubricEvaluation';

describe('submitAssignmentRubricEvaluation', () => {
  it('saves before advancing to the next student and keeps the dialog open', async () => {
    let finishSave: (saved: boolean) => void = () => {};
    const save = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishSave = resolve;
        })
    );
    const onAdvance = vi.fn();
    const onClose = vi.fn();
    const result = submitAssignmentRubricEvaluation({
      save,
      advance: true,
      nextStudent: { studentId: 'student-2' },
      onAdvance,
      onClose,
    });

    expect(onAdvance).not.toHaveBeenCalled();
    finishSave(true);
    await expect(result).resolves.toBe(true);
    expect(onAdvance).toHaveBeenCalledWith({ studentId: 'student-2' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps the current student open when saving fails', async () => {
    const onAdvance = vi.fn();
    const onClose = vi.fn();
    await expect(
      submitAssignmentRubricEvaluation({
        save: async () => false,
        advance: true,
        nextStudent: { studentId: 'student-2' },
        onAdvance,
        onClose,
      })
    ).resolves.toBe(false);

    expect(onAdvance).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes only after a normal submit succeeds', async () => {
    const onClose = vi.fn();
    await expect(
      submitAssignmentRubricEvaluation({
        save: async () => true,
        advance: false,
        nextStudent: null,
        onAdvance: vi.fn(),
        onClose,
      })
    ).resolves.toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not save when Submit & Next has no next student', async () => {
    const save = vi.fn(async () => true);
    await expect(
      submitAssignmentRubricEvaluation({
        save,
        advance: true,
        nextStudent: null,
        onAdvance: vi.fn(),
        onClose: vi.fn(),
      })
    ).resolves.toBe(false);
    expect(save).not.toHaveBeenCalled();
  });
});
