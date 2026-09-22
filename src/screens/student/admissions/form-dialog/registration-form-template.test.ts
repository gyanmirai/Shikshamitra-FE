import { it, expect, describe } from 'vitest';

import { admissionFormSchema } from './form-dialog-model';
import { getRegistrationFormTemplate } from './registration-form-template';

describe('registration admission form template', () => {
  it('creates the complete editable registration starter', async () => {
    const template = getRegistrationFormTemplate();

    expect(template.sections).toHaveLength(15);
    expect(template.sections.flatMap((section) => section.fields)).toHaveLength(134);
    await expect(admissionFormSchema.validate(template)).resolves.toBeDefined();
  });

  it('creates fresh client ids each time', () => {
    const first = getRegistrationFormTemplate();
    const second = getRegistrationFormTemplate();

    expect(second.sections[0].id).not.toBe(first.sections[0].id);
    expect(second.sections[0].fields[0].id).not.toBe(first.sections[0].fields[0].id);
  });
});
