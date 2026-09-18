import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getLivePreviewForm } from './form-builder-live-preview';

describe('form builder live preview', () => {
  it('adapts the editable draft without changing its sections', () => {
    const draft = {
      name: 'Application',
      code: 'APPLICATION',
      layoutType: 0,
      fieldsPerRow: 2,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      sections: [
        {
          id: 'section-1',
          code: 'PERSONAL',
          name: 'Personal details',
          displayOrder: 0,
          fields: [],
        },
      ],
    } satisfies CreateUpdateAdmissionForm;

    const preview = getLivePreviewForm(draft);
    expect(preview.status).toBe(0);
    expect(preview.sectionCount).toBe(1);
    expect(preview.sections).toBe(draft.sections);
  });
});
