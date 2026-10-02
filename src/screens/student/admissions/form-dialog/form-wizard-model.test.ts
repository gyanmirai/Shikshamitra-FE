import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionWizardSchema } from './form-wizard-model';

function validForm(): CreateUpdateAdmissionForm {
  return {
    name: 'Admission application',
    code: 'ADMISSION_2026',
    purpose: 1,
    layoutType: 1,
    fieldsPerRow: 1,
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    sections: [
      {
        id: 'student',
        code: 'STUDENT',
        name: 'Student details',
        displayOrder: 0,
        fields: [
          {
            id: 'first-name',
            sectionId: 'student',
            code: 'FIRST_NAME',
            label: 'First name',
            fieldType: 0,
            bindingType: 1,
            bindingKey: 'FIRST_NAME',
            required: true,
            readOnly: false,
            displayOrder: 0,
          },
        ],
      },
    ],
  };
}

describe('admission form wizard validation', () => {
  describe('Form details', () => {
    it.each([
      ['name', ''],
      ['name', '   '],
      ['name', 'A'.repeat(129)],
    ])('rejects an invalid %s', async (field, value) => {
      await expect(
        getAdmissionWizardSchema(0).validate({ ...validForm(), [field]: value })
      ).rejects.toMatchObject({ path: field });
    });

    it('allows a new form without a manually entered code', async () => {
      await expect(getAdmissionWizardSchema(0).isValid({ ...validForm(), code: '' })).resolves.toBe(
        true
      );
    });

    it('allows advancing before sections or fields are ready', async () => {
      const form = validForm();
      form.sections[0].fields[0].label = '';
      await expect(getAdmissionWizardSchema(0).isValid(form)).resolves.toBe(true);
      await expect(getAdmissionWizardSchema(0).isValid({ ...form, sections: [] })).resolves.toBe(
        true
      );
    });

    it('lets an old invalid grid value reach the builder where it can be corrected', async () => {
      const form = { ...validForm(), fieldsPerRow: 0 };
      await expect(getAdmissionWizardSchema(0).isValid(form)).resolves.toBe(true);
      await expect(getAdmissionWizardSchema(2).validate(form)).rejects.toMatchObject({
        path: 'fieldsPerRow',
      });
    });
  });

  describe('Build form', () => {
    it('requires at least one section', async () => {
      await expect(
        getAdmissionWizardSchema(1).validate({ ...validForm(), sections: [] })
      ).rejects.toMatchObject({ path: 'sections', message: 'Add at least one section' });
    });

    it('requires a field in every section', async () => {
      const form = validForm();
      form.sections[0].fields = [];
      await expect(getAdmissionWizardSchema(1).validate(form)).rejects.toMatchObject({
        path: 'sections[0].fields',
        message: 'Add at least one field',
      });
    });

    it('rejects a blank field label', async () => {
      const form = validForm();
      form.sections[0].fields[0].label = '   ';
      await expect(getAdmissionWizardSchema(1).validate(form)).rejects.toMatchObject({
        path: 'sections[0].fields[0].label',
        message: 'Field label is required',
      });
    });

    it('validates the builder without revalidating form details', async () => {
      await expect(
        getAdmissionWizardSchema(1).isValid({
          ...validForm(),
          name: '',
          code: 'invalid code',
          layoutType: 99,
          fieldsPerRow: 0,
        })
      ).resolves.toBe(true);
    });
  });

  describe('Review & save', () => {
    it('accepts a complete admission draft', async () => {
      await expect(getAdmissionWizardSchema(2).isValid({ ...validForm(), code: '' })).resolves.toBe(
        true
      );
    });

    it('checks both earlier stages before the draft can be saved', async () => {
      const form = validForm();
      form.name = '';
      form.code = 'INVALID CODE';
      form.sections[0].fields[0].label = '';
      await expect(
        getAdmissionWizardSchema(2).validate(form, { abortEarly: false })
      ).rejects.toMatchObject({
        inner: expect.arrayContaining([
          expect.objectContaining({ path: 'name' }),
          expect.objectContaining({ path: 'sections[0].fields[0].label' }),
        ]),
      });
    });
  });
});
