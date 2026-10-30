import { describe, expect, it } from 'vitest';

import { financeNameSchema, sanitizeFinanceName } from './finance-name';

describe('Finance names', () => {
  it.each(['School Fees 8', 'शिक्षा शुल्क २', 'École Fees', 'E\u0301cole Fees'])(
    'retains letters, combining marks, numbers and spaces: %s',
    async (name) => {
      expect(sanitizeFinanceName(name)).toBe(name);
      await expect(financeNameSchema('Name').validate(name)).resolves.toBe(name);
    }
  );

  it.each(['Fees@2026', 'Fees-2026', 'Fees_2026', 'Fees (2026)', 'Fees & Tax', 'Fees 🎓'])(
    'filters input and rejects an unfiltered name: %s',
    async (name) => {
      expect(sanitizeFinanceName(name)).not.toBe(name);
      await expect(financeNameSchema('Name').validate(name)).rejects.toThrow(
        'Name can only contain letters, numbers, and spaces'
      );
    }
  );

  it('keeps required and optional field semantics with field-specific messages', async () => {
    await expect(financeNameSchema('Document Name').validate('')).resolves.toBe('');
    await expect(
      financeNameSchema('Concession Type Name').required('Name is required').validate('')
    ).rejects.toThrow('Name is required');
    await expect(financeNameSchema('Document Name').validate('Proof.pdf')).rejects.toThrow(
      'Document Name can only contain letters, numbers, and spaces'
    );
    expect(sanitizeFinanceName('@#$🎓')).toBe('');
  });
});
