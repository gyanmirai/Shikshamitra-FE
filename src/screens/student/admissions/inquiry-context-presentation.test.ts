import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect } from 'vitest';

import { mergeInquiryContextSections } from './inquiry-context-presentation';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog/form-dialog-model';

it('merges source context into its original source section/grid/order without changing either schema', () => {
  const form = getBlankAdmissionFormInitialValues(1);
  const section = { ...form.sections[0], id: 'source', displayOrder: 0, fieldsPerRow: 3 as const };
  const name = {
    ...newField(section.id, 0),
    id: 'name',
    label: 'First name',
    inheritedFrom: {
      inquiryFormDefinitionId: 'inquiry',
      sourceFieldCode: 'NAME',
      fieldIdentity: 'name',
    },
  };
  const relationship = {
    ...newField(section.id, 1, 6),
    id: 'relationship',
    code: 'ROLE',
    label: 'Relationship to student',
    required: true,
    requiredRuleJson: '{"field":"NAME","operator":"isNotEmpty"}',
    inheritedFrom: {
      inquiryFormDefinitionId: 'inquiry',
      sourceFieldCode: 'ROLE',
      fieldIdentity: 'role',
    },
  };
  const definitions: AdmissionFormSection[] = [{ ...section, fields: [name] }];
  const context: AdmissionFormSection[] = [{ ...section, fields: [relationship] }];
  const before = JSON.stringify({ definitions, context });
  const result = mergeInquiryContextSections(definitions, context);
  expect(result).toHaveLength(1);
  expect(result[0].fields.map((field) => field.id)).toEqual(['name', 'relationship']);
  expect(result[0].fieldsPerRow).toBe(3);
  expect(result[0].fields[1]).toMatchObject({
    readOnly: true,
    required: false,
    requiredRuleJson: undefined,
  });
  expect(JSON.stringify({ definitions, context })).toBe(before);
  expect(mergeInquiryContextSections(result, context)[0].fields).toHaveLength(2);
});

it('inserts source context-only sections before Registration using the source display order', () => {
  const form = getBlankAdmissionFormInitialValues(1);
  const base = form.sections[0];
  const context: AdmissionFormSection = {
    ...base,
    id: 'context',
    displayOrder: 0,
    fields: [{ ...newField('context', 0), id: 'role', code: 'ROLE' }],
  };
  const source: AdmissionFormSection = {
    ...base,
    id: 'source',
    displayOrder: 1,
    fields: [
      {
        ...newField('source', 0),
        id: 'name',
        inheritedFrom: {
          inquiryFormDefinitionId: 'inquiry',
          sourceFieldCode: 'NAME',
          fieldIdentity: 'name',
        },
      },
    ],
  };
  const registration: AdmissionFormSection = { ...base, id: 'base', displayOrder: 2, fields: [] };
  expect(
    mergeInquiryContextSections([source, registration], [context]).map((section) => section.id)
  ).toEqual(['context', 'source', 'base']);
});
