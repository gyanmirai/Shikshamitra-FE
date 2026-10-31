import { it, expect, describe } from 'vitest';

import { getBuilderIssues } from './form-builder-issues';
import { admissionFormSchema } from './form-dialog-model';
import { getSystemAdmissionFormTemplate } from './admission-form-template-catalog';

describe('class question publication safeguards', () => {
  it('rejects a renamed duplicate even when it has a different field ID and code', async () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    const section = form.sections[0];
    const original = section.fields.find((field) => field.code === 'CLASS_INTERESTED')!;
    section.fields.push({
      ...original,
      id: 'duplicate',
      code: 'FIELD_99',
      bindingKey: 'FIELD_99',
      fieldIdentity: 'custom:other',
      label: 'Interested Class',
    });
    expect(
      getBuilderIssues(form).some(
        (issue) => issue.fieldId === 'duplicate' && issue.message.includes('Keep only one')
      )
    ).toBe(true);
    await expect(admissionFormSchema.validate(form)).rejects.toThrow('Keep only one');
  });
  it('rejects manual options for class interest while leaving ordinary custom choices available', async () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    const field = form.sections[0].fields.find((item) => item.code === 'CLASS_INTERESTED')!;
    field.optionsJson = '["class 1","class 2"]';
    expect(
      getBuilderIssues(form).some((issue) =>
        issue.message.includes('Institute Setup class dropdown')
      )
    ).toBe(true);
    await expect(admissionFormSchema.validate(form)).rejects.toThrow(
      'Institute Setup class dropdown'
    );
  });
});
