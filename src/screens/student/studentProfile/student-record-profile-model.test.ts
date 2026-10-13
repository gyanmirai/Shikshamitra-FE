import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { it, expect, describe } from 'vitest';

import { customField, customSource, customSection } from './student-custom-details-test-fixture';
import {
  hasProfileValue,
  profileFieldValue,
  profileRuleValues,
  serializeProfileField,
  profileSectionRowValues,
  updateTypedRepeatableValue,
  removeTypedRepeatableValue,
  visibleRegistrationSections,
  customProfileValidationErrors,
} from './student-record-profile-model';

const choices = JSON.stringify([
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
]);
const transportRule = JSON.stringify({ field: 'transport', operator: 'Equals', value: true });

describe('frozen Student profile field values', () => {
  it.each(['country', 'state', 'city'])(
    'shows the captured %s name without rewriting the stored answer',
    (format) => {
      const answer = JSON.stringify({ name: 'Captured place', isoCode: 'QA' });
      const field = customField('place', 0, { validationJson: JSON.stringify({ format }) });
      expect(profileFieldValue(field, answer)).toBe('Captured place');
      expect(serializeProfileField(field, answer)).toBe(answer);
      expect(profileFieldValue(customField('note'), answer)).toBe(answer);
    }
  );
  it.each(['false', 'null', 'true', '0', '"quoted"'])(
    'keeps the scalar text answer %s literal',
    (value) => {
      const field = customField('note');
      expect(serializeProfileField(field, value)).toBe(value);
      expect(profileFieldValue(field, value)).toBe(value);
      expect(hasProfileValue(value)).toBe(true);
    }
  );

  it('distinguishes missing data from false and numeric zero', () => {
    expect(hasProfileValue(null)).toBe(false);
    expect(hasProfileValue(false)).toBe(true);
    expect(hasProfileValue(0)).toBe(true);
    expect(profileFieldValue(customField('flag', 9), false)).toBe('No');
    expect(profileFieldValue(customField('count', 2), 0)).toBe('0');
    expect(profileFieldValue(customField('note'), null)).toBe('Not provided');
    expect(profileRuleValues({ nullable: null, flag: false, count: 0 })).toEqual({
      nullable: '',
      flag: 'false',
      count: '0',
    });
  });

  it('uses the actual MultiSelect 7 and Radio 8 wire types', () => {
    const multi = customField('languages', 7, { optionsJson: choices });
    expect(serializeProfileField(multi, '["en","hi"]')).toEqual(['en', 'hi']);
    expect(profileFieldValue(multi, ['en', 'hi'])).toBe('English, Hindi');
    expect(profileFieldValue(multi, '["en","hi"]')).toBe('English, Hindi');
    const radio = customField('answer', 8, {
      optionsJson: JSON.stringify([{ value: 'false', label: 'No transport' }]),
    });
    expect(serializeProfileField(radio, 'false')).toBe('false');
    expect(profileFieldValue(radio, 'false')).toBe('No transport');
    expect(serializeProfileField(customField('flag', 9), 'false')).toBe(false);
  });

  it('shows safe labels for captured photo/file evidence and unavailable dynamic references', () => {
    expect(
      profileFieldValue(
        customField('photo', 0, { validationJson: '{"format":"photo"}' }),
        'data:image/jpeg;base64,private'
      )
    ).toBe('Photo captured at admission');
    expect(profileFieldValue(customField('file', 10), 'private-storage-url')).toBe(
      'File captured at admission'
    );
    const id = 'ad400010-0000-4000-8000-000000000001';
    expect(
      profileFieldValue(
        customField('board', 6, { optionsJson: '{"source":"EducationBoards"}' }),
        id
      )
    ).toBe('Option unavailable');
    expect(
      profileFieldValue(customField('siblings', 7, { bindingKey: 'Family.SiblingStudentIds' }), [
        id,
      ])
    ).toBe('Student unavailable');
  });

  it('edits typed repeat AddressGroup and MultiSelect cells without damaging siblings', () => {
    const addresses = [
      { addressLine1: 'Old address', city: 'Ahmedabad' },
      { addressLine1: 'Other address', city: 'Surat' },
    ];
    const corrected = serializeProfileField(
      customField('address', 11),
      '{"addressLine1":"Corrected address","city":"Ahmedabad"}'
    );
    expect(JSON.parse(updateTypedRepeatableValue(addresses, 0, corrected))).toEqual([
      corrected,
      addresses[1],
    ]);
    const languages = [['en'], ['hi']];
    expect(
      JSON.parse(
        updateTypedRepeatableValue(
          JSON.stringify(languages),
          1,
          serializeProfileField(customField('languages', 7), '["en","hi"]')
        )
      )
    ).toEqual([['en'], ['en', 'hi']]);
    expect(JSON.parse(removeTypedRepeatableValue(addresses, 0))).toEqual([addresses[1]]);
    expect(addresses[0].addressLine1).toBe('Old address');
  });

  it('projects only repeated row fields and keeps unrelated arrays for conditional rules', () => {
    const section = customSection(
      [
        customField('enabled', 9),
        customField('pickup', 0, {
          visibilityRuleJson: JSON.stringify({
            operator: 'All',
            conditions: [
              { field: 'enabled', operator: 'Equals', value: true },
              { field: 'subjects', operator: 'Contains', value: 'Music' },
            ],
          }),
        }),
      ],
      { isRepeatable: true, minEntries: 0, maxEntries: 3 }
    );
    const values = {
      enabled: [false, true],
      pickup: ['Hidden address', 'Visible address'],
      subjects: ['Music', 'Art'],
    };
    expect(profileSectionRowValues(section, values, 1)).toEqual({
      enabled: true,
      pickup: 'Visible address',
      subjects: ['Music', 'Art'],
    });
    const rows = visibleRegistrationSections(customSource([section], values), false, true);
    expect(rows.map((row) => row.fields.map(({ field }) => field.code))).toEqual([
      ['enabled'],
      ['enabled', 'pickup'],
    ]);
    expect(values.pickup).toEqual(['Hidden address', 'Visible address']);
  });

  it('hides conditional current values without erasing them or their submitted originals', () => {
    const source = customSource(
      [
        customSection([
          customField('transport', 9),
          customField('pickup', 0, { visibilityRuleJson: transportRule }),
        ]),
      ],
      { transport: true, pickup: 'Satellite' }
    );
    const hidden: RecordRegistrationSource = {
      ...source,
      currentValues: { ...source.currentValues, transport: false },
    };
    expect(
      visibleRegistrationSections(hidden).flatMap((row) =>
        row.fields.map(({ field }) => field.code)
      )
    ).toEqual(['transport']);
    expect(hidden.currentValues.pickup).toBe('Satellite');
    expect(
      visibleRegistrationSections(hidden, true).flatMap((row) =>
        row.fields.map(({ value }) => value)
      )
    ).toContain('Satellite');
    expect(
      visibleRegistrationSections({
        ...hidden,
        currentValues: { ...hidden.currentValues, transport: true },
      }).flatMap((row) => row.fields.map(({ value }) => value))
    ).toContain('Satellite');
  });

  it('keeps each Registration source definition and original answers independent', () => {
    const original = customSource(
      [
        customSection([
          customField('language', 6, { label: 'First language', optionsJson: choices }),
        ]),
      ],
      { language: 'en' }
    );
    original.currentValues.language = 'hi';
    const newer = customSource(
      [customSection([customField('newLanguage', 0, { label: 'New language question' })])],
      { newLanguage: 'Gujarati' },
      {
        formInstanceId: 'instance-2',
        formVersion: 2,
        formDefinitionId: 'form-version-2',
        isBaseline: false,
      }
    );
    const originalFields = visibleRegistrationSections(original, true).flatMap((row) => row.fields);
    expect(originalFields.map(({ field }) => field.label)).toEqual(['First language']);
    expect(originalFields[0].value).toBe('en');
    expect(visibleRegistrationSections(original).flatMap((row) => row.fields)[0].value).toBe('hi');
    expect(visibleRegistrationSections(newer).flatMap((row) => row.fields)[0].field.code).toBe(
      'newLanguage'
    );
    expect(original.formVersion).toBe(1);
  });
});

describe('custom correction validation', () => {
  it.each([
    { label: 'typed empty choices', fieldType: 7, before: ['en'], value: [] },
    { label: 'serialized empty choices', fieldType: 7, before: ['en'], value: '[]' },
    { label: 'typed empty address', fieldType: 11, before: { addressLine1: 'Saved' }, value: {} },
    {
      label: 'serialized empty address',
      fieldType: 11,
      before: { addressLine1: 'Saved' },
      value: '{}',
    },
    {
      label: 'blank address properties',
      fieldType: 11,
      before: { addressLine1: 'Saved' },
      value: { addressLine1: '  ', city: null },
    },
  ] as const)(
    'highlights required $label while preserving the draft value',
    ({ fieldType, before, value }) => {
      const source = customSource(
        [
          customSection([
            customField('answer', fieldType, { label: 'Required answer', required: true }),
          ]),
        ],
        { answer: before }
      );
      const next = { answer: value };
      expect(customProfileValidationErrors(source, source.currentValues, next)).toEqual({
        answer: expect.stringContaining('Required answer is required'),
      });
      expect(next.answer).toEqual(value);
      expect(
        customProfileValidationErrors(source, source.currentValues, { answer: before })
      ).toEqual({});
    }
  );

  it('allows an unrelated correction without rejecting unchanged legacy-invalid fields', () => {
    const source = customSource(
      [
        customSection([
          customField('legacyEmail', 3, { required: true }),
          customField('legacyRequired', 0, { required: true }),
          customField('note'),
        ]),
      ],
      { legacyEmail: 'legacy-invalid', legacyRequired: '', note: 'Before' }
    );
    expect(
      customProfileValidationErrors(source, source.currentValues, {
        ...source.currentValues,
        note: 'Corrected',
      })
    ).toEqual({});
    expect(
      customProfileValidationErrors(source, source.currentValues, {
        ...source.currentValues,
        legacyEmail: 'still-invalid',
      })
    ).toHaveProperty('legacyEmail');
  });

  it('validates newly visible required fields and ignores retained values when hidden', () => {
    const source = customSource(
      [
        customSection([
          customField('transport', 9),
          customField('pickup', 0, { required: true, visibilityRuleJson: transportRule }),
        ]),
      ],
      { transport: false, pickup: '' }
    );
    expect(
      customProfileValidationErrors(source, source.currentValues, { transport: true, pickup: '' })
    ).toHaveProperty('pickup');
    expect(
      customProfileValidationErrors(
        source,
        { transport: true, pickup: '' },
        { transport: false, pickup: '' }
      )
    ).toEqual({});
  });

  it('validates a changed repeated cell without rejecting an unchanged legacy-invalid sibling', () => {
    const source = customSource(
      [
        customSection([customField('email', 3)], {
          isRepeatable: true,
          minEntries: 1,
          maxEntries: 3,
        }),
      ],
      { email: ['legacy-invalid', 'valid@example.com'] }
    );
    expect(
      customProfileValidationErrors(source, source.currentValues, {
        email: ['legacy-invalid', 'corrected@example.com'],
      })
    ).toEqual({});
    expect(
      customProfileValidationErrors(source, source.currentValues, {
        email: ['legacy-invalid', 'new-invalid'],
      })
    ).toEqual({ 'email[1]': expect.stringContaining('valid email') });
  });

  it('checks collection minimum when an edited repeatable section becomes empty', () => {
    const source = customSource(
      [
        customSection([customField('address', 11)], {
          isRepeatable: true,
          minEntries: 1,
          maxEntries: 2,
        }),
      ],
      { address: [{ addressLine1: 'Saved' }] }
    );
    expect(customProfileValidationErrors(source, source.currentValues, { address: [] })).toEqual({
      address: expect.stringContaining('at least 1'),
    });
  });

  it('checks newly required unchanged answers independently in each repeated row', () => {
    const source = customSource(
      [
        customSection(
          [
            customField('flag'),
            customField('note', 0, {
              requiredRuleJson: JSON.stringify({ field: 'flag', operator: 'equals', value: 'Yes' }),
            }),
          ],
          { isRepeatable: true, minEntries: 1, maxEntries: 3 }
        ),
      ],
      { flag: ['No', 'No'], note: ['', ''] }
    );
    expect(
      customProfileValidationErrors(source, source.currentValues, {
        flag: ['Yes', 'No'],
        note: ['', ''],
      })
    ).toEqual({ 'note[0]': expect.stringContaining('required') });
  });
});
