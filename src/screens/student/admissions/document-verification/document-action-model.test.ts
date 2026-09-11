import { it, expect } from 'vitest';

import { documentActionSchema } from './document-action-model';

it('enforces configured file size and format while allowing a permitted file larger than the old shared 5 MB limit', async () => {
  const schema = documentActionSchema('upload', ['pdf'], 10);
  await expect(
    schema.validate({ file: new File([new Uint8Array(6 * 1024 * 1024)], 'copy.PDF'), notes: '' })
  ).resolves.toBeDefined();
  await expect(
    schema.validate({ file: new File(['text'], 'copy.txt'), notes: '' })
  ).rejects.toThrow('Allowed formats: pdf');
  await expect(
    schema.validate({ file: new File([new Uint8Array(11 * 1024 * 1024)], 'copy.pdf'), notes: '' })
  ).rejects.toThrow('no larger than 10 MB');
  await expect(schema.validate({ file: null, notes: '' })).rejects.toThrow('Choose a document');
});

it.each(['original', 'reject', 'waive'] as const)(
  'requires an audit reason for %s',
  async (action) => {
    const schema = documentActionSchema(action, ['pdf'], 10);
    await expect(schema.validate({ file: null, notes: '   ' })).rejects.toThrow();
    await expect(
      schema.validate({ file: null, notes: 'Checked with admissions administrator' })
    ).resolves.toBeDefined();
  }
);
