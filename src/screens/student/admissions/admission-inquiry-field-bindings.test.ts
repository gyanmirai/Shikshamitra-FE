import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import {
  canonicalInquiryBinding,
  getInquiryFormConfigurationIssues,
  getConfiguredInquiryParentRelationship,
} from './admission-inquiry-field-bindings';

const field = (
  bindingKey: string,
  overrides: Partial<AdmissionFormField> = {}
): AdmissionFormField => ({
  id: bindingKey,
  code: bindingKey.replace(/\./g, '_').toUpperCase(),
  label: 'School-customized label',
  fieldType: bindingKey.endsWith('Mobile') ? 4 : 0,
  bindingType: 0,
  bindingKey,
  required: true,
  readOnly: false,
  displayOrder: 0,
  ...overrides,
});
const form = (fields: AdmissionFormField[]) => ({
  purpose: 0,
  sections: [{ fields }],
});
const generic = () => [
  field('Applicant.FirstName'),
  field('Guardian.FirstName'),
  field('Guardian.Mobile'),
];
const father = () => [field('Applicant.FirstName'), field('Father.Name'), field('Father.Mobile')];
const selector = () =>
  field('Inquiry.ParentRelationship', {
    fieldType: 6,
    optionsJson: JSON.stringify([
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
    ]),
  });

describe('configured Inquiry bindings', () => {
  it('recognizes labels independently and keeps explicit opposite bindings authoritative', () => {
    expect(canonicalInquiryBinding(field('Father.Mobile', { code: 'PARENT_PHONE' }))).toBe(
      'Father.Mobile'
    );
    expect(canonicalInquiryBinding(field('Mother.Name', { code: 'GUARDIAN_NAME' }))).toBe(
      'Mother.Name'
    );
    expect(canonicalInquiryBinding(field('Applicant.Gender', { code: 'FIRST_NAME' }))).toBe(
      'Applicant.Gender'
    );
    expect(canonicalInquiryBinding(field('Legacy.ParentPhone', { code: 'PARENT_PHONE' }))).toBe(
      'Guardian.Mobile'
    );
    expect(canonicalInquiryBinding(field('Guardian.LegacyPhone', { code: 'PARENT_PHONE' }))).toBe(
      'Guardian.Mobile'
    );
    expect(canonicalInquiryBinding(field('Medical.Allergies', { code: 'PARENT_PHONE' }))).toBe(
      'Medical.Allergies'
    );
  });

  it.each(['APPLICANT_FIRST_NAME', 'APPLICANT_FIRSTNAME', 'STUDENT_FIRST_NAME'])(
    'recognizes historic first-name code %s',
    (code) => {
      expect(canonicalInquiryBinding({ code })).toBe('Applicant.FirstName');
    }
  );

  it('does not identify an arbitrary custom question from its display label', () => {
    expect(
      canonicalInquiryBinding(field('Custom.Question', { code: 'CUSTOM', label: 'Father mobile' }))
    ).toBeUndefined();
  });

  it('derives one explicit parent role from its coherent configured pair', () => {
    expect(getConfiguredInquiryParentRelationship(father(), {})).toBe('father');
    expect(
      getConfiguredInquiryParentRelationship([field('Mother.Name'), field('Mother.Mobile')], {})
    ).toBe('mother');
  });

  it('keeps the saved relationship for generic identity and never uses matching phone values as role evidence', () => {
    const fields = [...generic(), field('Father.Name'), field('Father.Mobile')];
    expect(
      getConfiguredInquiryParentRelationship(fields, {
        GUARDIAN_MOBILE: '9876543210',
        FATHER_MOBILE: '9876543210',
      })
    ).toBeUndefined();
    expect(getConfiguredInquiryParentRelationship(fields, {}, 'mother')).toBe('mother');
  });

  it('requires deliberate selection when both parents have configured contact pairs', () => {
    const fields = [...father(), field('Mother.Name'), field('Mother.Mobile'), selector()];
    expect(getConfiguredInquiryParentRelationship(fields, {})).toBeUndefined();
    expect(
      getConfiguredInquiryParentRelationship(fields, { INQUIRY_PARENTRELATIONSHIP: 'mother' })
    ).toBe('mother');
    expect(
      getConfiguredInquiryParentRelationship(fields, { INQUIRY_PARENTRELATIONSHIP: 'guardian' })
    ).toBeUndefined();
    expect(
      getConfiguredInquiryParentRelationship(
        fields.filter((item) => item.bindingKey !== 'Inquiry.ParentRelationship'),
        {},
        'mother'
      )
    ).toBe('mother');
  });
});

describe('Inquiry publication minimum information', () => {
  it.each(['Father.Name', 'Mother.Mobile'])(
    'keeps optional %s separate from the complete generic primary slots',
    (binding) => {
      expect(
        getInquiryFormConfigurationIssues(form([...generic(), field(binding), selector()]))
      ).toEqual([]);
    }
  );

  it('rejects a custom alias that could shadow a valid explicit identity mapping', () => {
    const legacy = field('CUSTOM_ANSWER', { code: 'APPLICANT_FIRST_NAME', bindingType: 1 });
    expect(getInquiryFormConfigurationIssues(form([legacy, ...generic()]))).not.toEqual([]);
  });

  it('keeps legacy aliases readable but requires an explicit system mapping for publication', () => {
    const legacy = field('FIELD_1', {
      code: 'APPLICANT_FIRST_NAME',
      bindingType: 1,
      label: 'Full Name',
    });
    expect(canonicalInquiryBinding(legacy)).toBe('Applicant.FirstName');
    expect(getInquiryFormConfigurationIssues(form([legacy, ...generic().slice(1)]))).toContain(
      'Add a required Student name field before publishing.'
    );
  });

  it.each([
    ['Applicant.FirstName', 'Student name'],
    ['Guardian.FirstName', 'Parent / Guardian name'],
    ['Guardian.Mobile', 'Parent / Guardian mobile'],
  ])(
    'does not count a custom question with system-looking key %s as a published identity mapping',
    (binding, label) => {
      const fields = generic().map((item) =>
        item.bindingKey === binding ? { ...item, bindingType: 1 as const } : item
      );
      expect(getInquiryFormConfigurationIssues(form(fields))).toContain(
        `Add a required ${label} field before publishing.`
      );
      expect(getInquiryFormConfigurationIssues({ ...form(fields), purpose: 1 })).toEqual([]);
    }
  );

  it.each([
    ['Applicant.FirstName', 'Student name'],
    ['Guardian.FirstName', 'Parent / Guardian name'],
    ['Guardian.Mobile', 'Parent / Guardian mobile'],
  ])('does not publish an identity field %s with the wrong input type', (binding, label) => {
    const fields = generic().map((item) =>
      item.bindingKey === binding ? { ...item, fieldType: 2 as const } : item
    );
    expect(getInquiryFormConfigurationIssues(form(fields))).toContain(
      `Add a required ${label} field before publishing.`
    );
  });

  it('accepts FIELD_1 when its explicit mapping and type are correct, regardless of label', () => {
    expect(
      getInquiryFormConfigurationIssues(
        form([
          field('Applicant.Name', { code: 'FIELD_1', label: 'Full Name' }),
          ...generic().slice(1),
        ])
      )
    ).toEqual([]);
  });

  it.each(['Applicant.FirstName', 'Applicant.MiddleName', 'Applicant.LastName'])(
    'rejects a full name together with optional separate name field %s',
    (binding) => {
      const fields = [
        field('Applicant.Name'),
        field(binding, { required: false }),
        field('Guardian.FirstName'),
        field('Guardian.Mobile'),
      ];
      const draft = form(fields);
      expect(getInquiryFormConfigurationIssues(draft)).toEqual([
        'Use either Student name or separate student name fields before publishing.',
      ]);
      expect(getInquiryFormConfigurationIssues({ ...draft, purpose: 1 })).toEqual([]);
      expect(draft.sections[0].fields).toEqual(fields);
    }
  );

  it.each([
    generic(),
    father(),
    [field('Applicant.Name'), field('Mother.Name'), field('Mother.Mobile')],
  ])('accepts coherent required identity with arbitrary labels', (...fields) => {
    expect(getInquiryFormConfigurationIssues(form(fields))).toEqual([]);
  });

  it('reports the three missing details without inserting fields into the definition', () => {
    const draft = form([]);
    expect(getInquiryFormConfigurationIssues(draft)).toEqual([
      'Add a required Student name field before publishing.',
      'Add a required Parent / Guardian name field before publishing.',
      'Add a required Parent / Guardian mobile field before publishing.',
    ]);
    expect(draft.sections[0].fields).toEqual([]);
  });

  it.each([
    { required: false },
    { readOnly: true },
    { visibilityRuleJson: '{"field":"SHOW","operator":"equals","value":"yes"}' },
  ])('rejects optional, locked or conditional minimum control: %j', (overrides) => {
    const fields = generic();
    fields[2] = { ...fields[2], ...overrides };
    expect(getInquiryFormConfigurationIssues(form(fields))).toContain(
      'Add a required Parent / Guardian mobile field before publishing.'
    );
  });

  it.each([
    { visibilityRuleJson: '{"field":"SHOW"}' },
    { stepVisibilityRuleJson: '{"field":"SHOW"}' },
    { isRepeatable: true },
  ])('rejects minimum identity inside a conditional or repeatable section: %j', (extra) => {
    expect(
      getInquiryFormConfigurationIssues({ purpose: 0, sections: [{ fields: generic(), ...extra }] })
    ).toHaveLength(3);
  });

  it('does not combine a Father name with a Mother mobile', () => {
    expect(
      getInquiryFormConfigurationIssues(
        form([field('Applicant.FirstName'), field('Father.Name'), field('Mother.Mobile')])
      )
    ).toContain('Add a required Parent / Guardian mobile field before publishing.');
  });

  it('requires a valid configured selector for two parents and checks both contact paths', () => {
    const fields = [...father(), field('Mother.Name'), field('Mother.Mobile')];
    expect(getInquiryFormConfigurationIssues(form(fields))).toContain(
      'Add a required Primary contact selector when both Father and Mother contacts are configured.'
    );
    expect(getInquiryFormConfigurationIssues(form([...fields, selector()]))).toEqual([]);
    expect(
      getInquiryFormConfigurationIssues(form([...fields, { ...selector(), required: false }]))
    ).not.toEqual([]);
    fields[4] = { ...fields[4], required: false };
    expect(getInquiryFormConfigurationIssues(form([...fields, selector()]))).toContain(
      'Add a required Parent / Guardian mobile field before publishing.'
    );
  });

  it('rejects a selector choice without a matching contact path', () => {
    expect(getInquiryFormConfigurationIssues(form([...father(), selector()]))).toContain(
      'Configure a required Primary contact selector with Father, Mother and Guardian choices before publishing.'
    );
  });

  it('validates an optional or malformed selector even when a generic pair exists', () => {
    expect(
      getInquiryFormConfigurationIssues(form([...generic(), { ...selector(), required: false }]))
    ).not.toEqual([]);
    expect(
      getInquiryFormConfigurationIssues(
        form([
          ...generic(),
          { ...selector(), optionsJson: '[{"value":"father","label":"Father"}]' },
        ])
      )
    ).not.toEqual([]);
    expect(getInquiryFormConfigurationIssues(form([...generic(), selector()]))).toEqual([]);
  });

  it('does not apply Inquiry minimum rules to Registration or unknown-purpose legacy forms', () => {
    expect(getInquiryFormConfigurationIssues({ purpose: 1, sections: [] })).toEqual([]);
    expect(getInquiryFormConfigurationIssues({ sections: [] })).toEqual([]);
  });
});
