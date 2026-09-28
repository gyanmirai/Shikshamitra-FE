import { it, expect, describe } from 'vitest';

import { getDocumentConditionFields } from './components/document-condition-fields';

describe('document requirement condition fields', () => {
  it('exposes the complete application-experience scope catalogue', () => {
    const values = getDocumentConditionFields([]).map((field) => field.value);

    expect(values).toEqual(
      expect.arrayContaining([
        'application.admissionType',
        'application.class',
        'application.category',
        'application.rteStatus',
        'application.transferAdmission',
        'application.scholarship',
        'assessment.outcome',
      ])
    );
  });
});
