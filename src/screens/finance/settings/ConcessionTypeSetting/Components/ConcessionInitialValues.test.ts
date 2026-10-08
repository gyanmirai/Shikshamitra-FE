import { it, expect, describe } from 'vitest';

import { getInitialConcessionTypeData } from './ConcessionInitialValues';

describe('concession type document editing', () => {
  it('loads existing accepted formats as selectable numeric values', () => {
    const form = getInitialConcessionTypeData({
      id: 'existing',
      name: 'Sibling discount',
      documents: [
        {
          id: 'document-1',
          documentName: 'Evidence',
          maxFileSizeBytes: 5 * 1024 * 1024,
          acceptedFormats: ['0', '4'],
          isRequired: true,
        },
      ],
    });

    expect(form.documents?.[0]).toMatchObject({
      documentName: 'Evidence',
      maxFileSizeMb: 5,
      acceptedFormats: [0, 4],
    });
  });
});
