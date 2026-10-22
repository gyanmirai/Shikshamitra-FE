import { it, expect, describe } from 'vitest';

import {
  numberingSchema,
  defaultNumbering,
  numberingFormValues,
} from './admission-numbering-model';

const values = () => numberingFormValues(defaultNumbering);
describe('application numbering format', () => {
  it('keeps the configured minimum as editable text without deriving a next number locally', () => {
    expect(numberingFormValues({ ...defaultNumbering, startingNumber: 51 })).toMatchObject({
      startingNumber: '51',
      expectedVersion: 0,
    });
  });
  it.each(['', '0', '-1', '1.5', '1000000000', '2e3'])(
    'rejects invalid starting number %s',
    async (startingNumber) => {
      await expect(numberingSchema.validate({ ...values(), startingNumber })).rejects.toThrow();
    }
  );
  it('requires a matching year token for resets', async () => {
    await expect(numberingSchema.validate({ ...values(), yearFormat: 0 })).rejects.toThrow(
      'Year format must match'
    );
    await expect(
      numberingSchema.validate({ ...values(), yearFormat: 2, resetPolicy: 2 })
    ).resolves.toBeDefined();
  });
  it('allows continuous numbering and optional separators and suffix', async () => {
    await expect(
      numberingSchema.validate({
        ...values(),
        yearFormat: 0,
        resetPolicy: 0,
        separator: '',
        suffix: '',
      })
    ).resolves.toBeDefined();
  });
});
