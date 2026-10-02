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

  it('keeps an explicitly cleared option label empty while it is being edited', () => {
    expect(parseEditableAdmissionChoices('[{"value":"OPTION_1","label":""}]')).toEqual({
      choices: [{ value: 'OPTION_1', label: '' }],
    });
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

  it('avoids case-insensitive collisions with legacy option values', () => {
    expect(createAdmissionChoiceValue('Option 1', ['option_1', 'Option_1_2'])).toBe('OPTION_1_3');
    expect(appendPastedAdmissionChoices([{ value: 'bus', label: 'Old bus' }], 'Bus')).toEqual([
      { value: 'bus', label: 'Old bus' },
      { value: 'BUS_2', label: 'Bus' },
    ]);
  });

  it('falls back to a readable option code', () => {
    expect(createAdmissionChoiceValue('', [])).toBe('OPTION');
  });
});
