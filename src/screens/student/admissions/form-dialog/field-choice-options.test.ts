import { it, expect, describe } from 'vitest';

import {
  createAdmissionChoiceValue,
  appendPastedAdmissionChoices,
  parseEditableAdmissionChoices,
  serializeEditableAdmissionChoices,
} from './field-choice-options';

describe('admission form visual choices', () => {
  it('reads legacy string choices without changing their stored values', () => {
    expect(parseEditableAdmissionChoices('["Bus","Walking"]')).toEqual({
      choices: [
        { value: 'Bus', label: 'Bus' },
        { value: 'Walking', label: 'Walking' },
      ],
    });
  });

  it('preserves stable values when serializing labeled choices', () => {
    expect(
      serializeEditableAdmissionChoices([
        { value: 'SCHOOL_BUS', label: 'School bus' },
        { value: 'OWN', label: 'Own transport' },
      ])
    ).toBe('[{"value":"SCHOOL_BUS","label":"School bus"},{"value":"OWN","label":"Own transport"}]');
  });

  it('creates unique values for pasted choices', () => {
    expect(
      appendPastedAdmissionChoices(
        [{ value: 'BUS', label: 'Existing bus' }],
        'Bus\nOwn transport\nBus'
      )
    ).toEqual([
      { value: 'BUS', label: 'Existing bus' },
      { value: 'BUS_2', label: 'Bus' },
      { value: 'OWN_TRANSPORT', label: 'Own transport' },
      { value: 'BUS_3', label: 'Bus' },
    ]);
  });

  it('reports invalid saved values without silently replacing them', () => {
    expect(parseEditableAdmissionChoices('{invalid')).toEqual({
      choices: [],
      error: 'The saved choices contain invalid JSON.',
    });
  });

  it('falls back to a readable option code', () => {
    expect(createAdmissionChoiceValue('', [])).toBe('OPTION');
  });
});
