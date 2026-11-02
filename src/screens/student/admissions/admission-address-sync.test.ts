import { it, vi, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  useAdmissionAddressSync,
  getAdmissionAddressChanges,
  isAdmissionCopiedAddressField,
} from './admission-address-sync';

const fields = [
  { code: 'CURRENT_A', bindingType: 0, bindingKey: 'Address.AddressLine1' },
  { code: 'CURRENT_B', bindingType: 0, bindingKey: 'Address.AddressLine2' },
  { code: 'CURRENT_COUNTRY', bindingType: 0, bindingKey: 'Address.Country' },
  { code: 'CURRENT_STATE', bindingType: 0, bindingKey: 'Address.State' },
  { code: 'CURRENT_CITY', bindingType: 0, bindingKey: 'Address.City' },
  { code: 'CURRENT_POST', bindingType: 0, bindingKey: 'Address.PostalCode' },
  { code: 'SAME', bindingType: 0, bindingKey: 'PermanentAddress.SameAsCurrent' },
  { code: 'PERM_A', bindingType: 0, bindingKey: 'PermanentAddress.Line1' },
  { code: 'PERM_B', bindingType: 0, bindingKey: 'PermanentAddress.Line2' },
  { code: 'PERM_COUNTRY', bindingType: 0, bindingKey: 'PermanentAddress.Country' },
  { code: 'PERM_STATE', bindingType: 0, bindingKey: 'PermanentAddress.State' },
  { code: 'PERM_CITY', bindingType: 0, bindingKey: 'PermanentAddress.City' },
  { code: 'PERM_POST', bindingType: 0, bindingKey: 'PermanentAddress.PostalCode' },
];
const sections = [{ fields: fields.slice(0, 6) }, { fields: fields.slice(6) }];
const values = {
  SAME: 'true',
  CURRENT_A: 'QA Road',
  CURRENT_B: 'QA Area',
  CURRENT_COUNTRY: '{"isoCode":"IN","name":"India"}',
  CURRENT_STATE: '{"isoCode":"GJ","name":"Gujarat"}',
  CURRENT_CITY: 'Ahmedabad',
  CURRENT_POST: '380015',
};
const copied = {
  PERM_A: values.CURRENT_A,
  PERM_B: values.CURRENT_B,
  PERM_COUNTRY: values.CURRENT_COUNTRY,
  PERM_STATE: values.CURRENT_STATE,
  PERM_CITY: values.CURRENT_CITY,
  PERM_POST: values.CURRENT_POST,
};

it('copies every configured address component across sections by binding, retaining geographic identities', () => {
  const original = structuredClone(values);
  expect(getAdmissionAddressChanges(sections, values)).toEqual(copied);
  expect(values).toEqual(original);
  expect(getAdmissionAddressChanges(sections, { ...values, ...copied })).toEqual({});
  expect(isAdmissionCopiedAddressField(fields[7], sections, values)).toBe(true);
});

it('retains independent addresses when unchecked and never treats a custom checkbox as a linked field', () => {
  expect(
    getAdmissionAddressChanges(sections, { ...values, SAME: 'false', PERM_A: 'Own road' })
  ).toEqual({});
  expect(isAdmissionCopiedAddressField(fields[7], sections, { ...values, SAME: 'false' })).toBe(
    false
  );
  expect(
    getAdmissionAddressChanges(
      [
        {
          fields: fields.map((field) =>
            field.code === 'SAME' ? { ...field, bindingType: 1 } : field
          ),
        },
      ],
      values
    )
  ).toEqual({});
});

it('does not erase fields without a source or overwrite explicitly readonly fields', () => {
  const partial = [
    {
      fields: fields
        .filter((field) => field.code !== 'CURRENT_A')
        .map((field) => (field.code === 'PERM_CITY' ? { ...field, readOnly: true } : field)),
    },
  ];
  const changes = getAdmissionAddressChanges(partial, {
    ...values,
    PERM_A: 'Keep',
    PERM_CITY: 'Protected',
  });
  expect(changes).not.toHaveProperty('PERM_A');
  expect(changes).not.toHaveProperty('PERM_CITY');
  expect(isAdmissionCopiedAddressField(fields[7], partial, values)).toBe(false);
});

it('clears stale permanent values when their configured current fields are empty', () => {
  expect(
    getAdmissionAddressChanges(sections, {
      SAME: 'true',
      PERM_A: 'Old road',
      PERM_COUNTRY: 'Old country',
    })
  ).toEqual({ PERM_A: '', PERM_COUNTRY: '' });
});

it('copies only checked repeated rows and preserves the others', () => {
  const repeatedValues = {
    SAME: '["true","false"]',
    CURRENT_A: '["Row 1","Row 2"]',
    PERM_A: '["Old","Independent"]',
  };
  expect(getAdmissionAddressChanges([{ fields, isRepeatable: true }], repeatedValues)).toEqual({
    PERM_A: '["Row 1","Independent"]',
  });
});

it('does not copy hidden or nonwritable correction rows sharing the same field code', () => {
  const repeatedValues = {
    SAME: '["true","true"]',
    CURRENT_A: '["Hidden row","Visible row"]',
    PERM_A: '["Protected","Old"]',
  };
  expect(
    getAdmissionAddressChanges(
      [{ fields, isRepeatable: true }],
      repeatedValues,
      (_, index) => index === 1
    )
  ).toEqual({
    PERM_A: '["Protected","Visible row"]',
  });
});

it('restores checked saved drafts on mount, but leaves locked snapshots untouched', () => {
  const apply = vi.fn();
  const view = renderHook(
    ({ disabled }) => useAdmissionAddressSync(sections, values, apply, disabled),
    { initialProps: { disabled: true } }
  );
  expect(apply).not.toHaveBeenCalled();
  view.rerender({ disabled: false });
  expect(apply).toHaveBeenCalledWith(copied);
});
