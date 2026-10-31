import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getBuilderIssues } from './form-builder-issues';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

const metadata: AdmissionFormSystemFieldMetadata[] = [
  ...['Applicant.FirstName', 'Guardian.FirstName', 'Guardian.Mobile'].map((key) => ({
    key,
    displayName: key,
    description: '',
    fieldType: key.endsWith('Mobile') ? (4 as const) : (0 as const),
    readOnly: false,
  })),
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
    ...metadata.slice(0, 3).map((item, index) => ({
      ...newField(form.sections[0].id, index + 1, item.fieldType),
      code: item.key.replace(/\./g, '_').toUpperCase(),
      label: item.key,
      bindingType: 0 as const,
      bindingKey: item.key,
      required: true,
    })),
  ];
  return form;
}

describe('admission linked-field review', () => {
  const registrationNameMessage =
    'Use either a writable full student name or separate student name fields before publishing.';
  const nameMetadata = [
    'Applicant.Name',
    'Applicant.FirstName',
    'Applicant.MiddleName',
    'Applicant.LastName',
  ].map((key) => ({
    key,
    displayName: key,
    description: '',
    fieldType: 0 as const,
    readOnly: false,
  }));
  const registrationNames = (splitBinding = 'Applicant.FirstName') => {
    const form = getBlankAdmissionFormInitialValues(1);
    form.sections[0].fields = ['Applicant.Name', splitBinding].map((bindingKey, index) => ({
      ...newField(form.sections[0].id, index, 0),
      code: `NAME_${index}`,
      label: `Name ${index}`,
      bindingType: 0 as const,
      bindingKey,
    }));
    return form;
  };
  it.each(['Applicant.FirstName', 'Applicant.MiddleName', 'Applicant.LastName'])(
    'rejects writable Registration full name mixed with %s',
    (splitBinding) => {
      const form = registrationNames(splitBinding);
      expect(getBuilderIssues(form, { fields: nameMetadata })).toEqual([
        expect.objectContaining({
          message: registrationNameMessage,
          fieldId: form.sections[0].fields[0].id,
        }),
      ]);
    }
  );
  it('allows read-only inherited full-name context beside writable Registration split names', () => {
    const form = registrationNames();
    Object.assign(form.sections[0].fields[0], { readOnly: true, inheritedFrom: 'inquiry' });
    expect(getBuilderIssues(form, { fields: nameMetadata })).toEqual([]);
  });
  it('does not infer a full-name binding from an independent survey label', () => {
    const form = registrationNames();
    Object.assign(form.sections[0].fields[0], {
      label: 'Student full name',
      bindingType: 1,
      bindingKey: 'MY_SURVEY_NAME',
    });
    expect(getBuilderIssues(form, { fields: nameMetadata })).toEqual([]);
  });
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
    expect(getBuilderIssues(custom, { fields: metadata })).toEqual([]);
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
