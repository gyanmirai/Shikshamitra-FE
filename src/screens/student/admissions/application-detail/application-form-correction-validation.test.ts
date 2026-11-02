import type {
  AdmissionFormField,
  AdmissionFormSection,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { it, expect } from 'vitest';

import {
  buildCorrectionYupSchema,
  getCorrectionValidationErrors,
} from './application-form-correction-validation';

const rule = JSON.stringify({ field: 'SHOW', operator: 'equals', value: 'yes' });
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
const section = (
  fields: AdmissionFormField[],
  extra: Partial<AdmissionFormSection> = {}
): AdmissionFormSection =>
  ({
    id: 'section',
    code: 'section',
    name: 'Section',
    displayOrder: 0,
    fields,
    ...extra,
  }) as AdmissionFormSection;
const definition = (...sections: AdmissionFormSection[]): AdmissionApplicationForm['definition'] =>
  ({
    name: 'Registration',
    layoutType: 1,
    sections,
  }) as AdmissionApplicationForm['definition'];

it('does not validate required answers in a hidden step', () => {
  const form = definition(
    section([field('ANSWER', { required: true })], { stepVisibilityRuleJson: rule })
  );
  expect(getCorrectionValidationErrors(form, { SHOW: 'no', ANSWER: '' })).toEqual({});
});

it('ignores a hidden repeated section with a required minimum and no rows', () => {
  const form = definition(
    section([field('ANSWER', { required: true })], {
      isRepeatable: true,
      minEntries: 1,
      maxEntries: 3,
      visibilityRuleJson: rule,
    })
  );
  expect(getCorrectionValidationErrors(form, { SHOW: 'no' })).toEqual({});
});

it('validates only the visible repeated row and preserves email format validation', () => {
  const form = definition(
    section(
      [
        field('SHOW'),
        field('EMAIL', {
          required: true,
          fieldType: 3,
          visibilityRuleJson: rule,
        }),
      ],
      { isRepeatable: true, minEntries: 1, maxEntries: 3 }
    )
  );
  expect(
    getCorrectionValidationErrors(form, { SHOW: '["no","yes"]', EMAIL: '["","invalid"]' })
  ).toEqual({ 'EMAIL[1]': 'EMAIL must be a valid email address.' });
  expect(
    getCorrectionValidationErrors(form, {
      SHOW: '["no","yes"]',
      EMAIL: '["","parent@example.com"]',
    })
  ).toEqual({});
});

it('keeps conditional requiredness in the projected row context', () => {
  const form = definition(
    section([field('SHOW'), field('ANSWER', { requiredRuleJson: rule })], {
      isRepeatable: true,
      minEntries: 0,
      maxEntries: 3,
    })
  );
  expect(getCorrectionValidationErrors(form, { SHOW: '["no","yes"]', ANSWER: '["",""]' })).toEqual({
    'ANSWER[1]': 'ANSWER is required.',
  });
});

it('enforces visible repeat minimum and maximum on the first visible field', () => {
  const form = definition(
    section([field('HIDDEN', { visibilityRuleJson: rule }), field('ANSWER')], {
      isRepeatable: true,
      minEntries: 1,
      maxEntries: 2,
    })
  );
  expect(getCorrectionValidationErrors(form, { SHOW: 'no' })).toEqual({
    ANSWER: 'Add at least 1 entries.',
  });
  expect(
    getCorrectionValidationErrors(form, { SHOW: 'no', ANSWER: '["one","two","three"]' })
  ).toEqual({ ANSWER: 'Add no more than 2 entries.' });
});

it('does not validate the virtual visibility row of an optional empty repeat', () => {
  const form = definition(
    section([field('ANSWER', { required: true })], {
      isRepeatable: true,
      minEntries: 0,
      maxEntries: 2,
    })
  );
  expect(getCorrectionValidationErrors(form, {})).toEqual({});
});

it('treats non-array repeated values as empty for cardinality, like the backend', () => {
  const form = definition(
    section([field('ANSWER')], { isRepeatable: true, minEntries: 1, maxEntries: 2 })
  );
  expect(getCorrectionValidationErrors(form, { ANSWER: 'not-json' })).toEqual({
    ANSWER: 'Add at least 1 entries.',
  });
  expect(getCorrectionValidationErrors(form, { ANSWER: '"scalar"' })).toEqual({
    ANSWER: 'Add at least 1 entries.',
  });
});

it('retains scalar date and read-only required validation and supports scoped sections', () => {
  const form = definition(
    section([field('DATE', { fieldType: 5 })], { id: 'dates' }),
    section([field('LOCKED', { required: true, readOnly: true })], { id: 'locked' })
  );
  expect(getCorrectionValidationErrors(form, { DATE: 'invalid' })).toEqual({
    DATE: 'DATE must be a valid date.',
    LOCKED: 'LOCKED is required.',
  });
  expect(getCorrectionValidationErrors(form, { DATE: '2026-11-01' }, 'dates')).toEqual({});
});

it('exposes flat and indexed field paths through Yup for Formik', () => {
  const form = definition(
    section([field('NAME', { required: true })], { id: 'name' }),
    section([field('EMAIL', { required: true, fieldType: 3 })], {
      id: 'repeat',
      isRepeatable: true,
      minEntries: 1,
      maxEntries: 2,
    })
  );
  try {
    buildCorrectionYupSchema(form).validateSync(
      { NAME: '', EMAIL: '["invalid"]' },
      { abortEarly: false }
    );
    throw new Error('Expected validation failure');
  } catch (error) {
    expect(error).toBeInstanceOf(Yup.ValidationError);
    expect((error as Yup.ValidationError).inner.map(({ path }) => path)).toEqual([
      'NAME',
      'EMAIL[0]',
    ]);
  }
});
