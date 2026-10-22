import { describe, it, expect } from 'vitest';
import { feeCategoryValidationSchema } from './FeeCategoryValidation';

describe('fee category name uniqueness', () => {
  const current = { id: 'one', name: '8th FEE CATEGORY', isActive: true } as never;
  const archived = { id: 'two', name: 'TEST FC 2', isActive: false } as never;
  const schema = feeCategoryValidationSchema(new Set(['8th fee category', 'test fc 2']), null, [
    current,
    archived,
  ]);

  it('rejects repeated whitespace and case changes with Current guidance', async () => {
    await expect(schema.validateAt('name', { name: '  8TH   fee\tCATEGORY  ' })).rejects.toThrow(
      'Current categories'
    );
  });

  it('identifies archived conflicts and explains restoration', async () => {
    await expect(schema.validateAt('name', { name: 'TEST  FC  2' })).rejects.toThrow(
      'Restore it from the Archived tab'
    );
  });

  it('allows retaining the canonical name on the record being edited', async () => {
    const editSchema = feeCategoryValidationSchema(new Set(['8th fee category']), current, [
      current,
    ]);
    await expect(
      editSchema.validateAt('name', { name: '8th   FEE CATEGORY' })
    ).resolves.toBeDefined();
  });
});
