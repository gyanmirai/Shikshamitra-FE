import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { vi, it, expect, describe } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';

import { reorderFormBuilder } from './reorder-form-builder';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { warning: vi.fn() } }));

function makeForm(): CreateUpdateAdmissionForm {
  return {
    name: 'Admission',
    code: 'ADMISSION',
    layoutType: 0,
    fieldsPerRow: 1,
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
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
  it('does not move an inherited Inquiry question through a direct reorder request', () => {
    const values = makeForm();
    values.purpose = 1;
    values.sections[0].fields[0].inheritedFrom = {
      inquiryFormDefinitionId: 'inquiry',
      sourceFieldCode: 'SOURCE_A',
      fieldIdentity: 'custom:source-a',
    };
    const setFieldValue = vi.fn();
    reorderFormBuilder(
      { active: { id: 'field:first:a' }, over: { id: 'field:second:d' } },
      { values, setFieldValue },
      vi.fn()
    );
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('moves a core Inquiry identity field without unlocking its structure', () => {
    const values = getBlankAdmissionFormInitialValues(0);
    const section = values.sections[0];
    const target = newField(section.id, 3);
    section.fields.push(target);
    const setFieldValue = vi.fn();
    const selectField = vi.fn();
    reorderFormBuilder(
      {
        active: { id: `field:${section.id}:${section.fields[0].id}` },
        over: { id: `field:${section.id}:${target.id}` },
      },
      { values, setFieldValue },
      selectField
    );
    expect(setFieldValue).toHaveBeenCalled();
    expect(selectField).toHaveBeenCalledWith(section.id, section.fields[0].id);
  });
  it.each([
    { isRepeatable: true },
    { visibilityRuleJson: '{"field":"X","operator":"isNotEmpty"}' },
    { stepVisibilityRuleJson: '{"field":"X","operator":"isNotEmpty"}' },
  ])('keeps core fields out of inaccessible sections: %o', (settings) => {
    const values = getBlankAdmissionFormInitialValues(0);
    const source = values.sections[0];
    const target = {
      id: 'target',
      code: 'TARGET',
      name: 'Target',
      displayOrder: 1,
      fields: [],
      ...settings,
    };
    values.sections.push(target);
    const setFieldValue = vi.fn();
    reorderFormBuilder(
      {
        active: { id: `field:${source.id}:${source.fields[0].id}` },
        over: { id: 'section:target' },
      },
      { values, setFieldValue },
      vi.fn()
    );
    expect(setFieldValue).not.toHaveBeenCalled();
  });
  it('moves a core field to an empty always-visible section', () => {
    const values = getBlankAdmissionFormInitialValues(0);
    const source = values.sections[0];
    values.sections.push({
      id: 'target',
      code: 'TARGET',
      name: 'Target',
      displayOrder: 1,
      fields: [],
    });
    const setFieldValue = vi.fn();
    reorderFormBuilder(
      {
        active: { id: `field:${source.id}:${source.fields[0].id}` },
        over: { id: 'section:target' },
      },
      { values, setFieldValue },
      vi.fn()
    );
    expect(setFieldValue).toHaveBeenCalled();
    expect(setFieldValue.mock.calls[0][1][1].fields[0].sectionId).toBe('target');
  });
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

  it.each([0, 1] as const)('rejects new address inversions in layout %s', (layoutType) => {
    const values = makeForm();
    values.layoutType = layoutType;
    const [first, second] = values.sections;
    if (layoutType === 1) {
      Object.assign(first, { stepId: 'earlier', stepDisplayOrder: 0 });
      Object.assign(second, { stepId: 'later', stepDisplayOrder: 1 });
    }
    Object.assign(first.fields[0], {
      bindingType: 0,
      bindingKey: 'Address.Country',
      validationJson: '{"format":"country"}',
    });
    Object.assign(first.fields[1], {
      bindingType: 0,
      bindingKey: 'Address.State',
      validationJson: '{"format":"state","countryField":"A"}',
    });
    Object.assign(second.fields[0], {
      bindingType: 0,
      bindingKey: 'Address.City',
      validationJson: '{"format":"city","countryField":"A","stateField":"B"}',
    });
    const setFieldValue = vi.fn();
    const selectField = vi.fn();
    vi.mocked(shikshaMitraToast.warning).mockClear();
    reorderFormBuilder(
      { active: { id: 'field:first:a' }, over: { id: 'section:second' } },
      { values, setFieldValue },
      selectField
    );
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(selectField).not.toHaveBeenCalled();
    expect(shikshaMitraToast.warning).toHaveBeenCalledWith({
      message: expect.stringMatching(/country must come before state/i),
    });
    expect(first.fields[0].bindingKey).toBe('Address.Country');
  });

  it('allows a drag to repair an existing inversion', () => {
    const values = makeForm();
    const [first] = values.sections;
    Object.assign(first.fields[0], {
      bindingType: 0,
      bindingKey: 'PermanentAddress.State',
      validationJson: '{"format":"state","countryField":"B"}',
    });
    Object.assign(first.fields[1], {
      bindingType: 0,
      bindingKey: 'PermanentAddress.Country',
      validationJson: '{"format":"country"}',
    });
    const setFieldValue = vi.fn();
    reorderFormBuilder(
      { active: { id: 'field:first:b' }, over: { id: 'field:first:a' } },
      { values, setFieldValue },
      vi.fn()
    );
    expect(
      setFieldValue.mock.calls[0][1][0].fields.map((field: AdmissionFormField) => field.id)
    ).toEqual(['b', 'a', 'c']);
  });

  it.each([null, 'field:first:a', 'field:missing:a'])('ignores a drop on %s', (over) => {
    const { setFieldValue, selectField } = move('field:first:a', over);
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(selectField).not.toHaveBeenCalled();
  });
});
