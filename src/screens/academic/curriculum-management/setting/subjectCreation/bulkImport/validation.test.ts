import { it, expect, describe } from 'vitest';

import { subjectImportFileSchema } from './validation';

describe('subjectImportFileSchema', () => {
  it.each([
    ['subjects.csv', 'text/csv'],
    ['subjects.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ])('accepts supported file %s', async (name, type) => {
    const file = new File(['content'], name, { type });

    await expect(subjectImportFileSchema.validate(file)).resolves.toBe(file);
  });

  it('rejects an unsupported extension', async () => {
    const file = new File(['content'], 'subjects.pdf', { type: 'application/pdf' });

    await expect(subjectImportFileSchema.validate(file)).rejects.toThrow(
      'Only .csv,.xlsx files are supported.'
    );
  });

  it('rejects files larger than 5 MB', async () => {
    const file = new File(['content'], 'subjects.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 });

    await expect(subjectImportFileSchema.validate(file)).rejects.toThrow(
      'File size must be 5 MB or less.'
    );
  });
});
