import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect } from 'vitest';

import { getAddressBuilderIssues } from './form-builder-issues';
import { getBlankAdmissionFormInitialValues } from './form-dialog-model';
import { SavedAdmissionFormValidationError } from './form-publish-validation';

function addressField(group: 'Address' | 'PermanentAddress', kind: 'Country' | 'State' | 'City') {
  const countryField = `${group}_Country`;
  const stateField = `${group}_State`;
  const code = `${group}_${kind}`;
  return {
    id: code,
    code,
    label: group === 'Address' ? kind : `Permanent address ${kind.toLowerCase()}`,
    bindingType: 0,
    bindingKey: `${group}.${kind}`,
    displayOrder: 0,
    validationJson: JSON.stringify({
      format: kind.toLowerCase(),
      ...(kind !== 'Country' && { countryField }),
      ...(kind === 'City' && { stateField }),
    }),
  } as AdmissionFormField;
}

it.each([0, 1] as const)(
  'matches form checks and publish feedback for missing address links (%s)',
  (purpose) => {
    const form = getBlankAdmissionFormInitialValues(purpose);
    const city = addressField('Address', 'City');
    form.sections[0].fields.push(city);
    const guidance = 'City needs Country and State fields. Add them or remove City to publish.';
    expect(getAddressBuilderIssues(form)).toEqual([
      expect.objectContaining({ message: guidance, fieldId: city.id }),
    ]);
    [
      'Admissions.FormInvalidRuleReference',
      'Admissions.FormAddressMissingCityDependencies',
    ].forEach((code) => {
      const error = new SavedAdmissionFormValidationError(
        [`${code}:${city.code}`, `${code}:${city.code}`],
        form
      );
      expect(error.message).toBe(`Draft saved, but not published. ${guidance}`);
      expect(error.target).toMatchObject({ kind: 'field', fieldId: city.id });
    });
  }
);

it('checks address groups independently in step order, then section and field order', () => {
  const form = getBlankAdmissionFormInitialValues(1);
  form.layoutType = 1;
  const baseSection = form.sections[0];
  const country = addressField('Address', 'Country');
  const state = addressField('Address', 'State');
  const city = addressField('Address', 'City');
  form.sections = [
    { ...baseSection, id: 'later', stepId: 'later', stepDisplayOrder: 1, fields: [state] },
    {
      ...baseSection,
      id: 'first',
      stepId: 'first',
      stepDisplayOrder: 0,
      fields: [
        { ...city, displayOrder: 1 },
        country,
        ...(['Country', 'State', 'City'] as const).map((kind, index) => ({
          ...addressField('PermanentAddress', kind),
          displayOrder: index + 2,
        })),
      ],
    },
  ];
  expect(getAddressBuilderIssues(form)).toEqual([
    expect.objectContaining({
      fieldId: city.id,
      message: 'Country must come before State, and State before City. Check the position of City.',
    }),
  ]);
  form.sections[1].fields = form.sections[1].fields.filter((field) => field.id !== city.id);
  form.sections[0].fields.push({ ...city, displayOrder: 1 });
  expect(getAddressBuilderIssues(form)).toEqual([]);
});
