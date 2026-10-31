import { describe, it, expect } from 'vitest';
import { feeCategoryValidationSchema } from './FeeCategoryValidation';

describe('fee category and fee head name characters', () => {
  const schema = feeCategoryValidationSchema(new Set());

  it.each(['#$%SDFV', 'School @ Fees', 'Tuition-Fee', 'Bus_Fee', 'Fee 🎓'])(
    'rejects special characters in category and fee head names: %s',
    async (name) => {
      await expect(schema.validateAt('name', { name })).rejects.toThrow(
        'Category Name can only contain letters, numbers, and spaces'
      );
      await expect(
        schema.validateAt('feeHeads[0].name', { feeHeads: [{ name }] })
      ).rejects.toThrow('Fee Head Name can only contain letters, numbers, and spaces');
    }
  );

  it.each(['Class 8 Fees', 'शिक्षा शुल्क २', 'École Fees'])(
    'allows letters, numbers, and spaces in both names: %s',
    async (name) => {
      await expect(schema.validateAt('name', { name })).resolves.toBe(name);
      await expect(
        schema.validateAt('feeHeads[0].name', { feeHeads: [{ name }] })
      ).resolves.toBe(name);
    }
  );
});

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
