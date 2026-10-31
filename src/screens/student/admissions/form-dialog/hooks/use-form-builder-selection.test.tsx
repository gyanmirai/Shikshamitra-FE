import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { newField } from '../form-dialog-model';
import { useFormBuilderSelection } from './use-form-builder-selection';

const sectionsFor = (revision: string) => [
  { id: 'registration', code: 'BASE', name: 'Registration', displayOrder: 0, fields: [] },
  {
    id: `source-${revision}`,
    code: 'INQ_DETAILS',
    name: 'Inquiry',
    displayOrder: 1,
    fields: [
      {
        ...newField(`source-${revision}`, 0),
        id: `field-${revision}`,
        code: 'SOURCE_NAME',
        inheritedFrom: {
          inquiryFormDefinitionId: 'inquiry-a',
          sourceFieldCode: 'NAME',
          fieldIdentity: 'system:applicant.name',
        },
      },
    ],
  },
];

describe('builder selection across unsaved inheritance refreshes', () => {
  it('keeps an editable field selected by ID when its code changes in a mixed section', () => {
    const sections = sectionsFor('mixed');
    const editable = { ...newField('source-mixed', 1), id: 'editable', code: 'BEFORE' };
    const mixed = { ...sections[1], fields: [...sections[1].fields, editable] };
    const { result, rerender } = renderHook(({ items }) => useFormBuilderSelection(items), {
      initialProps: { items: [sections[0], mixed] },
    });
    act(() => result.current.select('source-mixed', 'editable'));
    rerender({
      items: [sections[0], { ...mixed, fields: [mixed.fields[0], { ...editable, code: 'AFTER' }] }],
    });
    expect(result.current.selectedFieldId).toBe('editable');
  });
  it('retains the selected source section and field when composition generates new IDs', () => {
    const { result, rerender } = renderHook(({ sections }) => useFormBuilderSelection(sections), {
      initialProps: { sections: sectionsFor('before') },
    });
    act(() => result.current.select('source-before', 'field-before'));
    rerender({ sections: sectionsFor('after') });
    expect(result.current.selectedSectionId).toBe('source-after');
    expect(result.current.selectedFieldId).toBe('field-after');
    expect(result.current.selectedLocation).toEqual({ sectionIndex: 1, fieldIndex: 0 });
  });
  it('keeps section-only selection and does not transfer a selection to another source', () => {
    const { result, rerender } = renderHook(({ sections }) => useFormBuilderSelection(sections), {
      initialProps: { sections: sectionsFor('before') },
    });
    act(() => result.current.select('source-before', null));
    rerender({ sections: sectionsFor('after') });
    expect(result.current.selectedSectionId).toBe('source-after');
    expect(result.current.selectedFieldId).toBeNull();
    const other = sectionsFor('other');
    other[1].fields[0].inheritedFrom.inquiryFormDefinitionId = 'inquiry-b';
    rerender({ sections: other });
    expect(result.current.selectedSectionId).toBe('registration');
  });
});
