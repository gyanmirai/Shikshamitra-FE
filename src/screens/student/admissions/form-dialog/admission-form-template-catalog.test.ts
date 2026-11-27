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
  getNewAdmissionFormInitialValues,
} from './admission-form-template-catalog';

it('starts a new Inquiry with only the six core questions and a two-column grid', () => {
  const form = getNewAdmissionFormInitialValues(0);
  const fields = form.sections.flatMap((section) => section.fields);
  expect(form).toMatchObject({ purpose: 0, layoutType: 0, fieldsPerRow: 2, name: '', code: '' });
  expect(fields.map(({ bindingKey, required }) => [bindingKey, required])).toEqual([
    ['Applicant.FirstName', true],
    ['Applicant.LastName', false],
    ['Guardian.FirstName', true],
    ['Guardian.Mobile', true],
    ['Guardian.Email', true],
    ['Inquiry.ParentRelationship', true],
  ]);
});

it('starts Registration with four steps, linked optional address, and optional emergency contact fields', () => {
  const form = getNewAdmissionFormInitialValues(1);
  expect(form).toMatchObject({ purpose: 1, layoutType: 1, fieldsPerRow: 2 });
  expect(form.sections.map(({ stepName }) => stepName)).toEqual([
    'Student',
    'Family',
    'Address',
    'Academic history',
  ]);
  const [student, family, address, history] = form.sections;
  expect(student.fields).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ bindingKey: 'Applicant.DateOfBirth', required: true }),
      expect.objectContaining({ bindingKey: 'Applicant.Gender', required: true }),
    ])
  );
  expect(
    family.fields
      .filter((field) => field.bindingKey?.startsWith('Emergency.'))
      .map(({ bindingKey, fieldType, required }) => [bindingKey, fieldType, required])
  ).toEqual([
    ['Emergency.ContactName', 0, false],
    ['Emergency.Relationship', 0, false],
    ['Emergency.ContactPhone', 4, false],
  ]);
  expect(address.fields).toHaveLength(6);
  expect(address.fields.every((field) => !field.required)).toBe(true);
  const [country, state, city] = address.fields.slice(2, 5);
  expect([country.bindingKey, state.bindingKey, city.bindingKey]).toEqual([
    'Address.Country',
    'Address.State',
    'Address.City',
  ]);
  expect(JSON.parse(city.validationJson ?? '{}')).toMatchObject({
    countryField: country.code,
    stateField: state.code,
  });
  expect(history.fields.map((field) => field.code)).toEqual([
    'PREVIOUS_SCHOOL',
    'LAST_CLASS_COMPLETED',
    'ACADEMIC_NOTES',
  ]);
});

describe('admission form template catalogue', () => {
  it('creates the Inquiry campus question without persisting a builder instruction as help', () => {
    const field = getSystemAdmissionFormTemplate('admission-inquiry')
      .sections.flatMap((section) => section.fields)
      .find((question) => question.code === 'CAMPUS_PREFERENCE');

    expect(field?.label).toBe('Campus preference');
    expect(field?.helpText).toBeUndefined();
  });

  it('retains print settings when using a saved school form as a starter', () => {
    const source = {
      ...getAdmissionFormInitialValues(),
      id: 'saved',
      version: 1,
      status: 0,
      printSettings: {
        template: 'structured-classic',
        layout: 'spacious',
        paperSize: 'A4',
        showSchoolHeader: false,
        showPhoto: false,
        showSignature: true,
      },
    } as AdmissionForm;
    const cloned = cloneSchoolFormAsStarter(source);
    expect(cloned.printSettings).toEqual(source.printSettings);
    expect(cloned.printSettings).not.toBe(source.printSettings);
  });
  it('uses Boxed Grid when creating an editable draft from a legacy Registration starter', () => {
    const legacySettings = {
      ...getAdmissionFormInitialValues().printSettings!,
      template: 'simple' as const,
      layout: 'spacious' as const,
    };
    const source = {
      ...getAdmissionFormInitialValues(),
      id: 'legacy',
      version: 1,
      status: 1,
      printSettings: legacySettings,
    } as AdmissionForm;

    expect(cloneSchoolFormAsStarter(source).printSettings).toEqual({
      ...legacySettings,
      template: 'boxed-grid',
    });
    expect(cloneSchoolFormAsStarter({ ...source, purpose: 0 }).printSettings).toEqual(
      legacySettings
    );
    expect(source.printSettings).toEqual(legacySettings);
  });
  it('orders new Home address selectors by their Country, State and City dependencies', () => {
    const form = getSystemAdmissionFormTemplate('admission-application');
    expect(form.printSettings?.template).toBe('boxed-grid');
    const home = form.sections.find((section) => section.code === 'HOME_ADDRESS')!;
    const locations = home.fields.filter((field) =>
      ['Address.Country', 'Address.State', 'Address.City'].includes(field.bindingKey ?? '')
    );
    expect(locations.map((field) => field.bindingKey)).toEqual([
      'Address.Country',
      'Address.State',
      'Address.City',
    ]);
    const [country, state, city] = locations;
    expect(JSON.parse(country.validationJson!)).toMatchObject({ format: 'country' });
    expect(JSON.parse(state.validationJson!)).toMatchObject({
      format: 'state',
      countryField: country.code,
    });
    expect(JSON.parse(city.validationJson!)).toMatchObject({
      format: 'city',
      countryField: country.code,
      stateField: state.code,
    });
    const pack = materializeAdmissionFormSectionTemplate('home-address', {
      ...form,
      sections: [],
    }).section;
    expect(pack.fields.map((field) => field.bindingKey)).toEqual(
      home.fields.map((field) => field.bindingKey)
    );
  });

  it('retains authored address order when reopening an existing saved form', () => {
    const form = getSystemAdmissionFormTemplate('admission-application');
    const home = form.sections.find((section) => section.code === 'HOME_ADDRESS')!;
    home.fields = [...home.fields]
      .reverse()
      .map((field, displayOrder) => ({ ...field, displayOrder }));
    const saved: AdmissionForm = {
      ...form,
      id: 'saved-address',
      version: 1,
      status: 0,
      sectionCount: form.sections.length,
      concurrencyStamp: form.concurrencyStamp ?? undefined,
    };
    expect(
      getAdmissionFormInitialValues(saved)
        .sections.find((section) => section.code === 'HOME_ADDRESS')!
        .fields.map((field) => field.code)
    ).toEqual(home.fields.map((field) => field.code));
  });

  it('collects required mapped identity in the application template without requiring a surname', () => {
    const fields = getSystemAdmissionFormTemplate('admission-application').sections.flatMap(
      (section) => section.fields
    );
    ['Applicant.FirstName', 'Applicant.DateOfBirth', 'Applicant.Gender'].forEach((binding) => {
      const field = fields.find((item) => item.bindingKey === binding)!;
      expect(field.bindingType).toBe(0);
      expect(field.required).toBe(true);
      expect(field.readOnly).toBe(false);
    });
    expect(fields.find((field) => field.bindingKey === 'Applicant.LastName')?.required).toBe(false);
  });
  it('uses registry-supported gender choices in system applicant questions', () => {
    SYSTEM_ADMISSION_FORM_TEMPLATES.forEach(({ id }) => {
      getSystemAdmissionFormTemplate(id)
        .sections.flatMap((section) => section.fields)
        .filter((field) => field.bindingKey === 'Applicant.Gender')
        .forEach((field) =>
          expect(JSON.parse(field.optionsJson!)).toEqual([
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
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
    expect(inquiryFields.some((field) => field.bindingKey === 'Applicant.FirstName')).toBe(true);
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
