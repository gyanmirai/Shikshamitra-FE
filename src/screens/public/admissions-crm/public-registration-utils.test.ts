import { it, expect, describe } from 'vitest';

import {
  getPublicRegistrationValue,
  isPublicRegistrationFieldVisible,
} from './public-registration-utils';

describe('public registration form helpers', () => {
  it('uses applicant responses before CRM prefill', () => {
    const field = { key: 'studentName', systemField: 'firstName' };
    expect(getPublicRegistrationValue(field, {}, { firstName: 'Aarav' })).toBe('Aarav');
    expect(
      getPublicRegistrationValue(field, { studentName: 'Aarav V.' }, { firstName: 'Aarav' })
    ).toBe('Aarav V.');
  });

  it('evaluates conditional visibility from the controlling field', () => {
    const fields = [
      { key: 'hasSibling' },
      { key: 'siblingName', visibleWhenFieldKey: 'hasSibling', visibleWhenValue: 'true' },
    ];
    expect(isPublicRegistrationFieldVisible(fields[1], fields, { hasSibling: true }, {})).toBe(
      true
    );
    expect(isPublicRegistrationFieldVisible(fields[1], fields, { hasSibling: false }, {})).toBe(
      false
    );
  });
});
