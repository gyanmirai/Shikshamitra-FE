import { it, expect, describe } from 'vitest';
import { documentFormData } from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { documentSchema, documentFilesError, initialDocumentValues } from './document-form';

const pdf = (size = 5) =>
  new File([new Uint8Array(size)], 'approval.pdf', { type: 'application/pdf' });

describe('School document form boundaries', () => {
  it('requires a name, category and at least one attachment', async () => {
    await expect(
      documentSchema.validate(initialDocumentValues(), { abortEarly: false })
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        'Enter a document name.',
        'Select a category.',
        'Attach at least one file.',
      ]),
    });
  });

  it('counts retained and newly selected files together', () => {
    expect(documentFilesError([pdf()], 4)).toBeUndefined();
    expect(documentFilesError([pdf()], 5)).toBe('Attach no more than 5 files.');
    expect(documentFilesError([], 1)).toBeUndefined();
    expect(documentFilesError([], 0)).toBe('Attach at least one file.');
  });

  it('accepts the size boundary and rejects oversized, empty and unsupported files', () => {
    expect(documentFilesError([pdf(5 * 1024 * 1024)], 0)).toBeUndefined();
    [
      pdf(0),
      pdf(5 * 1024 * 1024 + 1),
      new File(['html'], 'approval.html', { type: 'text/html' }),
    ].forEach((file) => {
      expect(documentFilesError([file], 0)).toMatch(/non-empty PDF/);
    });
  });

  it('submits binary files and retained IDs without trusting tenant or storage paths', () => {
    const values = {
      ...initialDocumentValues(),
      name: ' Approval ',
      category: 0,
      files: [pdf()],
      retainedFiles: [
        { id: 'saved-file', fileName: 'old.pdf', size: 8, contentType: 'application/pdf' },
      ],
    };
    const body = documentFormData(values, 'opened-version');
    expect(body.get('name')).toBe('Approval');
    expect(body.get('concurrencyStamp')).toBe('opened-version');
    expect(body.getAll('retainedFileIds')).toEqual(['saved-file']);
    expect(body.getAll('files')).toHaveLength(1);
    expect(body.has('tenantId')).toBe(false);
    expect(body.has('blobName')).toBe(false);
  });
});
