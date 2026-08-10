import { it, expect, describe } from 'vitest';

import { resolveRegistrationText, resolveRegistrationOptions } from './registration-localization';

describe('registration localization', () => {
  it('uses the selected parent language and falls back to the canonical text', () => {
    expect(resolveRegistrationText('Student name', { gu: 'વિદ્યાર્થીનું નામ' }, 'gu')).toBe(
      'વિદ્યાર્થીનું નામ'
    );
    expect(resolveRegistrationText('Student name', { gu: 'વિદ્યાર્થીનું નામ' }, 'hi')).toBe(
      'Student name'
    );
  });

  it('uses translated options only when they preserve the canonical value count', () => {
    const canonical = ['Bus', 'Self'];
    expect(resolveRegistrationOptions(canonical, { hi: ['बस', 'स्वयं'] }, 'hi')).toEqual([
      'बस',
      'स्वयं',
    ]);
    expect(resolveRegistrationOptions(canonical, { hi: ['बस'] }, 'hi')).toEqual(canonical);
  });

  it('resolves legacy mixed-case localization keys', () => {
    expect(resolveRegistrationText('Student name', { GU: 'Student in Gujarati' }, 'gu')).toBe(
      'Student in Gujarati'
    );
    expect(
      resolveRegistrationOptions(['Bus', 'Self'], { Hi: ['Bus Hindi', 'Self Hindi'] }, 'hi')
    ).toEqual(['Bus Hindi', 'Self Hindi']);
  });
});
