import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { vi, it, expect, describe } from 'vitest';

import { reorderFormBuilder } from './reorder-form-builder';

function makeForm(): CreateUpdateAdmissionForm {
  return {
    name: 'Admission',
    code: 'ADMISSION',
    layoutType: 0,
    fieldsPerRow: 1,
    sections: [
      ['first', 'a', 'b', 'c'],
      ['second', 'd'],
    ].map(([sectionId, ...ids], index) => ({
      id: sectionId,
      code: sectionId.toUpperCase(),
      name: sectionId,
      displayOrder: index,
      fields: ids.map((id, order) => ({
        id,
        code: id.toUpperCase(),
        label: id,
        sectionId,
        fieldType: 0,
        bindingType: 1,
        bindingKey: id.toUpperCase(),
        required: false,
        readOnly: false,
        displayOrder: order,
      })),
    })),
  };
}

function move(active: string, over: string | null) {
  const values = makeForm();
  const original = structuredClone(values);
  const setFieldValue = vi.fn().mockResolvedValue(undefined);
  const selectField = vi.fn();
  reorderFormBuilder(
    { active: { id: active }, over: over ? { id: over } : null },
    { values, setFieldValue },
    selectField
  );
  expect(values).toEqual(original);
  const sections = setFieldValue.mock.calls[0]?.[1] as
    CreateUpdateAdmissionForm['sections'] | undefined;
  return { sections, setFieldValue, selectField };
}

describe('form builder reordering', () => {
  it.each([
    ['a', 'b', ['b', 'a', 'c']],
    ['a', 'c', ['b', 'c', 'a']],
    ['c', 'a', ['c', 'a', 'b']],
  ])('moves field %s to the position of %s', (active, over, expected) => {
    const { sections, selectField } = move(`field:first:${active}`, `field:first:${over}`);
    expect(sections?.[0].fields.map((field) => field.id)).toEqual(expected);
    expect(sections?.[0].fields.map((field) => field.displayOrder)).toEqual([0, 1, 2]);
    expect(selectField).toHaveBeenCalledWith('first', active);
  });

  it('moves a field across sections once and follows it to its destination', () => {
    const { sections, selectField } = move('field:first:b', 'field:second:d');
    expect(sections?.[0].fields.map((field) => field.id)).toEqual(['a', 'c']);
    expect(sections?.[1].fields.map((field) => field.id)).toEqual(['b', 'd']);
    expect(sections?.[1].fields[0].sectionId).toBe('second');
    expect(sections?.[0].fields.map((field) => field.displayOrder)).toEqual([0, 1]);
    expect(sections?.[1].fields.map((field) => field.displayOrder)).toEqual([0, 1]);
    expect(selectField).toHaveBeenCalledWith('second', 'b');
  });

  it('reorders sections without changing their field membership', () => {
    const { sections, selectField } = move('section:first', 'section:second');
    expect(sections?.map((section) => section.id)).toEqual(['second', 'first']);
    expect(sections?.map((section) => section.displayOrder)).toEqual([0, 1]);
    expect(sections?.[1].fields.map((field) => field.id)).toEqual(['a', 'b', 'c']);
    expect(selectField).not.toHaveBeenCalled();
  });

  it.each([null, 'field:first:a', 'field:missing:a'])('ignores a drop on %s', (over) => {
    const { setFieldValue, selectField } = move('field:first:a', over);
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(selectField).not.toHaveBeenCalled();
  });
});
