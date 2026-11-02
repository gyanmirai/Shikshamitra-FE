import type {
  AdmissionFormField,
  AdmissionFormSection,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { it, expect } from 'vitest';

import {
  getCorrectionSections,
  getEffectiveCorrectionValues,
} from './application-form-correction-visibility';

const equals = (code: string, value: string) =>
  JSON.stringify({ field: code, operator: 'equals', value });
const field = (code: string, extra: Partial<AdmissionFormField> = {}): AdmissionFormField =>
  ({
    id: code,
    code,
    label: code,
    fieldType: 0,
    required: false,
    readOnly: false,
    ...extra,
  }) as AdmissionFormField;
const definition = (fields: AdmissionFormField[]): AdmissionApplicationForm['definition'] =>
  ({
    name: 'Registration',
    layoutType: 0,
    sections: [
      {
        id: 'section',
        code: 'section',
        name: 'Section',
        displayOrder: 0,
        fields,
      } as AdmissionFormSection,
    ],
  }) as AdmissionApplicationForm['definition'];

it('reverts omitted hidden answers until chained visibility matches the persisted candidate', () => {
  const form = definition([
    field('SHOW'),
    field('DETAIL', { visibilityRuleJson: equals('SHOW', 'yes') }),
    field('EXTRA', { required: true, visibilityRuleJson: equals('DETAIL', 'yes') }),
  ]);
  const initial = { SHOW: 'yes', DETAIL: 'no', EXTRA: 'saved hidden answer' };
  const draft = { SHOW: 'no', DETAIL: 'yes', EXTRA: 'edited' };
  const effective = getEffectiveCorrectionValues(form, initial, draft);
  expect(effective).toEqual({ SHOW: 'no', DETAIL: 'no', EXTRA: 'saved hidden answer' });
  expect(
    getCorrectionSections(form, effective).flatMap(({ rows }) =>
      rows.flatMap(({ fields }) => fields.map(({ code }) => code))
    )
  ).toEqual(['SHOW']);
  expect(draft).toEqual({ SHOW: 'no', DETAIL: 'yes', EXTRA: 'edited' });
});

it('removes a newly introduced hidden required answer and its validation context', () => {
  const form = definition([
    field('SHOW'),
    field('DETAIL', { visibilityRuleJson: equals('SHOW', 'yes') }),
    field('REQUIRED', { required: true, visibilityRuleJson: equals('DETAIL', 'yes') }),
  ]);
  const effective = getEffectiveCorrectionValues(
    form,
    { SHOW: 'yes', DETAIL: 'no' },
    { SHOW: 'no', DETAIL: 'yes', REQUIRED: '' }
  );
  expect(effective).toEqual({ SHOW: 'no', DETAIL: 'no' });
  expect(
    getCorrectionSections(form, effective).some(({ rows }) =>
      rows.some(({ fields }) => fields.some(({ required }) => required))
    )
  ).toBe(false);
});

it('restores read-only answers before resolving dependent visibility while preserving unknown context', () => {
  const form = definition([
    field('LOCKED', { readOnly: true }),
    field('ANSWER', { visibilityRuleJson: equals('LOCKED', 'yes') }),
    field('CONTEXT', { visibilityRuleJson: equals('EXTERNAL', 'yes') }),
  ]);
  expect(
    getEffectiveCorrectionValues(
      form,
      { LOCKED: 'no', ANSWER: 'saved' },
      { LOCKED: 'yes', ANSWER: 'edited', EXTERNAL: 'yes', CONTEXT: 'kept' }
    )
  ).toEqual({ LOCKED: 'no', ANSWER: 'saved', EXTERNAL: 'yes', CONTEXT: 'kept' });
});

it('terminates cyclic visibility by removing changed candidates monotonically', () => {
  const form = definition([
    field('FIRST', { visibilityRuleJson: equals('SECOND', 'yes') }),
    field('SECOND', { visibilityRuleJson: equals('FIRST', 'yes') }),
  ]);
  expect(
    getEffectiveCorrectionValues(
      form,
      { FIRST: 'yes', SECOND: 'yes' },
      { FIRST: 'no', SECOND: 'no' }
    )
  ).toEqual({ FIRST: 'yes', SECOND: 'yes' });
});

it('retains unchanged hidden baseline answers and visible changes', () => {
  const form = definition([
    field('SHOW'),
    field('HIDDEN', { visibilityRuleJson: equals('SHOW', 'yes') }),
  ]);
  expect(
    getEffectiveCorrectionValues(
      form,
      { SHOW: 'no', HIDDEN: 'saved' },
      { SHOW: 'still no', HIDDEN: 'saved' }
    )
  ).toEqual({ SHOW: 'still no', HIDDEN: 'saved' });
});
