import { it, expect } from 'vitest';

import { parentRegistrationDraftValues } from './parent-registration-model';

it('sends only changed visible writable answers, preserves explicit clears and retains hidden answers', () => {
  const form = {
    definition: {
      sections: [
        {
          id: 's',
          code: 's',
          name: 'Details',
          fields: [
            { code: 'SHOW', fieldType: 9 },
            { code: 'NAME', fieldType: 0 },
            {
              code: 'HIDDEN',
              fieldType: 0,
              visibilityRuleJson: JSON.stringify({
                field: 'SHOW',
                operator: 'equals',
                value: 'true',
              }),
            },
            { code: 'LOCKED', fieldType: 0, readOnly: true },
          ],
        },
      ],
    },
  } as any;
  const original = { SHOW: 'true', NAME: 'Old', HIDDEN: 'Retained answer', LOCKED: 'School' };
  expect(
    parentRegistrationDraftValues(form, original, {
      SHOW: 'false',
      NAME: '',
      HIDDEN: 'Hidden edited value',
      LOCKED: 'Tamper',
    })
  ).toEqual([
    { fieldCode: 'SHOW', valueJson: '"false"' },
    { fieldCode: 'NAME', valueJson: '""' },
  ]);
});

it('preserves an unchanged hidden repeat cell when saving a visible cell with the same field code', () => {
  const form = {
    definition: {
      sections: [
        {
          id: 's',
          code: 's',
          name: 'Schools',
          isRepeatable: true,
          fields: [
            { code: 'SHOW', fieldType: 0 },
            {
              code: 'DETAIL',
              fieldType: 0,
              visibilityRuleJson: JSON.stringify({
                field: 'SHOW',
                operator: 'equals',
                value: 'yes',
              }),
            },
          ],
        },
      ],
    },
  } as any;
  const initial = { SHOW: '["yes","no"]', DETAIL: '["Visible answer","Retained hidden answer"]' };
  expect(
    parentRegistrationDraftValues(form, initial, {
      ...initial,
      DETAIL: '["Updated answer","Retained hidden answer"]',
    })
  ).toEqual([
    {
      fieldCode: 'DETAIL',
      valueJson: JSON.stringify('["Updated answer","Retained hidden answer"]'),
    },
  ]);
});
