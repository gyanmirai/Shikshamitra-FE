import { it, expect, describe } from 'vitest';

import { isClassInterestQuestion } from './admission-class-question';

describe('class-interest question identity', () => {
  it.each(['Class interested in', 'Interested Class', 'class_interested_in'])(
    '%s identifies the same question',
    (label) => {
      expect(isClassInterestQuestion({ code: 'FIELD_1', label, bindingType: 1 })).toBe(true);
    }
  );

  it('recognizes renamed starter questions without matching another class meaning', () => {
    expect(
      isClassInterestQuestion({ code: 'CLASS_INTERESTED', label: 'Choose a grade', bindingType: 1 })
    ).toBe(true);
    expect(
      isClassInterestQuestion({
        code: 'CLASS_APPLYING_FOR',
        label: 'Class applying for',
        bindingType: 1,
      })
    ).toBe(false);
    expect(
      isClassInterestQuestion({
        code: 'PREVIOUS_CLASS',
        label: 'Last class attended',
        bindingType: 1,
      })
    ).toBe(false);
    expect(
      isClassInterestQuestion({
        code: 'CLASS_INTERESTED',
        label: 'Interested Class',
        bindingType: 0,
        bindingKey: 'PreviousSchool.LastClass',
      })
    ).toBe(false);
    expect(
      isClassInterestQuestion({ code: 'CLASS_INTERESTED_2', label: 'Choose grade', bindingType: 1 })
    ).toBe(true);
  });

  it('does not turn static information into a class question', () => {
    expect(
      isClassInterestQuestion({
        code: 'FIELD_1',
        label: 'Interested Class',
        bindingType: 1,
        fieldType: 12,
      })
    ).toBe(false);
  });
});
