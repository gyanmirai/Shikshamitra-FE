import { it, expect, describe } from 'vitest';

import { setupError } from './setup-error';
import { setupSchema } from './setup-model';

describe('institute setup validation', () => {
  it('allows incomplete drafts but requires a complete profile to continue', async () => {
    const draft = { profile: { instituteName: 'School', email: 'invalid', country: 'India' } };
    expect(await setupSchema(0).isValid(draft)).toBe(true);
    expect(await setupSchema(1).isValid(draft)).toBe(false);
  });
  it('rejects academic year dates that are missing or run backwards', async () => {
    expect(
      await setupSchema(2).isValid({ yearName: '2026-2027', startDate: null, endDate: null })
    ).toBe(false);
    expect(
      await setupSchema(2).isValid({
        yearName: '2026-2027',
        startDate: '2026-06-01',
        endDate: '2026-05-31',
      })
    ).toBe(false);
    expect(
      await setupSchema(2).isValid({
        yearName: '2026-2027',
        startDate: '2026-06-01',
        endDate: '2027-05-31',
      })
    ).toBe(true);
  });
  it('rejects unsupported boards and nonpositive class/division requirements', async () => {
    const structure = {
      boardType: 0,
      medium: 'English',
      stage: 'Primary',
      className: 'Class 1',
      divisionName: 'A',
      ageLowerLimit: 6,
      strength: 30,
    };
    expect(await setupSchema(3).isValid(structure)).toBe(true);
    expect(await setupSchema(3).isValid({ ...structure, boardType: 99 })).toBe(false);
    expect(await setupSchema(3).isValid({ ...structure, ageLowerLimit: 0 })).toBe(false);
    expect(await setupSchema(3).isValid({ ...structure, strength: 0 })).toBe(false);
  });
  it('accepts every supported board and requires a name for a custom board', async () => {
    const structure = {
      medium: 'English',
      stage: 'Primary',
      className: 'Class 1',
      divisionName: 'A',
      ageLowerLimit: 6,
      strength: 30,
    };
    const validBoards = await Promise.all(
      [0, 1, 2, 3, 4, 5].map((boardType) => setupSchema(3).isValid({ ...structure, boardType }))
    );
    expect(validBoards).toEqual([true, true, true, true, true, true]);
    expect(await setupSchema(3).isValid({ ...structure, boardType: 6 })).toBe(false);
    expect(
      await setupSchema(3).isValid({ ...structure, boardType: 6, customBoardName: '   ' })
    ).toBe(false);
    expect(
      await setupSchema(3).isValid({
        ...structure,
        boardType: 6,
        customBoardName: 'Regional board',
      })
    ).toBe(true);
  });
  it('provides a useful next action for concurrency conflicts and unconfirmed configuration', () => {
    expect(setupError({ status: 409 })).toContain('Reload');
    expect(
      setupError({
        status: 400,
        data: { errorCode: 'ShikshaMitra:InitialSetup:UnconfirmedChanges' },
      })
    ).toBe('Save the changed setup steps before finishing.');
  });
});
