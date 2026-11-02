import { useEffect } from 'react';

import { readRepeatableValues, writeRepeatableValue } from './form-repeatable-values';

type AddressField = {
  code: string;
  bindingKey?: string | null;
  bindingType?: number;
  readOnly?: boolean;
};
type AddressSection = { fields: readonly AddressField[]; isRepeatable?: boolean };
type Answers = Record<string, string>;
type AddressWriteGuard = (field: AddressField, entryIndex?: number) => boolean;
const sameKey = 'permanentaddress.sameascurrent';
const addressPairs = [
  ['address.addressline1', 'permanentaddress.line1'],
  ['address.addressline2', 'permanentaddress.line2'],
  ['address.country', 'permanentaddress.country'],
  ['address.state', 'permanentaddress.state'],
  ['address.city', 'permanentaddress.city'],
  ['address.postalcode', 'permanentaddress.postalcode'],
] as const;
const binding = (field: AddressField) =>
  field.bindingType === 1 ? undefined : field.bindingKey?.toLowerCase();
const checked = (value?: string) => value?.trim().toLowerCase() === 'true';

function copyAddress(
  fields: readonly AddressField[],
  values: Answers,
  sources = fields,
  canWrite?: (field: AddressField) => boolean
) {
  if (!fields.some((field) => binding(field) === sameKey && checked(values[field.code]))) return {};
  const changes: Answers = {};
  addressPairs.forEach(([currentKey, permanentKey]) => {
    const source = sources.find((field) => binding(field) === currentKey);
    if (!source) return; // A partial form must not erase an address it cannot copy.
    fields
      .filter(
        (field) => binding(field) === permanentKey && !field.readOnly && (canWrite?.(field) ?? true)
      )
      .forEach((target) => {
        const value = values[source.code] ?? '';
        if ((values[target.code] ?? '') !== value) changes[target.code] = value;
      });
  });
  return changes;
}

/** Copy by system binding, never display labels or generated question codes. */
export function getAdmissionAddressChanges(
  sections: readonly AddressSection[],
  values: Answers,
  canWrite?: AddressWriteGuard
) {
  const fields = sections
    .filter((section) => !section.isRepeatable)
    .flatMap((section) => section.fields);
  const changes = copyAddress(fields, values, fields, canWrite);
  sections
    .filter((section) => section.isRepeatable)
    .forEach((section) => {
      const rows = Math.max(
        0,
        ...section.fields.map((field) => readRepeatableValues(values[field.code]).length)
      );
      for (let index = 0; index < rows; index += 1) {
        const row = {
          ...values,
          ...Object.fromEntries(
            section.fields.map((field) => [
              field.code,
              readRepeatableValues(values[field.code])[index] ?? '',
            ])
          ),
        };
        const updates = copyAddress(
          section.fields,
          row,
          [...section.fields, ...fields],
          (field) => canWrite?.(field, index) ?? true
        );
        Object.entries(updates).forEach(([code, value]) => {
          changes[code] = writeRepeatableValue(changes[code] ?? values[code], index, value);
        });
      }
    });
  return changes;
}

export function isAdmissionCopiedAddressField(
  field: AddressField,
  sections: readonly AddressSection[],
  values: Answers
) {
  const section = sections.find((item) =>
    item.fields.some((itemField) => itemField.code === field.code)
  );
  const globals = sections.filter((item) => !item.isRepeatable).flatMap((item) => item.fields);
  const fields = section?.isRepeatable ? section.fields : globals;
  const pair = addressPairs.find(([, permanentKey]) => permanentKey === binding(field));
  return Boolean(
    pair &&
    !field.readOnly &&
    fields.some((item) => binding(item) === sameKey && checked(values[item.code])) &&
    [...fields, ...globals].some((item) => binding(item) === pair[0])
  );
}

/** Also restores a saved checked address when opening an editable draft. */
export function useAdmissionAddressSync(
  sections: readonly AddressSection[],
  values: Answers,
  applyChanges: (changes: Answers) => void,
  disabled = false,
  canWrite?: AddressWriteGuard
) {
  useEffect(() => {
    if (disabled) return;
    const changes = getAdmissionAddressChanges(sections, values, canWrite);
    if (Object.keys(changes).length) applyChanges(changes);
  }, [sections, values, applyChanges, disabled, canWrite]);
}
