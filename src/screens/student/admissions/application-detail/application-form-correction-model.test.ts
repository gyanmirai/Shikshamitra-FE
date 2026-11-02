import type { AdmissionApplicationForm } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect } from 'vitest';

import { buildFormCorrection } from './application-form-correction-model';

const rule = JSON.stringify({ field: 'SHOW', operator: 'equals', value: 'yes' });
const field = (code: string, extra = {}) => ({
  id: code,
  code,
  label: code,
  fieldType: 0,
  readOnly: false,
  ...extra,
});
const section = (fields: unknown[], extra = {}) => ({
  id: 'section',
  code: 'section',
  name: 'Section',
  displayOrder: 0,
  fields,
  ...extra,
});
const command = (
  sections: unknown[],
  initial: Record<string, string>,
  values: Record<string, string>
) =>
  buildFormCorrection(
    { id: 'app', concurrencyStamp: 'stamp' },
    { definition: { layoutType: 1, sections } } as AdmissionApplicationForm,
    initial,
    values,
    'Correction',
    'key'
  );

it('omits a changed answer after its controlling answer hides it', () => {
  expect(
    command(
      [section([field('SHOW'), field('DETAIL', { visibilityRuleJson: rule })])],
      { SHOW: 'yes', DETAIL: 'saved' },
      { SHOW: 'no', DETAIL: 'unsaved hidden' }
    ).values
  ).toEqual([{ fieldCode: 'SHOW', valueJson: '"no"' }]);
});

it('omits hidden steps, hidden sections and immutable answers from corrections', () => {
  const sections = [
    section([field('STEP')], { id: 'step', code: 'step', stepVisibilityRuleJson: rule }),
    section([field('SECTION')], { id: 'hidden', code: 'hidden', visibilityRuleJson: rule }),
    section([field('LOCKED', { readOnly: true }), field('VISIBLE')], {
      id: 'visible',
      code: 'visible',
    }),
  ];
  expect(
    command(
      sections,
      {},
      { SHOW: 'no', STEP: 'edited', SECTION: 'edited', LOCKED: 'edited', VISIBLE: 'edited' }
    ).values
  ).toEqual([{ fieldCode: 'VISIBLE', valueJson: '"edited"' }]);
});

it('retains a repeated field when it is visible in at least one row', () => {
  const sections = [
    section([field('SHOW'), field('DETAIL', { visibilityRuleJson: rule })], { isRepeatable: true }),
  ];
  const values = { SHOW: '["no","yes"]', DETAIL: '["first","second"]' };
  expect(command(sections, {}, values).values.map((value) => value.fieldCode)).toEqual([
    'SHOW',
    'DETAIL',
  ]);
});

it('omits a repeated field hidden in every row without clearing its saved answer', () => {
  const sections = [
    section([field('SHOW'), field('DETAIL', { visibilityRuleJson: rule })], { isRepeatable: true }),
  ];
  const initial = { SHOW: '["yes","yes"]', DETAIL: '["saved","saved"]' };
  const values = { SHOW: '["no","no"]', DETAIL: '["edited","edited"]' };
  expect(command(sections, initial, values).values).toEqual([
    { fieldCode: 'SHOW', valueJson: JSON.stringify(values.SHOW) },
  ]);
});
