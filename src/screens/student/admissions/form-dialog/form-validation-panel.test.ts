import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getBuilderIssues } from './form-validation-panel';

describe('admission form builder validation', () => {
  it('reports empty sections for step-by-step forms', () => {
    const form = {
      name: 'Student admission form',
      code: 'STUDENT_ADMISSION',
      layoutType: 1,
      fieldsPerRow: 1,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      sections: [
        {
          id: 'section-1',
          code: 'SECTION_1',
          name: 'Student details',
          displayOrder: 0,
          stepId: 'step-1',
          stepCode: 'STEP_1',
          stepName: 'Student details',
          stepDisplayOrder: 0,
          fields: [],
        },
        {
          id: 'section-2',
          code: 'SECTION_2',
          name: 'Eligibility',
          displayOrder: 1,
          stepId: 'step-2',
          stepCode: 'STEP_2',
          stepName: 'Eligibility',
          stepDisplayOrder: 1,
          fields: [],
        },
      ],
    } as CreateUpdateAdmissionForm;

    expect(getBuilderIssues(form).map((issue) => issue.message)).toEqual([
      'Student details has no fields. Add at least one field before publishing.',
      'Eligibility has no fields. Add at least one field before publishing.',
    ]);
  });
});
