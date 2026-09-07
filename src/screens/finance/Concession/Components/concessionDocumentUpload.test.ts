import { it, expect, describe } from 'vitest';

import { ConcessionDocumentFormat } from '../../settings/ConcessionTypeSetting/type';
import {
  getFileAccept,
  validateConcessionDocumentFile,
} from './concessionDocumentUpload';

const requirement = {
  isRequired: true,
  maxFileSizeBytes: 5,
  acceptedFormats: [ConcessionDocumentFormat.Pdf, ConcessionDocumentFormat.Jpg],
};

describe('concession document upload rules', () => {
  it('creates an accept filter from the configured formats', () => {
    expect(getFileAccept(requirement)).toBe('.pdf,.jpg');
  });

  it('rejects a file that is larger than the configured maximum', () => {
    const file = new File(['123456'], 'proof.pdf', { type: 'application/pdf' });

    expect(validateConcessionDocumentFile(file, requirement)).toContain('limit');
  });

  it('rejects an extension that is not configured', () => {
    const file = new File(['1'], 'proof.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    expect(validateConcessionDocumentFile(file, requirement)).toContain('Allowed formats');
  });
});
