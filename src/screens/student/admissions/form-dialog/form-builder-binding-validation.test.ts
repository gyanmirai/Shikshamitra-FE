import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getBuilderIssues } from './form-builder-issues';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

const metadata: AdmissionFormSystemFieldMetadata[] = [
  {
    key: 'Preference.TransportRequired',
    displayName: 'Transport needed',
    description: '',
    fieldType: 9,
    readOnly: false,
  },
];

function inquiry(fieldType: 6 | 9 = 6) {
  const form = getBlankAdmissionFormInitialValues(0);
  form.sections[0].fields = [
    {
      ...newField(form.sections[0].id, 0, fieldType),
      code: 'PREFERENCE_TRANSPORTREQUIRED',
      label: 'Preferences idea',
      bindingType: 0,
      bindingKey: 'Preference.TransportRequired',
      optionsJson: '[{"value":"Bus","label":"Bus"}]',
    },
  ];
  return form;
}

describe('admission linked-field review', () => {
  it('flags the transport checkbox changed into a select before publication', () => {
    expect(getBuilderIssues(inquiry(), { fields: metadata })).toEqual([
      expect.objectContaining({
        fieldId: expect.any(String),
        message: expect.stringMatching(/Preferences idea.*Checkbox/),
      }),
    ]);
  });

  it('accepts a valid linked checkbox and an independent custom select', () => {
    expect(getBuilderIssues(inquiry(9), { fields: metadata })).toEqual([]);
    const custom = inquiry();
    Object.assign(custom.sections[0].fields[0], { bindingType: 1, bindingKey: 'MY_TRANSPORT' });
    expect(getBuilderIssues(custom, { isLoading: true })).toEqual([]);
  });

  it.each(['missing', 'unknown', 'duplicate'])('flags %s linked bindings', (kind) => {
    const form = inquiry(9);
    const field = form.sections[0].fields[0];
    if (kind === 'missing') field.bindingKey = undefined;
    if (kind === 'unknown') field.bindingKey = 'Preference.DoesNotExist';
    if (kind === 'duplicate')
      form.sections[0].fields.push({
        ...field,
        id: 'other',
        code: 'OTHER',
        bindingKey: 'preference.transportrequired',
      });
    expect(getBuilderIssues(form, { fields: metadata })).toHaveLength(1);
  });

  it.each([{ isLoading: true }, { isError: true }, {}])(
    'does not pass linked checks while the catalogue is unavailable: %j',
    (state) => {
      expect(getBuilderIssues(inquiry(9), state)).not.toHaveLength(0);
    }
  );
});
