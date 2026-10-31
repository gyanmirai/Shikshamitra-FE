import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { admissionFormSchema, getAdmissionFormInitialValues } from './form-dialog-model';
import {
  ADMISSION_FORM_SECTION_TEMPLATES,
  materializeAdmissionFormSectionTemplate,
} from './admission-form-section-template-catalog';
import {
  cloneSchoolFormAsStarter,
  getSystemAdmissionFormTemplate,
  SYSTEM_ADMISSION_FORM_TEMPLATES,
} from './admission-form-template-catalog';

describe('admission form template catalogue', () => {
  it('uses registry-supported gender choices in system applicant questions', () => {
    SYSTEM_ADMISSION_FORM_TEMPLATES.forEach(({ id }) => {
      getSystemAdmissionFormTemplate(id)
        .sections.flatMap((section) => section.fields)
        .filter((field) => field.bindingKey === 'Applicant.Gender')
        .forEach((field) =>
          expect(JSON.parse(field.optionsJson!)).toEqual([
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
          ])
        );
    });
  });
  it('gives recommended Inquiry and Registration questions the same canonical identities', () => {
    const inquiry = getSystemAdmissionFormTemplate('admission-inquiry');
    const registration = getSystemAdmissionFormTemplate('admission-application');
    const inquiryFields = inquiry.sections.flatMap((section) => section.fields);
    const registrationFields = registration.sections.flatMap((section) => section.fields);
    ['Applicant.DateOfBirth', 'Guardian.FirstName', 'Guardian.Mobile'].forEach((binding) => {
      const source = inquiryFields.filter((field) => field.bindingKey === binding);
      const target = registrationFields.filter((field) => field.bindingKey === binding);
      expect(source, `Inquiry ${binding}`).toHaveLength(1);
      expect(target, `Registration ${binding}`).toHaveLength(1);
      expect(source[0].bindingType).toBe(0);
      expect(target[0].bindingType).toBe(0);
    });
    expect(inquiryFields.some((field) => field.bindingKey === 'Applicant.Name')).toBe(true);
    expect(registrationFields.some((field) => field.bindingKey === 'Applicant.FirstName')).toBe(
      true
    );
    expect(registrationFields.find((field) => field.code === 'DECLARATION_NAME')?.bindingType).toBe(
      1
    );
  });

  it.each([
    ['admission-inquiry', 'CLASS_INTERESTED', { source: 'Standards' }],
    ['admission-application', 'CLASS_APPLYING_FOR', { source: 'Standards' }],
    ['student-registration', 'CLASS', { source: 'StandardsByMedium', parentField: 'MEDIUM' }],
  ] as const)('uses Institute Setup class IDs in %s', (templateId, code, source) => {
    const fields = getSystemAdmissionFormTemplate(templateId).sections.flatMap(
      (section) => section.fields
    );
    expect(JSON.parse(fields.find((field) => field.code === code)!.optionsJson!)).toEqual(source);
    fields
      .filter((field) => field.bindingKey === 'PreviousSchool.LastClass')
      .forEach((field) => {
        expect(field.fieldType).toBe(0);
        expect(field.optionsJson).toBeUndefined();
      });
  });

  it('keeps consent sections available without offering a standalone consent form', () => {
    expect(SYSTEM_ADMISSION_FORM_TEMPLATES.some((item) => item.id === 'consent-declaration')).toBe(
      false
    );
    expect(ADMISSION_FORM_SECTION_TEMPLATES.some((item) => item.id === 'consent-declaration')).toBe(
      true
    );
  });

  it.each(SYSTEM_ADMISSION_FORM_TEMPLATES)(
    'creates a valid, accurate $title template',
    async (summary) => {
      const template = getSystemAdmissionFormTemplate(summary.id);
      const fields = template.sections.flatMap((section) => section.fields);
      const systemBindings = fields
        .filter((field) => field.bindingType === 0)
        .map((field) => field.bindingKey);

      expect(template.sections).toHaveLength(summary.sectionCount);
      expect(fields).toHaveLength(summary.fieldCount);
      expect(new Set(template.sections.map((section) => section.code)).size).toBe(
        template.sections.length
      );
      expect(new Set(fields.map((field) => field.code)).size).toBe(fields.length);
      expect(new Set(systemBindings).size).toBe(systemBindings.length);
      await expect(admissionFormSchema.validate(template)).resolves.toBeDefined();
    }
  );

  it('creates fresh section and field identifiers for every use', () => {
    const first = getSystemAdmissionFormTemplate('admission-application');
    const second = getSystemAdmissionFormTemplate('admission-application');

    expect(second.sections[0].id).not.toBe(first.sections[0].id);
    expect(second.sections[0].fields[0].id).not.toBe(first.sections[0].fields[0].id);
  });

  it('copies a persisted school form without retaining server identity or client ids', async () => {
    const source = getSystemAdmissionFormTemplate('admission-inquiry');
    const schoolForm: AdmissionForm = {
      ...source,
      id: 'saved-form-id',
      version: 3,
      status: 1,
      sectionCount: source.sections.length,
      concurrencyStamp: 'server-stamp',
    };
    const copy = cloneSchoolFormAsStarter(schoolForm);

    expect(copy.name).toBe('Admission inquiry copy');
    expect(copy.code).toMatch(/^ADMISSION_INQUIRY_COPY_[A-F0-9]{6}$/);
    expect(copy.concurrencyStamp).toBeUndefined();
    expect(copy.sections[0].id).not.toBe(source.sections[0].id);
    expect(copy.sections[0].fields[0].id).not.toBe(source.sections[0].fields[0].id);
    await expect(admissionFormSchema.validate(copy)).resolves.toBeDefined();
  });
});

describe('admission form section template catalogue', () => {
  it('keeps address selectors connected when a pack renames conflicting field codes', () => {
    const form = getAdmissionFormInitialValues();
    form.sections[0].fields[0].code = 'COUNTRY';
    const result = materializeAdmissionFormSectionTemplate('home-address', form);
    const country = result.section.fields.find((field) => field.bindingKey === 'Address.Country')!;
    const state = result.section.fields.find((field) => field.bindingKey === 'Address.State')!;
    const city = result.section.fields.find((field) => field.bindingKey === 'Address.City')!;
    expect(country.code).toBe('COUNTRY_2');
    expect(JSON.parse(state.validationJson!)).toMatchObject({ countryField: country.code });
    expect(JSON.parse(city.validationJson!)).toMatchObject({
      countryField: country.code,
      stateField: state.code,
    });
  });

  it('uses the existing linked country when adding an address pack skips that duplicate', () => {
    const form = getAdmissionFormInitialValues();
    const source = getSystemAdmissionFormTemplate('admission-application');
    const country = source.sections
      .flatMap((section) => section.fields)
      .find((field) => field.bindingKey === 'Address.Country')!;
    form.sections[0].fields = [{ ...country, code: 'EXISTING_COUNTRY' }];
    const result = materializeAdmissionFormSectionTemplate('home-address', form);
    expect(result.skippedSystemBindings).toEqual(['Address.Country']);
    const state = result.section.fields.find((field) => field.bindingKey === 'Address.State')!;
    expect(JSON.parse(state.validationJson!)).toMatchObject({ countryField: 'EXISTING_COUNTRY' });
  });
  it.each(ADMISSION_FORM_SECTION_TEMPLATES)(
    'materializes the $title section with fresh ids',
    (summary) => {
      const form = getAdmissionFormInitialValues();
      const first = materializeAdmissionFormSectionTemplate(summary.id, form);
      const second = materializeAdmissionFormSectionTemplate(summary.id, form);

      expect(first.section.fields).toHaveLength(summary.fieldCount);
      expect(first.section.id).not.toBe(second.section.id);
      expect(first.section.fields[0].id).not.toBe(second.section.fields[0].id);
      expect(first.section.displayOrder).toBe(form.sections.length);
    }
  );

  it('keeps the selected step and skips duplicate linked student fields', () => {
    const form = getAdmissionFormInitialValues();
    form.layoutType = 1;
    const existing = getSystemAdmissionFormTemplate('admission-application').sections[0].fields[0];
    form.sections[0].fields = [existing];
    const result = materializeAdmissionFormSectionTemplate(
      'student-details',
      form,
      form.sections[0].id
    );

    expect(result.section.stepId).toBe(form.sections[0].stepId);
    expect(result.skippedSystemBindings).toEqual(['Applicant.FirstName']);
    expect(result.section.fields).toHaveLength(4);
    expect(result.section.fields.some((field) => field.bindingKey === 'Applicant.FirstName')).toBe(
      false
    );
  });

  it('creates unique section and custom field codes when the form already uses them', () => {
    const form = getAdmissionFormInitialValues();
    form.sections[0].code = 'TRANSPORT_NEED';
    form.sections[0].fields[0].code = 'SERVICE_TYPE';
    const result = materializeAdmissionFormSectionTemplate('transport-requirement', form);

    expect(result.section.code).toBe('TRANSPORT_NEED_2');
    expect(result.section.fields[0].code).toBe('SERVICE_TYPE_2');
    expect(result.section.fields[0].bindingKey).toBe('SERVICE_TYPE_2');
  });
});
