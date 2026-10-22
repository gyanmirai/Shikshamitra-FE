import { it, expect, describe } from 'vitest';
import { normalizeEmail } from 'src/utils/input-format';

import {
  normalizeAdmissionEmailValue,
  normalizeAdmissionFormEmailValues,
} from './admission-email-values';

describe('admission email normalization', () => {
  it('lowercases addresses, trims external whitespace and preserves an empty optional value', () => {
    expect(normalizeEmail('  Parent+Tag@EXAMPLE.Test  ')).toBe('parent+tag@example.test');
    expect(normalizeEmail('')).toBe('');
    expect(normalizeEmail('   ')).toBe('');
  });

  it('normalizes only configured editable emails, preserving repeated entries and unrelated answers', () => {
    const definition = {
      sections: [
        {
          fields: [
            { code: 'EMAIL', fieldType: 3 },
            { code: 'METADATA_EMAIL', fieldType: 0, validationJson: '{"format":"email"}' },
            { code: 'NAME', fieldType: 0 },
            { code: 'READ_ONLY', fieldType: 3, readOnly: true },
            { code: 'ABSENT', fieldType: 3 },
          ],
        },
        { isRepeatable: true, fields: [{ code: 'CONTACTS', fieldType: 3 }] },
      ],
    };
    const values = {
      EMAIL: ' Existing@Example.COM ',
      METADATA_EMAIL: 'OTHER@Example.COM',
      NAME: 'Aanya PATEL',
      READ_ONLY: 'Locked@Example.COM',
      CONTACTS: '["FIRST@Example.COM","",null,"Second@Example.COM"]',
      UNKNOWN: 'KEEP Case',
    };
    expect(normalizeAdmissionFormEmailValues(definition, values)).toEqual({
      ...values,
      EMAIL: 'existing@example.com',
      METADATA_EMAIL: 'other@example.com',
      CONTACTS: '["first@example.com","",null,"second@example.com"]',
    });
    expect(values.EMAIL).toBe(' Existing@Example.COM ');
    expect(normalizeAdmissionEmailValue({ fieldType: 3 }, 'invalid-array', true)).toBe(
      'invalid-array'
    );
  });
});
