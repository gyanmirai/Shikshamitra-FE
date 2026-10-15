import { it, expect, describe } from 'vitest';

import {
  divisionFormSchema,
  onboardingDivisionInput,
  onboardingDivisionSchema,
} from './onboarding-division-model';

describe('onboarding division creation', () => {
  it('submits only the division name, strength and parent standard', () => {
    const legacyValues = { name: ' B ', strength: '50', roomId: 'legacy-room' };
    expect(onboardingDivisionInput(legacyValues, 'standard-1')).toEqual({
      name: 'B',
      strength: 50,
      standardId: 'standard-1',
    });
  });

  it('requires a name and positive whole-number strength without a room assignment', async () => {
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 50 })).toBe(true);
    expect(await onboardingDivisionSchema.isValid({ name: '', strength: 50 })).toBe(false);
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 0 })).toBe(false);
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 1.5 })).toBe(false);
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 501 })).toBe(false);
  });

  it.each(['A', 'a', ' A '])(
    'rejects existing division %s in the selected standard',
    async (name) => {
      const schema = divisionFormSchema([{ id: 'first', name: 'A' }]);
      await expect(schema.validate({ name, strength: 50 })).rejects.toThrow(
        `A division named '${name.trim()}' already exists in this standard.`
      );
    }
  );

  it('allows self edits and names absent from this standard, and compares literal characters', async () => {
    const divisions = [{ id: 'first', name: ' A ' }];
    expect(await divisionFormSchema(divisions, 'first').isValid({ name: 'a', strength: 45 })).toBe(
      true
    );
    expect(
      await Promise.all(
        ['B', '%', '_'].map((name) => divisionFormSchema(divisions).isValid({ name, strength: 50 }))
      )
    ).toEqual([true, true, true]);
  });
});
