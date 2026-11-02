import { it, expect, describe } from 'vitest';

import { getBlankAdmissionFormInitialValues } from './form-dialog-model';
import {
  createAdmissionChoiceValue,
  appendPastedAdmissionChoices,
  parseEditableAdmissionChoices,
  serializeEditableAdmissionChoices,
  repairDraftAdmissionGenderChoices,
  normalizeDraftAdmissionGenderChoices,
} from './field-choice-options';

describe('admission form visual choices', () => {
  it('repairs legacy draft defaults, translations and only conditions referencing that Gender field', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].fields = [
      {
        id: 'gender',
        required: false,
        readOnly: false,
        displayOrder: 0,
        code: 'GENDER',
        label: 'Gender',
        bindingType: 0,
        bindingKey: 'Applicant.Gender',
        fieldType: 6,
        defaultValue: 'OPTION_3',
        optionsJson:
          '[{"value":"Male","label":"Male"},{"value":"Female","label":"Female"},{"value":"OPTION_3","label":"Other"}]',
        translations: { hi: { choices: { OPTION_3: 'अन्य', Male: 'पुरुष' } } },
      },
    ];
    form.sections[0].fields[0].requiredRuleJson =
      '{"field":"GENDER","operator":"NotIn","value":"Male,OPTION_3"}';
    form.sections[0].visibilityRuleJson =
      '{"operator":"ANY","conditions":[{"field":"GENDER","operator":"In","value":["OPTION_3","Male"]},{"field":"CUSTOM","operator":"Equals","value":"OPTION_3"}]}';
    const repaired = repairDraftAdmissionGenderChoices(form);
    expect(repaired.sections[0].fields[0].defaultValue).toBe('Other');
    expect(JSON.parse(repaired.sections[0].fields[0].requiredRuleJson!).value).toBe('Male,Other');
    expect(repaired.sections[0].fields[0].translations?.hi.choices).toEqual({
      Other: 'अन्य',
      Male: 'पुरुष',
    });
    expect(
      JSON.parse(repaired.sections[0].visibilityRuleJson!).conditions.map(
        (rule: { value: unknown }) => rule.value
      )
    ).toEqual([['Other', 'Male'], 'OPTION_3']);
    expect(form.sections[0].fields[0].defaultValue).toBe('OPTION_3');
    expect(repairDraftAdmissionGenderChoices(repaired)).toBe(repaired);
  });
  it.each([
    { bindingType: 1, bindingKey: 'Applicant.Gender', fieldType: 6 },
    { bindingType: 0, bindingKey: 'CUSTOM_GENDER', fieldType: 6 },
    { bindingType: 0, bindingKey: 'Applicant.Gender', fieldType: 7 },
  ])('does not reinterpret generic choices for $bindingType/$bindingKey/$fieldType', (field) => {
    const choices = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'OPTION_3', label: 'Other' },
    ];
    expect(normalizeDraftAdmissionGenderChoices(field, choices)).toBe(choices);
  });
  it('does not guess the gender semantics of arbitrary labels or unsupported values', () => {
    const field = { bindingType: 0, bindingKey: 'Applicant.Gender', fieldType: 6 };
    const choices = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'CUSTOM', label: 'Other' },
    ];
    expect(normalizeDraftAdmissionGenderChoices(field, choices)).toBe(choices);
  });
  it('reads legacy string choices without changing their stored values', () => {
    expect(parseEditableAdmissionChoices('["Bus","Walking"]')).toEqual({
      choices: [
        { value: 'Bus', label: 'Bus' },
        { value: 'Walking', label: 'Walking' },
      ],
    });
  });

  it('preserves stable values when serializing labeled choices', () => {
    expect(
      serializeEditableAdmissionChoices([
        { value: 'SCHOOL_BUS', label: 'School bus' },
        { value: 'OWN', label: 'Own transport' },
      ])
    ).toBe('[{"value":"SCHOOL_BUS","label":"School bus"},{"value":"OWN","label":"Own transport"}]');
  });

  it('keeps an explicitly cleared option label empty while it is being edited', () => {
    expect(parseEditableAdmissionChoices('[{"value":"OPTION_1","label":""}]')).toEqual({
      choices: [{ value: 'OPTION_1', label: '' }],
    });
  });

  it('creates unique values for pasted choices', () => {
    expect(
      appendPastedAdmissionChoices(
        [{ value: 'BUS', label: 'Existing bus' }],
        'Bus\nOwn transport\nBus'
      )
    ).toEqual([
      { value: 'BUS', label: 'Existing bus' },
      { value: 'BUS_2', label: 'Bus' },
      { value: 'OWN_TRANSPORT', label: 'Own transport' },
      { value: 'BUS_3', label: 'Bus' },
    ]);
  });

  it('reports invalid saved values without silently replacing them', () => {
    expect(parseEditableAdmissionChoices('{invalid')).toEqual({
      choices: [],
      error: 'The saved choices contain invalid JSON.',
    });
  });

  it('avoids case-insensitive collisions with legacy option values', () => {
    expect(createAdmissionChoiceValue('Option 1', ['option_1', 'Option_1_2'])).toBe('OPTION_1_3');
    expect(appendPastedAdmissionChoices([{ value: 'bus', label: 'Old bus' }], 'Bus')).toEqual([
      { value: 'bus', label: 'Old bus' },
      { value: 'BUS_2', label: 'Bus' },
    ]);
  });

  it('falls back to a readable option code', () => {
    expect(createAdmissionChoiceValue('', [])).toBe('OPTION');
  });
});
